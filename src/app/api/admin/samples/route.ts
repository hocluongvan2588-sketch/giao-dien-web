import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { storeHtmlSource } from "@/lib/templates-admin";

export const runtime = "nodejs";

interface SampleMeta {
  file: string;
  slug: string;
  [key: string]: unknown;
}

/**
 * Nhập các giao diện mẫu trong thư mục samples/ (bỏ qua slug đã tồn tại).
 * Thumbnail được trình duyệt yêu cầu chụp riêng từng cái sau đó, tránh timeout.
 */
export async function POST() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const dir = path.join(process.cwd(), "samples");
  const catalog = JSON.parse(await readFile(path.join(dir, "catalog.json"), "utf8")) as SampleMeta[];
  const db = createAdminClient();
  const created: string[] = [];

  for (const { file, ...meta } of catalog) {
    const { data: exists } = await db.from("templates").select("id").eq("slug", meta.slug).maybeSingle();
    if (exists) continue;

    const html = await readFile(path.join(dir, file), "utf8");
    const { data, error } = await db
      .from("templates")
      .insert({ ...meta, demo_html: html, status: "published" })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message, created }, { status: 500 });

    const sourcePath = await storeHtmlSource(data.id, html);
    await db.from("templates").update({ source_path: sourcePath }).eq("id", data.id);
    created.push(data.id);
  }
  return NextResponse.json({ created });
}
