-- ============================================================================
-- TRANSCAÑA ERP - GRUPO GALARRETA
-- Sprint 15: Mantenimiento Preventivo de Flota (TPM) + PWA Conductor
-- Migration: 001_sprint15_tpm_flota_pwa.sql
-- Fecha: 2026-03-08
-- Supabase Project: uinoropxppiuqgzktqjr
-- ============================================================================

-- ============================================================================
-- 1. ENUMS
-- ============================================================================

CREATE TYPE tipo_mantenimiento AS ENUM (
  'preventivo', 'correctivo', 'predictivo', 'emergencia'
);

CREATE TYPE estado_orden_trabajo AS ENUM (
  'programada', 'en_espera_repuestos', 'en_ejecucion', 'pausada',
  'completada', 'cancelada', 'reprogramada'
);

CREATE TYPE prioridad_ot AS ENUM (
  'critica', 'alta', 'media', 'baja'
);

CREATE TYPE estado_componente AS ENUM (
  'operativo', 'desgastado', 'critico', 'fuera_servicio', 'reemplazado'
);

CREATE TYPE tipo_componente_flota AS ENUM (
  'llanta', 'motor', 'transmision', 'frenos', 'suspension',
  'sistema_electrico', 'sistema_hidraulico', 'carroceria',
  'sistema_combustible', 'refrigeracion', 'otro'
);

CREATE TYPE posicion_llanta AS ENUM (
  'DI', 'DD', 'TII', 'TID', 'TDI', 'TDD',  -- Tractocamión
  'R1I', 'R1D', 'R2I', 'R2D', 'R3I', 'R3D', -- Remolques
  'R4I', 'R4D', 'R5I', 'R5D', 'R6I', 'R6D',
  'repuesto'
);

CREATE TYPE estado_llanta AS ENUM (
  'nueva', 'en_uso', 'reencauche_1', 'reencauche_2', 'reencauche_3',
  'baja', 'en_reparacion', 'en_almacen'
);

CREATE TYPE tipo_combustible AS ENUM (
  'diesel_b5', 'diesel_b20', 'biodiesel', 'gnv', 'glp'
);

CREATE TYPE estado_checklist AS ENUM (
  'pendiente', 'aprobado', 'rechazado', 'con_observaciones'
);

CREATE TYPE tipo_notificacion_conductor AS ENUM (
  'orden_trabajo', 'checklist_pendiente', 'mantenimiento_programado',
  'alerta_componente', 'ruta_asignada', 'mensaje_supervisor',
  'documento_vencido', 'capacitacion'
);

CREATE TYPE estado_documento_conductor AS ENUM (
  'vigente', 'por_vencer', 'vencido', 'en_tramite'
);

-- ============================================================================
-- 2. TABLAS PRINCIPALES - TPM FLOTA
-- ============================================================================

-- 2.1 Planes de mantenimiento maestro
CREATE TABLE IF NOT EXISTS planes_mantenimiento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  codigo VARCHAR(20) NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  tipo tipo_mantenimiento NOT NULL DEFAULT 'preventivo',
  tipo_vehiculo VARCHAR(50), -- 'tractocamion', 'jaula_canera', 'volquete', etc.
  frecuencia_km INTEGER, -- Cada X kilómetros
  frecuencia_horas INTEGER, -- Cada X horas motor
  frecuencia_dias INTEGER, -- Cada X días calendario
  tolerancia_km INTEGER DEFAULT 500,
  tolerancia_horas INTEGER DEFAULT 50,
  tolerancia_dias INTEGER DEFAULT 7,
  costo_estimado DECIMAL(12,2) DEFAULT 0,
  tiempo_estimado_horas DECIMAL(5,2) DEFAULT 1,
  requiere_parada BOOLEAN DEFAULT TRUE,
  checklist_template JSONB DEFAULT '[]'::jsonb,
  repuestos_requeridos JSONB DEFAULT '[]'::jsonb,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, codigo)
);

-- 2.2 Componentes de vehículos (inventario de partes)
CREATE TABLE IF NOT EXISTS componentes_vehiculo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  vehiculo_id UUID NOT NULL REFERENCES vehiculos(id),
  tipo tipo_componente_flota NOT NULL,
  codigo_parte VARCHAR(50),
  marca VARCHAR(100),
  modelo VARCHAR(100),
  numero_serie VARCHAR(100),
  estado estado_componente DEFAULT 'operativo',
  fecha_instalacion DATE,
  fecha_ultimo_servicio DATE,
  km_instalacion INTEGER DEFAULT 0,
  horas_instalacion INTEGER DEFAULT 0,
  vida_util_km INTEGER,
  vida_util_horas INTEGER,
  km_actual INTEGER DEFAULT 0,
  horas_actual INTEGER DEFAULT 0,
  porcentaje_desgaste DECIMAL(5,2) DEFAULT 0,
  costo_adquisicion DECIMAL(12,2) DEFAULT 0,
  proveedor VARCHAR(150),
  garantia_hasta DATE,
  notas TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 Control de llantas (especializado)
