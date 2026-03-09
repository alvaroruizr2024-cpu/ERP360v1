-- ============================================================================
-- PLAN CONTABLE GENERAL EMPRESARIAL (PCGE) 2019
-- Adaptado para TransCaña ERP - Grupo Empresarial Galarreta
-- Sector: Transporte de caña de azúcar / Agroindustria
-- Normativa: Resolución 002-2019-EF/30 (SMV)
-- ============================================================================

-- User ID de Alvaro (admin)
-- user_id: 0ad9914c-b254-4586-869e-8acfe2962196

-- ============================================================================
-- ELEMENTO 1: ACTIVO DISPONIBLE Y EXIGIBLE
-- ============================================================================
INSERT INTO cuentas_contables (codigo, nombre, tipo, saldo, user_id) VALUES
-- Clase 10: Efectivo y Equivalentes de Efectivo
('10', 'EFECTIVO Y EQUIVALENTES DE EFECTIVO', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('101', 'Caja', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('1011', 'Caja - Moneda Nacional', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('1012', 'Caja - Moneda Extranjera', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('104', 'Cuentas Corrientes en Instituciones Financieras', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('1041', 'Cuentas Corrientes Operativas', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('1042', 'Cuentas Corrientes para Fines Específicos', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('106', 'Depósitos en Instituciones Financieras', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('107', 'Fondos Sujetos a Restricción', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('1071', 'Fondos de Detracciones', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

-- Clase 12: Cuentas por Cobrar Comerciales - Terceros
('12', 'CUENTAS POR COBRAR COMERCIALES - TERCEROS', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('121', 'Facturas, Boletas y Otros Comprobantes por Cobrar', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('1212', 'Emitidas en Cartera', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('1213', 'En Cobranza', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('122', 'Anticipos de Clientes', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

-- Clase 13: Cuentas por Cobrar Comerciales - Relacionadas
('13', 'CUENTAS POR COBRAR COMERCIALES - RELACIONADAS', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('131', 'Facturas, Boletas y Otros Comprobantes por Cobrar', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

-- Clase 14: Cuentas por Cobrar al Personal, Accionistas
('14', 'CUENTAS POR COBRAR AL PERSONAL, ACCIONISTAS Y DIRECTORES', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('141', 'Personal', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('1411', 'Préstamos al Personal', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('1412', 'Adelanto de Remuneraciones', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

-- Clase 16: Cuentas por Cobrar Diversas - Terceros
('16', 'CUENTAS POR COBRAR DIVERSAS - TERCEROS', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('162', 'Reclamaciones a Terceros', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('1629', 'Otras Reclamaciones', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('16291', 'Drawback por Cobrar', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('167', 'Tributos por Acreditar', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('1671', 'IGV - Cuenta Propia', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('1673', 'Detracciones por Aplicar', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

-- Clase 18: Servicios y Otros Contratados por Anticipado
('18', 'SERVICIOS Y OTROS CONTRATADOS POR ANTICIPADO', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('181', 'Costos Financieros', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('182', 'Seguros', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('1821', 'Seguros de Vehículos - SOAT', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('1822', 'Seguros de Carga', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('183', 'Alquileres', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

-- ============================================================================
-- ELEMENTO 2: ACTIVO REALIZABLE (INVENTARIOS)
-- ============================================================================
('20', 'MERCADERÍAS', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('201', 'Mercaderías Manufacturadas', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

('25', 'MATERIALES AUXILIARES, SUMINISTROS Y REPUESTOS', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('251', 'Materiales Auxiliares', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('252', 'Suministros', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('2521', 'Combustibles - Diesel B5', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('2522', 'Lubricantes y Grasas', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('2523', 'Filtros y Materiales de Mantenimiento', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('2524', 'Repuestos de Vehículos', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('2525', 'Llantas y Neumáticos', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('2526', 'Otros Suministros Diversos', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

-- ============================================================================
-- ELEMENTO 3: ACTIVO INMOVILIZADO
-- ============================================================================
('33', 'INMUEBLES, MAQUINARIA Y EQUIPO', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('332', 'Edificaciones', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('3321', 'Talleres y Cocheras', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('334', 'Unidades de Transporte', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('3341', 'Tractocamiones', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('3342', 'Jaulas Cañeras (Remolques)', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('3343', 'Vehículos Livianos', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('335', 'Muebles y Enseres', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('336', 'Equipos Diversos', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('3361', 'Equipos de GPS y Telemetría', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('3362', 'Básculas de Pesaje', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('3363', 'Equipos de Cómputo', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

('34', 'INTANGIBLES', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('341', 'Concesiones, Licencias y Otros Derechos', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('343', 'Programas de Computadora (Software)', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('3431', 'Software ERP TransCaña', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

('39', 'DEPRECIACIÓN, AMORTIZACIÓN Y AGOTAMIENTO ACUMULADOS', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('391', 'Depreciación Acumulada', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('3913', 'Depreciación - Edificaciones', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('3914', 'Depreciación - Unidades de Transporte', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('3915', 'Depreciación - Equipos Diversos', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('392', 'Amortización Acumulada', 'activo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

-- ============================================================================
-- ELEMENTO 4: PASIVO
-- ============================================================================
('40', 'TRIBUTOS, CONTRAPRESTACIONES Y APORTES AL SISTEMA', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('401', 'Gobierno Nacional', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('40111', 'IGV - Cuenta Propia', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('40112', 'IGV - Servicios Prestados por No Domiciliados', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('40113', 'IGV - Régimen de Percepciones', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('40114', 'IGV - Régimen de Retenciones', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('4017', 'Impuesto a la Renta', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('40171', 'Renta de 3ra Categoría', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('40173', 'Renta de 4ta Categoría', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('40174', 'Renta de 5ta Categoría', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('4018', 'Otros Tributos', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('40181', 'ITAN', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('403', 'Instituciones Públicas', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('4031', 'EsSalud', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('4032', 'ONP', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('4033', 'Contribución al SENATI', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('407', 'Administradoras de Fondos de Pensiones', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('4071', 'AFP - Aportes', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

('41', 'REMUNERACIONES Y PARTICIPACIONES POR PAGAR', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('411', 'Remuneraciones por Pagar', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('4111', 'Sueldos y Salarios por Pagar', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('4112', 'Comisiones por Pagar', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('4114', 'Gratificaciones por Pagar', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('4115', 'Vacaciones por Pagar', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('413', 'Participación de los Trabajadores por Pagar', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('415', 'Beneficios Sociales de los Trabajadores por Pagar', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('4151', 'Compensación por Tiempo de Servicios (CTS)', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

('42', 'CUENTAS POR PAGAR COMERCIALES - TERCEROS', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('421', 'Facturas, Boletas y Otros Comprobantes por Pagar', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('4211', 'No Emitidas', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('4212', 'Emitidas', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('422', 'Anticipos a Proveedores', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

('43', 'CUENTAS POR PAGAR COMERCIALES - RELACIONADAS', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('431', 'Facturas, Boletas por Pagar - Empresas del Grupo', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

('44', 'CUENTAS POR PAGAR A LOS ACCIONISTAS Y DIRECTORES', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('441', 'Accionistas (o Socios)', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('4411', 'Préstamos de Accionistas', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('4412', 'Dividendos por Pagar', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

('45', 'OBLIGACIONES FINANCIERAS', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('451', 'Préstamos de Instituciones Financieras', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('4511', 'Préstamos Bancarios', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('452', 'Contratos de Arrendamiento Financiero (Leasing)', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('4521', 'Leasing - Tractocamiones', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

('46', 'CUENTAS POR PAGAR DIVERSAS - TERCEROS', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('465', 'Pasivos por Compra de Activo Inmovilizado', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('469', 'Otras Cuentas por Pagar Diversas', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('4699', 'Liquidaciones Transportistas por Pagar', 'pasivo', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

-- ============================================================================
-- ELEMENTO 5: PATRIMONIO
-- ============================================================================
('50', 'CAPITAL', 'capital', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('501', 'Capital Social', 'capital', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('5011', 'Acciones', 'capital', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

('52', 'CAPITAL ADICIONAL', 'capital', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('521', 'Primas (Descuento) de Acciones', 'capital', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

('57', 'EXCEDENTE DE REVALUACIÓN', 'capital', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('571', 'Excedente de Revaluación Voluntaria', 'capital', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

('58', 'RESERVAS', 'capital', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('582', 'Reserva Legal', 'capital', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('583', 'Reservas Contractuales', 'capital', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

('59', 'RESULTADOS ACUMULADOS', 'capital', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('591', 'Utilidades No Distribuidas', 'capital', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('592', 'Pérdidas Acumuladas', 'capital', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

-- ============================================================================
-- ELEMENTO 6: GASTOS POR NATURALEZA
-- ============================================================================
('60', 'COMPRAS', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('603', 'Materiales Auxiliares, Suministros y Repuestos', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6031', 'Materiales Auxiliares', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6032', 'Suministros', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('60321', 'Compra de Combustible - Diesel', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('60322', 'Compra de Lubricantes', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6033', 'Repuestos', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('60331', 'Compra de Repuestos Vehículos', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('60332', 'Compra de Llantas y Neumáticos', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

('61', 'VARIACIÓN DE EXISTENCIAS', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('613', 'Materiales Auxiliares, Suministros y Repuestos', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

('62', 'GASTOS DE PERSONAL Y DIRECTORES', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('621', 'Remuneraciones', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6211', 'Sueldos y Salarios', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6214', 'Gratificaciones', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6215', 'Vacaciones', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('627', 'Seguridad, Previsión Social y Otras Contrib.', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6271', 'Régimen de Prestaciones de Salud (EsSalud)', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('629', 'Beneficios Sociales de los Trabajadores', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6291', 'Compensación por Tiempo de Servicio (CTS)', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

('63', 'GASTOS DE SERVICIOS PRESTADOS POR TERCEROS', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('631', 'Transporte, Correos y Gastos de Viaje', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6311', 'Transporte de Carga', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('634', 'Mantenimiento y Reparaciones', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6341', 'Mantenimiento - Inmuebles', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6343', 'Mantenimiento - Equipos de Transporte', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6344', 'Mantenimiento - Equipos Diversos', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('636', 'Servicios Básicos', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6361', 'Energía Eléctrica', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6363', 'Agua', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6364', 'Telefonía e Internet', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6365', 'Servicios de Taller Externo (Mantenimiento)', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('637', 'Publicidad, Publicaciones, Relaciones Públicas', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('638', 'Servicios de Contratistas', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('639', 'Otros Servicios Prestados por Terceros', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6391', 'Servicio de Báscula / Pesaje', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6392', 'Servicio de GPS y Telemetría', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

('65', 'OTROS GASTOS DE GESTIÓN', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('651', 'Seguros', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6511', 'Seguros de Vehículos - SOAT', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6512', 'Seguros de Carga', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('652', 'Regalías', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('653', 'Suscripciones y Cotizaciones', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('654', 'Licencias y Derechos de Vigencia', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('655', 'Costo Neto de Enajenación de Activos', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('656', 'Suministros', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6561', 'Consumo de Combustible', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6562', 'Consumo de Lubricantes', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6563', 'Mano de Obra Mantenimiento', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6564', 'Consumo de Repuestos', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6565', 'Consumo de Llantas', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('659', 'Otros Gastos de Gestión', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6591', 'Donaciones', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6592', 'Sanciones Administrativas / Multas', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

('67', 'GASTOS FINANCIEROS', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('671', 'Gastos en Operaciones de Endeudamiento', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6711', 'Intereses de Préstamos Bancarios', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6712', 'Intereses de Leasing', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('675', 'Descuentos Concedidos por Pronto Pago', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('676', 'Diferencia de Cambio', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

('68', 'VALUACIÓN Y DETERIORO DE ACTIVOS Y PROVISIONES', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('681', 'Depreciación', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6814', 'Depreciación - Unidades de Transporte', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('6815', 'Depreciación - Equipos Diversos', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('682', 'Amortización de Intangibles', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('684', 'Valuación de Activos', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('685', 'Deterioro del Valor de los Activos', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

-- ============================================================================
-- ELEMENTO 7: INGRESOS
-- ============================================================================
('70', 'VENTAS', 'ingreso', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('704', 'Prestación de Servicios', 'ingreso', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('7041', 'Servicio de Transporte de Caña', 'ingreso', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('7042', 'Servicio de Alquiler de Maquinaria', 'ingreso', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('7043', 'Servicio de Pesaje', 'ingreso', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('7049', 'Otros Servicios de Transporte', 'ingreso', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

('73', 'DESCUENTOS, REBAJAS Y BONIFICACIONES OBTENIDOS', 'ingreso', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('731', 'Descuentos, Rebajas y Bonif. Obtenidos', 'ingreso', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

('75', 'OTROS INGRESOS DE GESTIÓN', 'ingreso', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('754', 'Alquileres', 'ingreso', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('759', 'Otros Ingresos de Gestión', 'ingreso', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('7591', 'Restitución de Derechos Arancelarios (Drawback)', 'ingreso', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

('77', 'INGRESOS FINANCIEROS', 'ingreso', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('771', 'Ganancia por Instrumento Financiero', 'ingreso', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('772', 'Rendimientos Ganados', 'ingreso', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('776', 'Diferencia de Cambio', 'ingreso', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

-- ============================================================================
-- ELEMENTO 9: CONTABILIDAD ANALÍTICA (COSTOS)
-- ============================================================================
('90', 'COSTOS DEL SERVICIO', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('901', 'Costo del Servicio de Transporte', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('9011', 'Combustible - Costo Directo', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('9012', 'Conductores - Mano de Obra Directa', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('9013', 'Peajes y Viáticos', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('9014', 'Llantas - Costo Directo', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('9015', 'Mantenimiento Preventivo - CIF', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('9016', 'Depreciación Flota - CIF', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('9017', 'Seguros Flota - CIF', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('9018', 'GPS y Telemetría - CIF', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

('94', 'GASTOS DE ADMINISTRACIÓN', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('941', 'Gastos de Administración', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

('95', 'GASTOS DE VENTAS', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('951', 'Gastos de Ventas', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

('97', 'GASTOS FINANCIEROS', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('971', 'Gastos Financieros', 'gasto', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),

('79', 'CARGAS IMPUTABLES A CUENTAS DE COSTOS Y GASTOS', 'ingreso', 0, '0ad9914c-b254-4586-869e-8acfe2962196'),
('791', 'Cargas Imputables a Cuentas de Costos y Gastos', 'ingreso', 0, '0ad9914c-b254-4586-869e-8acfe2962196')

ON CONFLICT DO NOTHING;

-- ============================================================================
-- Verificación
-- ============================================================================
SELECT tipo, COUNT(*) as cantidad FROM cuentas_contables GROUP BY tipo ORDER BY tipo;
