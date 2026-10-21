import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { formatVnd } from "@/lib/format";
import { bankInfo, vietQrUrl } from "@/lib/payment";
import { PaymentStatus } from "./PaymentStatus";

export const metadata = { title: "Thanh toán" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/checkout/${orderId}`);

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, code, amount, status, templates(name, slug, thumbnail_url)")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) notFound();

  const template = order.templates as unknown as { name: string; slug: string; thumbnail_url: string | null };
  const bank = bankInfo();

  return (
    <>
      <SiteHeader />
      <main className="container-x py-10">
        <Link href={`/templates/${template.slug}`} className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-ink"><ArrowLeft className="h-4 w-4" /> Quay lại giao diện</Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Thanh toán đơn hàng</h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="card p-6 sm:p-8">
            {order.status === "pending" ? (
              <div className="grid items-start gap-8 md:grid-cols-[260px_1fr]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={vietQrUrl(order.amount, order.code)} alt={`Mã VietQR thanh toán ${formatVnd(order.amount)}`} className="w-full rounded-xl border border-zinc-200" />
                <div>
                  <h2 className="text-lg font-bold">Quét mã QR bằng app ngân hàng</h2>
                  <p className="mt-1 text-sm text-zinc-600">Hoặc chuyển khoản thủ công với thông tin bên dưới. <b>Giữ nguyên nội dung chuyển khoản</b> để hệ thống tự xác nhận.</p>
                  <dl className="mt-5 divide-y divide-zinc-100 rounded-xl border border-zinc-200 text-sm">
                    {[
                      ["Ngân hàng", bank.bank],
                      ["Số tài khoản", bank.accountNo],
                      ["Chủ tài khoản", bank.accountName],
                      ["Số tiền", formatVnd(order.amount)],
                      ["Nội dung", order.code],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 px-4 py-2.5">
                        <dt className="text-zinc-600">{k}</dt>
                        <dd className={`text-right font-semibold ${k === "Nội dung" ? "font-mono text-earth-600" : ""}`}>{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            ) : null}
            <PaymentStatus orderId={order.id} initialStatus={order.status} />
          </section>

          <aside className="card h-fit p-6">
            <h2 className="font-bold">Tóm tắt đơn hàng</h2>
            {template.thumbnail_url && (
              <div className="mt-4 aspect-[4/3] rounded-xl bg-cover bg-top" style={{ backgroundImage: `url("${template.thumbnail_url}")` }} />
            )}
            <p className="mt-4 font-semibold">{template.name}</p>
            <div className="mt-4 flex justify-between border-t border-zinc-200 pt-4 text-sm">
              <span>Mã đơn</span><span className="font-mono font-semibold">{order.code}</span>
            </div>
            <div className="mt-2 flex justify-between text-lg font-bold">
              <span>Tổng cộng</span><span className="text-ink">{formatVnd(order.amount)}</span>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
