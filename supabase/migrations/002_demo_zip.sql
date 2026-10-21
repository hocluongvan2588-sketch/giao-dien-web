-- Chạy file này trong Supabase → SQL Editor nếu bạn đã tạo database từ schema.sql trước đó.
-- Thêm hỗ trợ nhập giao diện từ gói ZIP (HTML + CSS + JS + ảnh).

alter table public.templates add column if not exists demo_base_url text;

insert into storage.buckets (id, name, public)
values ('demos', 'demos', true)
on conflict (id) do nothing;
