"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearPeriodoNomina(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("periodos_nomina").insert({
    codigo: formData.get("codigo") as string,
    nombre: formData.get("nombre") as string,
    tipo: formData.get("tipo") as string,
    fecha_inicio: formData.get("fecha_inicio") as string,
    fecha_fin: formData.get("fecha_fin") as string,
    fecha_pago: (formData.get("fecha_pago") as string) || null,
    estado: "borrador",
    notas: (formData.get("notas") as string) || null,
    user_id: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/nomina");
  redirect("/dashboard/nomina");
}

export async function calcularNomina(periodoId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: empleados } = await supabase
    .from("empleados")
    .select("*")
    .eq("estado", "activo");

  if (!empleados || empleados.length === 0) return;

  let totalBruto = 0;
  let totalDeducciones = 0;
  let totalNeto = 0;

  const detalles = empleados.map((emp) => {
    const salarioBase = Number(emp.salario) || 0;
    // IGSS laboral: 4.83% del salario bruto
    const igss = salarioBase * 0.0483;
    // ISR Guatemala: Renta anual - exención Q48,000
    // Q0-Q300,000: 5% | Q300,001+: 7%
    const salarioAnual = salarioBase * 12;
    const rentaImponible = Math.max(0, salarioAnual - 48000);
    let isrAnual = 0;
    if (rentaImponible <= 300000) {
      isrAnual = rentaImponible * 0.05;
    } else {
      isrAnual = 300000 * 0.05 + (rentaImponible - 300000) * 0.07;
    }
    const isr = isrAnual / 12; // Monthly ISR
    const totalDedEmp = igss + isr;
    const neto = salarioBase - totalDedEmp;

    totalBruto += salarioBase;
    totalDeducciones += totalDedEmp;
    totalNeto += neto;

    return {
      periodo_id: periodoId,
      empleado_id: emp.id,
      salario_base: salarioBase,
      horas_extra: 0,
      monto_horas_extra: 0,
      bonificaciones: 0,
      comisiones: 0,
      total_ingresos: salarioBase,
      deduccion_igss: igss,
      deduccion_isr: isr,
      otras_deducciones: 0,
      anticipos: 0,
      total_deducciones: totalDedEmp,
      salario_neto: neto,
      dias_trabajados: 30,
      faltas: 0,
      estado: "calculado",
      user_id: user.id,
    };
  });

  const { error: detError } = await supabase.from("nomina_detalle").insert(detalles);
  if (detError) throw new Error(detError.message);

  await supabase.from("periodos_nomina").update({
    total_bruto: totalBruto,
    total_deducciones: totalDeducciones,
    total_neto: totalNeto,
    estado: "calculado",
  }).eq("id", periodoId);

  revalidatePath("/dashboard/nomina");
}

export async function aprobarNomina(periodoId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("periodos_nomina").update({
    estado: "aprobado",
    aprobado_por: user.email || user.id,
  }).eq("id", periodoId);

  await supabase.from("nomina_detalle").update({
    estado: "aprobado",
  }).eq("periodo_id", periodoId);

  revalidatePath("/dashboard/nomina");
}
