export const CATEGORIES = [
  { id: "nong-san", label: "Nông sản", icon: "🌾" },
  { id: "thuc-pham", label: "Thực phẩm sạch", icon: "🥬" },
  { id: "nha-may", label: "Nhà máy · Sản xuất", icon: "🏭" },
  { id: "xuat-khau", label: "Xuất nhập khẩu", icon: "🚢" },
  { id: "organic", label: "Organic · Trang trại", icon: "🌱" },
  { id: "do-uong", label: "Đồ uống · Cà phê", icon: "☕" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function categoryLabel(id: string) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
