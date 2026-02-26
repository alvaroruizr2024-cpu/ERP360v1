-- ============================================================
-- TransCañaERP - Sprints 8-14: Advanced Features Migration
-- Zafra, Logística, Laboratorio, Nómina, Colonos, BI, Mant.Industrial
-- ============================================================

-- ===========================
-- SPRINT 8: PLANIFICACIÓN DE ZAFRA
-- ===========================

CREATE TABLE zafras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  nombre text NOT NULL,
  fecha_inicio date NOT NULL,
  fecha_fin date,
  meta_toneladas numeric(14,2) DEFAULT 0,
  meta_hectareas numeric(10,2) DEFAULT 0,
  toneladas_procesadas numeric(14,2) DEFAULT 0,
  hectareas_cosechadas numeric(10,2) DEFAULT 0,
  rendimiento_promedio numeric(8,2) DEFAULT 0,
  estado text DEFAULT 'planificada' CHECK (estado IN ('planificada', 'activa', 'pausada', 'completada', 'cancelada')),
  notas text,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE metas_zafra (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zafra_id uuid REFERENCES zafras ON DELETE CASCADE NOT NULL,
  parcela_id uuid REFERENCES parcelas,
  semana integer NOT NULL,
  meta_toneladas numeric(12,2) DEFAULT 0,
  toneladas_real numeric(12,2) DEFAULT 0,
  meta_hectareas numeric(10,2) DEFAULT 0,
  hectareas_real numeric(10,2) DEFAULT 0,
  cumplimiento_porcentaje numeric(5,2) DEFAULT 0,
  observaciones text,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ===========================
-- SPRINT 9: LOGÍSTICA AVANZADA
-- ===========================

CREATE TABLE rutas_transporte (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  nombre text NOT NULL,
  origen text NOT NULL,
  destino text NOT NULL,
  distancia_km numeric(8,2) DEFAULT 0,
  tiempo_estimado_min integer DEFAULT 0,
  tipo text DEFAULT 'cana' CHECK (tipo IN ('cana', 'insumos', 'producto_terminado', 'personal')),
  estado text DEFAULT 'activa' CHECK (estado IN ('activa', 'inactiva', 'en_revision')),
  puntos_gps jsonb DEFAULT '[]'::jsonb,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE viajes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero serial UNIQUE,
  ruta_id uuid REFERENCES rutas_transporte,
  vehiculo_id uuid REFERENCES vehiculos,
  chofer text,
  fecha_salida timestamptz DEFAULT now(),
  fecha_llegada timestamptz,
  toneladas_transportadas numeric(12,2) DEFAULT 0,
  kilometraje_inicio numeric(12,2) DEFAULT 0,
  kilometraje_fin numeric(12,2) DEFAULT 0,
  combustible_consumido numeric(8,2) DEFAULT 0,
  parcela_origen_id uuid REFERENCES parcelas,
  destino_ingenio text,
  ticket_pesaje text,
  costo_flete numeric(12,2) DEFAULT 0,
  estado text DEFAULT 'programado' CHECK (estado IN ('programado', 'en_transito', 'entregado', 'cancelado')),
  incidencias text,
  gps_tracking jsonb DEFAULT '[]'::jsonb,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ===========================
-- SPRINT 10: LABORATORIO Y CALIDAD
-- ===========================

CREATE TABLE muestras_laboratorio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero serial UNIQUE,
  codigo_muestra text UNIQUE NOT NULL,
  tipo_muestra text NOT NULL CHECK (tipo_muestra IN ('cana', 'jugo', 'melaza', 'azucar', 'bagazo', 'agua')),
  parcela_id uuid REFERENCES parcelas,
  ticket_pesaje text,
  fecha_muestreo timestamptz DEFAULT now(),
  punto_muestreo text,
  responsable text,
  temperatura numeric(5,2),
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_analisis', 'completado', 'rechazado')),
  observaciones text,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE analisis_calidad (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  muestra_id uuid REFERENCES muestras_laboratorio ON DELETE CASCADE NOT NULL,
  brix numeric(6,2) DEFAULT 0,
  pol numeric(6,2) DEFAULT 0,
  pureza numeric(6,2) DEFAULT 0,
  fibra numeric(6,2) DEFAULT 0,
  humedad numeric(6,2) DEFAULT 0,
  cenizas numeric(6,2) DEFAULT 0,
  ph numeric(4,2),
  color_icumsa numeric(8,2),
  sacarosa numeric(6,2) DEFAULT 0,
  azucares_reductores numeric(6,2) DEFAULT 0,
  rendimiento_estimado numeric(6,2) DEFAULT 0,
  calificacion text DEFAULT 'A' CHECK (calificacion IN ('A', 'B', 'C', 'D', 'rechazado')),
  analista text,
  equipo_utilizado text,
  fecha_analisis timestamptz DEFAULT now(),
  notas text,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ===========================
-- SPRINT 11: NÓMINA Y LIQUIDACIÓN
-- ===========================

CREATE TABLE periodos_nomina (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  nombre text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('quincenal', 'mensual', 'semanal', 'liquidacion')),
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  fecha_pago date,
  total_bruto numeric(14,2) DEFAULT 0,
  total_deducciones numeric(14,2) DEFAULT 0,
  total_neto numeric(14,2) DEFAULT 0,
  estado text DEFAULT 'borrador' CHECK (estado IN ('borrador', 'calculado', 'aprobado', 'pagado', 'anulado')),
  aprobado_por text,
  notas text,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE nomina_detalle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo_id uuid REFERENCES periodos_nomina ON DELETE CASCADE NOT NULL,
  empleado_id uuid REFERENCES empleados ON DELETE CASCADE NOT NULL,
  salario_base numeric(12,2) DEFAULT 0,
  horas_extra numeric(6,2) DEFAULT 0,
  monto_horas_extra numeric(12,2) DEFAULT 0,
  bonificaciones numeric(12,2) DEFAULT 0,
  comisiones numeric(12,2) DEFAULT 0,
  total_ingresos numeric(12,2) DEFAULT 0,
  deduccion_igss numeric(12,2) DEFAULT 0,
  deduccion_isr numeric(12,2) DEFAULT 0,
  otras_deducciones numeric(12,2) DEFAULT 0,
  anticipos numeric(12,2) DEFAULT 0,
  total_deducciones numeric(12,2) DEFAULT 0,
  salario_neto numeric(12,2) DEFAULT 0,
  dias_trabajados integer DEFAULT 0,
  faltas integer DEFAULT 0,
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'calculado', 'aprobado', 'pagado')),
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ===========================
-- SPRINT 12: PORTAL DE COLONOS
-- ===========================

CREATE TABLE colonos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  nombre text NOT NULL,
  dpi text,
  nit text,
  telefono text,
  email text,
  direccion text,
  parcelas_asignadas jsonb DEFAULT '[]'::jsonb,
  tipo_contrato text DEFAULT 'individual' CHECK (tipo_contrato IN ('individual', 'cooperativa', 'asociacion', 'arrendamiento')),
  precio_tonelada numeric(10,2) DEFAULT 0,
  cuenta_bancaria text,
  banco text,
  estado text DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'suspendido')),
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE entregas_colono (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero serial UNIQUE,
  colono_id uuid REFERENCES colonos ON DELETE CASCADE NOT NULL,
  parcela_id uuid REFERENCES parcelas,
  zafra_id uuid REFERENCES zafras,
  fecha_entrega date DEFAULT CURRENT_DATE,
  toneladas_brutas numeric(12,2) DEFAULT 0,
  porcentaje_impurezas numeric(5,2) DEFAULT 0,
  toneladas_netas numeric(12,2) DEFAULT 0,
  precio_tonelada numeric(10,2) DEFAULT 0,
  monto_bruto numeric(14,2) DEFAULT 0,
  deducciones numeric(12,2) DEFAULT 0,
  concepto_deducciones text,
  monto_neto numeric(14,2) DEFAULT 0,
  ticket_pesaje text,
  calificacion_calidad text DEFAULT 'A' CHECK (calificacion_calidad IN ('A', 'B', 'C', 'D')),
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'verificado', 'liquidado', 'pagado', 'rechazado')),
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ===========================
-- SPRINT 13: BI - TABLAS DE SOPORTE
-- ===========================

