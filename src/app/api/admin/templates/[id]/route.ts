import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseTemplateInput, storeHtmlSource, toRow } from "@/lib/templates-admin";
import { isMissingDemoColumn, MIGRATION_HINT } from "@/lib/demo";
import { removeDemoFolder } from "@/lib/package";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const input = parseTemplateInput(await request.json().catch(() => null));
  if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });

  const db = createAdminClient();
  const sourcePath = input.source_path ?? (await storeHtmlSource(id, input.demo_html));
  const save = (row: object) =>
    db.from("templates").update({ ...row, source_path: sourcePath, updated_at: new Date().toISOString() }).eq("id", id).select("id, slug").single();
  let { data, error } = await save(input);
  // Database chưa có cột demo_base_url: giao diện HTML thường vẫn lưu được
  if (isMissingDemoColumn(error) && !input.demo_base_url) ({ data, error } = await save(toRow(input)));
  if (error || !data) {
    const msg = error?.code === "23505" ? "Slug đã tồn tại, hãy chọn slug khác" : isMissingDemoColumn(error) ? MIGRATION_HINT : (error?.message ?? "Không lưu được");
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
  const { data: tpl } = await db.from("templates").select("demo_base_url").eq("id", id).maybeSingle();
  if (tpl?.demo_base_url) await removeDemoFolder(tpl.demo_base_url); // lỗi do thiếu cột thì tpl = null, bỏ qua
  for (const bucket of ["thumbnails", "sources"]) {
    const { data: files } = await db.storage.from(bucket).list(id);
    if (files?.length) await db.storage.from(bucket).remove(files.map((f) => `${id}/${f.name}`));
  }
  const { error } = await db.from("templates").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
