import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/** Xác nhận thủ công (khách chuyển sai nội dung) hoặc huỷ đơn. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const { action } = (await request.json().catch(() => ({}))) as { action?: string };
  const db = createAdminClient();

  if (action === "confirm") {
    const { data } = await db
      .from("orders")
      .update({ status: "paid", paid_at: new Date().toISOString(), payment_ref: "manual" })
      .eq("id", id)
      .neq("status", "paid")
      .select("template_id");
    if (data?.[0]) await db.rpc("increment_sales", { tid: data[0].template_id });
    return NextResponse.json({ ok: true });
  }
  if (action === "cancel") {
    await db.from("orders").update({ status: "cancelled" }).eq("id", id).eq("status", "pending");
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Thao tác không hợp lệ" }, { status: 400 });
}
