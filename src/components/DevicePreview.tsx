"use client";

import { useState } from "react";
import { ExternalLink, Monitor, Smartphone, Tablet } from "lucide-react";

const DEVICES = [
  { id: "desktop", label: "Desktop", width: "100%", icon: Monitor },
  { id: "tablet", label: "Tablet", width: "820px", icon: Tablet },
  { id: "mobile", label: "Mobile", width: "390px", icon: Smartphone },
] as const;

/**
 * Khung xem trước giao diện. Luôn dùng iframe sandbox (không allow-same-origin)
 * để CSS/JS của giao diện không ảnh hưởng trang chính và không đọc được cookie.
 */
export function DevicePreview({ src, srcDoc, height = 720 }: { src?: string; srcDoc?: string; height?: number }) {
  const [device, setDevice] = useState<(typeof DEVICES)[number]["id"]>("desktop");
  const width = DEVICES.find((d) => d.id === device)!.width;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 shadow-lift">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex rounded-full bg-zinc-100 p-1" role="tablist" aria-label="Chọn thiết bị">
          {DEVICES.map((d) => (
            <button
              key={d.id}
              type="button"
              role="tab"
              aria-selected={device === d.id}
              onClick={() => setDevice(d.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                device === d.id ? "bg-white text-ink shadow-sm" : "text-zinc-500 hover:text-ink"
              }`}
            >
              <d.icon className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{d.label}</span>
            </button>
          ))}
        </div>
        {src ? (
          <a href={src} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-ink">
            Toàn màn hình <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : <span />}
      </div>
      <div className="flex justify-center bg-zinc-100 p-0 sm:p-4">
        <iframe
          title="Xem trước giao diện"
          src={src}
          srcDoc={srcDoc}
          sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
          loading="lazy"
          className="max-w-full rounded-lg bg-white shadow-lg transition-[width] duration-300"
          style={{ width, height }}
        />
      </div>
    </div>
  );
}
