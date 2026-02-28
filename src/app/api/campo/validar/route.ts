import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { ticket_id, accion, observaciones } = body;

    if (!ticket_id || !accion) {
      return NextResponse.json({ error: "ticket_id y accion requeridos" }, { status: 400 });
    }

    if (accion !== "aprobar" && accion !== "rechazar") {
      return NextResponse.json({ error: "accion debe ser aprobar o rechazar" }, { status: 400 });
    }

    const nuevoEstado = accion === "aprobar" ? "completo" : "anulado";

    const { data, error } = await supabase
      .from("registros_pesaje")
      .update({
        estado: nuevoEstado,
        observaciones: observaciones || null,
      })
      .eq("id", ticket_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from("auditoria").insert({
      user_id: user.id,
      accion: accion === "aprobar" ? "aprobar_ticket" : "rechazar_ticket",
      modulo: "campo_validacion",
      detalle: "Ticket " + (data?.ticket || ticket_id) + " " + nuevoEstado + " por lider",
    });

    return NextResponse.json({ ticket: data, mensaje: "Ticket " + nuevoEstado });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const url = new URL(request.url);
    const estado = url.searchParams.get("estado");

    let query = supabase
      .from("registros_pesaje")
      .select("*")
      .order("created_at", { ascending: false });

    if (estado) {
      query = query.eq("estado", estado);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tickets: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
