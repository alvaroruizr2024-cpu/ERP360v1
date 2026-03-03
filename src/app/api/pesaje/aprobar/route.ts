import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// POST /api/pesaje/aprobar - Move record from temporal to main table
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, aprobado_por, motivo_rechazo } = body;

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    if (action === "aprobar") {
      // 1. Get the temporal record
      const { data: temp, error: fetchErr } = await supabase
        .from("registros_pesaje_temporal")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchErr || !temp) {
        return NextResponse.json({ error: "Registro temporal no encontrado: " + (fetchErr?.message || "") }, { status: 404 });
      }

      // 2. Insert into main table
      const mainRecord: any = {
        ticket: temp.ticket,
        vehiculo_placa: temp.vehiculo_placa,
        chofer: temp.chofer,
        tipo: temp.tipo,
        peso_bruto: temp.peso_bruto,
        tara: temp.tara,
        peso_neto: temp.peso_neto,
        bascula: temp.bascula,
        parcela: temp.parcela,
        porcentaje_impurezas: temp.impurezas || 0,
        peso_neto_ajustado: (temp.peso_neto || 0) * (1 - (temp.impurezas || 0) / 100),
        observaciones: temp.observaciones,
        estado: "completo",
        origen_registro: "campo",
        user_id: temp.user_id,
      };

      const { data: inserted, error: insertErr } = await supabase
        .from("registros_pesaje")
        .insert(mainRecord)
        .select()
        .single();

      if (insertErr) {
        return NextResponse.json({ error: "Error al insertar en tabla principal: " + insertErr.message }, { status: 500 });
      }

      // 3. Update temporal as approved
      await supabase
        .from("registros_pesaje_temporal")
        .update({
          estado: "aprobado",
          aprobado_por: aprobado_por || "sistema",
          aprobado_at: new Date().toISOString(),
        })
        .eq("id", id);

      return NextResponse.json({
        success: true,
        message: "Registro aprobado y movido a base de datos principal",
        mainId: inserted?.id,
        ticket: temp.ticket,
      });
    }

    if (action === "rechazar") {
      const { error } = await supabase
        .from("registros_pesaje_temporal")
        .update({
          estado: "rechazado",
          aprobado_por: aprobado_por || "sistema",
          aprobado_at: new Date().toISOString(),
          motivo_rechazo: motivo_rechazo || "",
        })
        .eq("id", id);

      if (error) {
        return NextResponse.json({ error: "Error al rechazar: " + error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Registro rechazado" });
    }

    return NextResponse.json({ error: "Accion no valida. Use 'aprobar' o 'rechazar'" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: "Error interno: " + (error?.message || "desconocido") }, { status: 500 });
  }
}
