-- Vexim Harvest — schema Supabase
-- Chạy toàn bộ file này trong Supabase Dashboard → SQL Editor.

-- ========== Templates (sản phẩm giao diện) ==========
create table if not exists public.templates (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  name              text not null,
  category          text not null,
  short_description text not null default '',
  description       text not null default '',
  price             integer not null check (price >= 0),
  sale_price        integer check (sale_price is null or sale_price >= 0),
  tags              text[] not null default '{}',
  is_featured       boolean not null default false,
  status            text not null default 'draft' check (status in ('draft', 'published')),
  demo_html         text not null,
  source_path       text,            -- đường dẫn file giao cho khách trong bucket "sources"
  thumbnail_url     text,            -- ảnh chụp toàn trang (bucket "thumbnails", public)
  sales_count       integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists templates_status_idx on public.templates (status, created_at desc);

-- ========== Orders ==========
create table if not exists public.orders (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,      -- nội dung chuyển khoản, VD: VXH7K2M9Q
  user_id     uuid not null references auth.users (id) on delete cascade,
  user_email  text not null,
  template_id uuid not null references public.templates (id) on delete restrict,
  amount      integer not null check (amount >= 0),
  status      text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  paid_at     timestamptz,
  payment_ref text,
  created_at  timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders (user_id, created_at desc);

-- Lưu giao dịch SePay đã xử lý để webhook gọi lại không bị xử lý 2 lần
create table if not exists public.payment_transactions (
  id          bigint primary key,      -- id giao dịch phía SePay
  order_id    uuid references public.orders (id),
  amount      integer not null,
  content     text,
  raw         jsonb not null,
  created_at  timestamptz not null default now()
);

-- Tăng lượt bán khi đơn chuyển sang paid
create or replace function public.increment_sales(tid uuid)
returns void language sql security definer set search_path = public as $$
  update public.templates set sales_count = sales_count + 1 where id = tid;
$$;
revoke all on function public.increment_sales(uuid) from public, anon, authenticated;

-- ========== RLS ==========
-- Mọi thao tác ghi đều đi qua API server dùng service role, nên chỉ mở quyền đọc tối thiểu.
alter table public.templates enable row level security;
alter table public.orders enable row level security;
alter table public.payment_transactions enable row level security;

drop policy if exists "templates_public_read" on public.templates;
create policy "templates_public_read" on public.templates
  for select using (status = 'published');

drop policy if exists "orders_owner_read" on public.orders;
create policy "orders_owner_read" on public.orders
  for select using (auth.uid() = user_id);

-- ========== Storage ==========
insert into storage.buckets (id, name, public)
values ('thumbnails', 'thumbnails', true)
on conflict (id) do nothing;

-- File nguồn giao cho khách: private, chỉ tải qua signed URL do server tạo sau khi đã thanh toán
insert into storage.buckets (id, name, public)
values ('sources', 'sources', false)
on conflict (id) do nothing;
