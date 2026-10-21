import { siteUrl } from "@/lib/env";
import { prepareDemoHtml, withDemoBadge } from "@/lib/demo";
import { DEMO_HEADERS, getPublishedDemo } from "@/lib/demo-server";

/** Trang chủ của giao diện demo. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPublishedDemo(slug);
  if (!data) return new Response("Không tìm thấy giao diện", { status: 404 });

  const html = prepareDemoHtml(data.demo_html, data.demo_base_url, `${siteUrl()}/demo/${slug}/`);
  return new Response(withDemoBadge(html, `${siteUrl()}/templates/${slug}#mua`), { headers: DEMO_HEADERS });
}
