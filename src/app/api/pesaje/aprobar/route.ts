import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, aprobado_por, motivo_rechazo } = body;

    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    if (action === "aprobar") {
      // 1. Get temporal record with ALL fields
      const { data: temp, error: fetchErr } = await supabase
        .from("registros_pesaje_temporal")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchErr || !temp) {
        return NextResponse.json({ error: "Registro no encontrado: " + (fetchErr?.message || "") }, { status: 404 });
      }

      // 2. Calculate adjusted weight
      const pesoNeto = temp.peso_neto || ((temp.peso_bruto || 0) - (temp.tara || 0));
      const impurezas = temp.impurezas || 0;
      const pesoNetoAjustado = pesoNeto * (1 - impurezas / 100);

      // 3. Build main record with ALL fields mapped
      const mainRecord: any = {
        ticket: temp.ticket || temp.numero_ticket,
        vehiculo_placa: temp.vehiculo_placa,
        chofer: temp.chofer,
        tipo: temp.tipo,
        peso_bruto: temp.peso_bruto,
        tara: temp.tara,
        peso_neto: pesoNeto,
        porcentaje_impurezas: impurezas,
        peso_neto_ajustado: Math.round(pesoNetoAjustado * 100) / 100,
        bascula: temp.bascula,
        parcela: temp.parcela,
        observaciones: temp.observaciones,
        estado: "completo",
        origen_registro: temp.origen_registro || "campo",
        user_id: temp.user_id,
        // Campos extendidos del ticket
        transportista: temp.transportista,
        variedad: temp.variedad,
        guia_remision: temp.guia_remision,
        nro_viaje: temp.nro_viaje,
        turno: temp.turno,
        producto: temp.producto,
        ruta: temp.ruta,
        aprobado_por: aprobado_por || "sistema",
        aprobado_at: new Date().toISOString(),
      };

      // Set fecha_hora from pesaje date or now
      if (temp.fecha_pesaje) {
        const hora = temp.hora_pesaje || "00:00";
        mainRecord.fecha_hora = new Date(temp.fecha_pesaje + "T" + hora).toISOString();
      } else {
        mainRecord.fecha_hora = temp.created_at || new Date().toISOString();
      }

      // 4. Insert into main table
      const { data: inserted, error: insertErr } = await supabase
        .from("registros_pesaje")
        .insert(mainRecord)
        .select()
        .single();

      if (insertErr) {
        return NextResponse.json({
          error: "Error insertando en tabla principal: " + insertErr.message,
          detail: insertErr.details,
          hint: insertErr.hint,
        }, { status: 500 });
      }

      // 5. Mark temporal as approved
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
        message: `Ticket ${temp.ticket} aprobado — ${temp.vehiculo_placa} / ${temp.chofer} / Neto: ${pesoNeto} TM (ajustado: ${pesoNetoAjustado.toFixed(2)} TM)`,
        mainId: inserted?.id,
        ticket: temp.ticket,
        pesoBruto: temp.peso_bruto,
        tara: temp.tara,
        pesoNeto: pesoNeto,
        pesoNetoAjustado: pesoNetoAjustado,
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

      if (error) return NextResponse.json({ error: "Error al rechazar: " + error.message }, { status: 500 });
      return NextResponse.json({ success: true, message: "Registro rechazado" });
    }

    return NextResponse.json({ error: "Acción no válida. Use 'aprobar' o 'rechazar'" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: "Error interno: " + (error?.message || "desconocido") }, { status: 500 });
  }
}
