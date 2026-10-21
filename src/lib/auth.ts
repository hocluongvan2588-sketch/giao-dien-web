import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/** Trả về user nếu là admin, ngược lại null. */
export async function getAdminUser() {
  const user = await getCurrentUser();
  return user && isAdminEmail(user.email) ? user : null;
}

/** Dùng trong API admin: trả về Response 401/403 nếu không phải admin. */
export async function requireAdminApi(): Promise<{ ok: true } | { ok: false; response: Response }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, response: Response.json({ error: "Chưa đăng nhập" }, { status: 401 }) };
  if (!isAdminEmail(user.email)) return { ok: false, response: Response.json({ error: "Không có quyền" }, { status: 403 }) };
  return { ok: true };
}
