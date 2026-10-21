"use client";

import { useState } from "react";

const DEVICES = [
  { id: "desktop", label: "Desktop", width: "100%" },
  { id: "tablet", label: "Tablet", width: "820px" },
  { id: "mobile", label: "Mobile", width: "390px" },
] as const;

/**
 * Khung xem trước giao diện. Luôn dùng iframe sandbox (không allow-same-origin)
 * để CSS/JS của giao diện không ảnh hưởng trang chính và không đọc được cookie.
 */
export function DevicePreview({ src, srcDoc, height = 720 }: { src?: string; srcDoc?: string; height?: number }) {
  const [device, setDevice] = useState<(typeof DEVICES)[number]["id"]>("desktop");
  const width = DEVICES.find((d) => d.id === device)!.width;

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-200 bg-brand-950/5">
      <div className="flex items-center justify-between gap-3 border-b border-brand-200 bg-white px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-3 w-3 rounded-full bg-red-300" />
          <span className="h-3 w-3 rounded-full bg-amber-300" />
          <span className="h-3 w-3 rounded-full bg-green-300" />
        </div>
        <div className="flex rounded-full bg-brand-50 p-1" role="tablist" aria-label="Chọn thiết bị">
          {DEVICES.map((d) => (
            <button
              key={d.id}
              type="button"
              role="tab"
              aria-selected={device === d.id}
              onClick={() => setDevice(d.id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                device === d.id ? "bg-brand-700 text-white" : "text-brand-800 hover:bg-white"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        {src ? (
          <a href={src} target="_blank" rel="noopener" className="text-xs font-semibold text-brand-700 hover:underline">
            Toàn màn hình ↗
          </a>
        ) : <span />}
      </div>
      <div className="flex justify-center bg-[repeating-linear-gradient(45deg,#f1f8f2,#f1f8f2_10px,#e8f3ea_10px,#e8f3ea_20px)] p-0 sm:p-4">
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