CREATE TABLE kpi_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  modulo text NOT NULL,
  indicador text NOT NULL,
  valor numeric(14,2) NOT NULL,
  valor_anterior numeric(14,2),
  variacion_porcentaje numeric(6,2),
  meta numeric(14,2),
  unidad text,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE alertas_sistema (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL CHECK (tipo IN ('critica', 'advertencia', 'info', 'exito')),
  modulo text NOT NULL,
  titulo text NOT NULL,
  mensaje text NOT NULL,
  datos jsonb DEFAULT '{}'::jsonb,
  leida boolean DEFAULT false,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ===========================
-- SPRINT 14: MANTENIMIENTO INDUSTRIAL
-- ===========================

CREATE TABLE equipos_industriales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  nombre text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('molino', 'caldera', 'centrifuga', 'evaporador', 'cristalizador', 'filtro', 'bomba', 'motor', 'transportador', 'otro')),
  area text CHECK (area IN ('patio', 'molinos', 'calderas', 'clarificacion', 'evaporacion', 'cristalizacion', 'centrifugado', 'secado', 'empaque', 'laboratorio')),
  marca text,
  modelo text,
  numero_serie text,
  fecha_instalacion date,
  potencia text,
  capacidad text,
  horas_operacion numeric(10,2) DEFAULT 0,
  estado text DEFAULT 'operativo' CHECK (estado IN ('operativo', 'en_mantenimiento', 'fuera_servicio', 'en_reserva', 'dado_baja')),
  criticidad text DEFAULT 'media' CHECK (criticidad IN ('critica', 'alta', 'media', 'baja')),
  ultimo_mantenimiento date,
  proximo_mantenimiento date,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE ordenes_trabajo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero serial UNIQUE,
  equipo_id uuid REFERENCES equipos_industriales ON DELETE CASCADE NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('preventivo', 'correctivo', 'predictivo', 'emergencia', 'mejora')),
  prioridad text DEFAULT 'media' CHECK (prioridad IN ('critica', 'alta', 'media', 'baja')),
  titulo text NOT NULL,
  descripcion text,
  solicitante text,
  tecnico_asignado text,
  fecha_solicitud timestamptz DEFAULT now(),
  fecha_programada date,
  fecha_inicio timestamptz,
  fecha_fin timestamptz,
  horas_trabajo numeric(6,2) DEFAULT 0,
  costo_mano_obra numeric(12,2) DEFAULT 0,
  costo_repuestos numeric(12,2) DEFAULT 0,
  costo_total numeric(12,2) DEFAULT 0,
  causa_raiz text,
  solucion text,
  estado text DEFAULT 'abierta' CHECK (estado IN ('abierta', 'asignada', 'en_progreso', 'en_espera', 'completada', 'cerrada', 'cancelada')),
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE repuestos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  categoria text CHECK (categoria IN ('mecanico', 'electrico', 'hidraulico', 'neumatico', 'instrumentacion', 'general')),
  unidad_medida text DEFAULT 'unidad',
  stock_actual numeric(10,2) DEFAULT 0,
  stock_minimo numeric(10,2) DEFAULT 0,
  precio_unitario numeric(12,2) DEFAULT 0,
  proveedor text,
  ubicacion_almacen text,
  equipo_compatible jsonb DEFAULT '[]'::jsonb,
  estado text DEFAULT 'disponible' CHECK (estado IN ('disponible', 'agotado', 'descontinuado')),
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE consumo_repuestos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_trabajo_id uuid REFERENCES ordenes_trabajo ON DELETE CASCADE NOT NULL,
  repuesto_id uuid REFERENCES repuestos NOT NULL,
  cantidad numeric(10,2) NOT NULL,
  precio_unitario numeric(12,2) NOT NULL,
  total numeric(12,2) NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ===========================
