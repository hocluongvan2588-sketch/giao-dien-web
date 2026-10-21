import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="Vexim Harvest — Trang chủ">
      <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-[10px] bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_1px_2px_rgba(0,0,0,.2)]">
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 21V11" />
          <path d="M12 11c0-4 3-7 8-7 0 5-3 8-8 7Z" />
          <path d="M12 14c0-3-2.5-5.5-7-5.5 0 4 2.5 6 7 5.5Z" />
        </svg>
      </span>
      <span className="leading-none">
        <span className={`block text-[15px] font-semibold tracking-[-.01em] ${light ? "text-white" : "text-ink"}`}>
          Vexim Harvest
        </span>
        <span className={`mt-1 block text-[11px] font-medium ${light ? "text-white/50" : "text-zinc-500"}`}>by Vexim Global</span>
      </span>
    </Link>
  );
}
