import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/** Giao file: kiểm tra đơn đã thanh toán & đúng chủ, rồi chuyển hướng tới signed URL hết hạn sau 2 phút. */
export async function GET(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL(`/login?next=/account`, request.url));

  const db = createAdminClient();
  const { data: order } = await db
    .from("orders")
    .select("id, user_id, status, templates(slug, source_path)")
    .eq("id", orderId)
    .maybeSingle();

  const template = order?.templates as unknown as { slug: string; source_path: string | null } | null;
  if (!order || order.user_id !== user.id) return new NextResponse("Không tìm thấy đơn hàng", { status: 404 });
  if (order.status !== "paid") return new NextResponse("Đơn hàng chưa được thanh toán", { status: 402 });
  if (!template?.source_path) return new NextResponse("File chưa sẵn sàng, vui lòng liên hệ hỗ trợ", { status: 409 });

  const ext = template.source_path.split(".").pop();
  const { data, error } = await db.storage
    .from("sources")
    .createSignedUrl(template.source_path, 120, { download: `vexim-harvest-${template.slug}.${ext}` });
  if (error || !data) return new NextResponse("Không tạo được liên kết tải", { status: 500 });

  return NextResponse.redirect(data.signedUrl);
}
