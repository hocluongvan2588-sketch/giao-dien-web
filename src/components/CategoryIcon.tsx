import { Coffee, Factory, LayoutGrid, Salad, Ship, Sprout, Wheat, type LucideProps } from "lucide-react";

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  all: LayoutGrid,
  "nong-san": Wheat,
  "thuc-pham": Salad,
  "nha-may": Factory,
  "xuat-khau": Ship,
  organic: Sprout,
  "do-uong": Coffee,
};

export function CategoryIcon({ id, ...props }: { id: string } & LucideProps) {
  const Icon = ICONS[id] ?? LayoutGrid;
  return <Icon aria-hidden {...props} />;
}
