import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_TAGLINE, siteUrl } from "@/lib/env";

const font = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${SITE_NAME} | ${SITE_TAGLINE}`, template: `%s | ${SITE_NAME}` },
  description:
    "Giao diện website cho doanh nghiệp nông sản, thực phẩm và nhà máy, được Vexim Global chọn và chỉnh theo góc nhìn của buyer nước ngoài. Xem demo, thanh toán VietQR, tải file ngay.",
  openGraph: { siteName: SITE_NAME, locale: "vi_VN", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={font.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
