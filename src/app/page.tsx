import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  ClipboardCheck,
  Download,
  Factory,
  FileText,
  Languages,
  Mail,
  MessagesSquare,
  MousePointerClick,
  Package,
  PenLine,
  QrCode,
  Search,
  ShieldCheck,
  Smartphone,
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

const CONTACT_EMAIL = "contact@veximglobal.com";
const CONTACT_LINK = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Trao đổi về website xuất khẩu")}`;

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

// Tiêu chí xem lại mỗi giao diện trước khi đưa lên kho
const CRITERIA = [
  {
    icon: Package,
    title: "Năng lực và quy cách",
    text: "Sản lượng mỗi tháng, MOQ, quy cách đóng gói, thời gian giao hàng. Buyer cần mấy con số này để quyết định có hỏi tiếp hay không.",
  },
  {
    icon: ShieldCheck,
    title: "Chứng nhận nằm ở chỗ dễ thấy",
    text: "GlobalGAP, HACCP, BRCGS, đăng ký FDA được trình bày rõ, có chỗ ghi số hiệu và thời hạn, không bị dồn xuống cuối trang.",
  },
  {
    icon: Factory,
    title: "Cho thấy nơi làm ra sản phẩm",
    text: "Vùng nguyên liệu, nhà xưởng, quy trình sơ chế. Ảnh thật về nơi sản xuất thường thuyết phục hơn mọi lời giới thiệu.",
  },
  {
    icon: Languages,
    title: "Dễ thêm bản tiếng Anh",
    text: "Tiêu đề ngắn, bố cục gọn, đổi sang tiếng Anh hay tiếng Nhật không bị tràn chữ hay vỡ khung.",
  },
  {
    icon: FileText,
    title: "Có chỗ để buyer hỏi giá",
    text: "Form liên hệ hỏi đủ sản phẩm, số lượng, thị trường. Bạn nhận được yêu cầu rõ ràng thay vì một dòng hello.",
  },
  {
    icon: Smartphone,
    title: "Mở nhanh trên điện thoại",
    text: "Rất nhiều buyer bấm link ngay trong email trên điện thoại. Trang phải nhẹ và dễ đọc trên màn hình nhỏ.",
  },
];

const SERVICE_STEPS = [
  {
    icon: MessagesSquare,
    title: "Nghe bạn kể",
    text: "Bạn bán gì, làm ra như thế nào, đang có chứng nhận gì và muốn bán sang đâu. Một buổi trao đổi khoảng một tiếng là đủ để bắt đầu.",
  },
  {
    icon: PenLine,
    title: "Viết lại theo thị trường",
    text: "Nội dung tiếng Việt và tiếng Anh, sắp lại thứ tự thông tin theo điều buyer ở thị trường đó muốn đọc trước.",
  },
  {
    icon: ClipboardCheck,
    title: "Rà lại trước khi lên mạng",
    text: "Đối chiếu từng thông tin về chứng nhận, nhãn mác, cam kết trên trang với hồ sơ bạn đang có, tránh ghi những điều chưa chứng minh được.",
  },
];

const BUY_STEPS = [
  { icon: MousePointerClick, title: "Xem demo và chọn mẫu", text: "Mở thử trên máy tính và điện thoại, bấm qua các trang như một website thật." },
  { icon: QrCode, title: "Chuyển khoản qua VietQR", text: "Quét mã bằng app ngân hàng. Hệ thống tự đối soát, thường chưa tới một phút." },
  { icon: Download, title: "Tải file về", text: "File nằm trong mục Đơn hàng của tôi, tải lại khi nào cũng được." },
];

