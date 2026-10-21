import Link from "next/link";
import { ArrowUpRight, Eye } from "lucide-react";
import type { TemplateCardData } from "@/lib/types";
import { categoryLabel } from "@/lib/categories";
import { effectivePrice, formatVnd, isNew } from "@/lib/format";

export function TemplateCard({ t }: { t: TemplateCardData }) {
  const price = effectivePrice(t);
  const onSale = price < t.price;
  return (
    <article className="group relative flex flex-col">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-100 shadow-card ring-0 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lift">
        {/* Thanh trình duyệt giả */}
        <div className="flex h-7 items-center gap-1.5 border-b border-zinc-200/80 bg-white px-3">
          <span className="h-2 w-2 rounded-full bg-zinc-300" />
          <span className="h-2 w-2 rounded-full bg-zinc-300" />
          <span className="h-2 w-2 rounded-full bg-zinc-300" />
        </div>
        <div className="relative aspect-[16/11]">
          {t.thumbnail_url ? (
            <div className="thumb-scroll absolute inset-0" style={{ backgroundImage: `url("${t.thumbnail_url}")` }} role="img" aria-label={`Ảnh giao diện ${t.name}`} />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-zinc-50 to-zinc-100 text-xs text-zinc-400">Đang tạo ảnh xem trước…</div>
          )}
          {/* Lớp nút khi hover */}
          <Link href={`/templates/${t.slug}`} className="absolute inset-0" aria-label={`Xem chi tiết ${t.name}`} tabIndex={-1} />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 bg-ink/0 opacity-0 [&>*]:pointer-events-auto transition duration-300 group-hover:bg-ink/35 group-hover:opacity-100 group-focus-within:bg-ink/35 group-focus-within:opacity-100">
            <a href={`/demo/${t.slug}`} target="_blank" rel="noopener" className="btn bg-white px-4 py-2 text-ink shadow-lg hover:bg-zinc-100">
              <Eye className="h-4 w-4" /> Xem demo
            </a>
            <Link href={`/templates/${t.slug}`} className="btn bg-brand-600 px-4 py-2 text-white shadow-lg hover:bg-brand-700">
              Chi tiết <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="pointer-events-none absolute left-3 top-3 flex gap-1.5">
            {t.is_featured && <span className="rounded-full bg-ink/90 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">Bán chạy</span>}
            {isNew(t.created_at) && <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-brand-700 shadow-sm">Mới</span>}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold tracking-[-.01em] text-ink">
            <Link href={`/templates/${t.slug}`} className="hover:text-brand-700">{t.name}</Link>
          </h3>
          <p className="mt-1 truncate text-[13px] text-zinc-500">
            {categoryLabel(t.category)}
            {t.sales_count > 0 && <> · {t.sales_count} lượt mua</>}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[15px] font-semibold text-ink">{formatVnd(price)}</p>
          {onSale && <p className="text-xs text-zinc-400 line-through">{formatVnd(t.price)}</p>}
        </div>
      </div>
    </article>
  );
}
