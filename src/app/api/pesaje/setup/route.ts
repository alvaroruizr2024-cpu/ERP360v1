import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("key");
  if (secret !== "innovaq2026") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const dbPassword = process.env.SUPABASE_DB_PASSWORD || "";
  const connectionString = process.env.SUPABASE_DB_URL ||
    "postgresql://postgres.uinoropxppiuqgzktqjr:" + dbPassword + "@aws-0-us-east-1.pooler.supabase.com:6543/postgres";

  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 1, connectionTimeoutMillis: 10000 });

  try {
    const client = await pool.connect();

    const check = await client.query(
      "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='registros_pesaje_temporal') as exists"
    );

    if (check.rows[0].exists) {
      client.release(); await pool.end();
      return NextResponse.json({ status: "ok", message: "Tabla registros_pesaje_temporal ya existe" });
    }

    const ddl = [
      `CREATE TABLE registros_pesaje_temporal (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        ticket TEXT NOT NULL,
        vehiculo_placa TEXT NOT NULL DEFAULT '',
        chofer TEXT DEFAULT '',
        tipo TEXT DEFAULT 'entrada',
        peso_bruto NUMERIC(10,2) DEFAULT 0,
        tara NUMERIC(10,2) DEFAULT 0,
        peso_neto NUMERIC(10,2) DEFAULT 0,
        bascula TEXT DEFAULT '',
        parcela TEXT DEFAULT '',
        impurezas NUMERIC(5,2) DEFAULT 0,
        observaciones TEXT DEFAULT '',
        estado TEXT DEFAULT 'pendiente',
        origen_registro TEXT DEFAULT 'campo',
        ocr_confianza NUMERIC(5,1) DEFAULT 0,
        ocr_datos_raw JSONB DEFAULT '{}',
        user_id UUID,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        aprobado_por TEXT,
        aprobado_at TIMESTAMPTZ,
        motivo_rechazo TEXT
      )`,
      "CREATE INDEX IF NOT EXISTS idx_temp_estado ON registros_pesaje_temporal(estado)",
      "CREATE INDEX IF NOT EXISTS idx_temp_created ON registros_pesaje_temporal(created_at DESC)",
      "ALTER TABLE registros_pesaje_temporal ENABLE ROW LEVEL SECURITY",
      `CREATE POLICY "allow_all_auth" ON registros_pesaje_temporal FOR ALL TO authenticated USING (true) WITH CHECK (true)`,
      `CREATE POLICY "allow_all_anon" ON registros_pesaje_temporal FOR ALL TO anon USING (true) WITH CHECK (true)`,
      "NOTIFY pgrst, 'reload schema'",
    ];

    for (const sql of ddl) {
      await client.query(sql);
    }

    client.release(); await pool.end();
    return NextResponse.json({ status: "created", message: "Tabla registros_pesaje_temporal creada con indices y RLS" });
  } catch (err: any) {
    try { await pool.end(); } catch (_) {}
    return NextResponse.json({ error: err.message, detail: err.detail || "" }, { status: 500 });
  }
}
