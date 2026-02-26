-- ERP360 Phase 3 Schema: Compras, Contabilidad, RRHH, CRM
-- Execute this in Supabase SQL Editor

-- ===========================
-- MODULO COMPRAS
-- ===========================

CREATE TABLE proveedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  contacto text,
  email text,
  telefono text,
  direccion text,
  rfc text,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE ordenes_compra (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero serial UNIQUE,
  proveedor_id uuid REFERENCES proveedores,
  fecha timestamptz DEFAULT now(),
  subtotal numeric(12,2) DEFAULT 0,
  impuesto numeric(12,2) DEFAULT 0,
  total numeric(12,2) DEFAULT 0,
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'recibida', 'cancelada')),
  notas text,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE orden_compra_detalle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id uuid REFERENCES ordenes_compra ON DELETE CASCADE NOT NULL,
  producto_id uuid REFERENCES productos NOT NULL,
  cantidad integer NOT NULL,
  precio_unitario numeric(12,2) NOT NULL,
  subtotal numeric(12,2) NOT NULL
);

-- ===========================
-- MODULO CONTABILIDAD
-- ===========================

CREATE TABLE cuentas_contables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  nombre text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('activo', 'pasivo', 'capital', 'ingreso', 'gasto')),
  saldo numeric(12,2) DEFAULT 0,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE asientos_contables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero serial UNIQUE,
  fecha timestamptz DEFAULT now(),
  descripcion text NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE asiento_detalle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asiento_id uuid REFERENCES asientos_contables ON DELETE CASCADE NOT NULL,
  cuenta_id uuid REFERENCES cuentas_contables NOT NULL,
  debe numeric(12,2) DEFAULT 0,
  haber numeric(12,2) DEFAULT 0
);

-- ===========================
-- MODULO RRHH
-- ===========================

CREATE TABLE departamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE empleados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  email text,
  telefono text,
  cargo text,
  departamento_id uuid REFERENCES departamentos,
  fecha_ingreso date DEFAULT CURRENT_DATE,
  salario numeric(12,2),
  estado text DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ===========================
-- MODULO CRM
-- ===========================

CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  empresa text,
  email text,
  telefono text,
  origen text,
  etapa text DEFAULT 'nuevo' CHECK (etapa IN ('nuevo', 'contactado', 'propuesta', 'negociacion', 'ganado', 'perdido')),
  valor_estimado numeric(12,2) DEFAULT 0,
  notas text,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ===========================
-- INDICES
-- ===========================

CREATE INDEX idx_proveedores_user_id ON proveedores(user_id);
CREATE INDEX idx_ordenes_compra_user_id ON ordenes_compra(user_id);
CREATE INDEX idx_ordenes_compra_proveedor ON ordenes_compra(proveedor_id);
CREATE INDEX idx_orden_compra_detalle_orden ON orden_compra_detalle(orden_id);
CREATE INDEX idx_cuentas_contables_user_id ON cuentas_contables(user_id);
CREATE INDEX idx_asientos_contables_user_id ON asientos_contables(user_id);
CREATE INDEX idx_asiento_detalle_asiento ON asiento_detalle(asiento_id);
CREATE INDEX idx_departamentos_user_id ON departamentos(user_id);
CREATE INDEX idx_empleados_user_id ON empleados(user_id);
CREATE INDEX idx_empleados_departamento ON empleados(departamento_id);
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_etapa ON leads(etapa);

-- ===========================
-- ROW LEVEL SECURITY
-- ===========================

ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE orden_compra_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuentas_contables ENABLE ROW LEVEL SECURITY;
ALTER TABLE asientos_contables ENABLE ROW LEVEL SECURITY;
ALTER TABLE asiento_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own proveedores" ON proveedores FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own ordenes_compra" ON ordenes_compra FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage orden_compra_detalle" ON orden_compra_detalle FOR ALL
  USING (orden_id IN (SELECT id FROM ordenes_compra WHERE user_id = auth.uid()));
CREATE POLICY "Users manage own cuentas_contables" ON cuentas_contables FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own asientos_contables" ON asientos_contables FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage asiento_detalle" ON asiento_detalle FOR ALL
  USING (asiento_id IN (SELECT id FROM asientos_contables WHERE user_id = auth.uid()));
CREATE POLICY "Users manage own departamentos" ON departamentos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own empleados" ON empleados FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own leads" ON leads FOR ALL USING (auth.uid() = user_id);

-- Trigger updated_at para leads
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
