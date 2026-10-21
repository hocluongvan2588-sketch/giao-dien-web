import Link from "next/link";
import { Logo } from "./Logo";
import { CATEGORIES } from "@/lib/categories";

export function SiteFooter() {
  return (
    <footer id="lien-he" className="mt-24 bg-brand-950 text-brand-100">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-200/80">
            Vexim Harvest là dịch vụ giao diện website của Vexim Global, dành riêng cho doanh nghiệp
            nông sản, thực phẩm, nhà máy sản xuất và xuất nhập khẩu. Giao diện chuẩn responsive, tối ưu SEO,
            dễ chỉnh sửa.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Danh mục</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link href={`/?danh-muc=${c.id}#giao-dien`} className="text-brand-200/80 hover:text-white">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Liên hệ</h3>
          <ul className="mt-4 space-y-2 text-sm text-brand-200/80">
            <li>Vexim Global</li>
            <li>Email: contact@veximglobal.com</li>
            <li>Hotline / Zalo: 0900 000 000</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x py-5 text-xs text-brand-200/60">
          © {new Date().getFullYear()} Vexim Global. Bảo lưu mọi quyền.
        </div>
      </div>
    </footer>
  );
}
