import { SITE_NAME } from "@/lib/env";
import { SUPABASE_URL } from "@/lib/supabase/config";

/** Bucket public chứa file giải nén từ gói ZIP (CSS, JS, ảnh, các trang HTML). */
export const DEMO_BUCKET = "demos";

export function demoPublicPrefix() {
  return `${SUPABASE_URL}/storage/v1/object/public/${DEMO_BUCKET}/`;
}

export const MIGRATION_HINT =
  'Database chưa có cột demo_base_url. Vào Supabase, mở mục SQL Editor, chạy file supabase/migrations/002_demo_zip.sql rồi thử lại.';

/** Lỗi do chưa chạy migration thêm cột demo_base_url. */
export function isMissingDemoColumn(error: { message?: string } | null | undefined) {
  return Boolean(error?.message?.includes("demo_base_url"));
}

/** Chỉ chấp nhận base URL trỏ vào bucket demos của chính project. */
export function isValidDemoBase(url: string) {
  return url.startsWith(demoPublicPrefix()) && url.endsWith("/") && !url.includes("..");
}

/** Gắn nhãn nhỏ "Demo" vào giao diện trước khi hiển thị công khai. */
export function withDemoBadge(html: string, buyUrl: string) {
  const badge = `
<a href="${buyUrl}" target="_top" rel="noopener" style="position:fixed;right:16px;bottom:16px;z-index:2147483647;display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:999px;background:#193b29;color:#fff;font:600 13px/1 system-ui,sans-serif;text-decoration:none;box-shadow:0 8px 24px rgba(0,0,0,.25)">
  <span style="width:8px;height:8px;border-radius:50%;background:#8ec79f"></span>
  Bản demo của ${SITE_NAME}. Mua giao diện này
</a>`;
  return /<\/body>/i.test(html) ? html.replace(/<\/body>/i, `${badge}</body>`) : html + badge;
}

/**
 * Giao diện từ gói ZIP: chèn <base> trỏ vào thư mục đã giải nén để CSS/JS/ảnh
 * dùng đường dẫn tương đối vẫn tải đúng.
 * Vì <base> đổi gốc của mọi link, thêm script nhỏ để:
 *  - link "#muc" vẫn cuộn trong trang (nếu template không tự xử lý),
 *  - link sang trang HTML khác mở qua route demo (pagesUrl) thay vì file thô trên Storage.
 */
export function withAssetBase(html: string, baseUrl: string, pagesUrl?: string) {
  const script = `<script>(function(){var B=${JSON.stringify(baseUrl)},P=${JSON.stringify(pagesUrl ?? "")};
document.addEventListener("click",function(e){if(e.defaultPrevented||e.button!==0)return;
var a=e.target&&e.target.closest?e.target.closest("a[href]"):null;if(!a||a.target==="_blank")return;
var h=a.getAttribute("href")||"";
if(h.charAt(0)==="#"){e.preventDefault();if(h.length<2){window.scrollTo({top:0,behavior:"smooth"});return}
var t=document.getElementById(decodeURIComponent(h.slice(1)))||document.querySelector('[name="'+h.slice(1).replace(/"/g,"")+'"]');
if(t)t.scrollIntoView({behavior:"smooth"});return}
if(!P)return;var u=a.href;if(u.indexOf(B)!==0)return;var rel=u.slice(B.length).split("#")[0].split("?")[0];
if(/\\.html?$/i.test(rel)){e.preventDefault();location.href=P+rel}});})();</script>`;
  const head = `<base href="${baseUrl}">${script}`;
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, (m) => m + head);
  if (/<html[^>]*>/i.test(html)) return html.replace(/<html[^>]*>/i, (m) => `${m}<head>${head}</head>`);
  return head + html;
}

/** Chuẩn bị HTML để hiển thị: chèn base (nếu có gói ZIP). */
export function prepareDemoHtml(html: string, baseUrl: string | null | undefined, pagesUrl?: string) {
  return baseUrl ? withAssetBase(html, baseUrl, pagesUrl) : html;
}
