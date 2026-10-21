export type TemplateStatus = "draft" | "published";

export interface Template {
  id: string;
  slug: string;
  name: string;
  category: string;
  short_description: string;
  description: string;
  price: number;
  sale_price: number | null;
  tags: string[];
  is_featured: boolean;
  status: TemplateStatus;
  demo_html: string;
  source_path: string | null;
  demo_base_url: string | null;
  thumbnail_url: string | null;
  sales_count: number;
  created_at: string;
  updated_at: string;
}

export type TemplateCardData = Pick<
  Template,
  | "id"
  | "slug"
  | "name"
  | "category"
  | "short_description"
  | "price"
  | "sale_price"
  | "is_featured"
  | "thumbnail_url"
  | "sales_count"
  | "created_at"
>;

export const CARD_COLUMNS =
  "id, slug, name, category, short_description, price, sale_price, is_featured, thumbnail_url, sales_count, created_at";

export type OrderStatus = "pending" | "paid" | "cancelled";

export interface Order {
  id: string;
  code: string;
  user_id: string;
  user_email: string;
  template_id: string;
  amount: number;
  status: OrderStatus;
  paid_at: string | null;
  payment_ref: string | null;
  created_at: string;
}
