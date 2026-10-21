import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Client dùng service role — bỏ qua RLS. Chỉ gọi sau khi đã kiểm tra quyền. */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
