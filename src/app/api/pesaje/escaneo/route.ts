import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await request.formData();

  const vehiculoPlaca = formData.get("vehiculo_placa") as string;
  if (!vehiculoPlaca) {
    return NextResponse.json(
      { error: "La placa del vehículo es requerida" },
      { status: 400 }
    );
  }

  const pesoBruto = parseFloat(formData.get("peso_bruto") as string) || 0;
  const tara = parseFloat(formData.get("tara") as string) || 0;
  const pesoNeto = pesoBruto - tara;
  const impurezas =
    parseFloat(formData.get("porcentaje_impurezas") as string) || 0;
  const pesoAjustado = pesoNeto * (1 - impurezas / 100);

  const { error } = await supabase.from("registros_pesaje").insert({
    ticket: (formData.get("ticket") as string) || null,
    vehiculo_placa: vehiculoPlaca,
    chofer: (formData.get("chofer") as string) || null,
    tipo: (formData.get("tipo") as "entrada" | "salida") || "entrada",
    peso_bruto: pesoBruto,
    tara,
    peso_neto: pesoNeto,
    porcentaje_impurezas: impurezas,
    peso_neto_ajustado: pesoAjustado,
    bascula: (formData.get("bascula") as string) || null,
    observaciones: (formData.get("observaciones") as string) || null,
    estado:
      (formData.get("estado") as "pendiente" | "completo" | "anulado") ||
      "pendiente",
    user_id: user.id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
