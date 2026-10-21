import { Suspense } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TemplateBrowser } from "@/components/TemplateBrowser";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { CATEGORIES } from "@/lib/categories";
import { CARD_COLUMNS, type TemplateCardData } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getTemplates(): Promise<TemplateCardData[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("templates")
    .select(CARD_COLUMNS)
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (error) console.error("Load templates:", error.message);
  return (data as TemplateCardData[] | null) ?? [];
}

const FEATURES = [
  { icon: "📱", title: "Chuẩn responsive", text: "Hiển thị đẹp trên máy tính, máy tính bảng và điện thoại. Kiểm tra ngay bằng nút đổi thiết bị khi xem demo." },
  { icon: "⚡", title: "Nhẹ & tải nhanh", text: "HTML/CSS thuần, không phụ thuộc nền tảng. Có thể đặt lên bất kỳ hosting hoặc CMS nào." },
  { icon: "🔎", title: "Tối ưu SEO", text: "Cấu trúc thẻ tiêu đề rõ ràng, hỗ trợ meta và schema để sản phẩm của bạn dễ lên Google." },
  { icon: "🌾", title: "Đúng ngành", text: "Bố cục thiết kế riêng cho nông sản, thực phẩm, nhà máy: catalogue sản phẩm, chứng nhận, quy trình, xuất khẩu." },
  { icon: "🛠️", title: "Dễ chỉnh sửa", text: "Mã nguồn gọn, có chú thích. Đổi màu, logo, nội dung chỉ trong vài phút." },
  { icon: "🤝", title: "Hỗ trợ cài đặt", text: "Đội ngũ Vexim Global hỗ trợ đưa giao diện lên tên miền, hosting của bạn." },
];

const STEPS = [
  { n: "01", title: "Chọn giao diện", text: "Xem demo trực tiếp trên mọi thiết bị, chọn mẫu phù hợp doanh nghiệp." },
  { n: "02", title: "Thanh toán VietQR", text: "Quét mã QR bằng app ngân hàng. Hệ thống tự xác nhận trong vài giây." },
  { n: "03", title: "Nhận file ngay", text: "Tải mã nguồn trong mục “Đơn hàng của tôi”, tải lại bất cứ lúc nào." },
];

const FAQ = [
  { q: "Tôi nhận được gì sau khi mua?", a: "Toàn bộ mã nguồn HTML/CSS/JS của giao diện (không có nhãn demo), tải về dưới dạng file. Bạn có thể tải lại bất kỳ lúc nào trong mục Đơn hàng của tôi." },
  { q: "Bao lâu thì nhận được file?", a: "Ngay khi chuyển khoản thành công (thường dưới 1 phút). Hệ thống đối soát tự động qua nội dung chuyển khoản, bạn không cần gửi ảnh chụp." },
  { q: "Tôi chuyển khoản sai nội dung thì sao?", a: "Liên hệ hotline/Zalo kèm mã đơn hàng, đội ngũ Vexim Global sẽ xác nhận thủ công cho bạn." },
  { q: "Có dùng được với WordPress hay hosting của tôi không?", a: "Giao diện là HTML thuần nên dùng được trên mọi hosting. Nếu cần chuyển sang WordPress hoặc cài lên tên miền, hãy liên hệ để được báo giá dịch vụ." },
  { q: "Một giao diện được dùng cho bao nhiêu website?", a: "Mỗi lượt mua dùng cho 1 website của bạn hoặc của 1 khách hàng của bạn. Không được bán lại mã nguồn dưới dạng giao diện." },
];

