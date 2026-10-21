"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, Loader2 } from "lucide-react";

export type CaptureState = {
  mode: "capture" | "upload";
  startedAt: number;
  phase: "running" | "done" | "error";
  /** Dòng phụ, VD: "Giao diện 2/5" khi nhập nhiều mẫu */
  subtitle?: string;
  error?: string;
  thumbnailUrl?: string;
  finishedAt?: number;
};

// Các bước thường gặp khi chụp. Máy chủ không báo tiến độ từng bước,
// nên bước đang chạy được ước lượng theo thời gian đã trôi qua.
const STEPS = [
  { label: "Mở giao diện trong trình duyệt ngầm", until: 3 },
  { label: "Tải hình ảnh và font chữ", until: 10 },
  { label: "Chụp toàn bộ trang", until: 17 },
  { label: "Lưu ảnh lên máy chủ", until: Infinity },
];

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CaptureProgress({
  state,
  onClose,
  onRetry,
}: {
  state: CaptureState;
  onClose: () => void;
  onRetry?: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (state.phase !== "running") return;
    const timer = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(timer);
  }, [state.phase]);

  // Tự đóng sau khi hoàn tất
  useEffect(() => {
    if (state.phase !== "done") return;
    const timer = setTimeout(onClose, 2200);
    return () => clearTimeout(timer);
  }, [state.phase, onClose]);

  const end = state.phase === "running" ? now : (state.finishedAt ?? now);
  const elapsed = Math.max(0, (end - state.startedAt) / 1000);
  // Tiến độ tiệm cận 95% khi đang chạy, đủ 100% khi xong
  const progress = state.phase === "done" ? 1 : state.phase === "error" ? 0.15 : Math.min(0.95, 1 - Math.exp(-elapsed / 11));
  const activeStep = STEPS.findIndex((s) => elapsed < s.until);

  const title =
    state.phase === "done"
      ? "Đã tạo xong thumbnail"
      : state.phase === "error"
        ? "Chưa tạo được thumbnail"
        : state.mode === "upload"
          ? "Đang tải ảnh lên"
          : "Đang chụp ảnh thumbnail";

  const ring = state.phase === "error" ? "stroke-red-500" : state.phase === "done" ? "stroke-brand-500" : "stroke-brand-600";

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="capture-title">
      <div className="animate-fade-up w-full max-w-md rounded-3xl bg-white p-7 shadow-glow">
        <div className="flex flex-col items-center text-center">
          {/* Vòng tiến độ + đồng hồ đếm giây */}
          <div className="relative h-36 w-36">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <circle cx="60" cy="60" r={RADIUS} className="fill-none stroke-zinc-100" strokeWidth="8" />
              <circle
                cx="60"
                cy="60"
                r={RADIUS}
                className={`fill-none transition-[stroke-dashoffset] duration-300 ease-out ${ring}`}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
              />
            </svg>
            {state.phase === "running" && (
              <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full animate-spin [animation-duration:1.4s]" aria-hidden>
                <circle cx="60" cy="8" r="4" className="fill-brand-500" />
              </svg>
            )}
            <div className="absolute inset-0 grid place-items-center">
              {state.phase === "done" ? (
                <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-600 text-white">
                  <Check className="h-7 w-7" strokeWidth={3} />
                </span>
              ) : state.phase === "error" ? (
                <span className="grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-600">
                  <AlertTriangle className="h-7 w-7" />
                </span>
              ) : (
                <div aria-live="polite">
                  <p className="text-4xl font-semibold tabular-nums tracking-tight text-ink">{Math.floor(elapsed)}</p>
                  <p className="-mt-0.5 text-xs font-medium text-zinc-500">giây</p>
                </div>
              )}
            </div>
          </div>

          <h2 id="capture-title" className="mt-5 text-lg font-semibold tracking-tight">{title}</h2>
          {state.subtitle && <p className="mt-0.5 text-sm font-medium text-brand-700">{state.subtitle}</p>}
          <p className="mt-1 text-sm text-zinc-500">
            {state.phase === "running"
              ? state.mode === "upload"
                ? "Chỉ mất vài giây."
                : "Thường mất 10–30 giây. Vui lòng không đóng trang."
              : state.phase === "done"
                ? `Hoàn tất sau ${elapsed.toFixed(1)} giây`
                : state.error}
          </p>
        </div>

        {state.phase === "running" && state.mode === "capture" && (
          <ol className="mt-6 space-y-2.5 rounded-2xl bg-zinc-50 p-4 text-sm">
            {STEPS.map((step, i) => {
              const done = activeStep === -1 || i < activeStep;
              const active = i === activeStep;
              return (
                <li key={step.label} className={`flex items-center gap-3 ${done ? "text-zinc-700" : active ? "font-medium text-ink" : "text-zinc-400"}`}>
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                      done ? "bg-brand-600 text-white" : active ? "text-brand-600" : "border border-zinc-300"
                    }`}
                  >
                    {done ? <Check className="h-3 w-3" strokeWidth={3} /> : active ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  </span>
                  {step.label}
                </li>
              );
            })}
          </ol>
        )}

        {state.phase === "done" && state.thumbnailUrl && (
          <div
            className="mt-6 aspect-[16/10] overflow-hidden rounded-xl border border-zinc-200 bg-cover bg-top"
            style={{ backgroundImage: `url("${state.thumbnailUrl}")` }}
            role="img"
            aria-label="Thumbnail vừa tạo"
          />
        )}

        {state.phase !== "running" && (
          <div className="mt-6 flex justify-center gap-2">
            {state.phase === "error" && onRetry && (
              <button type="button" onClick={onRetry} className="btn-primary">Thử lại</button>
            )}
            <button type="button" onClick={onClose} className="btn-ghost">{state.phase === "done" ? "Xong" : "Đóng"}</button>
          </div>
        )}
      </div>
    </div>
  );
}