CREATE TABLE IF NOT EXISTS control_llantas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  componente_id UUID NOT NULL REFERENCES componentes_vehiculo(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  vehiculo_id UUID NOT NULL REFERENCES vehiculos(id),
  dot VARCHAR(20), -- Código DOT de la llanta
  marca_llanta VARCHAR(50) NOT NULL,
  medida VARCHAR(20) NOT NULL, -- ej: '295/80R22.5'
  tipo_banda VARCHAR(50), -- 'tracción', 'dirección', 'mixta'
  posicion posicion_llanta,
  estado estado_llanta DEFAULT 'nueva',
  profundidad_cocada_mm DECIMAL(4,1), -- Profundidad actual
  profundidad_original_mm DECIMAL(4,1) DEFAULT 16.0,
  profundidad_minima_mm DECIMAL(4,1) DEFAULT 3.0,
  presion_recomendada_psi DECIMAL(5,1) DEFAULT 120,
  presion_actual_psi DECIMAL(5,1),
  temperatura_actual_c DECIMAL(5,1),
  numero_reencauches INTEGER DEFAULT 0,
  max_reencauches INTEGER DEFAULT 3,
  km_acumulados INTEGER DEFAULT 0,
  costo_original DECIMAL(10,2) DEFAULT 0,
  costo_reencauches_acum DECIMAL(10,2) DEFAULT 0,
  costo_por_km DECIMAL(8,4) GENERATED ALWAYS AS (
    CASE WHEN km_acumulados > 0
      THEN (costo_original + costo_reencauches_acum) / km_acumulados
      ELSE 0
    END
  ) STORED,
  fecha_ultima_inspeccion DATE,
  proximo_reencauche_km INTEGER,
  historial_rotaciones JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 Órdenes de trabajo de mantenimiento
CREATE TABLE IF NOT EXISTS ordenes_trabajo_mto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  numero_ot VARCHAR(20) NOT NULL,
  vehiculo_id UUID NOT NULL REFERENCES vehiculos(id),
  plan_id UUID REFERENCES planes_mantenimiento(id),
  tipo tipo_mantenimiento NOT NULL,
  prioridad prioridad_ot DEFAULT 'media',
  estado estado_orden_trabajo DEFAULT 'programada',
  descripcion TEXT NOT NULL,
  diagnostico TEXT,
  solucion_aplicada TEXT,
  fecha_programada DATE NOT NULL,
  fecha_inicio TIMESTAMPTZ,
  fecha_fin TIMESTAMPTZ,
  km_vehiculo INTEGER,
  horas_motor INTEGER,
  tecnico_responsable UUID REFERENCES empleados(id),
  supervisor_id UUID REFERENCES empleados(id),
  taller_externo VARCHAR(150),
  es_taller_externo BOOLEAN DEFAULT FALSE,
  componentes_afectados UUID[] DEFAULT '{}',
  repuestos_utilizados JSONB DEFAULT '[]'::jsonb,
  mano_obra_horas DECIMAL(6,2) DEFAULT 0,
  costo_repuestos DECIMAL(12,2) DEFAULT 0,
  costo_mano_obra DECIMAL(12,2) DEFAULT 0,
  costo_taller_externo DECIMAL(12,2) DEFAULT 0,
  costo_total DECIMAL(12,2) GENERATED ALWAYS AS (
    costo_repuestos + costo_mano_obra + costo_taller_externo
  ) STORED,
  checklist_completado JSONB DEFAULT '[]'::jsonb,
  fotos_antes TEXT[] DEFAULT '{}',
  fotos_despues TEXT[] DEFAULT '{}',
  observaciones TEXT,
  aprobado_por UUID REFERENCES auth.users(id),
  fecha_aprobacion TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, numero_ot)
);

