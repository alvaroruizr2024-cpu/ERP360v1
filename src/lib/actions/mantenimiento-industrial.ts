"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearEquipoIndustrial(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("equipos_industriales").insert({
    codigo: formData.get("codigo") as string,
    nombre: formData.get("nombre") as string,
    tipo: formData.get("tipo") as string,
    area: (formData.get("area") as string) || null,
    marca: (formData.get("marca") as string) || null,
    modelo: (formData.get("modelo") as string) || null,
    numero_serie: (formData.get("numero_serie") as string) || null,
    fecha_instalacion: (formData.get("fecha_instalacion") as string) || null,
    potencia: (formData.get("potencia") as string) || null,
    capacidad: (formData.get("capacidad") as string) || null,
    criticidad: (formData.get("criticidad") as string) || "media",
    estado: "operativo",
    user_id: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/mantenimiento-industrial");
  redirect("/dashboard/mantenimiento-industrial");
}

export async function crearOrdenTrabajo(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("ordenes_trabajo").insert({
    equipo_id: formData.get("equipo_id") as string,
    tipo: formData.get("tipo") as string,
    prioridad: (formData.get("prioridad") as string) || "media",
    titulo: formData.get("titulo") as string,
    descripcion: (formData.get("descripcion") as string) || null,
    solicitante: (formData.get("solicitante") as string) || null,
    tecnico_asignado: (formData.get("tecnico_asignado") as string) || null,
    fecha_programada: (formData.get("fecha_programada") as string) || null,
    estado: "abierta",
    user_id: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/mantenimiento-industrial/ordenes");
  redirect("/dashboard/mantenimiento-industrial/ordenes");
}

export async function completarOrdenTrabajo(id: string, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const costoManoObra = parseFloat(formData.get("costo_mano_obra") as string) || 0;
  const costoRepuestos = parseFloat(formData.get("costo_repuestos") as string) || 0;

  await supabase.from("ordenes_trabajo").update({
    fecha_fin: new Date().toISOString(),
    horas_trabajo: parseFloat(formData.get("horas_trabajo") as string) || 0,
    costo_mano_obra: costoManoObra,
    costo_repuestos: costoRepuestos,
    costo_total: costoManoObra + costoRepuestos,
    causa_raiz: (formData.get("causa_raiz") as string) || null,
    solucion: (formData.get("solucion") as string) || null,
    estado: "completada",
  }).eq("id", id);

  revalidatePath("/dashboard/mantenimiento-industrial/ordenes");
}

export async function crearRepuesto(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("repuestos").insert({
    codigo: formData.get("codigo") as string,
    nombre: formData.get("nombre") as string,
    descripcion: (formData.get("descripcion") as string) || null,
    categoria: (formData.get("categoria") as string) || null,
    unidad_medida: (formData.get("unidad_medida") as string) || "unidad",
    stock_actual: parseFloat(formData.get("stock_actual") as string) || 0,
    stock_minimo: parseFloat(formData.get("stock_minimo") as string) || 0,
    precio_unitario: parseFloat(formData.get("precio_unitario") as string) || 0,
    proveedor: (formData.get("proveedor") as string) || null,
    ubicacion_almacen: (formData.get("ubicacion_almacen") as string) || null,
    estado: "disponible",
    user_id: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/mantenimiento-industrial/repuestos");
  redirect("/dashboard/mantenimiento-industrial/repuestos");
}
