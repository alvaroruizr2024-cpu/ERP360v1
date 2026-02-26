"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearZafra(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("zafras").insert({
    codigo: formData.get("codigo") as string,
    nombre: formData.get("nombre") as string,
    fecha_inicio: formData.get("fecha_inicio") as string,
    fecha_fin: (formData.get("fecha_fin") as string) || null,
    meta_toneladas: parseFloat(formData.get("meta_toneladas") as string) || 0,
    meta_hectareas: parseFloat(formData.get("meta_hectareas") as string) || 0,
    estado: (formData.get("estado") as string) || "planificada",
    notas: (formData.get("notas") as string) || null,
    user_id: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/zafra");
  redirect("/dashboard/zafra");
}

export async function actualizarZafra(id: string, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("zafras").update({
    nombre: formData.get("nombre") as string,
    fecha_inicio: formData.get("fecha_inicio") as string,
    fecha_fin: (formData.get("fecha_fin") as string) || null,
    meta_toneladas: parseFloat(formData.get("meta_toneladas") as string) || 0,
    meta_hectareas: parseFloat(formData.get("meta_hectareas") as string) || 0,
    toneladas_procesadas: parseFloat(formData.get("toneladas_procesadas") as string) || 0,
    hectareas_cosechadas: parseFloat(formData.get("hectareas_cosechadas") as string) || 0,
    estado: formData.get("estado") as string,
    notas: (formData.get("notas") as string) || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/zafra");
  redirect("/dashboard/zafra");
}

export async function crearMetaZafra(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const metaToneladas = parseFloat(formData.get("meta_toneladas") as string) || 0;
  const toneladasReal = parseFloat(formData.get("toneladas_real") as string) || 0;
  const cumplimiento = metaToneladas > 0 ? (toneladasReal / metaToneladas) * 100 : 0;

  const { error } = await supabase.from("metas_zafra").insert({
    zafra_id: formData.get("zafra_id") as string,
    parcela_id: (formData.get("parcela_id") as string) || null,
    semana: parseInt(formData.get("semana") as string),
    meta_toneladas: metaToneladas,
    toneladas_real: toneladasReal,
    meta_hectareas: parseFloat(formData.get("meta_hectareas") as string) || 0,
    hectareas_real: parseFloat(formData.get("hectareas_real") as string) || 0,
    cumplimiento_porcentaje: cumplimiento,
    observaciones: (formData.get("observaciones") as string) || null,
    user_id: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/zafra");
}
