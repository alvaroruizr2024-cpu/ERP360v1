"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearCuenta(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("cuentas_contables").insert({
    codigo: formData.get("codigo") as string,
    nombre: formData.get("nombre") as string,
    tipo: formData.get("tipo") as "activo" | "pasivo" | "capital" | "ingreso" | "gasto",
    user_id: user.id,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/contabilidad");
}

type AsientoLinea = {
  cuenta_id: string;
  debe: number;
  haber: number;
};

export async function crearAsiento(data: {
  descripcion: string;
  lineas: AsientoLinea[];
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const totalDebe = data.lineas.reduce((s, l) => s + l.debe, 0);
  const totalHaber = data.lineas.reduce((s, l) => s + l.haber, 0);

  if (Math.abs(totalDebe - totalHaber) > 0.01) {
    throw new Error("El asiento no esta balanceado: Debe y Haber deben ser iguales");
  }

  const { data: asiento, error: asientoError } = await supabase
    .from("asientos_contables")
    .insert({ descripcion: data.descripcion, user_id: user.id })
    .select()
    .single();

  if (asientoError) throw new Error(asientoError.message);

  const detalles = data.lineas.map((l) => ({
    asiento_id: asiento.id,
    cuenta_id: l.cuenta_id,
    debe: l.debe,
    haber: l.haber,
  }));

  const { error: detalleError } = await supabase
    .from("asiento_detalle")
    .insert(detalles);

  if (detalleError) throw new Error(detalleError.message);

  // Update account balances
  for (const l of data.lineas) {
    const { data: cuenta } = await supabase
      .from("cuentas_contables")
      .select("saldo, tipo")
      .eq("id", l.cuenta_id)
      .single();

    if (cuenta) {
      const isDebit = ["activo", "gasto"].includes(cuenta.tipo);
      const delta = isDebit ? l.debe - l.haber : l.haber - l.debe;
      await supabase
        .from("cuentas_contables")
        .update({ saldo: cuenta.saldo + delta })
        .eq("id", l.cuenta_id);
    }
  }

  revalidatePath("/dashboard/contabilidad");
  revalidatePath("/dashboard");
  redirect("/dashboard/contabilidad");
}
