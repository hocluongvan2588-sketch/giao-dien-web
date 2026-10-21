import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, siteUrl } from "@/lib/env";
import { withDemoBadge } from "@/lib/demo";

/**
 * Trả về HTML demo của giao diện. Header CSP `sandbox` khiến trang chạy ở origin
 * riêng biệt (không đọc được cookie/session của site) kể cả khi mở trực tiếp.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isSupabaseConfigured) return new Response("Not configured", { status: 503 });

  const supabase = await createClient();
  const { data } = await supabase
    .from("templates")
    .select("demo_html")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!data) return new Response("Không tìm thấy giao diện", { status: 404 });

  return new Response(withDemoBadge(data.demo_html, `${siteUrl()}/templates/${slug}#mua`), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": "sandbox allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation",
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "public, max-age=60, s-maxage=300",
    },
  });
}
