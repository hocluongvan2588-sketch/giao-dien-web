import Link from "next/link";
import type { TemplateCardData } from "@/lib/types";
import { categoryLabel } from "@/lib/categories";
import { effectivePrice, formatVnd, isNew } from "@/lib/format";

export function TemplateCard({ t }: { t: TemplateCardData }) {
  const price = effectivePrice(t);
  const onSale = price < t.price;
  return (
    <article className="group card flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/templates/${t.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-brand-50" aria-label={`Xem chi tiết ${t.name}`}>
        {t.thumbnail_url ? (
          <div className="thumb-scroll absolute inset-0" style={{ backgroundImage: `url("${t.thumbnail_url}")` }} />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-sm text-brand-500">Đang tạo ảnh xem trước…</div>
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          {t.is_featured && <span className="rounded-full bg-earth-500 px-2.5 py-1 text-[11px] font-bold text-white shadow">Bán chạy</span>}
          {isNew(t.created_at) && <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-brand-700 shadow">Mới</span>}
          {onSale && <span className="rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white shadow">-{Math.round((1 - price / t.price) * 100)}%</span>}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">{categoryLabel(t.category)}</p>
        <h3 className="mt-1 line-clamp-1 text-base font-bold text-brand-950">
          <Link href={`/templates/${t.slug}`} className="hover:text-brand-600">{t.name}</Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-brand-900/70">{t.short_description}</p>
        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <p className="text-lg font-extrabold text-brand-800">{formatVnd(price)}</p>
            {onSale && <p className="text-xs text-brand-900/45 line-through">{formatVnd(t.price)}</p>}
          </div>
          {t.sales_count > 0 && <p className="text-xs text-brand-900/55">{t.sales_count} lượt mua</p>}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <a href={`/demo/${t.slug}`} target="_blank" rel="noopener" className="btn-ghost px-3 py-2">Xem demo</a>
          <Link href={`/templates/${t.slug}#mua`} className="btn-primary px-3 py-2">Mua ngay</Link>
        </div>
      </div>
    </article>
  );
}
