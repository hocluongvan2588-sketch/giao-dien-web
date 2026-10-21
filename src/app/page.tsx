import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Download,
  Headset,
  MousePointerClick,
  PenLine,
  QrCode,
  Search,
  SearchCheck,
  ShieldCheck,
  Smartphone,
  Wheat,
  Zap,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TemplateBrowser } from "@/components/TemplateBrowser";
import { CategoryIcon } from "@/components/CategoryIcon";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { CATEGORIES } from "@/lib/categories";
import { CARD_COLUMNS, type TemplateCardData } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getTemplates(): Promise<{ templates: TemplateCardData[]; failed: boolean }> {
  if (!isSupabaseConfigured) return { templates: [], failed: false };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("templates")
    .select(CARD_COLUMNS)
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (error) console.error("Load templates:", error.message);
  return { templates: (data as TemplateCardData[] | null) ?? [], failed: Boolean(error) };
}

const FEATURES = [
  { icon: Smartphone, title: "Chuẩn responsive", text: "Hiển thị đẹp trên máy tính, tablet và điện thoại. Kiểm tra ngay bằng nút đổi thiết bị khi xem demo." },
  { icon: Zap, title: "Nhẹ & tải nhanh", text: "HTML/CSS thuần, không phụ thuộc nền tảng. Đặt lên bất kỳ hosting hay CMS nào." },
  { icon: SearchCheck, title: "Tối ưu SEO", text: "Cấu trúc tiêu đề rõ ràng, hỗ trợ meta và schema để sản phẩm dễ lên Google." },
  { icon: Wheat, title: "Thiết kế đúng ngành", text: "Catalogue sản phẩm, chứng nhận, quy trình, xuất khẩu — đủ những gì doanh nghiệp nông sản cần." },
  { icon: PenLine, title: "Dễ chỉnh sửa", text: "Mã nguồn gọn gàng. Đổi màu, logo, nội dung chỉ trong vài phút." },
  { icon: Headset, title: "Hỗ trợ cài đặt", text: "Đội ngũ Vexim Global hỗ trợ đưa giao diện lên tên miền và hosting của bạn." },
];

const STEPS = [
  { icon: MousePointerClick, title: "Chọn giao diện", text: "Xem demo trực tiếp trên mọi thiết bị, chọn mẫu hợp với doanh nghiệp." },
  { icon: QrCode, title: "Thanh toán VietQR", text: "Quét mã QR bằng app ngân hàng. Hệ thống tự xác nhận trong vài giây." },
  { icon: Download, title: "Nhận file ngay", text: "Tải mã nguồn trong “Đơn hàng của tôi”, tải lại bất cứ lúc nào." },
];

const FAQ = [
  { q: "Tôi nhận được gì sau khi mua?", a: "Toàn bộ mã nguồn HTML/CSS/JS của giao diện (không có nhãn demo). Bạn có thể tải lại bất kỳ lúc nào trong mục Đơn hàng của tôi." },
  { q: "Bao lâu thì nhận được file?", a: "Ngay khi chuyển khoản thành công, thường dưới 1 phút. Hệ thống đối soát tự động qua nội dung chuyển khoản, bạn không cần gửi ảnh chụp." },
  { q: "Tôi chuyển khoản sai nội dung thì sao?", a: "Liên hệ hotline/Zalo kèm mã đơn hàng, đội ngũ Vexim Global sẽ xác nhận thủ công cho bạn." },
  { q: "Có dùng được với WordPress hay hosting của tôi không?", a: "Giao diện là HTML thuần nên dùng được trên mọi hosting. Nếu cần chuyển sang WordPress hoặc cài lên tên miền, hãy liên hệ để được báo giá." },
  { q: "Một giao diện được dùng cho bao nhiêu website?", a: "Mỗi lượt mua dùng cho 1 website của bạn hoặc của 1 khách hàng của bạn. Không được bán lại mã nguồn dưới dạng giao diện." },
];

