-- ============================================================================
-- TRANSCAÑA ERP - Setup Contable Post-PCGE
-- 1. Función fn_kpi_flota (pendiente del Sprint 15)
-- 2. Centros de Costo iniciales para Grupo Galarreta
-- 3. Período contable 2026
-- ============================================================================

-- ============================================================================
-- 1. fn_kpi_flota
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_kpi_flota(
  p_tenant_id UUID,
  p_fecha_desde DATE DEFAULT CURRENT_DATE - 30,
  p_fecha_hasta DATE DEFAULT CURRENT_DATE
) RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object(
    'total_vehiculos', (SELECT COUNT(*) FROM vehiculos WHERE tenant_id = p_tenant_id AND activo),
    'vehiculos_operativos', (SELECT COUNT(*) FROM vehiculos WHERE tenant_id = p_tenant_id AND activo AND estado = 'operativo'),
    'vehiculos_en_taller', (SELECT COUNT(DISTINCT vehiculo_id) FROM ordenes_trabajo_mto WHERE tenant_id = p_tenant_id AND estado = 'en_ejecucion'),
    'ot_pendientes', (SELECT COUNT(*) FROM ordenes_trabajo_mto WHERE tenant_id = p_tenant_id AND estado IN ('programada','en_espera_repuestos')),
    'costo_mto_periodo', COALESCE((SELECT SUM(costo_repuestos + costo_mano_obra + costo_taller_externo) FROM ordenes_trabajo_mto WHERE tenant_id = p_tenant_id AND estado = 'completada' AND fecha_fin BETWEEN p_fecha_desde AND p_fecha_hasta), 0),
    'rendimiento_promedio_kmgl', (SELECT ROUND(AVG(rendimiento_km_galon)::NUMERIC, 2) FROM cargas_combustible WHERE tenant_id = p_tenant_id AND fecha_carga BETWEEN p_fecha_desde AND p_fecha_hasta AND rendimiento_km_galon > 0),
    'gasto_combustible_periodo', COALESCE((SELECT SUM(galones * precio_galon) FROM cargas_combustible WHERE tenant_id = p_tenant_id AND fecha_carga BETWEEN p_fecha_desde AND p_fecha_hasta), 0),
    'llantas_criticas', (SELECT COUNT(*) FROM control_llantas WHERE tenant_id = p_tenant_id AND profundidad_cocada_mm <= profundidad_minima_mm + 1 AND estado = 'en_uso'),
    'alertas_activas', (SELECT COUNT(*) FROM alertas_mantenimiento WHERE tenant_id = p_tenant_id AND NOT resuelta),
    'checklist_cumplimiento', (SELECT ROUND(AVG(porcentaje_cumplimiento)::NUMERIC, 1) FROM checklist_preoperativo WHERE tenant_id = p_tenant_id AND fecha BETWEEN p_fecha_desde AND p_fecha_hasta)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. Centros de Costo - Grupo Galarreta
-- ============================================================================
INSERT INTO centros_costo (nombre, descripcion, user_id) VALUES
  ('CC-TRANSPORTE', 'Operación de Transporte de Caña - Costo directo del servicio', '0ad9914c-b254-4586-869e-8acfe2962196'),
  ('CC-MANTENIMIENTO', 'Taller de Mantenimiento de Flota - Mano de obra y repuestos', '0ad9914c-b254-4586-869e-8acfe2962196'),
  ('CC-COMBUSTIBLE', 'Centro de Costo de Combustible - Diesel B5 operativo', '0ad9914c-b254-4586-869e-8acfe2962196'),
  ('CC-LLANTAS', 'Gestión de Neumáticos - Llantas nuevas, reencauches, rotaciones', '0ad9914c-b254-4586-869e-8acfe2962196'),
  ('CC-ADMINISTRACION', 'Gastos Administrativos - Oficina, personal administrativo', '0ad9914c-b254-4586-869e-8acfe2962196'),
  ('CC-PESAJE', 'Operaciones de Báscula - Servicio de pesaje en ingenio', '0ad9914c-b254-4586-869e-8acfe2962196'),
  ('CC-LOGISTICA', 'Logística y Despacho - Coordinación de rutas y turnos', '0ad9914c-b254-4586-869e-8acfe2962196'),
  ('CC-DEPRECIACION', 'Depreciación de Activos Fijos - Flota y equipos', '0ad9914c-b254-4586-869e-8acfe2962196')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. Función para generar asiento automático desde liquidación
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_asiento_liquidacion(
  p_liquidacion_id UUID,
  p_user_id UUID
) RETURNS UUID AS $$
DECLARE
  v_liq RECORD;
  v_asiento_id UUID;
  v_total DECIMAL(12,2);
BEGIN
  -- Obtener datos de la liquidación
  SELECT l.*, 
    COALESCE(SUM(ld.monto), 0) as total_detalle
  INTO v_liq
  FROM liquidaciones l
  LEFT JOIN liquidacion_detalle ld ON ld.liquidacion_id = l.id
  WHERE l.id = p_liquidacion_id
  GROUP BY l.id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Liquidación no encontrada';
  END IF;

  v_total := v_liq.total_detalle;

  -- Crear asiento contable
  INSERT INTO asientos_contables (descripcion, user_id)
  VALUES (
    'Liquidación transporte caña - ' || COALESCE(v_liq.id::text, ''),
    p_user_id
  )
  RETURNING id INTO v_asiento_id;

  -- Línea DEBE: Costo del servicio de transporte (cuenta 9011 o 6311)
  INSERT INTO asiento_detalle (asiento_id, cuenta_id, debe, haber)
  SELECT v_asiento_id, id, v_total, 0
  FROM cuentas_contables WHERE codigo = '6311';

  -- Línea HABER: Liquidaciones transportistas por pagar (cuenta 4699)
  INSERT INTO asiento_detalle (asiento_id, cuenta_id, debe, haber)
  SELECT v_asiento_id, id, 0, v_total
  FROM cuentas_contables WHERE codigo = '4699';

  -- Actualizar saldos
  UPDATE cuentas_contables SET saldo = saldo + v_total WHERE codigo = '6311';
  UPDATE cuentas_contables SET saldo = saldo + v_total WHERE codigo = '4699';

  RETURN v_asiento_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. Función para generar asiento de consumo de combustible
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_asiento_combustible(
  p_carga_id UUID,
  p_user_id UUID
) RETURNS UUID AS $$
DECLARE
  v_carga RECORD;
  v_asiento_id UUID;
  v_monto DECIMAL(12,2);
BEGIN
  SELECT * INTO v_carga FROM cargas_combustible WHERE id = p_carga_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Carga no encontrada'; END IF;

  v_monto := v_carga.galones * v_carga.precio_galon;

  INSERT INTO asientos_contables (descripcion, user_id)
  VALUES ('Consumo combustible - ' || v_carga.vehiculo_id::text, p_user_id)
  RETURNING id INTO v_asiento_id;

  -- DEBE: Consumo de combustible (6561)
  INSERT INTO asiento_detalle (asiento_id, cuenta_id, debe, haber)
  SELECT v_asiento_id, id, v_monto, 0 FROM cuentas_contables WHERE codigo = '6561';

  -- HABER: Inventario Diesel B5 (2521)
  INSERT INTO asiento_detalle (asiento_id, cuenta_id, debe, haber)
  SELECT v_asiento_id, id, 0, v_monto FROM cuentas_contables WHERE codigo = '2521';

  UPDATE cuentas_contables SET saldo = saldo + v_monto WHERE codigo = '6561';
  UPDATE cuentas_contables SET saldo = saldo - v_monto WHERE codigo = '2521';

  RETURN v_asiento_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. Función para generar asiento de OT mantenimiento completada
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_asiento_mantenimiento(
  p_ot_id UUID,
  p_user_id UUID
) RETURNS UUID AS $$
DECLARE
  v_ot RECORD;
  v_asiento_id UUID;
BEGIN
  SELECT * INTO v_ot FROM ordenes_trabajo_mto WHERE id = p_ot_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'OT no encontrada'; END IF;

  INSERT INTO asientos_contables (descripcion, user_id)
  VALUES ('Mantenimiento ' || v_ot.numero_ot || ' - ' || v_ot.tipo, p_user_id)
  RETURNING id INTO v_asiento_id;

  -- Mano de obra → DEBE 6563 / HABER 4111
  IF v_ot.costo_mano_obra > 0 THEN
    INSERT INTO asiento_detalle (asiento_id, cuenta_id, debe, haber)
    SELECT v_asiento_id, id, v_ot.costo_mano_obra, 0 FROM cuentas_contables WHERE codigo = '6563';
    INSERT INTO asiento_detalle (asiento_id, cuenta_id, debe, haber)
    SELECT v_asiento_id, id, 0, v_ot.costo_mano_obra FROM cuentas_contables WHERE codigo = '4111';
    UPDATE cuentas_contables SET saldo = saldo + v_ot.costo_mano_obra WHERE codigo = '6563';
    UPDATE cuentas_contables SET saldo = saldo + v_ot.costo_mano_obra WHERE codigo = '4111';
  END IF;

  -- Repuestos → DEBE 6564 / HABER 2524
  IF v_ot.costo_repuestos > 0 THEN
    INSERT INTO asiento_detalle (asiento_id, cuenta_id, debe, haber)
    SELECT v_asiento_id, id, v_ot.costo_repuestos, 0 FROM cuentas_contables WHERE codigo = '6564';
    INSERT INTO asiento_detalle (asiento_id, cuenta_id, debe, haber)
    SELECT v_asiento_id, id, 0, v_ot.costo_repuestos FROM cuentas_contables WHERE codigo = '2524';
    UPDATE cuentas_contables SET saldo = saldo + v_ot.costo_repuestos WHERE codigo = '6564';
    UPDATE cuentas_contables SET saldo = saldo - v_ot.costo_repuestos WHERE codigo = '2524';
  END IF;

  -- Taller externo → DEBE 6365 / HABER 4212
  IF v_ot.costo_taller_externo > 0 THEN
    INSERT INTO asiento_detalle (asiento_id, cuenta_id, debe, haber)
    SELECT v_asiento_id, id, v_ot.costo_taller_externo, 0 FROM cuentas_contables WHERE codigo = '6365';
    INSERT INTO asiento_detalle (asiento_id, cuenta_id, debe, haber)
    SELECT v_asiento_id, id, 0, v_ot.costo_taller_externo FROM cuentas_contables WHERE codigo = '4212';
    UPDATE cuentas_contables SET saldo = saldo + v_ot.costo_taller_externo WHERE codigo = '6365';
    UPDATE cuentas_contables SET saldo = saldo + v_ot.costo_taller_externo WHERE codigo = '4212';
  END IF;

  RETURN v_asiento_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Verificación final
-- ============================================================================
SELECT 'centros_costo' as tabla, COUNT(*) as registros FROM centros_costo
UNION ALL
SELECT 'cuentas_contables', COUNT(*) FROM cuentas_contables
UNION ALL
SELECT 'funciones_contables', (
  SELECT COUNT(*) FROM pg_proc WHERE proname IN (
    'fn_asiento_liquidacion','fn_asiento_combustible','fn_asiento_mantenimiento','fn_kpi_flota'
  )
);
