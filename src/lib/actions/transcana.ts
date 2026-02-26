"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearOperacion(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("operaciones_campo").insert({
    tipo: formData.get("tipo") as "corte" | "alce" | "transporte",
    parcela_id: (formData.get("parcela_id") as string) || null,
    fecha: (formData.get("fecha") as string) || new Date().toISOString(),
    turno: (formData.get("turno") as "diurno" | "nocturno") || null,
    cuadrilla: (formData.get("cuadrilla") as string) || null,
    hectareas_trabajadas: parseFloat(formData.get("hectareas_trabajadas") as string) || 0,
    toneladas: parseFloat(formData.get("toneladas") as string) || 0,
    chofer: (formData.get("chofer") as string) || null,
    origen: (formData.get("origen") as string) || null,
    destino: (formData.get("destino") as string) || null,
    observaciones: (formData.get("observaciones") as string) || null,
    estado: (formData.get("estado") as "programada" | "en_proceso" | "completada" | "cancelada") || "en_proceso",
    user_id: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/operaciones");
  redirect("/dashboard/operaciones");
}

export async function crearPesaje(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const pesoBruto = parseFloat(formData.get("peso_bruto") as string) || 0;
  const tara = parseFloat(formData.get("tara") as string) || 0;
  const pesoNeto = pesoBruto - tara;
  const impurezas = parseFloat(formData.get("porcentaje_impurezas") as string) || 0;
  const pesoAjustado = pesoNeto * (1 - impurezas / 100);

  const { error } = await supabase.from("registros_pesaje").insert({
    ticket: (formData.get("ticket") as string) || null,
    vehiculo_placa: formData.get("vehiculo_placa") as string,
    chofer: (formData.get("chofer") as string) || null,
    parcela_id: (formData.get("parcela_id") as string) || null,
    tipo: formData.get("tipo") as "entrada" | "salida",
    peso_bruto: pesoBruto,
    tara,
    peso_neto: pesoNeto,
    porcentaje_impurezas: impurezas,
    peso_neto_ajustado: pesoAjustado,
    bascula: (formData.get("bascula") as string) || null,
    observaciones: (formData.get("observaciones") as string) || null,
    estado: (formData.get("estado") as "pendiente" | "completo" | "anulado") || "pendiente",
    user_id: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/pesaje");
  redirect("/dashboard/pesaje");
}

export async function crearParcela(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("parcelas").insert({
    codigo: formData.get("codigo") as string,
    nombre: formData.get("nombre") as string,
    ubicacion: (formData.get("ubicacion") as string) || null,
    hectareas: parseFloat(formData.get("hectareas") as string) || 0,
    variedad_cana: (formData.get("variedad_cana") as string) || null,
    fecha_siembra: (formData.get("fecha_siembra") as string) || null,
    estado: (formData.get("estado") as "activa" | "en_corte" | "cosechada" | "en_reposo") || "activa",
    user_id: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/operaciones/parcelas");
  redirect("/dashboard/operaciones/parcelas");
}

export async function crearVehiculo(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("vehiculos").insert({
    placa: formData.get("placa") as string,
    tipo: formData.get("tipo") as "camion" | "tractor" | "alzadora" | "cosechadora" | "vehiculo_liviano" | "otro",
    marca: (formData.get("marca") as string) || null,
    modelo: (formData.get("modelo") as string) || null,
    anio: parseInt(formData.get("anio") as string) || null,
    capacidad_toneladas: parseFloat(formData.get("capacidad_toneladas") as string) || null,
    kilometraje: parseFloat(formData.get("kilometraje") as string) || 0,
    chofer_asignado: (formData.get("chofer_asignado") as string) || null,
    estado: (formData.get("estado") as "disponible" | "en_operacion" | "en_mantenimiento" | "fuera_servicio") || "disponible",
    user_id: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/flota");
  redirect("/dashboard/flota");
}

export async function crearMantenimiento(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("mantenimientos").insert({
    vehiculo_id: formData.get("vehiculo_id") as string,
    tipo: formData.get("tipo") as "preventivo" | "correctivo" | "emergencia",
    descripcion: formData.get("descripcion") as string,
    fecha: (formData.get("fecha") as string) || new Date().toISOString().split("T")[0],
    costo: parseFloat(formData.get("costo") as string) || 0,
    kilometraje: parseFloat(formData.get("kilometraje") as string) || null,
    taller: (formData.get("taller") as string) || null,
    estado: (formData.get("estado") as "programado" | "en_proceso" | "completado") || "programado",
    user_id: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/flota/mantenimiento");
  redirect("/dashboard/flota/mantenimiento");
}

export async function crearDespachoCombustible(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const galones = parseFloat(formData.get("galones") as string);
  const precioGalon = parseFloat(formData.get("precio_galon") as string);

  const { error } = await supabase.from("despachos_combustible").insert({
    vehiculo_placa: formData.get("vehiculo_placa") as string,
    vehiculo_id: (formData.get("vehiculo_id") as string) || null,
    tipo_combustible: formData.get("tipo_combustible") as "diesel" | "gasolina_90" | "gasolina_95" | "glp",
    galones,
    precio_galon: precioGalon,
    total: galones * precioGalon,
    kilometraje: parseFloat(formData.get("kilometraje") as string) || null,
    operador: (formData.get("operador") as string) || null,
    estacion: (formData.get("estacion") as string) || null,
    user_id: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/combustible");
  redirect("/dashboard/combustible");
}

export async function crearRegistroCosto(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("registros_costo").insert({
    centro_costo_id: (formData.get("centro_costo_id") as string) || null,
    parcela_id: (formData.get("parcela_id") as string) || null,
    concepto: formData.get("concepto") as string,
    categoria: (formData.get("categoria") as "mano_obra" | "combustible" | "mantenimiento" | "insumos" | "transporte" | "otros") || null,
    monto: parseFloat(formData.get("monto") as string),
    fecha: (formData.get("fecha") as string) || new Date().toISOString().split("T")[0],
    referencia: (formData.get("referencia") as string) || null,
    user_id: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/costos");
  redirect("/dashboard/costos");
}

export async function crearCentroCosto(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("centros_costo").insert({
    codigo: formData.get("codigo") as string,
    nombre: formData.get("nombre") as string,
    tipo: (formData.get("tipo") as "operativo" | "administrativo" | "logistico") || null,
    presupuesto: parseFloat(formData.get("presupuesto") as string) || 0,
    user_id: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/costos/centros");
  redirect("/dashboard/costos/centros");
}
