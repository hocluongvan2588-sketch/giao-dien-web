import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { CATEGORIES } from "@/lib/categories";
import { slugify } from "@/lib/format";
import { captureHtml } from "@/lib/screenshot";

export interface TemplateInput {
  name: string;
  slug: string;
  category: string;
  short_description: string;
  description: string;
  price: number;
  sale_price: number | null;
  tags: string[];
  is_featured: boolean;
  status: "draft" | "published";
  demo_html: string;
  /** Đường dẫn file ZIP đã upload lên bucket "sources"; null = giao chính file HTML */
  source_path: string | null;
}

/** Kiểm tra & chuẩn hoá dữ liệu form. Trả về chuỗi lỗi nếu không hợp lệ. */
export function parseTemplateInput(body: unknown): TemplateInput | string {
  const b = (body ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const name = str(b.name);
  const slug = slugify(str(b.slug) || name);
  const category = str(b.category);
  const price = Number(b.price);
  const sale = b.sale_price === null || b.sale_price === "" || b.sale_price === undefined ? null : Number(b.sale_price);
  const demo_html = typeof b.demo_html === "string" ? b.demo_html : "";

  if (!name) return "Vui lòng nhập tên giao diện";
  if (!slug) return "Slug không hợp lệ";
  if (!CATEGORIES.some((c) => c.id === category)) return "Danh mục không hợp lệ";
  if (!Number.isInteger(price) || price < 0) return "Giá không hợp lệ";
  if (sale !== null && (!Number.isInteger(sale) || sale < 0)) return "Giá khuyến mãi không hợp lệ";
  if (demo_html.trim().length < 20) return "Vui lòng dán mã HTML của giao diện";
  if (demo_html.length > 3_000_000) return "HTML quá lớn (tối đa ~3MB). Hãy đưa ảnh ra ngoài hoặc dùng file ZIP";

  const sourcePath = str(b.source_path);
  return {
    name,
    slug,
    category,
    short_description: str(b.short_description).slice(0, 300),
    description: str(b.description),
    price,
    sale_price: sale,
    tags: Array.isArray(b.tags) ? b.tags.map(String).map((t) => t.trim()).filter(Boolean).slice(0, 12) : [],
    is_featured: Boolean(b.is_featured),
    status: b.status === "published" ? "published" : "draft",
    demo_html,
    source_path: sourcePath && !sourcePath.endsWith("/index.html") ? sourcePath : null,
  };
}

/** Khi không có file ZIP, giao chính HTML (bản không gắn nhãn demo) cho khách. */
export async function storeHtmlSource(templateId: string, html: string) {
  const db = createAdminClient();
  const path = `${templateId}/index.html`;
  const { error } = await db.storage
    .from("sources")
    .upload(path, new Blob([html], { type: "text/html" }), { upsert: true, contentType: "text/html; charset=utf-8" });
  if (error) throw new Error(`Upload source: ${error.message}`);
  return path;
}

/** Lưu ảnh thumbnail và cập nhật thumbnail_url. Nếu không truyền ảnh thì tự chụp từ HTML. */
export async function updateThumbnail(templateId: string, image?: { data: Buffer | Blob; contentType: string }) {
  const db = createAdminClient();
  let file = image;
  if (!file) {
    const { data: t, error } = await db.from("templates").select("demo_html").eq("id", templateId).single();
    if (error || !t) throw new Error("Không tìm thấy giao diện");
    file = { data: await captureHtml(t.demo_html), contentType: "image/jpeg" };
  }

  const ext = file.contentType === "image/png" ? "png" : file.contentType === "image/webp" ? "webp" : "jpg";
  const path = `${templateId}/${Date.now()}.${ext}`;
  const bucket = db.storage.from("thumbnails");

  const { error: upErr } = await bucket.upload(path, file.data, { contentType: file.contentType, cacheControl: "31536000" });
  if (upErr) throw new Error(`Upload thumbnail: ${upErr.message}`);

  // Xoá ảnh cũ
  const { data: old } = await bucket.list(templateId);
  const stale = (old ?? []).map((f) => `${templateId}/${f.name}`).filter((p) => p !== path);
  if (stale.length) await bucket.remove(stale);

  const url = bucket.getPublicUrl(path).data.publicUrl;
  await db.from("templates").update({ thumbnail_url: url, updated_at: new Date().toISOString() }).eq("id", templateId);
  return url;
}
