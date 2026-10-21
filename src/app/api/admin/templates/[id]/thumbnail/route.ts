import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { updateThumbnail } from "@/lib/templates-admin";

// Chụp ảnh bằng Chromium có thể mất 10–30 giây
export const maxDuration = 60;
export const runtime = "nodejs";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

/** Không gửi file → tự chụp từ HTML. Gửi multipart "file" → dùng ảnh tải lên. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  try {
    let image: { data: Blob; contentType: string } | undefined;
    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      const file = (await request.formData()).get("file");
      if (!(file instanceof Blob) || !ALLOWED.includes(file.type)) {
        return NextResponse.json({ error: "Ảnh phải là JPG, PNG hoặc WebP" }, { status: 400 });
      }
      if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "Ảnh tối đa 4MB" }, { status: 400 });
      image = { data: file, contentType: file.type };
    }
    const url = await updateThumbnail(id, image);
    return NextResponse.json({ thumbnail_url: url });
  } catch (e) {
    console.error("Thumbnail:", e);
    return NextResponse.json({ error: `Không chụp được ảnh: ${(e as Error).message}` }, { status: 500 });
  }
}
