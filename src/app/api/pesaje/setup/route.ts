import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("key");
  if (secret !== "innovaq2026") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const dbPassword = process.env.SUPABASE_DB_PASSWORD || "";
  const ref = "uinoropxppiuqgzktqjr";
  const ep = encodeURIComponent(dbPassword);

  const attempts = [
    process.env.SUPABASE_DB_URL,
    `postgresql://postgres.${ref}:${ep}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${ref}:${ep}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
    `postgresql://postgres:${ep}@db.${ref}.supabase.co:5432/postgres`,
    `postgresql://postgres.${ref}:${ep}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`,
  ].filter(Boolean) as string[];

  const errors: string[] = [];

  for (const cs of attempts) {
    const masked = cs.replace(/:[^/:@]+@/, ":***@");
    const pool = new Pool({
      connectionString: cs,
      ssl: { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 8000,
    });

    try {
      const client = await pool.connect();
      const check = await client.query(
        "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='registros_pesaje_temporal') as e"
      );

      if (check.rows[0].e) {
        client.release(); await pool.end();
        return NextResponse.json({ status: "ok", message: "Tabla ya existe", via: masked });
      }

      const ddl = `CREATE TABLE registros_pesaje_temporal (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        ticket TEXT NOT NULL, vehiculo_placa TEXT NOT NULL DEFAULT '',
        chofer TEXT DEFAULT '', tipo TEXT DEFAULT 'entrada',
        peso_bruto NUMERIC(10,2) DEFAULT 0, tara NUMERIC(10,2) DEFAULT 0,
        peso_neto NUMERIC(10,2) DEFAULT 0, bascula TEXT DEFAULT '',
        parcela TEXT DEFAULT '', impurezas NUMERIC(5,2) DEFAULT 0,
        observaciones TEXT DEFAULT '', estado TEXT DEFAULT 'pendiente',
        origen_registro TEXT DEFAULT 'campo', ocr_confianza NUMERIC(5,1) DEFAULT 0,
        ocr_datos_raw JSONB DEFAULT '{}', user_id UUID,
        created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
        aprobado_por TEXT, aprobado_at TIMESTAMPTZ, motivo_rechazo TEXT)`;

      await client.query(ddl);
      await client.query("CREATE INDEX IF NOT EXISTS idx_rpt_estado ON registros_pesaje_temporal(estado)");
      await client.query("CREATE INDEX IF NOT EXISTS idx_rpt_created ON registros_pesaje_temporal(created_at DESC)");
      await client.query("ALTER TABLE registros_pesaje_temporal ENABLE ROW LEVEL SECURITY");
      await client.query(`CREATE POLICY "rpt_auth" ON registros_pesaje_temporal FOR ALL TO authenticated USING (true) WITH CHECK (true)`);
      await client.query(`CREATE POLICY "rpt_anon" ON registros_pesaje_temporal FOR ALL TO anon USING (true) WITH CHECK (true)`);
      await client.query("NOTIFY pgrst, 'reload schema'");

      client.release(); await pool.end();
      return NextResponse.json({ status: "created", message: "Tabla creada OK", via: masked });
    } catch (err: any) {
      errors.push(`${masked} => ${err.message}`);
      try { await pool.end(); } catch(_) {}
    }
  }

  return NextResponse.json({ error: "No se pudo conectar", attempts: errors, hasPw: dbPassword.length > 0 }, { status: 500 });
}
