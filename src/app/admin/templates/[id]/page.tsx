import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Template } from "@/lib/types";
import { TemplateForm } from "../TemplateForm";

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await createAdminClient().from("templates").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <div>
      <h1 className="text-2xl font-bold">Sửa: {data.name}</h1>
      <div className="mt-6"><TemplateForm initial={data as Template} /></div>
    </div>
  );
}
