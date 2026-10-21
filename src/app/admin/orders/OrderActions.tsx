"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OrderActions({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(action: "confirm" | "cancel") {
    const msg = action === "confirm" ? "Xác nhận đã nhận tiền cho đơn này?" : "Huỷ đơn này?";
    if (!confirm(msg)) return;
    setBusy(true);
    await fetch(`/api/admin/orders/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex justify-end gap-2">
      <button disabled={busy} onClick={() => act("confirm")} className="btn-primary px-3 py-1.5 text-xs">Xác nhận</button>
      <button disabled={busy} onClick={() => act("cancel")} className="btn-ghost px-3 py-1.5 text-xs">Huỷ</button>
    </div>
  );
}