-- INDICES - SPRINTS 8-14
-- ===========================

-- Sprint 8
CREATE INDEX idx_zafras_user ON zafras(user_id);
CREATE INDEX idx_zafras_estado ON zafras(estado);
CREATE INDEX idx_metas_zafra_zafra ON metas_zafra(zafra_id);
CREATE INDEX idx_metas_zafra_parcela ON metas_zafra(parcela_id);

-- Sprint 9
CREATE INDEX idx_rutas_transporte_user ON rutas_transporte(user_id);
CREATE INDEX idx_viajes_user ON viajes(user_id);
CREATE INDEX idx_viajes_ruta ON viajes(ruta_id);
CREATE INDEX idx_viajes_vehiculo ON viajes(vehiculo_id);
CREATE INDEX idx_viajes_estado ON viajes(estado);

-- Sprint 10
CREATE INDEX idx_muestras_lab_user ON muestras_laboratorio(user_id);
CREATE INDEX idx_muestras_lab_parcela ON muestras_laboratorio(parcela_id);
CREATE INDEX idx_muestras_lab_tipo ON muestras_laboratorio(tipo_muestra);
CREATE INDEX idx_analisis_calidad_muestra ON analisis_calidad(muestra_id);

-- Sprint 11
CREATE INDEX idx_periodos_nomina_user ON periodos_nomina(user_id);
CREATE INDEX idx_periodos_nomina_estado ON periodos_nomina(estado);
CREATE INDEX idx_nomina_detalle_periodo ON nomina_detalle(periodo_id);
CREATE INDEX idx_nomina_detalle_empleado ON nomina_detalle(empleado_id);