-- 2.5 Control de combustible
CREATE TABLE IF NOT EXISTS cargas_combustible (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  vehiculo_id UUID NOT NULL REFERENCES vehiculos(id),
  conductor_id UUID REFERENCES conductores(id),
  fecha_carga TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tipo_combustible tipo_combustible DEFAULT 'diesel_b5',
  estacion_servicio VARCHAR(150),
  km_odometro INTEGER NOT NULL,
  galones DECIMAL(8,2) NOT NULL,
  precio_galon DECIMAL(8,2) NOT NULL,
  monto_total DECIMAL(12,2) GENERATED ALWAYS AS (galones * precio_galon) STORED,
  km_recorridos INTEGER, -- Desde última carga
  rendimiento_km_galon DECIMAL(8,2), -- Calculado
  comprobante_numero VARCHAR(30),
  comprobante_tipo VARCHAR(20) DEFAULT 'factura',
  foto_odometro TEXT,
  foto_comprobante TEXT,
  latitud DECIMAL(10,7),
  longitud DECIMAL(10,7),
  validado BOOLEAN DEFAULT FALSE,
  validado_por UUID REFERENCES auth.users(id),
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 Historial de inspecciones de llanta
CREATE TABLE IF NOT EXISTS inspecciones_llanta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  llanta_id UUID NOT NULL REFERENCES control_llantas(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  vehiculo_id UUID NOT NULL REFERENCES vehiculos(id),
  inspector_id UUID REFERENCES auth.users(id),
  fecha_inspeccion TIMESTAMPTZ DEFAULT NOW(),
  profundidad_cocada_mm DECIMAL(4,1),
  presion_psi DECIMAL(5,1),
  temperatura_c DECIMAL(5,1),
  desgaste_irregular BOOLEAN DEFAULT FALSE,
  tipo_desgaste VARCHAR(50), -- 'centro', 'bordes', 'diagonal', 'plano'
  danos_visibles TEXT,
  requiere_rotacion BOOLEAN DEFAULT FALSE,
  requiere_reencauche BOOLEAN DEFAULT FALSE,
  requiere_baja BOOLEAN DEFAULT FALSE,
  fotos TEXT[] DEFAULT '{}',
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. TABLAS PWA CONDUCTOR MEJORADA
-- ============================================================================

-- 3.1 Checklist pre-operativo del conductor
CREATE TABLE IF NOT EXISTS checklist_preoperativo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  vehiculo_id UUID NOT NULL REFERENCES vehiculos(id),
  conductor_id UUID NOT NULL REFERENCES conductores(id),
  fecha TIMESTAMPTZ DEFAULT NOW(),
  turno VARCHAR(20), -- 'mañana', 'tarde', 'noche'
  km_odometro INTEGER,
  estado estado_checklist DEFAULT 'pendiente',
  -- Items del checklist (JSONB flexible)
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  /*
    Estructura items: [
      { "categoria": "Motor", "item": "Nivel de aceite", "ok": true, "observacion": "" },
      { "categoria": "Motor", "item": "Nivel de refrigerante", "ok": false, "observacion": "Bajo", "foto": "url" },
      { "categoria": "Llantas", "item": "Presión visual", "ok": true },
      { "categoria": "Luces", "item": "Faros delanteros", "ok": true },
      ...
    ]
  */
  items_ok INTEGER DEFAULT 0,
  items_total INTEGER DEFAULT 0,
  items_fallidos INTEGER DEFAULT 0,
  porcentaje_cumplimiento DECIMAL(5,2) DEFAULT 0,
  firma_conductor TEXT, -- base64 de firma digital
  foto_vehiculo TEXT,
  observaciones_generales TEXT,
  revisado_por UUID REFERENCES auth.users(id),
  fecha_revision TIMESTAMPTZ,
  observaciones_supervisor TEXT,
  latitud DECIMAL(10,7),
  longitud DECIMAL(10,7),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 Documentos del conductor (licencia, SOAT, certificaciones)
CREATE TABLE IF NOT EXISTS documentos_conductor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  conductor_id UUID NOT NULL REFERENCES conductores(id),
  tipo_documento VARCHAR(50) NOT NULL, -- 'licencia', 'soat', 'certificado_salud', etc.
  numero_documento VARCHAR(50),
  fecha_emision DATE,
  fecha_vencimiento DATE,
  estado estado_documento_conductor DEFAULT 'vigente',
  archivo_url TEXT,
  entidad_emisora VARCHAR(150),
  categoria VARCHAR(20), -- Para licencia: 'AIIB', 'AIIIB', etc.
  alertas_enviadas INTEGER DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 Notificaciones push para conductores
CREATE TABLE IF NOT EXISTS notificaciones_conductor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  conductor_id UUID NOT NULL REFERENCES conductores(id),
  tipo tipo_notificacion_conductor NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  mensaje TEXT NOT NULL,
  datos_extra JSONB DEFAULT '{}'::jsonb,
  leida BOOLEAN DEFAULT FALSE,
  fecha_lectura TIMESTAMPTZ,
  prioridad prioridad_ot DEFAULT 'media',
  accion_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4 Registro de jornada del conductor
CREATE TABLE IF NOT EXISTS jornada_conductor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  conductor_id UUID NOT NULL REFERENCES conductores(id),
  vehiculo_id UUID REFERENCES vehiculos(id),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  hora_inicio TIMESTAMPTZ,
  hora_fin TIMESTAMPTZ,
  km_inicio INTEGER,
  km_fin INTEGER,
  km_recorridos INTEGER GENERATED ALWAYS AS (
    CASE WHEN km_fin IS NOT NULL AND km_inicio IS NOT NULL
      THEN km_fin - km_inicio
      ELSE NULL
    END
  ) STORED,
  viajes_completados INTEGER DEFAULT 0,
  toneladas_transportadas DECIMAL(10,2) DEFAULT 0,
  horas_efectivas DECIMAL(5,2),
  horas_espera DECIMAL(5,2) DEFAULT 0,
  incidentes INTEGER DEFAULT 0,
  checklist_id UUID REFERENCES checklist_preoperativo(id),
  calificacion_jornada DECIMAL(3,1), -- 1-5
  observaciones TEXT,
  latitud_inicio DECIMAL(10,7),
  longitud_inicio DECIMAL(10,7),
  latitud_fin DECIMAL(10,7),
  longitud_fin DECIMAL(10,7),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, conductor_id, fecha)
);

