"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DevicePreview } from "@/components/DevicePreview";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES } from "@/lib/categories";
import { slugify } from "@/lib/format";
import type { Template } from "@/lib/types";

type Status = { type: "info" | "error" | "ok"; text: string } | null;

export function TemplateForm({ initial }: { initial?: Template }) {
  const router = useRouter();
  const isEdit = Boolean(initial);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    category: initial?.category ?? CATEGORIES[0].id,
    short_description: initial?.short_description ?? "",
    description: initial?.description ?? "",
    price: initial?.price ?? 990000,
    sale_price: initial?.sale_price ?? ("" as number | ""),
    tags: initial?.tags.join(", ") ?? "",
    is_featured: initial?.is_featured ?? false,
    status: initial?.status ?? "published",
    demo_html: initial?.demo_html ?? "",
  });
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [sourcePath, setSourcePath] = useState<string | null>(initial?.source_path ?? null);
  const [zipName, setZipName] = useState<string | null>(null);
  const [thumb, setThumb] = useState(initial?.thumbnail_url ?? null);
  const [preview, setPreview] = useState(form.demo_html);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const htmlFileRef = useRef<HTMLInputElement>(null);

  // Cập nhật khung xem trước sau khi ngừng gõ 600ms
  useEffect(() => {
    const t = setTimeout(() => setPreview(form.demo_html), 600);
    return () => clearTimeout(t);
  }, [form.demo_html]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value, ...(key === "name" && !slugTouched ? { slug: slugify(String(value)) } : {}) }));
  }

  async function loadHtmlFile(file: File) {
    set("demo_html", await file.text());
    if (!form.name) set("name", file.name.replace(/\.html?$/i, "").replace(/[-_]/g, " "));
  }

  async function uploadZip(file: File) {
    setStatus({ type: "info", text: "Đang tải file ZIP lên…" });
    const res = await fetch("/api/admin/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name }),
    });
    const data = await res.json();
    if (!res.ok) return setStatus({ type: "error", text: data.error });
    const { error } = await createClient().storage.from("sources").uploadToSignedUrl(data.path, data.token, file, { contentType: "application/zip" });
    if (error) return setStatus({ type: "error", text: `Upload ZIP lỗi: ${error.message}` });
    setSourcePath(data.path);
    setZipName(file.name);
    setStatus({ type: "ok", text: "Đã tải file ZIP. Nhớ bấm Lưu." });
  }

  async function regenerateThumbnail(id: string, file?: File) {
    setStatus({ type: "info", text: file ? "Đang tải ảnh lên…" : "Đang chụp ảnh thumbnail tự động (10–30 giây)…" });
    let body: FormData | undefined;
    if (file) {
      body = new FormData();
      body.append("file", file);
    }
    const res = await fetch(`/api/admin/templates/${id}/thumbnail`, { method: "POST", body });
    const data = await res.json().catch(() => ({ error: "Lỗi không xác định" }));
    if (!res.ok) {
      setStatus({ type: "error", text: `${data.error}. Bạn có thể tải ảnh lên thủ công.` });
      return false;
    }
    setThumb(data.thumbnail_url);
    setStatus({ type: "ok", text: "Đã cập nhật thumbnail." });
    return true;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus({ type: "info", text: "Đang lưu…" });
    const payload = {
      ...form,
      sale_price: form.sale_price === "" ? null : Number(form.sale_price),
      price: Number(form.price),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      source_path: sourcePath,
    };
    const res = await fetch(isEdit ? `/api/admin/templates/${initial!.id}` : "/api/admin/templates", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setBusy(false);
      return setStatus({ type: "error", text: data.error });
    }

    const htmlChanged = !isEdit || initial!.demo_html !== form.demo_html || !thumb;
    const thumbOk = htmlChanged ? await regenerateThumbnail(data.id) : true;
    setBusy(false);
    if (thumbOk) setStatus({ type: "ok", text: "Đã lưu giao diện." });
    if (!isEdit) router.replace(`/admin/templates/${data.id}`);
    router.refresh();
  }

  async function remove() {
    if (!initial || !confirm(`Xoá giao diện “${initial.name}”? Không thể hoàn tác.`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/templates/${initial.id}`, { method: "DELETE" });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setStatus({ type: "error", text: data.error });
    router.replace("/admin");
    router.refresh();
  }

  const statusCls = { info: "bg-earth-50 text-earth-600", error: "bg-red-50 text-red-700", ok: "bg-brand-50 text-brand-700" };

  return (
    <form onSubmit={save} className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <div className="min-w-0 space-y-6">
        <section className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-bold">1. Mã HTML giao diện</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500">{(form.demo_html.length / 1024).toFixed(1)} KB</span>
              <button type="button" className="btn-ghost px-3 py-1.5 text-xs" onClick={() => htmlFileRef.current?.click()}>
                Chọn file .html
              </button>
              <input ref={htmlFileRef} type="file" accept=".html,.htm,text/html" hidden onChange={(e) => e.target.files?.[0] && loadHtmlFile(e.target.files[0])} />
            </div>
          </div>
          <textarea
            className="input mt-3 h-72 resize-y font-mono text-xs leading-relaxed"
            placeholder="<!DOCTYPE html>&#10;<html lang=&quot;vi&quot;>&#10;  ... dán toàn bộ mã HTML vào đây ...&#10;</html>"
            spellCheck={false}
            value={form.demo_html}
            onChange={(e) => set("demo_html", e.target.value)}
            required
          />
          <p className="mt-2 text-xs text-zinc-500">
            Mẹo: CSS/JS nên để inline hoặc dùng link CDN; ảnh dùng URL tuyệt đối (https://…) để demo và thumbnail hiển thị đúng.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-bold">2. Xem trước</h2>
          {preview.trim() ? (
            <DevicePreview srcDoc={preview} height={640} />
          ) : (
            <div className="card grid h-60 place-items-center text-sm text-zinc-500">Dán HTML để xem trước</div>
          )}
        </section>
      </div>

      <aside className="space-y-6">
        <section className="card space-y-4 p-5">
          <h2 className="font-bold">3. Thông tin sản phẩm</h2>
          <div>
            <label className="label" htmlFor="name">Tên giao diện</label>
            <input id="name" className="input" required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="VD: AgriFresh — Nông sản sạch" />
          </div>
          <div>
            <label className="label" htmlFor="slug">Slug (URL)</label>
            <input id="slug" className="input font-mono" required value={form.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} />
          </div>
          <div>
            <label className="label" htmlFor="category">Danh mục</label>
            <select id="category" className="input" value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="price">Giá (₫)</label>
              <input id="price" type="number" min={0} step={1000} className="input" required value={form.price} onChange={(e) => set("price", Number(e.target.value))} />
            </div>
            <div>
              <label className="label" htmlFor="sale">Giá KM (₫)</label>
              <input id="sale" type="number" min={0} step={1000} className="input" value={form.sale_price} onChange={(e) => set("sale_price", e.target.value === "" ? "" : Number(e.target.value))} placeholder="Không có" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="short">Mô tả ngắn (hiện trên thẻ)</label>
            <textarea id="short" className="input h-20" maxLength={300} value={form.short_description} onChange={(e) => set("short_description", e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="desc">Mô tả chi tiết</label>
            <textarea id="desc" className="input h-32" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Các trang có trong giao diện, tính năng nổi bật…" />
          </div>
          <div>
            <label className="label" htmlFor="tags">Tags (phân cách bằng dấu phẩy)</label>
            <input id="tags" className="input" value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="trái cây, xuất khẩu, landing page" />
          </div>
          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.status === "published"} onChange={(e) => set("status", e.target.checked ? "published" : "draft")} className="h-4 w-4 accent-brand-700" />
              Hiển thị trên website
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} className="h-4 w-4 accent-brand-700" />
              Gắn nhãn “Bán chạy”
            </label>
          </div>
        </section>

        <section className="card space-y-3 p-5">
          <h2 className="font-bold">4. File giao cho khách</h2>
          <p className="text-xs text-zinc-600">
            Mặc định khách nhận chính file HTML ở trên. Nếu giao diện có nhiều file (ảnh, CSS, JS), hãy tải lên gói .zip.
          </p>
          <p className="rounded-lg bg-brand-50 px-3 py-2 text-xs">
            Hiện tại: <b>{zipName ?? (sourcePath && !sourcePath.endsWith("/index.html") ? "Gói ZIP đã tải lên" : "File HTML")}</b>
          </p>
          <div className="flex flex-wrap gap-2">
            <label className="btn-ghost cursor-pointer px-3 py-1.5 text-xs">
              Tải lên .zip
              <input type="file" accept=".zip,application/zip" hidden onChange={(e) => e.target.files?.[0] && uploadZip(e.target.files[0])} />
            </label>
            {sourcePath && !sourcePath.endsWith("/index.html") && (
              <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => { setSourcePath(null); setZipName(null); }}>
                Dùng file HTML
              </button>
            )}
          </div>
        </section>

        <section className="card space-y-3 p-5">
          <h2 className="font-bold">5. Thumbnail</h2>
          <div className="group aspect-[4/3] overflow-hidden rounded-xl bg-brand-50">
            {thumb ? <div className="thumb-scroll h-full w-full" style={{ backgroundImage: `url("${thumb}")` }} /> : (
              <div className="grid h-full place-items-center px-6 text-center text-xs text-zinc-500">Ảnh sẽ được chụp tự động sau khi lưu</div>
            )}
          </div>
          {isEdit && (
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={busy} className="btn-ghost px-3 py-1.5 text-xs" onClick={async () => { setBusy(true); await regenerateThumbnail(initial!.id); setBusy(false); }}>
                Chụp lại tự động
              </button>
              <label className="btn-ghost cursor-pointer px-3 py-1.5 text-xs">
                Tải ảnh lên
                <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setBusy(true); await regenerateThumbnail(initial!.id, f); setBusy(false); } }} />
              </label>
            </div>
          )}
        </section>

        <div className="sticky bottom-4 space-y-3">
          {status && <p className={`rounded-xl px-3 py-2 text-sm ${statusCls[status.type]}`} role="status">{status.text}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="btn-primary flex-1 py-3">{busy ? "Đang xử lý…" : isEdit ? "Lưu thay đổi" : "Lưu & tạo thumbnail"}</button>
            {isEdit && (
              <a href={`/templates/${form.slug}`} target="_blank" rel="noopener" className="btn-ghost py-3">Xem</a>
            )}
          </div>
          {isEdit && (
            <button type="button" disabled={busy} onClick={remove} className="w-full text-center text-xs text-red-600 hover:underline">Xoá giao diện</button>
          )}
        </div>
      </aside>
    </form>
  );
}