-- Sprint 12
CREATE INDEX idx_colonos_user ON colonos(user_id);
CREATE INDEX idx_colonos_estado ON colonos(estado);
CREATE INDEX idx_entregas_colono_colono ON entregas_colono(colono_id);
CREATE INDEX idx_entregas_colono_zafra ON entregas_colono(zafra_id);
CREATE INDEX idx_entregas_colono_parcela ON entregas_colono(parcela_id);

-- Sprint 13
CREATE INDEX idx_kpi_snapshots_fecha ON kpi_snapshots(fecha);
CREATE INDEX idx_kpi_snapshots_modulo ON kpi_snapshots(modulo);
CREATE INDEX idx_alertas_sistema_user ON alertas_sistema(user_id);
CREATE INDEX idx_alertas_sistema_tipo ON alertas_sistema(tipo);

-- Sprint 14
CREATE INDEX idx_equipos_ind_user ON equipos_industriales(user_id);
CREATE INDEX idx_equipos_ind_tipo ON equipos_industriales(tipo);
CREATE INDEX idx_equipos_ind_area ON equipos_industriales(area);
CREATE INDEX idx_ordenes_trabajo_equipo ON ordenes_trabajo(equipo_id);
CREATE INDEX idx_ordenes_trabajo_estado ON ordenes_trabajo(estado);
CREATE INDEX idx_repuestos_user ON repuestos(user_id);
CREATE INDEX idx_repuestos_categoria ON repuestos(categoria);
CREATE INDEX idx_consumo_repuestos_ot ON consumo_repuestos(orden_trabajo_id);
CREATE INDEX idx_consumo_repuestos_rep ON consumo_repuestos(repuesto_id);

-- ===========================
-- ROW LEVEL SECURITY - SPRINTS 8-14
-- ===========================

ALTER TABLE zafras ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas_zafra ENABLE ROW LEVEL SECURITY;
ALTER TABLE rutas_transporte ENABLE ROW LEVEL SECURITY;
ALTER TABLE viajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE muestras_laboratorio ENABLE ROW LEVEL SECURITY;
ALTER TABLE analisis_calidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE periodos_nomina ENABLE ROW LEVEL SECURITY;
ALTER TABLE nomina_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE colonos ENABLE ROW LEVEL SECURITY;
ALTER TABLE entregas_colono ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipos_industriales ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_trabajo ENABLE ROW LEVEL SECURITY;
ALTER TABLE repuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumo_repuestos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own zafras" ON zafras FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own metas_zafra" ON metas_zafra FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own rutas_transporte" ON rutas_transporte FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own viajes" ON viajes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own muestras_laboratorio" ON muestras_laboratorio FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own analisis_calidad" ON analisis_calidad FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own periodos_nomina" ON periodos_nomina FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own nomina_detalle" ON nomina_detalle FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own colonos" ON colonos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own entregas_colono" ON entregas_colono FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own kpi_snapshots" ON kpi_snapshots FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own alertas_sistema" ON alertas_sistema FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own equipos_industriales" ON equipos_industriales FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own ordenes_trabajo" ON ordenes_trabajo FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own repuestos" ON repuestos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own consumo_repuestos" ON consumo_repuestos FOR ALL USING (auth.uid() = user_id);
