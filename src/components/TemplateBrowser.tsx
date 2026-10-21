"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import type { TemplateCardData } from "@/lib/types";
import { effectivePrice } from "@/lib/format";
import { Search } from "lucide-react";
import { CategoryIcon } from "./CategoryIcon";
import { TemplateCard } from "./TemplateCard";

const PAGE_SIZE = 12;
type Sort = "featured" | "newest" | "price-asc" | "price-desc";

function normalize(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase();
}

export function TemplateBrowser({ templates }: { templates: TemplateCardData[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const category = params.get("danh-muc") ?? "all";
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [sort, setSort] = useState<Sort>("featured");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    templates.forEach((t) => m.set(t.category, (m.get(t.category) ?? 0) + 1));
    return m;
  }, [templates]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    const list = templates.filter(
      (t) =>
        (category === "all" || t.category === category) &&
        (!q || normalize(`${t.name} ${t.short_description}`).includes(q)),
    );
    const sorters: Record<Sort, (a: TemplateCardData, b: TemplateCardData) => number> = {
      featured: (a, b) => Number(b.is_featured) - Number(a.is_featured) || b.sales_count - a.sales_count,
      newest: (a, b) => b.created_at.localeCompare(a.created_at),
      "price-asc": (a, b) => effectivePrice(a) - effectivePrice(b),
      "price-desc": (a, b) => effectivePrice(b) - effectivePrice(a),
    };
    return list.sort(sorters[sort]);
  }, [templates, category, query, sort]);

  function selectCategory(id: string) {
    const next = new URLSearchParams(params);
    if (id === "all") next.delete("danh-muc");
    else next.set("danh-muc", id);
    setLimit(PAGE_SIZE);
    router.replace(`?${next}#giao-dien`, { scroll: false });
  }

  const chip = (active: boolean) =>
    `inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
      active ? "bg-ink text-white shadow-sm" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200/70 hover:text-ink"
    }`;

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <button className={chip(category === "all")} onClick={() => selectCategory("all")} aria-pressed={category === "all"}>
            <CategoryIcon id="all" className="h-4 w-4" /> Tất cả
            <span className="tabular-nums opacity-50">{templates.length}</span>
          </button>
          {CATEGORIES.map((c) => (
            <button key={c.id} className={chip(category === c.id)} onClick={() => selectCategory(c.id)} aria-pressed={category === c.id}>
              <CategoryIcon id={c.id} className="h-4 w-4" /> {c.label}
              {counts.get(c.id) ? <span className="tabular-nums opacity-50">{counts.get(c.id)}</span> : null}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 lg:w-64 lg:flex-none">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            className="input rounded-full pl-10"
            placeholder="Tìm giao diện"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setLimit(PAGE_SIZE); }}
            aria-label="Tìm giao diện"
          />
          </div>
          <select className="input w-auto rounded-full" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sắp xếp">
            <option value="featured">Nổi bật</option>
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 p-12 text-center text-sm text-zinc-500">
          Chưa có giao diện phù hợp. Hãy thử danh mục hoặc từ khoá khác.
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.slice(0, limit).map((t) => <TemplateCard key={t.id} t={t} />)}
        </div>
      )}

      {filtered.length > limit && (
        <div className="mt-10 text-center">
          <button className="btn-ghost" onClick={() => setLimit((l) => l + PAGE_SIZE)}>
            Xem thêm {Math.min(PAGE_SIZE, filtered.length - limit)} giao diện
          </button>
        </div>
      )}
    </div>
  );
}
