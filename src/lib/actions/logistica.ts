"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearRuta(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("rutas_transporte").insert({
    codigo: formData.get("codigo") as string,
    nombre: formData.get("nombre") as string,
    origen: formData.get("origen") as string,
    destino: formData.get("destino") as string,
    distancia_km: parseFloat(formData.get("distancia_km") as string) || 0,
    tiempo_estimado_min: parseInt(formData.get("tiempo_estimado_min") as string) || 0,
    tipo: (formData.get("tipo") as string) || "cana",
    estado: (formData.get("estado") as string) || "activa",
    user_id: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/logistica");
  redirect("/dashboard/logistica");
}

export async function crearViaje(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("viajes").insert({
    ruta_id: (formData.get("ruta_id") as string) || null,
    vehiculo_id: (formData.get("vehiculo_id") as string) || null,
    chofer: (formData.get("chofer") as string) || null,
    fecha_salida: (formData.get("fecha_salida") as string) || new Date().toISOString(),
    toneladas_transportadas: parseFloat(formData.get("toneladas_transportadas") as string) || 0,
    kilometraje_inicio: parseFloat(formData.get("kilometraje_inicio") as string) || 0,
    parcela_origen_id: (formData.get("parcela_origen_id") as string) || null,
    destino_ingenio: (formData.get("destino_ingenio") as string) || null,
    ticket_pesaje: (formData.get("ticket_pesaje") as string) || null,
    costo_flete: parseFloat(formData.get("costo_flete") as string) || 0,
    estado: (formData.get("estado") as string) || "programado",
    user_id: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/logistica/viajes");
  redirect("/dashboard/logistica/viajes");
}

export async function completarViaje(id: string, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("viajes").update({
    fecha_llegada: new Date().toISOString(),
    kilometraje_fin: parseFloat(formData.get("kilometraje_fin") as string) || 0,
    combustible_consumido: parseFloat(formData.get("combustible_consumido") as string) || 0,
    incidencias: (formData.get("incidencias") as string) || null,
    estado: "entregado",
  }).eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/logistica/viajes");
}
