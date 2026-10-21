import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { getCurrentUser, isAdminEmail } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Quản trị", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!isAdminEmail(user.email)) {
    return (
      <main className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">Bạn không có quyền truy cập trang quản trị</h1>
          <p className="mt-2 text-sm text-zinc-600">Tài khoản {user.email} chưa nằm trong ADMIN_EMAILS.</p>
          <Link href="/" className="btn-primary mt-6">Về trang chủ</Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden gap-5 text-sm font-medium sm:flex">
              <Link href="/admin" className="hover:text-brand-600">Giao diện</Link>
              <Link href="/admin/orders" className="hover:text-brand-600">Đơn hàng</Link>
              <Link href="/" className="hover:text-brand-600">Xem website ↗</Link>
            </nav>
          </div>
          <Link href="/admin/templates/new" className="btn-primary">+ Thêm giao diện</Link>
        </div>
      </header>
      <main className="container-x py-8">{children}</main>
    </div>
  );
}
