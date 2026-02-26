"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearLead(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("leads").insert({
    nombre: formData.get("nombre") as string,
    empresa: (formData.get("empresa") as string) || null,
    email: (formData.get("email") as string) || null,
    telefono: (formData.get("telefono") as string) || null,
    origen: (formData.get("origen") as string) || null,
    valor_estimado: formData.get("valor_estimado")
      ? parseFloat(formData.get("valor_estimado") as string)
      : 0,
    notas: (formData.get("notas") as string) || null,
    user_id: user.id,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/crm");
  revalidatePath("/dashboard");
  redirect("/dashboard/crm");
}

type LeadEtapa = "nuevo" | "contactado" | "propuesta" | "negociacion" | "ganado" | "perdido";

export async function actualizarEtapaLead(id: string, etapa: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("leads")
    .update({ etapa: etapa as LeadEtapa })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/crm");
}

export async function eliminarLead(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/crm");
  redirect("/dashboard/crm");
}
