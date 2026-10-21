import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Chromium dùng để chụp thumbnail không được bundle, chỉ require lúc chạy.
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
};

export default nextConfig;
