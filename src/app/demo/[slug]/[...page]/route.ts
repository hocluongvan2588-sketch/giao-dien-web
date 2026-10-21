import { siteUrl } from "@/lib/env";
import { withAssetBase, withDemoBadge } from "@/lib/demo";
import { DEMO_HEADERS, getPublishedDemo } from "@/lib/demo-server";

/** Các trang con của giao diện nhiều trang (VD: about.html, shop/cart.html) lấy từ gói ZIP. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string; page: string[] }> }) {
  const { slug, page } = await params;
  const rel = page.map(decodeURIComponent).join("/");
  if (!/\.html?$/i.test(rel) || rel.split("/").some((seg) => !seg || seg === "..")) {
    return new Response("Không tìm thấy trang", { status: 404 });
  }

  const data = await getPublishedDemo(slug);
  if (!data?.demo_base_url) return new Response("Không tìm thấy trang", { status: 404 });

  const res = await fetch(data.demo_base_url + rel.split("/").map(encodeURIComponent).join("/"), { cache: "no-store" });
  if (!res.ok) return new Response("Không tìm thấy trang", { status: 404 });

  // <base> của trang con là thư mục chứa nó, để đường dẫn tương đối trong trang vẫn đúng
  const dir = rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/") + 1) : "";
  const html = withAssetBase(await res.text(), data.demo_base_url + dir, `${siteUrl()}/demo/${slug}/${dir}`);
  return new Response(withDemoBadge(html, `${siteUrl()}/templates/${slug}#mua`), { headers: DEMO_HEADERS });
}
