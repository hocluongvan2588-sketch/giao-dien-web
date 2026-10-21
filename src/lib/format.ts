export function formatVnd(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount) + "₫";
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

export function effectivePrice(t: { price: number; sale_price: number | null }) {
  return t.sale_price != null && t.sale_price < t.price ? t.sale_price : t.price;
}

/** Bỏ dấu tiếng Việt và chuyển thành slug URL. */
export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function isNew(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() < 1000 * 60 * 60 * 24 * 30;
}
