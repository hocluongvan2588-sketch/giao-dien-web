import Link from "next/link";
import { Logo } from "./Logo";
import { getCurrentUser, isAdminEmail } from "@/lib/auth";

export async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b border-brand-100/70 bg-[#fbfaf6]/85 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-brand-800 md:flex">
          <Link href="/#giao-dien" className="hover:text-brand-600">Giao diện</Link>
          <Link href="/#quy-trinh" className="hover:text-brand-600">Quy trình mua</Link>
          <Link href="/#faq" className="hover:text-brand-600">Hỏi đáp</Link>
          <Link href="/#lien-he" className="hover:text-brand-600">Liên hệ</Link>
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
              <Link href="/login" className="btn-ghost hidden sm:inline-flex">Đăng nhập</Link>
              <Link href="/#giao-dien" className="btn-primary">Xem giao diện</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
