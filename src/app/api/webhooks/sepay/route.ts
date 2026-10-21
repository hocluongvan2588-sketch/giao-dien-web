import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractOrderCode } from "@/lib/payment";

/**
 * Webhook SePay: gọi mỗi khi tài khoản ngân hàng có giao dịch.
 * Cấu hình trong SePay → Webhooks: URL = {SITE_URL}/api/webhooks/sepay,
 * Kiểu chứng thực = API Key (header "Authorization: Apikey <key>").
 */
interface SepayPayload {
  id: number;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  code: string | null;
  content: string;
  transferType: "in" | "out";
  transferAmount: number;
  referenceCode: string;
}

function authorized(request: Request) {
  const expected = process.env.SEPAY_WEBHOOK_API_KEY;
  if (!expected) return false;
  const given = (request.headers.get("authorization") ?? "").replace(/^Apikey\s+/i, "");
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ success: false }, { status: 401 });

  const payload = (await request.json().catch(() => null)) as SepayPayload | null;
  if (!payload || typeof payload.id !== "number") {
    return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
  }
  if (payload.transferType !== "in") return NextResponse.json({ success: true, ignored: "outgoing" });

  const db = createAdminClient();

  // Chống xử lý trùng: SePay có thể gửi lại cùng một giao dịch
  const { error: dupError } = await db.from("payment_transactions").insert({
    id: payload.id,
    amount: payload.transferAmount,
    content: payload.content,
    raw: payload,
  });
  if (dupError?.code === "23505") return NextResponse.json({ success: true, duplicate: true });
  if (dupError) {
    console.error("SePay log:", dupError.message);
    return NextResponse.json({ success: false }, { status: 500 });
  }

  const code = extractOrderCode(`${payload.code ?? ""} ${payload.content ?? ""}`);
  if (!code) return NextResponse.json({ success: true, matched: false });

  const { data: order } = await db.from("orders").select("id, amount, status, template_id").eq("code", code).maybeSingle();
  if (!order) return NextResponse.json({ success: true, matched: false });

  await db.from("payment_transactions").update({ order_id: order.id }).eq("id", payload.id);

  if (order.status === "paid") return NextResponse.json({ success: true, alreadyPaid: true });
  if (payload.transferAmount < order.amount) {
    // Chuyển thiếu: giữ pending, admin xử lý thủ công
    return NextResponse.json({ success: true, matched: true, underpaid: true });
  }

  const { data: updated } = await db
    .from("orders")
    .update({ status: "paid", paid_at: new Date().toISOString(), payment_ref: payload.referenceCode || String(payload.id) })
    .eq("id", order.id)
    .neq("status", "paid")
    .select("id");
  if (updated?.length) await db.rpc("increment_sales", { tid: order.template_id });

  return NextResponse.json({ success: true, matched: true });
}
