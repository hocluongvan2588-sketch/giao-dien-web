import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Vexim Harvest — Trang chủ">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-700 text-white shadow-sm">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 21V11" />
          <path d="M12 11c0-4 3-7 8-7 0 5-3 8-8 7Z" />
          <path d="M12 14c0-3-2.5-5.5-7-5.5 0 4 2.5 6 7 5.5Z" />
        </svg>
      </span>
      <span className="leading-tight">
        <span className={`block text-[17px] font-extrabold tracking-tight ${light ? "text-white" : "text-brand-900"}`}>
          Vexim Harvest
        </span>
        <span className={`block text-[11px] font-medium ${light ? "text-brand-200" : "text-brand-600"}`}>
          by Vexim Global
        </span>
      </span>
    </Link>
  );
}
