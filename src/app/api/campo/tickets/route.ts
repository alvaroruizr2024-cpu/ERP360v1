import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const url = new URL(request.url);
    const status = url.searchParams.get("estado") || "pendiente";
    const limit = parseInt(url.searchParams.get("limit") || "50");

    const { data, error } = await supabase
      .from("registros_pesaje")
      .select("*")
      .eq("estado", status)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ tickets: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const ticket = "TK-" + String(Date.now()).slice(-6);

    const record = {
      ticket: body.ticket || ticket,
      vehiculo_placa: body.vehiculo_placa || "",
      chofer: body.chofer || "",
      parcela_id: body.parcela_id || null,
      tipo: body.tipo || "entrada",
      peso_bruto: parseFloat(body.peso_bruto) || 0,
      tara: parseFloat(body.tara) || 0,
      peso_neto: parseFloat(body.peso_neto) || 0,
      porcentaje_impurezas: parseFloat(body.porcentaje_impurezas) || 0,
      peso_neto_ajustado: parseFloat(body.peso_neto_ajustado) || 0,
      bascula: body.bascula || "Bascula 1",
      observaciones: body.observaciones || "",
      estado: "pendiente",
      user_id: body.user_id,
    };

    if (!record.user_id) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        record.user_id = user.id;
      } else {
        return NextResponse.json({ error: "user_id requerido" }, { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from("registros_pesaje")
      .insert(record)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from("auditoria").insert({
      user_id: record.user_id,
      accion: "crear_ticket_pesaje",
      modulo: "campo",
      detalle: "Ticket " + (data?.ticket || ticket) + " placa " + record.vehiculo_placa,
    });

    return NextResponse.json({ ticket: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
