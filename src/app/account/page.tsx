import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, formatVnd } from "@/lib/format";

export const metadata = { title: "Đơn hàng của tôi" };
export const dynamic = "force-dynamic";

const STATUS = {
  pending: { label: "Chờ thanh toán", cls: "bg-earth-50 text-earth-600" },
  paid: { label: "Đã thanh toán", cls: "bg-brand-50 text-brand-700" },
  cancelled: { label: "Đã huỷ", cls: "bg-red-50 text-red-700" },
} as const;

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, code, amount, status, created_at, templates(name, slug, thumbnail_url)")
    .order("created_at", { ascending: false });

  return (
    <>
      <SiteHeader />
      <main className="container-x py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Đơn hàng của tôi</h1>
            <p className="mt-1 text-sm text-zinc-600">{user.email}</p>
          </div>
          <form action="/auth/signout" method="post">
            <button className="btn-ghost">Đăng xuất</button>
          </form>
        </div>

        {!orders?.length ? (
          <div className="card mt-8 p-12 text-center">
            <p className="text-zinc-600">Bạn chưa có đơn hàng nào.</p>
            <Link href="/#giao-dien" className="btn-primary mt-5">Khám phá giao diện</Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {orders.map((o) => {
              const t = o.templates as unknown as { name: string; slug: string; thumbnail_url: string | null };
              const s = STATUS[o.status as keyof typeof STATUS];
              return (
                <li key={o.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <div className="aspect-[4/3] w-full shrink-0 rounded-xl bg-brand-50 bg-cover bg-top sm:w-32" style={t.thumbnail_url ? { backgroundImage: `url("${t.thumbnail_url}")` } : undefined} />
                  <div className="min-w-0 flex-1">
                    <Link href={`/templates/${t.slug}`} className="font-bold hover:text-brand-600">{t.name}</Link>
                    <p className="mt-1 text-sm text-zinc-600">
                      Mã đơn <span className="font-mono">{o.code}</span> · {formatDate(o.created_at)} · {formatVnd(o.amount)}
                    </p>
                    <span className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>{s.label}</span>
                  </div>
                  {o.status === "paid" ? (
                    <a href={`/api/download/${o.id}`} className="btn-primary">Tải mã nguồn</a>
                  ) : o.status === "pending" ? (
                    <Link href={`/checkout/${o.id}`} className="btn-ghost">Thanh toán</Link>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