-- 3.5 Alertas predictivas de mantenimiento
CREATE TABLE IF NOT EXISTS alertas_mantenimiento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  vehiculo_id UUID NOT NULL REFERENCES vehiculos(id),
  componente_id UUID REFERENCES componentes_vehiculo(id),
  plan_id UUID REFERENCES planes_mantenimiento(id),
  tipo_alerta VARCHAR(50) NOT NULL, -- 'km_proximo', 'horas_proximo', 'fecha_proxima', 'desgaste_critico', 'anomalia'
  severidad prioridad_ot DEFAULT 'media',
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  valor_actual DECIMAL(12,2),
  valor_limite DECIMAL(12,2),
  porcentaje_alcanzado DECIMAL(5,2),
  resuelta BOOLEAN DEFAULT FALSE,
  resuelta_por UUID REFERENCES auth.users(id),
  fecha_resolucion TIMESTAMPTZ,
  ot_generada UUID REFERENCES ordenes_trabajo_mto(id),
  auto_generada BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. ÍNDICES
-- ============================================================================

CREATE INDEX idx_planes_mto_tenant ON planes_mantenimiento(tenant_id) WHERE activo;
CREATE INDEX idx_componentes_vehiculo ON componentes_vehiculo(vehiculo_id, tipo);
CREATE INDEX idx_componentes_estado ON componentes_vehiculo(tenant_id, estado);
CREATE INDEX idx_llantas_vehiculo ON control_llantas(vehiculo_id, posicion);
CREATE INDEX idx_llantas_estado ON control_llantas(tenant_id, estado);
CREATE INDEX idx_ot_vehiculo ON ordenes_trabajo_mto(vehiculo_id, estado);
CREATE INDEX idx_ot_fecha ON ordenes_trabajo_mto(tenant_id, fecha_programada);
CREATE INDEX idx_ot_estado ON ordenes_trabajo_mto(tenant_id, estado);
CREATE INDEX idx_combustible_vehiculo ON cargas_combustible(vehiculo_id, fecha_carga DESC);
CREATE INDEX idx_checklist_conductor ON checklist_preoperativo(conductor_id, fecha DESC);
CREATE INDEX idx_checklist_vehiculo ON checklist_preoperativo(vehiculo_id, fecha DESC);
CREATE INDEX idx_docs_conductor ON documentos_conductor(conductor_id, tipo_documento);
CREATE INDEX idx_docs_vencimiento ON documentos_conductor(fecha_vencimiento) WHERE estado != 'vencido';
CREATE INDEX idx_notif_conductor ON notificaciones_conductor(conductor_id, leida, created_at DESC);
CREATE INDEX idx_jornada_conductor ON jornada_conductor(conductor_id, fecha DESC);
CREATE INDEX idx_alertas_mto ON alertas_mantenimiento(vehiculo_id, resuelta);
CREATE INDEX idx_alertas_severidad ON alertas_mantenimiento(tenant_id, severidad) WHERE NOT resuelta;
CREATE INDEX idx_inspecciones_llanta ON inspecciones_llanta(llanta_id, fecha_inspeccion DESC);