export default async function HomePage() {
  const templates = await getTemplates();
  const heroShots = templates.filter((t) => t.thumbnail_url).slice(0, 2);

  return (
    <>
      <SiteHeader />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand-100 blur-3xl" />
          <div className="pointer-events-none absolute -left-32 top-40 h-[360px] w-[360px] rounded-full bg-earth-100 blur-3xl" />
          <div className="container-x relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold text-brand-700">
                <span className="h-2 w-2 rounded-full bg-brand-500" /> Dịch vụ giao diện web của Vexim Global
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-brand-950 sm:text-5xl lg:text-6xl">
                Website đẹp cho doanh nghiệp{" "}
                <span className="bg-gradient-to-r from-brand-600 to-earth-500 bg-clip-text text-transparent">
                  nông sản & thực phẩm
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-brand-900/70">
                Kho giao diện HTML thiết kế riêng cho trang trại, nhà máy chế biến, thương hiệu thực phẩm sạch
                và doanh nghiệp xuất khẩu. Xem demo trực tiếp, thanh toán VietQR, nhận mã nguồn ngay.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="#giao-dien" className="btn-primary px-6 py-3 text-base">Khám phá giao diện</Link>
                <Link href="#quy-trinh" className="btn-ghost px-6 py-3 text-base">Cách mua hàng</Link>
              </div>
              <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
                <div><dt className="text-xs text-brand-900/60">Giao diện</dt><dd className="text-2xl font-extrabold text-brand-800">{templates.length}+</dd></div>
                <div><dt className="text-xs text-brand-900/60">Lĩnh vực</dt><dd className="text-2xl font-extrabold text-brand-800">{CATEGORIES.length}</dd></div>
                <div><dt className="text-xs text-brand-900/60">Giao file</dt><dd className="text-2xl font-extrabold text-brand-800">Tức thì</dd></div>
              </dl>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="rounded-2xl border border-brand-200 bg-white p-2 shadow-2xl">
                <div className="flex gap-1.5 px-2 pb-2 pt-1" aria-hidden>
                  <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
                </div>
                <div className="group aspect-[16/10] overflow-hidden rounded-lg bg-gradient-to-br from-brand-100 to-earth-100">
                  {heroShots[0] ? (
                    <div className="thumb-scroll h-full w-full" style={{ backgroundImage: `url("${heroShots[0].thumbnail_url}")` }} />
                  ) : (
                    <div className="grid h-full place-items-center text-6xl" aria-hidden>🌾🥬🏭</div>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-10 -right-4 hidden w-32 rounded-[1.6rem] border-4 border-brand-950 bg-brand-950 shadow-2xl sm:block">
                <div className="aspect-[9/19] overflow-hidden rounded-[1.25rem] bg-brand-50">
                  {heroShots[1] ?? heroShots[0] ? (
                    <div className="h-full w-full bg-cover bg-top" style={{ backgroundImage: `url("${(heroShots[1] ?? heroShots[0])!.thumbnail_url}")` }} />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GRID */}
        <section id="giao-dien" className="container-x scroll-mt-20 py-12">
          <div className="mb-8 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-earth-600">Kho giao diện</p>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Chọn giao diện cho doanh nghiệp của bạn</h2>
            </div>
            <p className="max-w-sm text-sm text-brand-900/60">Rê chuột lên ảnh để xem toàn bộ trang. Bấm “Xem demo” để trải nghiệm trực tiếp.</p>
          </div>
          {!isSupabaseConfigured ? (
            <div className="card p-8 text-sm text-brand-900/70">
              Chưa cấu hình Supabase. Hãy điền <code>.env.local</code> theo hướng dẫn trong README.
            </div>
          ) : (
            <Suspense>
              <TemplateBrowser templates={templates} />
            </Suspense>
          )}
        </section>

        {/* FEATURES */}
        <section className="container-x py-16">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-earth-600">Vì sao chọn Vexim Harvest</p>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Giao diện làm ra để bán hàng nông sản</h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-2xl" aria-hidden>{f.icon}</div>
                <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-900/70">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PROCESS */}
        <section id="quy-trinh" className="scroll-mt-20 bg-brand-900 py-20 text-white">
          <div className="container-x">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-earth-400">Quy trình mua hàng</p>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">3 bước, không cần chờ đợi</h2>
            </div>
            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {STEPS.map((s) => (
                <li key={s.n} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <span className="text-4xl font-extrabold text-earth-400">{s.n}</span>
                  <h3 className="mt-3 text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-100/80">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="container-x scroll-mt-20 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Câu hỏi thường gặp</h2>
            <div className="mt-10 space-y-3">
              {FAQ.map((f) => (
                <details key={f.q} className="card group p-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold">
                    {f.q}
                    <span className="text-brand-500 transition group-open:rotate-45" aria-hidden>＋</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-brand-900/70">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container-x">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 px-8 py-14 text-center text-white">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Cần giao diện theo yêu cầu riêng?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-brand-100/85">
              Vexim Global nhận thiết kế và lập trình website trọn gói cho doanh nghiệp nông sản, thực phẩm và nhà máy.
            </p>
            <a href="mailto:contact@veximglobal.com" className="btn mt-7 bg-white px-6 py-3 text-base text-brand-800 hover:bg-brand-50">
              Liên hệ tư vấn
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
