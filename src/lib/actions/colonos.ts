"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearColono(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("colonos").insert({
    codigo: formData.get("codigo") as string,
    nombre: formData.get("nombre") as string,
    dpi: (formData.get("dpi") as string) || null,
    nit: (formData.get("nit") as string) || null,
    telefono: (formData.get("telefono") as string) || null,
    email: (formData.get("email") as string) || null,
    direccion: (formData.get("direccion") as string) || null,
    tipo_contrato: (formData.get("tipo_contrato") as string) || "individual",
    precio_tonelada: parseFloat(formData.get("precio_tonelada") as string) || 0,
    cuenta_bancaria: (formData.get("cuenta_bancaria") as string) || null,
    banco: (formData.get("banco") as string) || null,
    estado: "activo",
    user_id: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/colonos");
  redirect("/dashboard/colonos");
}

export async function crearEntregaColono(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const toneladasBrutas = parseFloat(formData.get("toneladas_brutas") as string) || 0;
  const impurezas = parseFloat(formData.get("porcentaje_impurezas") as string) || 0;
  const toneladasNetas = toneladasBrutas * (1 - impurezas / 100);
  const precioTonelada = parseFloat(formData.get("precio_tonelada") as string) || 0;
  const montoBruto = toneladasNetas * precioTonelada;
  const deducciones = parseFloat(formData.get("deducciones") as string) || 0;
  const montoNeto = montoBruto - deducciones;

  const { error } = await supabase.from("entregas_colono").insert({
    colono_id: formData.get("colono_id") as string,
    parcela_id: (formData.get("parcela_id") as string) || null,
    zafra_id: (formData.get("zafra_id") as string) || null,
    fecha_entrega: (formData.get("fecha_entrega") as string) || new Date().toISOString().split("T")[0],
    toneladas_brutas: toneladasBrutas,
    porcentaje_impurezas: impurezas,
    toneladas_netas: toneladasNetas,
    precio_tonelada: precioTonelada,
    monto_bruto: montoBruto,
    deducciones,
    concepto_deducciones: (formData.get("concepto_deducciones") as string) || null,
    monto_neto: montoNeto,
    ticket_pesaje: (formData.get("ticket_pesaje") as string) || null,
    calificacion_calidad: (formData.get("calificacion_calidad") as string) || "A",
    estado: "pendiente",
    user_id: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/colonos/entregas");
  redirect("/dashboard/colonos/entregas");
}

export async function liquidarEntrega(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("entregas_colono").update({
    estado: "liquidado",
  }).eq("id", id);

  revalidatePath("/dashboard/colonos/entregas");
}
