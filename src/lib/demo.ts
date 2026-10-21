import { SITE_NAME } from "@/lib/env";

/** Gắn nhãn nhỏ "Demo" vào giao diện trước khi hiển thị công khai. */
export function withDemoBadge(html: string, buyUrl: string) {
  const badge = `
<a href="${buyUrl}" target="_top" rel="noopener" style="position:fixed;right:16px;bottom:16px;z-index:2147483647;display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:999px;background:#193b29;color:#fff;font:600 13px/1 system-ui,sans-serif;text-decoration:none;box-shadow:0 8px 24px rgba(0,0,0,.25)">
  <span style="width:8px;height:8px;border-radius:50%;background:#8ec79f"></span>
  Demo · ${SITE_NAME} — Mua giao diện này
</a>`;
  return /<\/body>/i.test(html) ? html.replace(/<\/body>/i, `${badge}</body>`) : html + badge;
}