-- ============================================================================
-- 5. FUNCIONES RPC
-- ============================================================================

-- 5.1 Generar OTs automáticas por plan de mantenimiento
CREATE OR REPLACE FUNCTION fn_generar_ots_preventivas(p_tenant_id UUID)
RETURNS TABLE(vehiculo TEXT, plan TEXT, ot_numero TEXT) AS $$
DECLARE
  v_rec RECORD;
  v_num_ot VARCHAR(20);
  v_seq INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(numero_ot FROM '[0-9]+$') AS INTEGER)), 0)
  INTO v_seq FROM ordenes_trabajo_mto WHERE tenant_id = p_tenant_id;

  FOR v_rec IN
    SELECT
      v.id AS vehiculo_id,
      v.placa,
      v.km_actual,
      v.horas_motor,
      pm.id AS plan_id,
      pm.codigo AS plan_codigo,
      pm.nombre AS plan_nombre,
      pm.frecuencia_km,
      pm.frecuencia_horas,
      pm.frecuencia_dias,
      pm.tolerancia_km,
      pm.tolerancia_horas,
      pm.costo_estimado,
      pm.tiempo_estimado_horas,
      pm.checklist_template,
      COALESCE(
        (SELECT MAX(ot2.km_vehiculo) FROM ordenes_trabajo_mto ot2
         WHERE ot2.vehiculo_id = v.id AND ot2.plan_id = pm.id
         AND ot2.estado IN ('completada')),
        0
      ) AS ultimo_km_mto,
      COALESCE(
        (SELECT MAX(ot2.fecha_fin) FROM ordenes_trabajo_mto ot2
         WHERE ot2.vehiculo_id = v.id AND ot2.plan_id = pm.id
         AND ot2.estado IN ('completada')),
        v.created_at
      ) AS ultima_fecha_mto
    FROM vehiculos v
    CROSS JOIN planes_mantenimiento pm
    WHERE v.tenant_id = p_tenant_id
      AND pm.tenant_id = p_tenant_id
      AND pm.activo
      AND v.activo
      AND NOT EXISTS (
        SELECT 1 FROM ordenes_trabajo_mto ot_exist
        WHERE ot_exist.vehiculo_id = v.id
          AND ot_exist.plan_id = pm.id
          AND ot_exist.estado IN ('programada', 'en_espera_repuestos', 'en_ejecucion')
      )
  LOOP
    -- Verificar si toca mantenimiento por KM
    IF v_rec.frecuencia_km IS NOT NULL
       AND (v_rec.km_actual - v_rec.ultimo_km_mto) >= (v_rec.frecuencia_km - v_rec.tolerancia_km)
    THEN
      v_seq := v_seq + 1;
      v_num_ot := 'OT-' || LPAD(v_seq::TEXT, 6, '0');

      INSERT INTO ordenes_trabajo_mto (
        tenant_id, numero_ot, vehiculo_id, plan_id, tipo, prioridad,
        estado, descripcion, fecha_programada, km_vehiculo,
        checklist_completado
      ) VALUES (
        p_tenant_id, v_num_ot, v_rec.vehiculo_id, v_rec.plan_id,
        'preventivo',
        CASE
          WHEN (v_rec.km_actual - v_rec.ultimo_km_mto) >= v_rec.frecuencia_km THEN 'alta'
          ELSE 'media'
        END,
        'programada',
        v_rec.plan_nombre || ' - ' || v_rec.placa || ' (' || v_rec.km_actual || ' km)',
        CURRENT_DATE + 3,
        v_rec.km_actual,
        v_rec.checklist_template
      );

      vehiculo := v_rec.placa;
      plan := v_rec.plan_codigo;
      ot_numero := v_num_ot;
      RETURN NEXT;
    END IF;

    -- Verificar por días
    IF v_rec.frecuencia_dias IS NOT NULL
       AND (CURRENT_DATE - v_rec.ultima_fecha_mto::DATE) >= (v_rec.frecuencia_dias - v_rec.tolerancia_dias)
    THEN
      v_seq := v_seq + 1;
      v_num_ot := 'OT-' || LPAD(v_seq::TEXT, 6, '0');

      INSERT INTO ordenes_trabajo_mto (
        tenant_id, numero_ot, vehiculo_id, plan_id, tipo, prioridad,
        estado, descripcion, fecha_programada, km_vehiculo
      ) VALUES (
        p_tenant_id, v_num_ot, v_rec.vehiculo_id, v_rec.plan_id,
        'preventivo', 'media', 'programada',
        v_rec.plan_nombre || ' - ' || v_rec.placa || ' (calendario)',
        CURRENT_DATE + 3,
        v_rec.km_actual
      );

      vehiculo := v_rec.placa;
      plan := v_rec.plan_codigo;
      ot_numero := v_num_ot;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.2 Dashboard KPIs de flota
