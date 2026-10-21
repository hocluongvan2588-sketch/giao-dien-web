import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

export const SITE_NAME = "Vexim Harvest";
export const SITE_TAGLINE = "Giao diện website cho doanh nghiệp nông sản và thực phẩm xuất khẩu";
export const COMPANY = "Vexim Global";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
