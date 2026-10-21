"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ImportSamples() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setMessage("Đang nhập giao diện mẫu…");
    const res = await fetch("/api/admin/samples", { method: "POST" });
    const data = await res.json().catch(() => ({ error: "Lỗi không xác định" }));
    if (!res.ok) {
      setBusy(false);
      return setMessage(`Lỗi: ${data.error}`);
    }
    const ids: string[] = data.created;
    let failed = 0;
    for (const [i, id] of ids.entries()) {
      setMessage(`Đang chụp thumbnail ${i + 1}/${ids.length}…`);
      const r = await fetch(`/api/admin/templates/${id}/thumbnail`, { method: "POST" });
      if (!r.ok) failed++;
    }
    setBusy(false);
    setMessage(
      ids.length === 0
        ? "Các giao diện mẫu đã có sẵn."
        : `Đã nhập ${ids.length} giao diện mẫu${failed ? ` (${failed} thumbnail chưa chụp được, hãy mở giao diện và bấm “Chụp lại tự động”)` : ""}.`,
    );
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" onClick={run} disabled={busy} className="btn-ghost">
        {busy ? "Đang xử lý…" : "Nhập 4 giao diện mẫu"}
      </button>
      {message && <span className="text-sm text-zinc-600" role="status">{message}</span>}
    </div>
  );
}
