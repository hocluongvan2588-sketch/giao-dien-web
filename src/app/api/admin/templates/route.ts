import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseTemplateInput, storeHtmlSource, toRow } from "@/lib/templates-admin";
import { isMissingDemoColumn, MIGRATION_HINT } from "@/lib/demo";

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const input = parseTemplateInput(await request.json().catch(() => null));
  if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });

  const db = createAdminClient();
  const { data, error } = await db.from("templates").insert(toRow(input)).select("id, slug").single();
  if (error) {
    const msg = error.code === "23505" ? "Slug đã tồn tại, hãy chọn slug khác" : isMissingDemoColumn(error) ? MIGRATION_HINT : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (!input.source_path) {
    const path = await storeHtmlSource(data.id, input.demo_html);
    await db.from("templates").update({ source_path: path }).eq("id", data.id);
  }
  return NextResponse.json(data, { status: 201 });
}
