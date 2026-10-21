import type { Metadata } from "next";
import Link from "next/link";
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
        <nav className="text-sm text-brand-900/60" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-brand-700">Trang chủ</Link> /{" "}
          <Link href={`/?danh-muc=${t.category}#giao-dien`} className="hover:text-brand-700">{categoryLabel(t.category)}</Link> /{" "}
          <span className="text-brand-900">{t.name}</span>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t.name}</h1>
            <p className="mt-2 text-brand-900/70">{t.short_description}</p>
            <div className="mt-6">
              <DevicePreview src={`/demo/${t.slug}`} height={760} />
            </div>
            {t.description && (
              <section className="card mt-8 p-6">
                <h2 className="text-xl font-bold">Mô tả giao diện</h2>
                <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-brand-900/80">{t.description}</div>
              </section>
            )}
          </div>

          <aside id="mua" className="scroll-mt-24">
            <div className="card sticky top-24 p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">{categoryLabel(t.category)}</p>
              <div className="mt-2 flex items-end gap-3">
                <p className="text-3xl font-extrabold text-brand-800">{formatVnd(price)}</p>
                {onSale && <p className="pb-1 text-sm text-brand-900/45 line-through">{formatVnd(t.price)}</p>}
              </div>
              <div className="mt-5"><BuyButton templateId={t.id} slug={t.slug} /></div>
              <a href={`/demo/${t.slug}`} target="_blank" rel="noopener" className="btn-ghost mt-2 w-full py-3">Xem demo toàn màn hình</a>
              <ul className="mt-6 space-y-2.5 text-sm text-brand-900/80">
                <li>✅ Mã nguồn HTML/CSS/JS đầy đủ</li>
                <li>✅ Responsive desktop · tablet · mobile</li>
                <li>✅ Thanh toán VietQR, nhận file tự động</li>
                <li>✅ Tải lại không giới hạn</li>
                <li>✅ Hỗ trợ cài đặt từ Vexim Global</li>
              </ul>
              {t.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-1.5">
                  {t.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-700">#{tag}</span>
                  ))}
                </div>
              )}
              {t.sales_count > 0 && <p className="mt-4 text-xs text-brand-900/55">{t.sales_count} khách hàng đã mua</p>}
            </div>
          </aside>
        </div>

        {related && related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-extrabold tracking-tight">Giao diện cùng lĩnh vực</h2>
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