const FAQ = [
  {
    q: "Mua một giao diện thì tôi nhận được gì?",
    a: "Toàn bộ mã nguồn của giao diện, bản sạch không có nhãn demo. Bạn tải về trong mục Đơn hàng của tôi và tải lại bao nhiêu lần cũng được.",
  },
  {
    q: "Giao diện có sẵn bản tiếng Anh không?",
    a: "Tuỳ từng mẫu, phần mô tả của mỗi giao diện có ghi rõ. Nếu bạn cần tiếng Anh viết theo giọng thương mại, đúng cách buyer quen đọc, Vexim nhận viết riêng.",
  },
  {
    q: "Tôi không rành kỹ thuật, có tự đưa lên mạng được không?",
    a: "Giao diện là HTML nên chạy được trên hầu hết các hosting. Nếu bạn chưa có hosting hay tên miền, Vexim hỗ trợ cài đặt và báo phí trước khi làm.",
  },
  {
    q: "Vexim có làm website riêng từ đầu không?",
    a: "Có. Với doanh nghiệp cần nhiều trang, nhiều ngôn ngữ hoặc nội dung riêng cho từng thị trường, chúng tôi làm theo yêu cầu. Thường bắt đầu bằng một buổi trao đổi để hiểu sản phẩm và thị trường bạn nhắm tới.",
  },
  {
    q: "Vexim có lo luôn chuyện chứng nhận không?",
    a: "Chúng tôi giúp bạn trình bày đúng và đủ những gì doanh nghiệp đã đạt, và chỉ ra chỗ nào buyer sẽ hỏi thêm. Việc cấp chứng nhận vẫn do tổ chức chứng nhận quyết định.",
  },
  {
    q: "Chuyển khoản sai nội dung thì sao?",
    a: "Bạn nhắn cho chúng tôi kèm mã đơn, đội ngũ sẽ kiểm tra và xác nhận tay cho bạn.",
  },
  {
    q: "Một giao diện dùng được cho mấy website?",
    a: "Mỗi lượt mua dùng cho một website, của bạn hoặc của một khách hàng của bạn. Không bán lại mã nguồn dưới dạng giao diện.",
  },
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
        {/* ============ MỞ ĐẦU ============ */}
        <section className="relative overflow-hidden">
          <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
          <div className="pointer-events-none absolute left-1/2 top-[-280px] h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-brand-300/30 blur-[120px]" />

          <div className="container-x relative pt-16 text-center sm:pt-24">
            <Link
              href="#lam-rieng"
              className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 py-1 pl-1 pr-3 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur transition hover:border-zinc-300"
            >
              <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-semibold text-white">Vexim Global</span>
              Từ những người làm xuất khẩu<span className="hidden sm:inline"> mỗi ngày</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <h1 className="animate-fade-up mx-auto mt-7 max-w-5xl text-balance text-[2.6rem] font-semibold leading-[1.05] tracking-[-.045em] text-ink [animation-delay:80ms] sm:text-6xl lg:text-[4.6rem]">
              Website để buyer đọc xong là{" "}
              <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-earth-500 bg-clip-text text-transparent">muốn hỏi giá</span>
            </h1>
            <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 [animation-delay:160ms]">
              Buyer nước ngoài thường mở website của nhà cung cấp trước khi trả lời email đầu tiên. Họ tìm năng lực sản xuất,
              chứng nhận, quy cách, thời gian giao hàng. Vexim làm việc với buyer mỗi ngày, nên các giao diện ở đây được chọn và
              chỉnh quanh đúng những thông tin đó.
            </p>

            <form action="/#giao-dien" className="animate-fade-up mx-auto mt-9 flex max-w-xl items-center gap-2 rounded-full border border-zinc-200 bg-white p-1.5 shadow-lift [animation-delay:240ms]">
              <Search className="ml-3 h-5 w-5 shrink-0 text-zinc-400" />
              <input
                name="q"
                placeholder="Tìm giao diện, ví dụ: gạo, cà phê, nhà máy"
                className="min-w-0 flex-1 bg-transparent py-2 text-[15px] outline-none placeholder:text-zinc-400"
                aria-label="Tìm giao diện"
              />
              <button className="btn-primary px-5">Tìm</button>
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

          <div className="container-x relative mt-16 sm:mt-20">
            <div className="relative mx-auto h-[220px] max-w-5xl sm:h-[360px] lg:h-[440px]">
              <BrowserShot url={shots[1]} className="absolute left-0 top-10 hidden w-[42%] -rotate-[5deg] opacity-90 sm:block" />
              <BrowserShot url={shots[2] ?? shots[0]} className="absolute right-0 top-10 hidden w-[42%] rotate-[5deg] opacity-90 sm:block" />
              <BrowserShot url={shots[0]} className="absolute left-1/2 top-0 z-10 w-full -translate-x-1/2 sm:w-[62%]" />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40 bg-gradient-to-t from-white to-transparent" />
          </div>
        </section>

        {/* ============ DẢI THÔNG TIN ============ */}
        <section className="relative z-30 border-y border-zinc-200/70 bg-zinc-50/60">
          <div className="container-x grid grid-cols-2 divide-zinc-200 py-6 sm:grid-cols-4 sm:divide-x">
            {[
              [`${templates.length}`, "giao diện đang có"],
              [`${CATEGORIES.length}`, "nhóm ngành hàng"],
              ["Demo thật", "xem trên máy tính và điện thoại"],
              ["VietQR", "chuyển khoản xong là tải file"],
            ].map(([v, k]) => (
              <div key={k} className="px-4 py-2 text-center">
                <p className="text-2xl font-semibold tracking-tight text-ink">{v}</p>
                <p className="mt-0.5 text-[13px] text-zinc-500">{k}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============ KHO GIAO DIỆN ============ */}
        <section id="giao-dien" className="container-x scroll-mt-16 py-24">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Kho giao diện</p>
              <h2 className="h-section mt-3">Chọn một điểm bắt đầu</h2>
            </div>
            <p className="max-w-sm text-[15px] text-zinc-500">Rê chuột lên ảnh để xem cả trang. Bấm Xem demo để dùng thử như một website thật.</p>
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
              Kho giao diện đang được cập nhật. Nếu bạn cần gấp, hãy{" "}
              <a href={CONTACT_LINK} className="font-medium text-ink underline underline-offset-4">gửi email cho Vexim</a>.
            </div>
          ) : (
            <Suspense>
              <TemplateBrowser templates={templates} />
            </Suspense>
          )}
        </section>

        {/* ============ KHÁC BIỆT ============ */}
        <section id="khac-biet" className="scroll-mt-16 border-y border-zinc-200/70 bg-zinc-50/60 py-24">
          <div className="container-x">
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">Khác ở đâu</p>
              <h2 className="h-section mt-3">Mỗi giao diện được xem lại bằng con mắt của buyer</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-zinc-500">
                Trong các cuộc gọi với nhà nhập khẩu, có những câu hỏi lặp đi lặp lại. Website trả lời trước được những câu đó thì
                cuộc trao đổi đầu tiên đã đi được nửa đường. Đây là sáu điều chúng tôi xem trước khi đưa một giao diện lên kho.
              </p>
            </div>
            <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 sm:grid-cols-2 lg:grid-cols-3">
              {CRITERIA.map(({ icon: Icon, title, text }) => (
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

        {/* ============ LÀM RIÊNG ============ */}
        <section id="lam-rieng" className="scroll-mt-16 py-24">
          <div className="container-x">
            <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-14 text-white sm:px-12 lg:py-16">
              <div className="bg-grid pointer-events-none absolute inset-0 opacity-[.12] invert" />
              <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-brand-500/30 blur-[100px]" />
              <div className="relative grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[.14em] text-brand-300">Dịch vụ của Vexim Global</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-.03em] sm:text-[2.6rem] sm:leading-[1.1]">
                    Có giao diện rồi, phần khó nhất là nội dung
                  </h2>
                  <p className="mt-5 leading-relaxed text-zinc-400">
                    Một website xuất khẩu tốt không nằm ở màu sắc. Nó nằm ở chỗ nói đúng điều thị trường đó quan tâm. Buyer châu Âu
                    hỏi về truy xuất nguồn gốc và dư lượng. Buyer Mỹ để ý đăng ký FDA. Buyer Nhật xem kỹ từng chi tiết đóng gói.
                    Nếu bạn muốn, đội ngũ Vexim sẽ cùng bạn làm phần này.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <a href={CONTACT_LINK} className="btn bg-white px-6 py-3 text-ink hover:bg-zinc-100">
                      <Mail className="h-4 w-4" /> Đặt lịch trao đổi
                    </a>
                    <Link href="#giao-dien" className="btn border border-white/15 px-6 py-3 text-white hover:bg-white/10">
                      Xem kho giao diện
                    </Link>
                  </div>
                </div>
                <ol className="space-y-3">
                  {SERVICE_STEPS.map(({ icon: Icon, title, text }, i) => (
                    <li key={title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[.04] p-5">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 text-brand-300">
                        <Icon className="h-5 w-5" strokeWidth={1.8} />
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-zinc-500">Bước {i + 1}</p>
                        <h3 className="mt-0.5 font-semibold">{title}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{text}</p>
                      </div>
                    </li>
                  ))}
                  <li className="px-1 pt-2 text-xs leading-relaxed text-zinc-500">
                    Chúng tôi giúp trình bày đúng những gì doanh nghiệp đã đạt. Việc cấp chứng nhận vẫn do tổ chức chứng nhận quyết định.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* ============ CÁCH MUA ============ */}
        <section id="quy-trinh" className="container-x scroll-mt-16 pb-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Mua giao diện có sẵn</p>
            <h2 className="h-section mt-3">Ba bước, không phải chờ ai</h2>
          </div>
          <ol className="relative mt-14 grid gap-6 md:grid-cols-3">
            <div className="pointer-events-none absolute left-[16%] right-[16%] top-7 hidden border-t border-dashed border-zinc-300 md:block" />
            {BUY_STEPS.map(({ icon: Icon, title, text }, i) => (
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

        {/* ============ HỎI ĐÁP ============ */}
        <section id="faq" className="container-x scroll-mt-16 pb-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
            <div>
              <p className="eyebrow">Hỏi đáp</p>
              <h2 className="h-section mt-3">Những câu hay được hỏi</h2>
              <p className="mt-4 max-w-sm text-[15px] text-zinc-500">
                Không thấy câu bạn cần? Gửi thư cho chúng tôi ở{" "}
                <a href={CONTACT_LINK} className="font-medium text-ink underline decoration-zinc-300 underline-offset-4 hover:decoration-ink">
                  {CONTACT_EMAIL}
                </a>
              </p>
              <div className="mt-8 flex items-center gap-3 rounded-2xl border border-zinc-200 p-4 text-sm text-zinc-600">
                <ShieldCheck className="h-5 w-5 shrink-0 text-brand-600" />
                Tiền chuyển vào tài khoản doanh nghiệp, hệ thống tự đối soát.
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

        {/* ============ LỜI MỜI ============ */}
        <section className="container-x">
          <div className="rounded-3xl border border-zinc-200 bg-gradient-to-br from-brand-50 via-white to-earth-50 px-6 py-14 text-center sm:px-12">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-[-.03em] text-ink sm:text-4xl">Chưa biết nên bắt đầu từ đâu?</h2>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-zinc-600">
              Gửi cho chúng tôi link website hiện tại, hoặc chỉ cần kể bạn đang bán gì và muốn bán cho ai. Chúng tôi sẽ đọc kỹ và
              nói thật buyer sẽ nghĩ gì khi xem trang của bạn.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href={CONTACT_LINK} className="btn-primary px-6 py-3">
                Gửi email cho Vexim <ArrowRight className="h-4 w-4" />
              </a>
              <Link href="#giao-dien" className="btn-ghost px-6 py-3">Xem kho giao diện</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
