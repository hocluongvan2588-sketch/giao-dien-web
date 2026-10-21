import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { isMissingDemoColumn } from "@/lib/demo";

export const DEMO_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  // CSP sandbox: trang demo chạy ở origin riêng biệt, không đọc được cookie/session của site
  "Content-Security-Policy": "sandbox allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation",
  "X-Robots-Tag": "noindex, nofollow",
  "Cache-Control": "public, max-age=60, s-maxage=300",
};

export async function getPublishedDemo(slug: string) {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const query = (columns: string) =>
    supabase.from("templates").select(columns).eq("slug", slug).eq("status", "published").maybeSingle();
  let { data, error } = await query("demo_html, demo_base_url");
  // Database chưa chạy migration 002: vẫn phục vụ demo HTML thường
  if (isMissingDemoColumn(error)) ({ data, error } = await query("demo_html"));
  return data as unknown as { demo_html: string; demo_base_url?: string | null } | null;
}
