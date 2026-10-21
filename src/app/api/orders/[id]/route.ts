import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Trang checkout gọi định kỳ để biết đơn đã được thanh toán chưa. RLS đảm bảo chỉ chủ đơn đọc được. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("orders").select("id, status, paid_at").eq("id", id).maybeSingle();
  if (!data) return NextResponse.json({ error: "Không tìm thấy đơn" }, { status: 404 });
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
