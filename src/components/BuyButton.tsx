"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BuyButton({ templateId, slug, label = "Mua ngay" }: { templateId: string; slug: string; label?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent(`/templates/${slug}#mua`)}`);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Không tạo được đơn hàng");
      router.push(`/checkout/${data.id}`);
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={buy} disabled={loading} className="btn-primary w-full py-3 text-base">
        {loading ? "Đang tạo đơn…" : label}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