CREATE OR REPLACE FUNCTION fn_kpi_flota(
  p_tenant_id UUID,
  p_fecha_desde DATE DEFAULT CURRENT_DATE - 30,
  p_fecha_hasta DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_vehiculos', (SELECT COUNT(*) FROM vehiculos WHERE tenant_id = p_tenant_id AND activo),
    'vehiculos_operativos', (SELECT COUNT(*) FROM vehiculos WHERE tenant_id = p_tenant_id AND activo AND estado = 'operativo'),
    'vehiculos_en_taller', (
      SELECT COUNT(DISTINCT vehiculo_id) FROM ordenes_trabajo_mto
      WHERE tenant_id = p_tenant_id AND estado = 'en_ejecucion'
    ),
    'ot_pendientes', (
      SELECT COUNT(*) FROM ordenes_trabajo_mto
      WHERE tenant_id = p_tenant_id AND estado IN ('programada', 'en_espera_repuestos')
    ),
    'ot_completadas_periodo', (
      SELECT COUNT(*) FROM ordenes_trabajo_mto
      WHERE tenant_id = p_tenant_id AND estado = 'completada'
        AND fecha_fin BETWEEN p_fecha_desde AND p_fecha_hasta
    ),
    'costo_mto_periodo', (
      SELECT COALESCE(SUM(costo_total), 0) FROM ordenes_trabajo_mto
      WHERE tenant_id = p_tenant_id AND estado = 'completada'
        AND fecha_fin BETWEEN p_fecha_desde AND p_fecha_hasta
    ),
    'rendimiento_promedio_kmgl', (
      SELECT ROUND(AVG(rendimiento_km_galon)::NUMERIC, 2) FROM cargas_combustible
      WHERE tenant_id = p_tenant_id AND fecha_carga BETWEEN p_fecha_desde AND p_fecha_hasta
        AND rendimiento_km_galon > 0
    ),
    'gasto_combustible_periodo', (
      SELECT COALESCE(SUM(monto_total), 0) FROM cargas_combustible
      WHERE tenant_id = p_tenant_id AND fecha_carga BETWEEN p_fecha_desde AND p_fecha_hasta
    ),
    'llantas_criticas', (
      SELECT COUNT(*) FROM control_llantas
      WHERE tenant_id = p_tenant_id
        AND profundidad_cocada_mm <= profundidad_minima_mm + 1
        AND estado = 'en_uso'
    ),
    'alertas_activas', (
      SELECT COUNT(*) FROM alertas_mantenimiento
      WHERE tenant_id = p_tenant_id AND NOT resuelta
    ),
    'checklist_cumplimiento', (
      SELECT ROUND(AVG(porcentaje_cumplimiento)::NUMERIC, 1)
      FROM checklist_preoperativo
      WHERE tenant_id = p_tenant_id
        AND fecha BETWEEN p_fecha_desde AND p_fecha_hasta
    ),
    'docs_por_vencer', (
      SELECT COUNT(*) FROM documentos_conductor
      WHERE tenant_id = p_tenant_id
        AND fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + 30
        AND estado != 'vencido'
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.3 Resumen de jornada por conductor
CREATE OR REPLACE FUNCTION fn_resumen_jornada_conductor(
  p_conductor_id UUID,
  p_fecha_desde DATE DEFAULT CURRENT_DATE - 7,
  p_fecha_hasta DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT jsonb_build_object(
      'dias_trabajados', COUNT(*),
      'km_totales', SUM(km_recorridos),
      'viajes_totales', SUM(viajes_completados),
      'toneladas_totales', SUM(toneladas_transportadas),
      'horas_efectivas', SUM(horas_efectivas),
      'horas_espera', SUM(horas_espera),
      'eficiencia', ROUND(
        (SUM(horas_efectivas) / NULLIF(SUM(horas_efectivas) + SUM(horas_espera), 0) * 100)::NUMERIC, 1
      ),
      'calificacion_promedio', ROUND(AVG(calificacion_jornada)::NUMERIC, 1),
      'incidentes_totales', SUM(incidentes)
    )
    FROM jornada_conductor
    WHERE conductor_id = p_conductor_id
      AND fecha BETWEEN p_fecha_desde AND p_fecha_hasta
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.4 Proyección de vida útil de llantas
CREATE OR REPLACE FUNCTION fn_proyeccion_llantas(p_tenant_id UUID)
RETURNS TABLE(
  llanta_id UUID,
  vehiculo_placa TEXT,
  posicion TEXT,
  marca TEXT,
  profundidad_actual DECIMAL,
  profundidad_minima DECIMAL,
  km_restantes_estimados INTEGER,
  dias_restantes_estimados INTEGER,
  costo_km DECIMAL,
  accion_recomendada TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cl.id,
    v.placa,
    cl.posicion::TEXT,
    cl.marca_llanta,
    cl.profundidad_cocada_mm,
    cl.profundidad_minima_mm,
    CASE
      WHEN cl.km_acumulados > 0 AND cl.profundidad_cocada_mm > cl.profundidad_minima_mm
      THEN CAST(
        (cl.profundidad_cocada_mm - cl.profundidad_minima_mm) /
        ((cl.profundidad_original_mm - cl.profundidad_cocada_mm) / NULLIF(cl.km_acumulados, 1))
        AS INTEGER
      )
      ELSE 0
    END AS km_restantes,
    CASE
      WHEN cl.km_acumulados > 0 AND cl.profundidad_cocada_mm > cl.profundidad_minima_mm
      THEN CAST(
        ((cl.profundidad_cocada_mm - cl.profundidad_minima_mm) /
        ((cl.profundidad_original_mm - cl.profundidad_cocada_mm) / NULLIF(cl.km_acumulados, 1))) / 150
        AS INTEGER
      ) -- Asumiendo 150 km/día promedio
      ELSE 0
    END AS dias_restantes,
    cl.costo_por_km,
    CASE
      WHEN cl.profundidad_cocada_mm <= cl.profundidad_minima_mm THEN 'BAJA INMEDIATA'
      WHEN cl.profundidad_cocada_mm <= cl.profundidad_minima_mm + 1 THEN 'PROGRAMAR REENCAUCHE'
      WHEN cl.profundidad_cocada_mm <= cl.profundidad_minima_mm + 2 THEN 'MONITOREAR'
      ELSE 'OK'
    END
  FROM control_llantas cl
  JOIN vehiculos v ON v.id = cl.vehiculo_id
  WHERE cl.tenant_id = p_tenant_id
    AND cl.estado = 'en_uso'
  ORDER BY cl.profundidad_cocada_mm ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE planes_mantenimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE componentes_vehiculo ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_llantas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_trabajo_mto ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargas_combustible ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspecciones_llanta ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_preoperativo ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_conductor ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones_conductor ENABLE ROW LEVEL SECURITY;
ALTER TABLE jornada_conductor ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas_mantenimiento ENABLE ROW LEVEL SECURITY;

-- Política genérica por tenant para todas las tablas
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'planes_mantenimiento', 'componentes_vehiculo', 'control_llantas',
      'ordenes_trabajo_mto', 'cargas_combustible', 'inspecciones_llanta',
      'checklist_preoperativo', 'documentos_conductor', 'notificaciones_conductor',
      'jornada_conductor', 'alertas_mantenimiento'
    ])
  LOOP
    EXECUTE format(
      'CREATE POLICY tenant_isolation_%I ON %I FOR ALL USING (
        tenant_id IN (
          SELECT ut.tenant_id FROM user_tenants ut WHERE ut.user_id = auth.uid()
        )
      )', tbl, tbl
    );
  END LOOP;
END $$;

-- ============================================================================
-- 7. TRIGGERS
-- ============================================================================

-- Auto-actualizar updated_at
CREATE OR REPLACE FUNCTION fn_auto_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'planes_mantenimiento', 'componentes_vehiculo', 'control_llantas',
      'ordenes_trabajo_mto', 'documentos_conductor', 'jornada_conductor'
    ])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION fn_auto_updated_at()',
      tbl, tbl
    );
  END LOOP;
