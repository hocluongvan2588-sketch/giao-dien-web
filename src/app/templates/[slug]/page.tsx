import type { Metadata } from "next";
import Link from "next/link";
import { Check, Eye } from "lucide-react";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DevicePreview } from "@/components/DevicePreview";
import { BuyButton } from "@/components/BuyButton";
import { TemplateCard } from "@/components/TemplateCard";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { categoryLabel } from "@/lib/categories";
import { effectivePrice, formatVnd } from "@/lib/format";
import { CARD_COLUMNS, type Template, type TemplateCardData } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const DETAIL_COLUMNS =
  "id, slug, name, category, short_description, description, price, sale_price, tags, is_featured, thumbnail_url, sales_count, created_at, updated_at";

async function getTemplate(slug: string) {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("templates").select(DETAIL_COLUMNS).eq("slug", slug).eq("status", "published").maybeSingle();
  return data as Omit<Template, "demo_html" | "source_path" | "status"> | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTemplate((await params).slug);
  if (!t) return {};
  return {
    title: t.name,
    description: t.short_description,
    openGraph: { images: t.thumbnail_url ? [t.thumbnail_url] : [] },
  };
}

export default async function TemplateDetailPage({ params }: Props) {
  const t = await getTemplate((await params).slug);
  if (!t) notFound();

  const supabase = await createClient();
  const { data: related } = await supabase
    .from("templates")
    .select(CARD_COLUMNS)
    .eq("status", "published")
    .eq("category", t.category)
    .neq("id", t.id)
    .limit(4);

  const price = effectivePrice(t);
  const onSale = price < t.price;

  return (
    <>
      <SiteHeader />
      <main className="container-x py-8">
        <nav className="text-sm text-zinc-600" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-brand-700">Trang chủ</Link> /{" "}
          <Link href={`/?danh-muc=${t.category}#giao-dien`} className="hover:text-brand-700">{categoryLabel(t.category)}</Link> /{" "}
          <span className="text-ink">{t.name}</span>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-[-.03em] sm:text-4xl">{t.name}</h1>
            <p className="mt-2 text-zinc-600">{t.short_description}</p>
            <div className="mt-6">
              <DevicePreview src={`/demo/${t.slug}`} height={760} />
            </div>
            {t.description && (
              <section className="card mt-8 p-6">
                <h2 className="text-xl font-bold">Mô tả giao diện</h2>
                <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-700">{t.description}</div>
              </section>
            )}
          </div>

          <aside id="mua" className="scroll-mt-24">
            <div className="card sticky top-24 p-6 shadow-lift">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">{categoryLabel(t.category)}</p>
              <div className="mt-2 flex items-end gap-3">
                <p className="text-3xl font-semibold tracking-tight text-ink">{formatVnd(price)}</p>
                {onSale && <p className="pb-1 text-sm text-zinc-500 line-through">{formatVnd(t.price)}</p>}
              </div>
              <div className="mt-5"><BuyButton templateId={t.id} slug={t.slug} /></div>
              <a href={`/demo/${t.slug}`} target="_blank" rel="noopener" className="btn-ghost mt-2 w-full py-3"><Eye className="h-4 w-4" /> Xem demo toàn màn hình</a>
              <ul className="mt-6 space-y-3 border-t border-zinc-100 pt-6 text-sm text-zinc-700">
                {[
                  "Mã nguồn đầy đủ, bản không có nhãn demo",
                  "Chạy tốt trên máy tính, máy tính bảng, điện thoại",
                  "Thanh toán VietQR, chuyển khoản xong là tải file",
                  "Tải lại bao nhiêu lần cũng được",
                  "Vexim hỗ trợ cài đặt nếu bạn cần",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              {t.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-1.5">
                  {t.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-700">#{tag}</span>
                  ))}
                </div>
              )}
              {t.sales_count > 0 && <p className="mt-4 text-xs text-zinc-500">{t.sales_count} khách hàng đã mua</p>}
              <div className="mt-6 rounded-xl bg-zinc-50 p-4 text-sm">
                <p className="font-medium text-ink">Cần nội dung viết cho buyer nước ngoài?</p>
                <p className="mt-1 text-zinc-500">Vexim viết lại nội dung tiếng Việt và tiếng Anh theo thị trường bạn nhắm tới.</p>
                <Link href="/#lam-rieng" className="mt-2 inline-block font-medium text-brand-700 hover:underline">Xem cách làm</Link>
              </div>
            </div>
          </aside>
        </div>

        {related && related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold tracking-tight">Giao diện cùng lĩnh vực</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(related as TemplateCardData[]).map((r) => <TemplateCard key={r.id} t={r} />)}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
