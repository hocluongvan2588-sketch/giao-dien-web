import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate, formatVnd } from "@/lib/format";
import { OrderActions } from "./OrderActions";

const LABEL = { pending: "Chờ thanh toán", paid: "Đã thanh toán", cancelled: "Đã huỷ" } as const;

export default async function AdminOrdersPage() {
  const { data: orders } = await createAdminClient()
    .from("orders")
    .select("id, code, user_email, amount, status, created_at, paid_at, payment_ref, templates(name)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="text-2xl font-bold">Đơn hàng</h1>
      <p className="mt-1 text-sm text-zinc-600">Đơn được xác nhận tự động qua webhook SePay. Dùng "Xác nhận" khi khách chuyển sai nội dung.</p>
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="p-4">Mã đơn</th><th className="p-4">Khách hàng</th><th className="p-4">Giao diện</th>
              <th className="p-4">Số tiền</th><th className="p-4">Trạng thái</th><th className="p-4">Thời gian</th><th className="p-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {(orders ?? []).map((o) => (
              <tr key={o.id}>
                <td className="p-4 font-mono font-semibold">{o.code}</td>
                <td className="p-4">{o.user_email}</td>
                <td className="p-4">{(o.templates as unknown as { name: string } | null)?.name}</td>
                <td className="p-4">{formatVnd(o.amount)}</td>
                <td className="p-4">
                  {LABEL[o.status as keyof typeof LABEL]}
                  {o.payment_ref && <span className="block text-xs text-zinc-500">Ref: {o.payment_ref}</span>}
                </td>
                <td className="p-4 text-zinc-600">{formatDate(o.paid_at ?? o.created_at)}</td>
                <td className="p-4 text-right">{o.status === "pending" && <OrderActions id={o.id} />}</td>
              </tr>
            ))}
            {!orders?.length && <tr><td colSpan={7} className="p-10 text-center text-zinc-500">Chưa có đơn hàng.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
