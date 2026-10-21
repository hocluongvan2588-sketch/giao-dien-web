export const CATEGORIES = [
  { id: "nong-san", label: "Nông sản" },
  { id: "thuc-pham", label: "Thực phẩm sạch" },
  { id: "nha-may", label: "Nhà máy · Sản xuất" },
  { id: "xuat-khau", label: "Xuất nhập khẩu" },
  { id: "organic", label: "Organic · Trang trại" },
  { id: "do-uong", label: "Đồ uống · Cà phê" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function categoryLabel(id: string) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
