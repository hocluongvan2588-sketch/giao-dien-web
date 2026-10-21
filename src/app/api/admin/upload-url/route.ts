import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Cấp signed upload URL để trình duyệt upload file ZIP mã nguồn thẳng lên Supabase Storage
 * (tránh giới hạn kích thước body của serverless function).
 */
export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { filename } = (await request.json().catch(() => ({}))) as { filename?: string };
  if (!filename?.toLowerCase().endsWith(".zip")) {
    return NextResponse.json({ error: "Chỉ nhận file .zip" }, { status: 400 });
  }
  const path = `packages/${crypto.randomUUID()}.zip`;
  const { data, error } = await createAdminClient().storage.from("sources").createSignedUploadUrl(path);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ path: data.path, token: data.token });
}
