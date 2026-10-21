import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseTemplateInput, storeHtmlSource } from "@/lib/templates-admin";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const input = parseTemplateInput(await request.json().catch(() => null));
  if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });

  const db = createAdminClient();
  const sourcePath = input.source_path ?? (await storeHtmlSource(id, input.demo_html));
  const { data, error } = await db
    .from("templates")
    .update({ ...input, source_path: sourcePath, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, slug")
    .single();
  if (error) {
    const msg = error.code === "23505" ? "Slug đã tồn tại, hãy chọn slug khác" : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const db = createAdminClient();

  const { count } = await db.from("orders").select("id", { count: "exact", head: true }).eq("template_id", id);
  if (count) {
    return NextResponse.json(
      { error: "Giao diện đã có đơn hàng, không thể xoá (khách cần tải lại). Hãy chuyển sang Bản nháp để ẩn." },
      { status: 409 },
    );
  }
  for (const bucket of ["thumbnails", "sources"]) {
    const { data: files } = await db.storage.from(bucket).list(id);
    if (files?.length) await db.storage.from(bucket).remove(files.map((f) => `${id}/${f.name}`));
  }
  const { error } = await db.from("templates").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