END $$;

-- Trigger: Auto-calcular rendimiento combustible
CREATE OR REPLACE FUNCTION fn_calcular_rendimiento_combustible()
RETURNS TRIGGER AS $$
DECLARE
  v_km_anterior INTEGER;
BEGIN
  SELECT km_odometro INTO v_km_anterior
  FROM cargas_combustible
  WHERE vehiculo_id = NEW.vehiculo_id
    AND id != NEW.id
  ORDER BY fecha_carga DESC
  LIMIT 1;

  IF v_km_anterior IS NOT NULL AND NEW.galones > 0 THEN
    NEW.km_recorridos := NEW.km_odometro - v_km_anterior;
    NEW.rendimiento_km_galon := ROUND((NEW.km_recorridos / NEW.galones)::NUMERIC, 2);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_rendimiento_combustible
  BEFORE INSERT ON cargas_combustible
  FOR EACH ROW EXECUTE FUNCTION fn_calcular_rendimiento_combustible();

-- Trigger: Auto-calcular porcentaje checklist
CREATE OR REPLACE FUNCTION fn_calcular_checklist_stats()
RETURNS TRIGGER AS $$
BEGIN
  NEW.items_total := jsonb_array_length(NEW.items);
  NEW.items_ok := (
    SELECT COUNT(*) FROM jsonb_array_elements(NEW.items) elem
    WHERE (elem->>'ok')::BOOLEAN = TRUE
  );
  NEW.items_fallidos := NEW.items_total - NEW.items_ok;
  NEW.porcentaje_cumplimiento := ROUND(
    (NEW.items_ok::DECIMAL / NULLIF(NEW.items_total, 0) * 100)::NUMERIC, 2
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_checklist_stats
  BEFORE INSERT OR UPDATE OF items ON checklist_preoperativo
  FOR EACH ROW EXECUTE FUNCTION fn_calcular_checklist_stats();

-- Trigger: Alertar documentos por vencer
CREATE OR REPLACE FUNCTION fn_verificar_docs_vencimiento()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.fecha_vencimiento IS NOT NULL THEN
    IF NEW.fecha_vencimiento < CURRENT_DATE THEN
      NEW.estado := 'vencido';
    ELSIF NEW.fecha_vencimiento <= CURRENT_DATE + 30 THEN
      NEW.estado := 'por_vencer';
    ELSE
      NEW.estado := 'vigente';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_docs_vencimiento
  BEFORE INSERT OR UPDATE ON documentos_conductor
  FOR EACH ROW EXECUTE FUNCTION fn_verificar_docs_vencimiento();

-- ============================================================================
-- 8. STORAGE BUCKETS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('fotos-mantenimiento', 'fotos-mantenimiento', false),
  ('fotos-checklist', 'fotos-checklist', false),
  ('docs-conductor', 'docs-conductor', false),
  ('fotos-combustible', 'fotos-combustible', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
CREATE POLICY "Authenticated upload mto" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('fotos-mantenimiento', 'fotos-checklist', 'docs-conductor', 'fotos-combustible'));

CREATE POLICY "Authenticated read mto" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id IN ('fotos-mantenimiento', 'fotos-checklist', 'docs-conductor', 'fotos-combustible'));

