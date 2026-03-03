import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  const { error } = await supabase.from("registros_pesaje_temporal").select("id").limit(1);

  if (!error) {
    return NextResponse.json({ status: "ok", message: "Tabla temporal existe" });
  }

  return NextResponse.json({
    status: "missing",
    message: "Ejecute este SQL en Supabase SQL Editor (https://supabase.com/dashboard/project/uinoropxppiuqgzktqjr/sql)",
    sql: "CREATE TABLE IF NOT EXISTS registros_pesaje_temporal (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, ticket TEXT NOT NULL, vehiculo_placa TEXT NOT NULL DEFAULT '', chofer TEXT DEFAULT '', tipo TEXT DEFAULT 'entrada', peso_bruto NUMERIC(10,2) DEFAULT 0, tara NUMERIC(10,2) DEFAULT 0, peso_neto NUMERIC(10,2) DEFAULT 0, bascula TEXT DEFAULT '', parcela TEXT DEFAULT '', impurezas NUMERIC(5,2) DEFAULT 0, observaciones TEXT DEFAULT '', estado TEXT DEFAULT 'pendiente', origen_registro TEXT DEFAULT 'campo', ocr_confianza NUMERIC(5,1) DEFAULT 0, ocr_datos_raw JSONB DEFAULT '{}', user_id UUID, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(), aprobado_por TEXT, aprobado_at TIMESTAMPTZ, motivo_rechazo TEXT); ALTER TABLE registros_pesaje_temporal ENABLE ROW LEVEL SECURITY; CREATE POLICY allow_all_auth ON registros_pesaje_temporal FOR ALL TO authenticated USING (true) WITH CHECK (true); CREATE POLICY allow_all_anon ON registros_pesaje_temporal FOR ALL TO anon USING (true) WITH CHECK (true);"
  });
}