function BrowserShot({ url, className = "" }: { url?: string | null; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-glow ${className}`}>
      <div className="flex h-6 items-center gap-1.5 border-b border-zinc-100 px-3">
        <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
        <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
        <span className="h-2 w-2 rounded-full bg-[#28c840]" />
      </div>
      {url ? (
        <div className="aspect-[16/10] bg-cover bg-top" style={{ backgroundImage: `url("${url}")` }} />
      ) : (
        <div className="aspect-[16/10] bg-gradient-to-br from-brand-50 via-white to-earth-50 p-6">
          <div className="h-3 w-1/3 rounded-full bg-zinc-200" />
          <div className="mt-6 h-6 w-2/3 rounded-lg bg-zinc-200/80" />
          <div className="mt-2 h-6 w-1/2 rounded-lg bg-zinc-200/80" />
          <div className="mt-6 grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((i) => <div key={i} className="aspect-square rounded-lg bg-brand-100/70" />)}
          </div>
        </div>
      )}
    </div>
  );
}

export default async function HomePage() {
  const { templates, failed } = await getTemplates();
  const shots = templates.filter((t) => t.thumbnail_url).map((t) => t.thumbnail_url);

  return (
    <>
      <SiteHeader />
      <main>
        {/* ============ HERO ============ */}
        <section className="relative overflow-hidden">
          <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
          <div className="pointer-events-none absolute left-1/2 top-[-280px] h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-brand-300/30 blur-[120px]" />

          <div className="container-x relative pt-16 text-center sm:pt-24">
            <Link
              href="#giao-dien"
              className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 py-1 pl-1 pr-3 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur transition hover:border-zinc-300"
            >
              <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-semibold text-white">Mới</span>
              Kho giao diện ngành nông sản<span className="hidden sm:inline"> & thực phẩm</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <h1 className="animate-fade-up mx-auto mt-7 max-w-5xl text-balance text-[2.6rem] font-semibold leading-[1.05] tracking-[-.045em] text-ink [animation-delay:80ms] sm:text-6xl lg:text-[4.6rem]">
              Website chuyên nghiệp cho{" "}
              <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-earth-500 bg-clip-text text-transparent">
                doanh nghiệp nông sản
              </span>
            </h1>
            <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 [animation-delay:160ms]">
              Giao diện HTML thiết kế riêng cho trang trại, nhà máy chế biến, thương hiệu thực phẩm và
              doanh nghiệp xuất khẩu. Xem demo trực tiếp, thanh toán VietQR, nhận mã nguồn ngay.
            </p>

            <form action="/#giao-dien" className="animate-fade-up mx-auto mt-9 flex max-w-xl items-center gap-2 rounded-full border border-zinc-200 bg-white p-1.5 shadow-lift [animation-delay:240ms]">
              <Search className="ml-3 h-5 w-5 shrink-0 text-zinc-400" />
              <input
                name="q"
                placeholder="Tìm giao diện: rau sạch, cà phê, nhà máy…"
                className="min-w-0 flex-1 bg-transparent py-2 text-[15px] outline-none placeholder:text-zinc-400"
                aria-label="Tìm giao diện"
              />
              <button className="btn-primary px-5">Tìm kiếm</button>
            </form>

            <div className="animate-fade-up mt-6 flex flex-wrap justify-center gap-2 [animation-delay:320ms]">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.id}
                  href={`/?danh-muc=${c.id}#giao-dien`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/70 px-3 py-1.5 text-[13px] text-zinc-600 transition hover:border-zinc-300 hover:text-ink"
                >
                  <CategoryIcon id={c.id} className="h-3.5 w-3.5" /> {c.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Showcase: 3 ảnh giao diện xếp lớp */}
          <div className="container-x relative mt-16 sm:mt-20">
            <div className="relative mx-auto h-[220px] max-w-5xl sm:h-[360px] lg:h-[440px]">
              <BrowserShot url={shots[1]} className="absolute left-0 top-10 hidden w-[42%] -rotate-[5deg] opacity-90 sm:block" />
              <BrowserShot url={shots[2] ?? shots[0]} className="absolute right-0 top-10 hidden w-[42%] rotate-[5deg] opacity-90 sm:block" />
              <BrowserShot url={shots[0]} className="absolute left-1/2 top-0 z-10 w-full -translate-x-1/2 sm:w-[62%]" />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40 bg-gradient-to-t from-white to-transparent" />
          </div>
        </section>

        {/* ============ TRUST STRIP ============ */}
        <section className="relative z-30 border-y border-zinc-200/70 bg-zinc-50/60">
          <div className="container-x grid grid-cols-2 divide-zinc-200 py-6 sm:grid-cols-4 sm:divide-x">
            {[
              [`${templates.length}`, "giao diện sẵn sàng"],
              [`${CATEGORIES.length}`, "lĩnh vực chuyên biệt"],
              ["< 1 phút", "nhận file sau thanh toán"],
              ["100%", "responsive mọi thiết bị"],
            ].map(([v, k]) => (
              <div key={k} className="px-4 py-2 text-center">
                <p className="text-2xl font-semibold tracking-tight text-ink">{v}</p>
                <p className="mt-0.5 text-[13px] text-zinc-500">{k}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============ GRID ============ */}
        <section id="giao-dien" className="container-x scroll-mt-16 py-24">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Kho giao diện</p>
              <h2 className="h-section mt-3">Chọn giao diện cho doanh nghiệp</h2>
            </div>
            <p className="max-w-sm text-[15px] text-zinc-500">Rê chuột lên ảnh để xem toàn trang. Bấm “Xem demo” để trải nghiệm trực tiếp.</p>
          </div>
          {!isSupabaseConfigured ? (
            <div className="card p-8 text-sm text-zinc-600">
              Chưa cấu hình Supabase. Hãy điền <code>.env.local</code> theo hướng dẫn trong README.
            </div>
          ) : failed ? (
            <div className="card p-8 text-sm text-zinc-600">
              Chưa đọc được dữ liệu giao diện. Quản trị viên hãy kiểm tra đã chạy <code>supabase/schema.sql</code> trên Supabase chưa.
            </div>
          ) : templates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center text-sm text-zinc-500">
              Kho giao diện đang được cập nhật, vui lòng quay lại sau.
            </div>
          ) : (
            <Suspense>
              <TemplateBrowser templates={templates} />
            </Suspense>
          )}
        </section>

        {/* ============ FEATURES ============ */}
        <section id="tinh-nang" className="scroll-mt-16 border-y border-zinc-200/70 bg-zinc-50/60 py-24">
          <div className="container-x">
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">Vì sao chọn Vexim Harvest</p>
              <h2 className="h-section mt-3">Làm ra để bán hàng nông sản</h2>
              <p className="mt-4 text-[15px] text-zinc-500">Mỗi giao diện được thiết kế quanh nhu cầu thật của doanh nghiệp ngành thực phẩm và nông nghiệp.</p>
            </div>
            <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <div key={title} className="group bg-white p-7 transition hover:bg-zinc-50/50">
                  <div className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-200 bg-white text-brand-600 shadow-card transition group-hover:border-brand-200 group-hover:bg-brand-50">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <h3 className="mt-5 text-base font-semibold tracking-[-.01em]">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ PROCESS ============ */}
        <section id="quy-trinh" className="container-x scroll-mt-16 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Quy trình mua hàng</p>
            <h2 className="h-section mt-3">3 bước, không cần chờ đợi</h2>
          </div>
          <ol className="relative mt-14 grid gap-6 md:grid-cols-3">
            <div className="pointer-events-none absolute left-[16%] right-[16%] top-7 hidden border-t border-dashed border-zinc-300 md:block" />
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="relative text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-ink text-white shadow-lift">
                  <Icon className="h-6 w-6" strokeWidth={1.8} />
                </div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[.14em] text-brand-700">Bước {i + 1}</p>
                <h3 className="mt-2 text-lg font-semibold tracking-[-.01em]">{title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-zinc-500">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ============ FAQ ============ */}
        <section id="faq" className="container-x scroll-mt-16 pb-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
            <div>
              <p className="eyebrow">Hỏi đáp</p>
              <h2 className="h-section mt-3">Câu hỏi thường gặp</h2>
              <p className="mt-4 max-w-sm text-[15px] text-zinc-500">
                Chưa tìm thấy câu trả lời? Liên hệ{" "}
                <a href="mailto:contact@veximglobal.com" className="font-medium text-ink underline decoration-zinc-300 underline-offset-4 hover:decoration-ink">
                  contact@veximglobal.com
                </a>
              </p>
              <div className="mt-8 flex items-center gap-3 rounded-2xl border border-zinc-200 p-4 text-sm text-zinc-600">
                <ShieldCheck className="h-5 w-5 shrink-0 text-brand-600" />
                Thanh toán qua tài khoản doanh nghiệp, đối soát tự động.
              </div>
            </div>
            <div className="divide-y divide-zinc-200 border-y border-zinc-200">
              {FAQ.map((f) => (
                <details key={f.q} className="group py-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-ink">
                    {f.q}
                    <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400 transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 pr-8 text-sm leading-relaxed text-zinc-500">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CTA ============ */}
        <section className="container-x">
          <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-16 text-center sm:px-12">
            <div className="bg-grid pointer-events-none absolute inset-0 opacity-[.15] invert" />
            <div className="pointer-events-none absolute left-1/2 top-full h-80 w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/40 blur-[100px]" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-[-.03em] text-white sm:text-4xl">
                Cần giao diện theo yêu cầu riêng?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-zinc-400">
                Vexim Global nhận thiết kế và lập trình website trọn gói cho doanh nghiệp nông sản, thực phẩm và nhà máy.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <a href="mailto:contact@veximglobal.com" className="btn bg-white px-6 py-3 text-ink hover:bg-zinc-100">
                  Liên hệ tư vấn <ArrowRight className="h-4 w-4" />
                </a>
                <Link href="#giao-dien" className="btn border border-white/15 px-6 py-3 text-white hover:bg-white/10">
                  Xem giao diện có sẵn
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
