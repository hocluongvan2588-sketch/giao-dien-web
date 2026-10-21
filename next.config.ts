import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Chromium dùng để chụp thumbnail không được bundle, chỉ require lúc chạy.
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  // File không được import trực tiếp nên phải khai báo để Vercel đóng gói kèm function
  outputFileTracingIncludes: {
    "/api/admin/samples": ["./samples/**"],
    "/api/admin/templates/[id]/thumbnail": ["./node_modules/@sparticuz/chromium/bin/**"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
};

export default nextConfig;
