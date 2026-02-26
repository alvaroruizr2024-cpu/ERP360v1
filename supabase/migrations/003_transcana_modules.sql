-- TransCañaERP Phase: Operaciones, Pesaje, Flota, Facturación, Combustible, Costos
-- Execute in Supabase SQL Editor

-- ===========================
-- MODULO OPERACIONES DE CAMPO
-- ===========================

CREATE TABLE parcelas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  nombre text NOT NULL,
  ubicacion text,
  hectareas numeric(10,2) NOT NULL DEFAULT 0,
  variedad_cana text,
  fecha_siembra date,
  estado text DEFAULT 'activa' CHECK (estado IN ('activa', 'en_corte', 'cosechada', 'en_reposo')),
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE operaciones_campo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero serial UNIQUE,
  tipo text NOT NULL CHECK (tipo IN ('corte', 'alce', 'transporte')),
  parcela_id uuid REFERENCES parcelas,
  fecha timestamptz DEFAULT now(),
  turno text CHECK (turno IN ('diurno', 'nocturno')),
  cuadrilla text,
  hectareas_trabajadas numeric(10,2) DEFAULT 0,
  toneladas numeric(12,2) DEFAULT 0,
  vehiculo_id uuid,
  chofer text,
  origen text,
  destino text,
  observaciones text,
  estado text DEFAULT 'en_proceso' CHECK (estado IN ('programada', 'en_proceso', 'completada', 'cancelada')),
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ===========================
-- MODULO PESAJE
-- ===========================

CREATE TABLE registros_pesaje (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero serial UNIQUE,
  ticket text UNIQUE,
  vehiculo_placa text NOT NULL,
  chofer text,
  parcela_id uuid REFERENCES parcelas,
  tipo text NOT NULL CHECK (tipo IN ('entrada', 'salida')),
  peso_bruto numeric(12,2) DEFAULT 0,
  tara numeric(12,2) DEFAULT 0,
  peso_neto numeric(12,2) DEFAULT 0,
  porcentaje_impurezas numeric(5,2) DEFAULT 0,
  peso_neto_ajustado numeric(12,2) DEFAULT 0,
  bascula text,
  fecha_hora timestamptz DEFAULT now(),
  observaciones text,
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completo', 'anulado')),
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ===========================
-- MODULO FLOTA
-- ===========================

CREATE TABLE vehiculos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  placa text UNIQUE NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('camion', 'tractor', 'alzadora', 'cosechadora', 'vehiculo_liviano', 'otro')),
  marca text,
  modelo text,
  anio integer,
  capacidad_toneladas numeric(10,2),
  kilometraje numeric(12,2) DEFAULT 0,
  estado text DEFAULT 'disponible' CHECK (estado IN ('disponible', 'en_operacion', 'en_mantenimiento', 'fuera_servicio')),
  chofer_asignado text,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE mantenimientos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehiculo_id uuid REFERENCES vehiculos ON DELETE CASCADE NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('preventivo', 'correctivo', 'emergencia')),
  descripcion text NOT NULL,
  fecha date DEFAULT CURRENT_DATE,
  costo numeric(12,2) DEFAULT 0,
  kilometraje numeric(12,2),
  taller text,
  estado text DEFAULT 'programado' CHECK (estado IN ('programado', 'en_proceso', 'completado')),
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ===========================
-- MODULO COMBUSTIBLE
-- ===========================

CREATE TABLE despachos_combustible (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero serial UNIQUE,
  vehiculo_id uuid REFERENCES vehiculos,
  vehiculo_placa text NOT NULL,
  tipo_combustible text NOT NULL CHECK (tipo_combustible IN ('diesel', 'gasolina_90', 'gasolina_95', 'glp')),
  galones numeric(10,2) NOT NULL,
  precio_galon numeric(10,2) NOT NULL,
  total numeric(12,2) NOT NULL,
  kilometraje numeric(12,2),
  operador text,
  estacion text,
  fecha timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ===========================
-- MODULO COSTOS
-- ===========================

CREATE TABLE centros_costo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  nombre text NOT NULL,
  tipo text CHECK (tipo IN ('operativo', 'administrativo', 'logistico')),
  presupuesto numeric(12,2) DEFAULT 0,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE registros_costo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  centro_costo_id uuid REFERENCES centros_costo,
  parcela_id uuid REFERENCES parcelas,
  concepto text NOT NULL,
  categoria text CHECK (categoria IN ('mano_obra', 'combustible', 'mantenimiento', 'insumos', 'transporte', 'otros')),
  monto numeric(12,2) NOT NULL,
  fecha date DEFAULT CURRENT_DATE,
  referencia text,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ===========================
-- MODULO ADMIN / AUDITORIA
-- ===========================

CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text UNIQUE NOT NULL,
  descripcion text,
  permisos jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE auditoria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users,
  accion text NOT NULL,
  modulo text NOT NULL,
  detalle text,
  ip text,
  created_at timestamptz DEFAULT now()
);

-- ===========================
-- INDICES
-- ===========================

CREATE INDEX idx_parcelas_user ON parcelas(user_id);
CREATE INDEX idx_operaciones_campo_user ON operaciones_campo(user_id);
CREATE INDEX idx_operaciones_campo_tipo ON operaciones_campo(tipo);
CREATE INDEX idx_operaciones_campo_parcela ON operaciones_campo(parcela_id);
CREATE INDEX idx_pesaje_user ON registros_pesaje(user_id);
CREATE INDEX idx_pesaje_placa ON registros_pesaje(vehiculo_placa);
CREATE INDEX idx_vehiculos_user ON vehiculos(user_id);
CREATE INDEX idx_vehiculos_tipo ON vehiculos(tipo);
CREATE INDEX idx_mantenimientos_vehiculo ON mantenimientos(vehiculo_id);
CREATE INDEX idx_despachos_combustible_vehiculo ON despachos_combustible(vehiculo_id);
CREATE INDEX idx_centros_costo_user ON centros_costo(user_id);
CREATE INDEX idx_registros_costo_centro ON registros_costo(centro_costo_id);
CREATE INDEX idx_registros_costo_parcela ON registros_costo(parcela_id);
CREATE INDEX idx_auditoria_user ON auditoria(user_id);
CREATE INDEX idx_auditoria_modulo ON auditoria(modulo);

-- ===========================
-- ROW LEVEL SECURITY
-- ===========================

ALTER TABLE parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE operaciones_campo ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_pesaje ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mantenimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE despachos_combustible ENABLE ROW LEVEL SECURITY;
ALTER TABLE centros_costo ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_costo ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own parcelas" ON parcelas FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own operaciones_campo" ON operaciones_campo FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own registros_pesaje" ON registros_pesaje FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own vehiculos" ON vehiculos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own mantenimientos" ON mantenimientos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own despachos_combustible" ON despachos_combustible FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own centros_costo" ON centros_costo FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own registros_costo" ON registros_costo FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own auditoria" ON auditoria FOR SELECT USING (auth.uid() = user_id);