-- ============================================================================
-- 9. VISTAS
-- ============================================================================

CREATE OR REPLACE VIEW v_flota_resumen AS
SELECT
  v.id,
  v.placa,
  v.tenant_id,
  v.tipo_vehiculo,
  v.km_actual,
  v.estado,
  (SELECT COUNT(*) FROM ordenes_trabajo_mto ot
   WHERE ot.vehiculo_id = v.id AND ot.estado IN ('programada', 'en_espera_repuestos')) AS ots_pendientes,
  (SELECT COUNT(*) FROM control_llantas cl
   WHERE cl.vehiculo_id = v.id AND cl.estado = 'en_uso'
   AND cl.profundidad_cocada_mm <= cl.profundidad_minima_mm + 1) AS llantas_criticas,
  (SELECT ROUND(AVG(cc.rendimiento_km_galon)::NUMERIC, 2)
   FROM cargas_combustible cc WHERE cc.vehiculo_id = v.id
   AND cc.fecha_carga >= CURRENT_DATE - 30) AS rendimiento_30d,
  (SELECT MAX(cp.fecha) FROM checklist_preoperativo cp
   WHERE cp.vehiculo_id = v.id) AS ultimo_checklist,
  (SELECT COUNT(*) FROM alertas_mantenimiento am
   WHERE am.vehiculo_id = v.id AND NOT am.resuelta) AS alertas_activas
FROM vehiculos v
WHERE v.activo;

-- ============================================================================
-- FIN SPRINT 15
-- ============================================================================
