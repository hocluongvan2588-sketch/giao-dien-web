import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { categoryLabel } from "@/lib/categories";
import { effectivePrice, formatDate, formatVnd } from "@/lib/format";
import { ImportSamples } from "./ImportSamples";

export default async function AdminHome() {
  const db = createAdminClient();
  const [{ data: templates, error }, { data: paid }] = await Promise.all([
    db
      .from("templates")
      .select("id, slug, name, category, price, sale_price, status, thumbnail_url, sales_count, updated_at")
      .order("updated_at", { ascending: false }),
    db.from("orders").select("amount").eq("status", "paid"),
  ]);
  const revenue = (paid ?? []).reduce((s, o) => s + o.amount, 0);

  const stats = [
    ["Giao diện", templates?.length ?? 0],
    ["Đang bán", templates?.filter((t) => t.status === "published").length ?? 0],
    ["Đơn đã thanh toán", paid?.length ?? 0],
    ["Doanh thu", formatVnd(revenue)],
  ];

  if (error) {
    return (
      <div className="card border-red-200 p-6 text-sm">
        <h1 className="text-lg font-bold text-red-700">Không đọc được bảng templates</h1>
        <p className="mt-2 text-zinc-700">Lỗi từ Supabase: <code>{error.message}</code></p>
        <p className="mt-2 text-zinc-700">
          Nếu bạn chưa tạo bảng, hãy vào Supabase, mở mục SQL Editor và chạy toàn bộ file <code>supabase/schema.sql</code>.
          Kiểm tra thêm biến <code>SUPABASE_SERVICE_ROLE_KEY</code> trên Vercel.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([k, v]) => (
          <div key={k} className="card p-5">
            <p className="text-xs font-medium text-zinc-600">{k}</p>
            <p className="mt-1 text-2xl font-bold text-ink">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Danh sách giao diện</h1>
        <ImportSamples />
      </div>
      {!templates?.length ? (
        <div className="card mt-6 p-12 text-center">
          <p className="text-zinc-600">Chưa có giao diện nào.</p>
          <Link href="/admin/templates/new" className="btn-primary mt-5">Dán HTML để tạo giao diện đầu tiên</Link>
        </div>
      ) : (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="p-4">Giao diện</th>
                <th className="p-4">Danh mục</th>
                <th className="p-4">Giá</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Đã bán</th>
                <th className="p-4">Cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {templates.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-50">
                  <td className="p-4">
                    <Link href={`/admin/templates/${t.id}`} className="flex items-center gap-3 font-semibold hover:text-brand-600">
                      <span className="h-12 w-16 shrink-0 rounded-md bg-brand-100 bg-cover bg-top" style={t.thumbnail_url ? { backgroundImage: `url("${t.thumbnail_url}")` } : undefined} />
                      {t.name}
                    </Link>
                  </td>
                  <td className="p-4">{categoryLabel(t.category)}</td>
                  <td className="p-4">{formatVnd(effectivePrice(t))}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${t.status === "published" ? "bg-brand-50 text-brand-700" : "bg-gray-100 text-gray-600"}`}>
                      {t.status === "published" ? "Đang bán" : "Bản nháp"}
                    </span>
                  </td>
                  <td className="p-4">{t.sales_count}</td>
                  <td className="p-4 text-zinc-600">{formatDate(t.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
