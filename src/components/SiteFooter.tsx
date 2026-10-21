import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { CATEGORIES } from "@/lib/categories";

export function SiteFooter() {
  return (
    <footer id="lien-he" className="mt-28 bg-ink text-zinc-400">
      <div className="container-x grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-relaxed">
            Dịch vụ giao diện website của Vexim Global dành cho doanh nghiệp nông sản, thực phẩm,
            nhà máy sản xuất và xuất nhập khẩu.
          </p>
        </div>
        <div className="md:col-span-3">
          <h3 className="text-sm font-semibold text-white">Danh mục</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link href={`/?danh-muc=${c.id}#giao-dien`} className="transition hover:text-white">{c.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-4">
          <h3 className="text-sm font-semibold text-white">Liên hệ</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-2.5"><MapPin className="h-4 w-4 text-brand-400" /> Vexim Global</li>
            <li className="flex items-center gap-2.5"><Mail className="h-4 w-4 text-brand-400" /> contact@veximglobal.com</li>
            <li className="flex items-center gap-2.5"><Phone className="h-4 w-4 text-brand-400" /> 0900 000 000 (Zalo)</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col justify-between gap-2 py-6 text-xs text-zinc-500 sm:flex-row">
          <span>© {new Date().getFullYear()} Vexim Global. Bảo lưu mọi quyền.</span>
          <span>Thanh toán an toàn qua VietQR</span>
        </div>
      </div>
    </footer>
  );
}
