import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Bỏ qua file tĩnh, trang demo và webhook
  matcher: ["/((?!_next/static|_next/image|favicon.ico|demo/|api/webhooks/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
