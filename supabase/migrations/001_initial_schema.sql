-- ERP360 Initial Schema
-- Execute this in Supabase SQL Editor or via CLI

-- Tabla de productos (inventario)
CREATE TABLE productos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  sku text UNIQUE NOT NULL,
  descripcion text,
  precio numeric(12,2) NOT NULL,
  costo numeric(12,2) DEFAULT 0,
  stock integer DEFAULT 0,
  stock_minimo integer DEFAULT 0,
  categoria text,
  estado text DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de clientes
CREATE TABLE clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  email text,
  telefono text,
  direccion text,
  rfc text,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabla de facturas (ventas)
CREATE TABLE facturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero serial UNIQUE,
  cliente_id uuid REFERENCES clientes,
  fecha timestamptz DEFAULT now(),
  subtotal numeric(12,2) DEFAULT 0,
  impuesto numeric(12,2) DEFAULT 0,
  total numeric(12,2) DEFAULT 0,
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagada', 'cancelada')),
  notas text,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabla de detalle de factura (lineas)
CREATE TABLE factura_detalle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  factura_id uuid REFERENCES facturas ON DELETE CASCADE NOT NULL,
  producto_id uuid REFERENCES productos NOT NULL,
  cantidad integer NOT NULL,
  precio_unitario numeric(12,2) NOT NULL,
  subtotal numeric(12,2) NOT NULL
);

-- Indices
CREATE INDEX idx_productos_user_id ON productos(user_id);
CREATE INDEX idx_productos_sku ON productos(sku);
CREATE INDEX idx_clientes_user_id ON clientes(user_id);
CREATE INDEX idx_facturas_user_id ON facturas(user_id);
CREATE INDEX idx_facturas_cliente_id ON facturas(cliente_id);
CREATE INDEX idx_factura_detalle_factura_id ON factura_detalle(factura_id);

-- Row Level Security
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_detalle ENABLE ROW LEVEL SECURITY;

-- Politicas RLS: usuarios solo ven sus propios datos
CREATE POLICY "Users can manage their own productos"
  ON productos FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own clientes"
  ON clientes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own facturas"
  ON facturas FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage factura_detalle via facturas"
  ON factura_detalle FOR ALL
  USING (factura_id IN (SELECT id FROM facturas WHERE user_id = auth.uid()));

-- Trigger para updated_at en productos
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER productos_updated_at
  BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
