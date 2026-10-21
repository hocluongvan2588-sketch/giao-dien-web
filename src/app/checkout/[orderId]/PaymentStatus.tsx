"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { OrderStatus } from "@/lib/types";

export function PaymentStatus({ orderId, initialStatus }: { orderId: string; initialStatus: OrderStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    if (status !== "pending") return;
    const timer = setInterval(async () => {
      const res = await fetch(`/api/orders/${orderId}`, { cache: "no-store" }).catch(() => null);
      if (!res?.ok) return;
      const data = (await res.json()) as { status: OrderStatus };
      if (data.status !== "pending") {
        setStatus(data.status);
        router.refresh();
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [orderId, status, router]);

  if (status === "paid") {
    return (
      <div className="rounded-2xl bg-brand-50 p-6 text-center">
        <div className="text-4xl" aria-hidden>🎉</div>
        <h2 className="mt-2 text-xl font-extrabold text-brand-800">Thanh toán thành công!</h2>
        <p className="mt-1 text-sm text-brand-900/70">Cảm ơn bạn đã mua giao diện tại Vexim Harvest.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a href={`/api/download/${orderId}`} className="btn-primary px-6 py-3">Tải mã nguồn</a>
          <Link href="/account" className="btn-ghost px-6 py-3">Đơn hàng của tôi</Link>
        </div>
      </div>
    );
  }
  if (status === "cancelled") {
    return <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">Đơn hàng đã bị huỷ. Vui lòng liên hệ hỗ trợ nếu bạn đã chuyển khoản.</p>;
  }
  return (
    <div className="mt-6 flex items-center gap-3 rounded-xl bg-earth-50 px-4 py-3 text-sm text-earth-600">
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-earth-400 opacity-75" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-earth-500" />
      </span>
      Đang chờ thanh toán… Trang sẽ tự cập nhật khi nhận được tiền.
    </div>
  );
}
