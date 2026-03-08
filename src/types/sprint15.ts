// ============================================================================
// TRANSCAÑA ERP - Sprint 15: Types
// Mantenimiento Preventivo de Flota (TPM) + PWA Conductor
// ============================================================================

// --- ENUMS ---

export type TipoMantenimiento = 'preventivo' | 'correctivo' | 'predictivo' | 'emergencia';

export type EstadoOrdenTrabajo =
  | 'programada' | 'en_espera_repuestos' | 'en_ejecucion'
  | 'pausada' | 'completada' | 'cancelada' | 'reprogramada';

export type PrioridadOT = 'critica' | 'alta' | 'media' | 'baja';

export type EstadoComponente = 'operativo' | 'desgastado' | 'critico' | 'fuera_servicio' | 'reemplazado';

export type TipoComponenteFlota =
  | 'llanta' | 'motor' | 'transmision' | 'frenos' | 'suspension'
  | 'sistema_electrico' | 'sistema_hidraulico' | 'carroceria'
  | 'sistema_combustible' | 'refrigeracion' | 'otro';

export type PosicionLlanta =
  | 'DI' | 'DD' | 'TII' | 'TID' | 'TDI' | 'TDD'
  | 'R1I' | 'R1D' | 'R2I' | 'R2D' | 'R3I' | 'R3D'
  | 'R4I' | 'R4D' | 'R5I' | 'R5D' | 'R6I' | 'R6D'
  | 'repuesto';

export type EstadoLlanta =
  | 'nueva' | 'en_uso' | 'reencauche_1' | 'reencauche_2' | 'reencauche_3'
  | 'baja' | 'en_reparacion' | 'en_almacen';

export type TipoCombustible = 'diesel_b5' | 'diesel_b20' | 'biodiesel' | 'gnv' | 'glp';

export type EstadoChecklist = 'pendiente' | 'aprobado' | 'rechazado' | 'con_observaciones';

export type TipoNotificacionConductor =
  | 'orden_trabajo' | 'checklist_pendiente' | 'mantenimiento_programado'
  | 'alerta_componente' | 'ruta_asignada' | 'mensaje_supervisor'
  | 'documento_vencido' | 'capacitacion';

export type EstadoDocumentoConductor = 'vigente' | 'por_vencer' | 'vencido' | 'en_tramite';

// --- INTERFACES ---

export interface PlanMantenimiento {
  id: string;
  tenant_id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: TipoMantenimiento;
  tipo_vehiculo?: string;
  frecuencia_km?: number;
  frecuencia_horas?: number;
  frecuencia_dias?: number;
  tolerancia_km: number;
  tolerancia_horas: number;
  tolerancia_dias: number;
  costo_estimado: number;
  tiempo_estimado_horas: number;
  requiere_parada: boolean;
  checklist_template: ChecklistItem[];
  repuestos_requeridos: RepuestoRequerido[];
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  categoria: string;
  item: string;
  ok?: boolean;
  observacion?: string;
  foto?: string;
  obligatorio?: boolean;
}

export interface RepuestoRequerido {
  codigo: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  costo_unitario?: number;
}

