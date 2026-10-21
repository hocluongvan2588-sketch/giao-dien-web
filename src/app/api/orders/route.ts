import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { effectivePrice } from "@/lib/format";
import { generateOrderCode } from "@/lib/payment";

/** Tạo đơn hàng (hoặc dùng lại đơn đang chờ thanh toán cho cùng giao diện). */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });

  const { templateId } = (await request.json().catch(() => ({}))) as { templateId?: string };
  if (!templateId) return NextResponse.json({ error: "Thiếu giao diện" }, { status: 400 });

  const db = createAdminClient();
  const { data: template } = await db
    .from("templates")
    .select("id, price, sale_price, status")
    .eq("id", templateId)
    .maybeSingle();
  if (!template || template.status !== "published") {
    return NextResponse.json({ error: "Giao diện không tồn tại" }, { status: 404 });
  }

  const { data: existing } = await db
    .from("orders")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("template_id", templateId)
    .in("status", ["pending", "paid"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existing) return NextResponse.json({ id: existing.id, status: existing.status });

  const amount = effectivePrice(template);
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await db
      .from("orders")
      .insert({
        code: generateOrderCode(),
        user_id: user.id,
        user_email: user.email ?? "",
        template_id: templateId,
        amount,
        // Giao diện miễn phí: giao ngay
        ...(amount === 0 ? { status: "paid", paid_at: new Date().toISOString(), payment_ref: "free" } : {}),
      })
      .select("id, status")
      .single();
    if (!error) return NextResponse.json(data, { status: 201 });
    if (error.code !== "23505") {
      console.error("Create order:", error.message);
      break;
    }
    // Trùng mã đơn (rất hiếm): thử lại với mã khác
  }
  return NextResponse.json({ error: "Không tạo được đơn hàng, vui lòng thử lại" }, { status: 500 });
}
