import Link from "next/link";
import { Logo } from "./Logo";
import { getCurrentUser, isAdminEmail } from "@/lib/auth";

const NAV = [
  ["/#giao-dien", "Kho giao diện"],
  ["/#khac-biet", "Khác ở đâu"],
  ["/#lam-rieng", "Làm nội dung riêng"],
  ["/#faq", "Hỏi đáp"],
] as const;

export async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/75 backdrop-blur-xl backdrop-saturate-150">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 text-sm text-zinc-600 md:flex">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className="rounded-full px-3.5 py-2 transition hover:bg-zinc-100 hover:text-ink">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {isAdminEmail(user.email) && (
                <Link href="/admin" className="btn-ghost hidden sm:inline-flex">Quản trị</Link>
              )}
              <Link href="/account" className="btn-primary">Đơn hàng của tôi</Link>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 sm:inline-flex">
                Đăng nhập
              </Link>
              <Link href="/#giao-dien" className="btn-primary">Xem giao diện</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
