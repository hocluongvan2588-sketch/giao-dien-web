export const CATEGORIES = [
  { id: "nong-san", label: "Nông sản" },
  { id: "thuc-pham", label: "Thực phẩm sạch" },
  { id: "nha-may", label: "Nhà máy, sản xuất" },
  { id: "xuat-khau", label: "Xuất nhập khẩu" },
  { id: "organic", label: "Organic, trang trại" },
  { id: "do-uong", label: "Đồ uống, cà phê" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function categoryLabel(id: string) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
