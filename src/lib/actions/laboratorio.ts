"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearMuestra(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("muestras_laboratorio").insert({
    codigo_muestra: formData.get("codigo_muestra") as string,
    tipo_muestra: formData.get("tipo_muestra") as string,
    parcela_id: (formData.get("parcela_id") as string) || null,
    ticket_pesaje: (formData.get("ticket_pesaje") as string) || null,
    fecha_muestreo: (formData.get("fecha_muestreo") as string) || new Date().toISOString(),
    punto_muestreo: (formData.get("punto_muestreo") as string) || null,
    responsable: (formData.get("responsable") as string) || null,
    temperatura: parseFloat(formData.get("temperatura") as string) || null,
    estado: "pendiente",
    observaciones: (formData.get("observaciones") as string) || null,
    user_id: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/laboratorio");
  redirect("/dashboard/laboratorio");
}

export async function crearAnalisis(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const brix = parseFloat(formData.get("brix") as string) || 0;
  const pol = parseFloat(formData.get("pol") as string) || 0;
  const pureza = brix > 0 ? (pol / brix) * 100 : 0;
  const fibra = parseFloat(formData.get("fibra") as string) || 0;
  const rendimiento = pol * (1 - fibra / 100) * 0.7;

  let calificacion = "A";
  if (pureza >= 85) calificacion = "A";
  else if (pureza >= 75) calificacion = "B";
  else if (pureza >= 65) calificacion = "C";
  else calificacion = "D";

  const muestraId = formData.get("muestra_id") as string;

  const { error } = await supabase.from("analisis_calidad").insert({
    muestra_id: muestraId,
    brix,
    pol,
    pureza,
    fibra,
    humedad: parseFloat(formData.get("humedad") as string) || 0,
    cenizas: parseFloat(formData.get("cenizas") as string) || 0,
    ph: parseFloat(formData.get("ph") as string) || null,
    color_icumsa: parseFloat(formData.get("color_icumsa") as string) || null,
    sacarosa: parseFloat(formData.get("sacarosa") as string) || 0,
    azucares_reductores: parseFloat(formData.get("azucares_reductores") as string) || 0,
    rendimiento_estimado: rendimiento,
    calificacion,
    analista: (formData.get("analista") as string) || null,
    equipo_utilizado: (formData.get("equipo_utilizado") as string) || null,
    notas: (formData.get("notas") as string) || null,
    user_id: user.id,
  });

  if (error) throw new Error(error.message);

  await supabase.from("muestras_laboratorio").update({
    estado: "completado",
  }).eq("id", muestraId);

  revalidatePath("/dashboard/laboratorio");
  redirect("/dashboard/laboratorio");
}
