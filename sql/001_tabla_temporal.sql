-- ============================================================
-- MIGRACION: Tabla temporal para registros de campo
-- Ejecutar en Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS registros_pesaje_temporal (
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
);

CREATE INDEX IF NOT EXISTS idx_temp_estado ON registros_pesaje_temporal(estado);
CREATE INDEX IF NOT EXISTS idx_temp_created ON registros_pesaje_temporal(created_at DESC);

ALTER TABLE registros_pesaje_temporal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_select_temp" ON registros_pesaje_temporal FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_temp" ON registros_pesaje_temporal FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_temp" ON registros_pesaje_temporal FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete_temp" ON registros_pesaje_temporal FOR DELETE TO authenticated USING (true);
CREATE POLICY "anon_select_temp" ON registros_pesaje_temporal FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_temp" ON registros_pesaje_temporal FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_temp" ON registros_pesaje_temporal FOR UPDATE TO anon USING (true);
CREATE POLICY "anon_delete_temp" ON registros_pesaje_temporal FOR DELETE TO anon USING (true);