export interface ComponenteVehiculo {
  id: string;
  tenant_id: string;
  vehiculo_id: string;
  tipo: TipoComponenteFlota;
  codigo_parte?: string;
  marca?: string;
  modelo?: string;
  numero_serie?: string;
  estado: EstadoComponente;
  fecha_instalacion?: string;
  fecha_ultimo_servicio?: string;
  km_instalacion: number;
  horas_instalacion: number;
  vida_util_km?: number;
  vida_util_horas?: number;
  km_actual: number;
  horas_actual: number;
  porcentaje_desgaste: number;
  costo_adquisicion: number;
  proveedor?: string;
  garantia_hasta?: string;
  notas?: string;
  metadata: Record<string, unknown>;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ControlLlanta {
  id: string;
  componente_id: string;
  tenant_id: string;
  vehiculo_id: string;
  dot?: string;
  marca_llanta: string;
  medida: string;
  tipo_banda?: string;
  posicion?: PosicionLlanta;
  estado: EstadoLlanta;
  profundidad_cocada_mm?: number;
  profundidad_original_mm: number;
  profundidad_minima_mm: number;
  presion_recomendada_psi: number;
  presion_actual_psi?: number;
  temperatura_actual_c?: number;
  numero_reencauches: number;
  max_reencauches: number;
  km_acumulados: number;
  costo_original: number;
  costo_reencauches_acum: number;
  costo_por_km: number; // computed
  fecha_ultima_inspeccion?: string;
  proximo_reencauche_km?: number;
  historial_rotaciones: RotacionLlanta[];
  created_at: string;
  updated_at: string;
}

export interface RotacionLlanta {
  fecha: string;
  posicion_anterior: PosicionLlanta;
  posicion_nueva: PosicionLlanta;
  km_momento: number;
  motivo?: string;
}

export interface OrdenTrabajoMto {
  id: string;
  tenant_id: string;
  numero_ot: string;
  vehiculo_id: string;
  plan_id?: string;
  tipo: TipoMantenimiento;
  prioridad: PrioridadOT;
  estado: EstadoOrdenTrabajo;
  descripcion: string;
  diagnostico?: string;
  solucion_aplicada?: string;
  fecha_programada: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  km_vehiculo?: number;
  horas_motor?: number;
  tecnico_responsable?: string;
  supervisor_id?: string;
  taller_externo?: string;
  es_taller_externo: boolean;
  componentes_afectados: string[];
  repuestos_utilizados: RepuestoUtilizado[];
  mano_obra_horas: number;
  costo_repuestos: number;
  costo_mano_obra: number;
  costo_taller_externo: number;
  costo_total: number; // computed
  checklist_completado: ChecklistItem[];
  fotos_antes: string[];
  fotos_despues: string[];
  observaciones?: string;
  aprobado_por?: string;
  fecha_aprobacion?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Relations
  vehiculo?: { placa: string; tipo_vehiculo: string };
  plan?: PlanMantenimiento;
  tecnico?: { nombre: string };
}

export interface RepuestoUtilizado {
  codigo: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  costo_unitario: number;
  costo_total: number;
}

export interface CargaCombustible {
  id: string;
  tenant_id: string;
  vehiculo_id: string;
  conductor_id?: string;
  fecha_carga: string;
  tipo_combustible: TipoCombustible;
  estacion_servicio?: string;
  km_odometro: number;
  galones: number;
  precio_galon: number;
  monto_total: number; // computed
  km_recorridos?: number;
  rendimiento_km_galon?: number;
  comprobante_numero?: string;
  comprobante_tipo?: string;
  foto_odometro?: string;
  foto_comprobante?: string;
  latitud?: number;
  longitud?: number;
  validado: boolean;
  validado_por?: string;
  observaciones?: string;
  created_at: string;
  // Relations
  vehiculo?: { placa: string };
  conductor?: { nombre: string };
}

export interface ChecklistPreoperativo {
  id: string;
  tenant_id: string;
  vehiculo_id: string;
  conductor_id: string;
  fecha: string;
  turno?: string;
  km_odometro?: number;
  estado: EstadoChecklist;
  items: ChecklistItem[];
  items_ok: number;
  items_total: number;
  items_fallidos: number;
  porcentaje_cumplimiento: number;
  firma_conductor?: string;
  foto_vehiculo?: string;
  observaciones_generales?: string;
  revisado_por?: string;
  fecha_revision?: string;
  observaciones_supervisor?: string;
  latitud?: number;
  longitud?: number;
  created_at: string;
  // Relations
  vehiculo?: { placa: string };
  conductor?: { nombre: string };
}

export interface DocumentoConductor {
  id: string;
  tenant_id: string;
  conductor_id: string;
  tipo_documento: string;
  numero_documento?: string;
  fecha_emision?: string;
  fecha_vencimiento?: string;
  estado: EstadoDocumentoConductor;
  archivo_url?: string;
  entidad_emisora?: string;
  categoria?: string;
  alertas_enviadas: number;
  notas?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificacionConductor {
  id: string;
  tenant_id: string;
  conductor_id: string;
  tipo: TipoNotificacionConductor;
  titulo: string;
  mensaje: string;
  datos_extra: Record<string, unknown>;
  leida: boolean;
  fecha_lectura?: string;
  prioridad: PrioridadOT;
  accion_url?: string;
  created_at: string;
}

export interface JornadaConductor {
  id: string;
  tenant_id: string;
  conductor_id: string;
  vehiculo_id?: string;
  fecha: string;
  hora_inicio?: string;
  hora_fin?: string;
  km_inicio?: number;
  km_fin?: number;
  km_recorridos?: number; // computed
  viajes_completados: number;
  toneladas_transportadas: number;
  horas_efectivas?: number;
  horas_espera: number;
  incidentes: number;
  checklist_id?: string;
  calificacion_jornada?: number;
  observaciones?: string;
  latitud_inicio?: number;
  longitud_inicio?: number;
  latitud_fin?: number;
  longitud_fin?: number;
  created_at: string;
  updated_at: string;
}

export interface AlertaMantenimiento {
  id: string;
  tenant_id: string;
  vehiculo_id: string;
  componente_id?: string;
  plan_id?: string;
  tipo_alerta: string;
  severidad: PrioridadOT;
  titulo: string;
  descripcion?: string;
  valor_actual?: number;
  valor_limite?: number;
  porcentaje_alcanzado?: number;
  resuelta: boolean;
  resuelta_por?: string;
  fecha_resolucion?: string;
  ot_generada?: string;
  auto_generada: boolean;
  created_at: string;
  // Relations
  vehiculo?: { placa: string };
  componente?: ComponenteVehiculo;
}

export interface InspeccionLlanta {
  id: string;
  llanta_id: string;
  tenant_id: string;
  vehiculo_id: string;
  inspector_id?: string;
  fecha_inspeccion: string;
  profundidad_cocada_mm?: number;
  presion_psi?: number;
  temperatura_c?: number;
  desgaste_irregular: boolean;
  tipo_desgaste?: string;
  danos_visibles?: string;
  requiere_rotacion: boolean;
  requiere_reencauche: boolean;
  requiere_baja: boolean;
  fotos: string[];
  observaciones?: string;
  created_at: string;
}

// --- KPI Types ---

export interface KPIFlota {
  total_vehiculos: number;
  vehiculos_operativos: number;
  vehiculos_en_taller: number;
  ot_pendientes: number;
  ot_completadas_periodo: number;
  costo_mto_periodo: number;
  rendimiento_promedio_kmgl: number;
  gasto_combustible_periodo: number;
  llantas_criticas: number;
  alertas_activas: number;
  checklist_cumplimiento: number;
  docs_por_vencer: number;
}

export interface ResumenJornada {
  dias_trabajados: number;
  km_totales: number;
  viajes_totales: number;
  toneladas_totales: number;
  horas_efectivas: number;
  horas_espera: number;
  eficiencia: number;
  calificacion_promedio: number;
  incidentes_totales: number;
}

export interface ProyeccionLlanta {
  llanta_id: string;
  vehiculo_placa: string;
  posicion: string;
  marca: string;
  profundidad_actual: number;
  profundidad_minima: number;
  km_restantes_estimados: number;
  dias_restantes_estimados: number;
  costo_km: number;
  accion_recomendada: 'BAJA INMEDIATA' | 'PROGRAMAR REENCAUCHE' | 'MONITOREAR' | 'OK';
}

export interface FlotaResumen {
  id: string;
  placa: string;
  tenant_id: string;
  tipo_vehiculo: string;
  km_actual: number;
  estado: string;
  ots_pendientes: number;
  llantas_criticas: number;
  rendimiento_30d: number;
  ultimo_checklist: string;
  alertas_activas: number;
}

// --- Form Types ---

export interface OrdenTrabajoForm {
  vehiculo_id: string;
  plan_id?: string;
  tipo: TipoMantenimiento;
  prioridad: PrioridadOT;
  descripcion: string;
  fecha_programada: string;
  tecnico_responsable?: string;
  es_taller_externo: boolean;
  taller_externo?: string;
}

export interface CargaCombustibleForm {
  vehiculo_id: string;
  conductor_id?: string;
  tipo_combustible: TipoCombustible;
  estacion_servicio?: string;
  km_odometro: number;
  galones: number;
  precio_galon: number;
  comprobante_numero?: string;
  comprobante_tipo?: string;
}

export interface ChecklistForm {
  vehiculo_id: string;
  turno: string;
  km_odometro: number;
  items: ChecklistItem[];
  observaciones_generales?: string;
}

// --- Filter Types ---

export interface FiltrosOT {
  estado?: EstadoOrdenTrabajo;
  tipo?: TipoMantenimiento;
  prioridad?: PrioridadOT;
  vehiculo_id?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface FiltrosCombustible {
  vehiculo_id?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  validado?: boolean;
}
