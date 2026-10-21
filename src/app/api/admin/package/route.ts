import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { extractPackage } from "@/lib/package";

// Giải nén và tải hàng trăm file lên Storage có thể mất vài chục giây
export const maxDuration = 60;
export const runtime = "nodejs";

/** Giải nén gói ZIP (đã upload vào bucket "sources") để chạy demo đầy đủ CSS/JS/ảnh. */
export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { zipPath } = (await request.json().catch(() => ({}))) as { zipPath?: string };
  if (!zipPath || !/^packages\/[\w-]+\.zip$/.test(zipPath)) {
    return NextResponse.json({ error: "Đường dẫn gói ZIP không hợp lệ" }, { status: 400 });
  }
  try {
    return NextResponse.json(await extractPackage(zipPath));
  } catch (e) {
    console.error("Extract package:", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
