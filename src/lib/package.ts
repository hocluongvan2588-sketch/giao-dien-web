import "server-only";
import { unzipSync } from "fflate";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_BUCKET, demoPublicPrefix } from "@/lib/demo";

const MAX_FILES = 3000;
const MAX_TOTAL_BYTES = 150 * 1024 * 1024; // 150MB sau giải nén
const MAX_HTML_RETURNED = 80;
const UPLOAD_CONCURRENCY = 12;

const MIME: Record<string, string> = {
  html: "text/html; charset=utf-8", htm: "text/html; charset=utf-8",
  css: "text/css; charset=utf-8", js: "text/javascript; charset=utf-8", mjs: "text/javascript; charset=utf-8",
  json: "application/json", map: "application/json", txt: "text/plain; charset=utf-8", xml: "application/xml",
  svg: "image/svg+xml", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif",
  webp: "image/webp", avif: "image/avif", ico: "image/x-icon", bmp: "image/bmp",
  woff: "font/woff", woff2: "font/woff2", ttf: "font/ttf", otf: "font/otf", eot: "application/vnd.ms-fontobject",
  mp4: "video/mp4", webm: "video/webm", mp3: "audio/mpeg", ogg: "audio/ogg", pdf: "application/pdf",
};

// Không đưa lên Storage: file rác của hệ điều hành và file chạy phía server
const SKIP = /(^|\/)(__MACOSX|\.DS_Store|Thumbs\.db|\.git)(\/|$)|\.(php|py|sh|exe|bat)$/i;

function mimeOf(path: string) {
  return MIME[path.split(".").pop()?.toLowerCase() ?? ""] ?? "application/octet-stream";
}

/** Chuẩn hoá đường dẫn trong ZIP, chặn "../" (zip slip). */
function cleanPath(raw: string) {
  const p = raw.replace(/\\/g, "/").replace(/^\.?\/+/, "");
  if (!p || p.endsWith("/") || p.split("/").some((seg) => seg === ".." || seg === "")) return null;
  return p;
}

export interface PackageResult {
  /** URL public của thư mục gốc gói đã giải nén (kết thúc bằng "/") */
  root: string;
  fileCount: number;
  totalBytes: number;
  /** Các trang HTML (đường dẫn tương đối so với root), trang chủ đoán được xếp đầu */
  htmlFiles: { path: string; html: string }[];
}

/** Tải gói ZIP từ bucket "sources", giải nén và đưa toàn bộ file lên bucket public "demos". */
export async function extractPackage(zipPath: string): Promise<PackageResult> {
  const db = createAdminClient();
  const { data: blob, error } = await db.storage.from("sources").download(zipPath);
  if (error || !blob) throw new Error(`Không đọc được file ZIP: ${error?.message ?? "không rõ"}`);

  let entries: Record<string, Uint8Array>;
  try {
    entries = unzipSync(new Uint8Array(await blob.arrayBuffer()));
  } catch {
    throw new Error("File ZIP bị lỗi hoặc không phải định dạng ZIP");
  }

  const files: { path: string; data: Uint8Array }[] = [];
  let totalBytes = 0;
  for (const [raw, data] of Object.entries(entries)) {
    const path = cleanPath(raw);
    if (!path || SKIP.test(path)) continue;
    files.push({ path, data });
    totalBytes += data.byteLength;
  }
  if (files.length === 0) throw new Error("File ZIP không có file nào");
  if (files.length > MAX_FILES) throw new Error(`Gói có ${files.length} file, vượt giới hạn ${MAX_FILES} file`);
  if (totalBytes > MAX_TOTAL_BYTES) throw new Error("Gói sau khi giải nén lớn hơn 150MB");

  const html = files.filter((f) => /\.html?$/i.test(f.path));
  if (html.length === 0) throw new Error("Không tìm thấy file .html nào trong gói ZIP");

  const folder = crypto.randomUUID();
  const bucket = db.storage.from(DEMO_BUCKET);
  let next = 0;
  const failures: string[] = [];
  async function worker() {
    while (next < files.length) {
      const f = files[next++];
      const { error: upErr } = await bucket.upload(`${folder}/${f.path}`, f.data, {
        contentType: mimeOf(f.path),
        cacheControl: "31536000",
        upsert: true,
      });
      if (upErr) failures.push(`${f.path}: ${upErr.message}`);
    }
  }
  await Promise.all(Array.from({ length: UPLOAD_CONCURRENCY }, worker));
  if (failures.length) {
    throw new Error(`Không tải lên được ${failures.length} file (VD: ${failures[0]}). Đã chạy migration tạo bucket "demos" chưa?`);
  }

  // Trang chủ: index.html nông nhất, sau đó tới các trang khác theo độ sâu và tên
  const depth = (p: string) => p.split("/").length;
  html.sort((a, b) => {
    const ia = /(^|\/)index\.html?$/i.test(a.path) ? 0 : 1;
    const ib = /(^|\/)index\.html?$/i.test(b.path) ? 0 : 1;
    return depth(a.path) - depth(b.path) || ia - ib || a.path.localeCompare(b.path, undefined, { numeric: true });
  });

  const decoder = new TextDecoder("utf-8");
  return {
    root: `${demoPublicPrefix()}${folder}/`,
    fileCount: files.length,
    totalBytes,
    htmlFiles: html.slice(0, MAX_HTML_RETURNED).map((f) => ({ path: f.path, html: decoder.decode(f.data) })),
  };
}

/** Xoá đệ quy một thư mục trong bucket demos (dùng khi xoá giao diện). */
export async function removeDemoFolder(baseUrl: string) {
  const prefix = demoPublicPrefix();
  if (!baseUrl.startsWith(prefix)) return;
  const folder = baseUrl.slice(prefix.length).split("/")[0];
  if (!folder) return;
  const bucket = createAdminClient().storage.from(DEMO_BUCKET);

  const paths: string[] = [];
  async function walk(dir: string) {
    for (let offset = 0; ; offset += 1000) {
      const { data } = await bucket.list(dir, { limit: 1000, offset });
      if (!data?.length) break;
      for (const item of data) {
        const full = `${dir}/${item.name}`;
        if (item.id) paths.push(full);
        else await walk(full); // thư mục con không có id
      }
      if (data.length < 1000) break;
    }
  }
  await walk(folder);
  for (let i = 0; i < paths.length; i += 900) await bucket.remove(paths.slice(i, i + 900));
}
