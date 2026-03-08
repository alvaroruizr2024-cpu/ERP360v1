// ============================================================================
// TRANSCAÑA ERP - Sprint 15: Custom Hooks
// Mantenimiento Preventivo de Flota (TPM) + PWA Conductor
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  PlanMantenimiento, ComponenteVehiculo, ControlLlanta, OrdenTrabajoMto,
  CargaCombustible, ChecklistPreoperativo, DocumentoConductor,
  NotificacionConductor, JornadaConductor, AlertaMantenimiento,
  InspeccionLlanta, KPIFlota, ResumenJornada, ProyeccionLlanta,
  FlotaResumen, FiltrosOT, FiltrosCombustible, OrdenTrabajoForm,
  CargaCombustibleForm, ChecklistForm
} from '@/types/sprint15';

const supabase = createClient();

// ============================================================================
// Hook: useTenantId
// ============================================================================
function useTenantId() {
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTenant() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('user_tenants')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();
      if (data) setTenantId(data.tenant_id);
    }
    fetchTenant();
  }, []);

  return tenantId;
}

// ============================================================================
// Hook: usePlanesMantenimiento
// ============================================================================
export function usePlanesMantenimiento() {
  const tenantId = useTenantId();
  const [planes, setPlanes] = useState<PlanMantenimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlanes = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('planes_mantenimiento')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('activo', true)
        .order('codigo');
      if (err) throw err;
      setPlanes(data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { fetchPlanes(); }, [fetchPlanes]);

  const crearPlan = async (plan: Partial<PlanMantenimiento>) => {
    const { data, error } = await supabase
      .from('planes_mantenimiento')
      .insert({ ...plan, tenant_id: tenantId })
      .select()
      .single();
    if (error) throw error;
    await fetchPlanes();
    return data;
  };

  const actualizarPlan = async (id: string, updates: Partial<PlanMantenimiento>) => {
    const { error } = await supabase
      .from('planes_mantenimiento')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    await fetchPlanes();
  };

  return { planes, loading, error, fetchPlanes, crearPlan, actualizarPlan };
}

// ============================================================================
// Hook: useComponentesVehiculo
// ============================================================================
export function useComponentesVehiculo(vehiculoId?: string) {
  const tenantId = useTenantId();
  const [componentes, setComponentes] = useState<ComponenteVehiculo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComponentes = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    let query = supabase
      .from('componentes_vehiculo')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('activo', true);

    if (vehiculoId) query = query.eq('vehiculo_id', vehiculoId);

    const { data } = await query.order('tipo');
    setComponentes(data || []);
    setLoading(false);
  }, [tenantId, vehiculoId]);

  useEffect(() => { fetchComponentes(); }, [fetchComponentes]);

  return { componentes, loading, fetchComponentes };
}

// ============================================================================
// Hook: useControlLlantas
// ============================================================================
export function useControlLlantas(vehiculoId?: string) {
  const tenantId = useTenantId();
  const [llantas, setLlantas] = useState<ControlLlanta[]>([]);
  const [proyecciones, setProyecciones] = useState<ProyeccionLlanta[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLlantas = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    let query = supabase
      .from('control_llantas')
      .select('*, componentes_vehiculo(marca, modelo)')
      .eq('tenant_id', tenantId);

    if (vehiculoId) query = query.eq('vehiculo_id', vehiculoId);

    const { data } = await query.order('posicion');
    setLlantas(data || []);
    setLoading(false);
  }, [tenantId, vehiculoId]);

  const fetchProyecciones = useCallback(async () => {
    if (!tenantId) return;
    const { data } = await supabase.rpc('fn_proyeccion_llantas', { p_tenant_id: tenantId });
    setProyecciones(data || []);
  }, [tenantId]);

  useEffect(() => {
    fetchLlantas();
    fetchProyecciones();
  }, [fetchLlantas, fetchProyecciones]);

  const registrarInspeccion = async (inspeccion: Partial<InspeccionLlanta>) => {
    const { data, error } = await supabase
      .from('inspecciones_llanta')
      .insert({ ...inspeccion, tenant_id: tenantId })
      .select()
      .single();
    if (error) throw error;

    // Actualizar llanta con nueva profundidad
    if (inspeccion.profundidad_cocada_mm && inspeccion.llanta_id) {
      await supabase.from('control_llantas').update({
        profundidad_cocada_mm: inspeccion.profundidad_cocada_mm,
        presion_actual_psi: inspeccion.presion_psi,
        temperatura_actual_c: inspeccion.temperatura_c,
        fecha_ultima_inspeccion: new Date().toISOString().split('T')[0],
      }).eq('id', inspeccion.llanta_id);
    }

    await fetchLlantas();
    return data;
  };

  return { llantas, proyecciones, loading, fetchLlantas, fetchProyecciones, registrarInspeccion };
}

// ============================================================================
// Hook: useOrdenesTrabajoMto
// ============================================================================
export function useOrdenesTrabajoMto(filtros?: FiltrosOT) {
  const tenantId = useTenantId();
  const [ordenes, setOrdenes] = useState<OrdenTrabajoMto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrdenes = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);

    let query = supabase
      .from('ordenes_trabajo_mto')
      .select(`
        *,
        vehiculo:vehiculos(placa, tipo_vehiculo),
        plan:planes_mantenimiento(codigo, nombre),
        tecnico:empleados!tecnico_responsable(nombre)
      `)
      .eq('tenant_id', tenantId);

    if (filtros?.estado) query = query.eq('estado', filtros.estado);
    if (filtros?.tipo) query = query.eq('tipo', filtros.tipo);
    if (filtros?.prioridad) query = query.eq('prioridad', filtros.prioridad);
    if (filtros?.vehiculo_id) query = query.eq('vehiculo_id', filtros.vehiculo_id);
    if (filtros?.fecha_desde) query = query.gte('fecha_programada', filtros.fecha_desde);
    if (filtros?.fecha_hasta) query = query.lte('fecha_programada', filtros.fecha_hasta);

    const { data } = await query.order('fecha_programada', { ascending: true });
    setOrdenes(data || []);
    setLoading(false);
  }, [tenantId, filtros]);

  useEffect(() => { fetchOrdenes(); }, [fetchOrdenes]);

  const crearOT = async (form: OrdenTrabajoForm) => {
    // Generar número correlativo
    const { data: last } = await supabase
      .from('ordenes_trabajo_mto')
      .select('numero_ot')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(1);

    const seq = last?.[0]
      ? parseInt(last[0].numero_ot.replace('OT-', '')) + 1
      : 1;
    const numero_ot = `OT-${String(seq).padStart(6, '0')}`;

    const { data, error } = await supabase
      .from('ordenes_trabajo_mto')
      .insert({ ...form, tenant_id: tenantId, numero_ot })
      .select()
      .single();
    if (error) throw error;
    await fetchOrdenes();
    return data;
  };

  const actualizarEstado = async (id: string, estado: string, extras?: Partial<OrdenTrabajoMto>) => {
    const updates: any = { estado, ...extras };
    if (estado === 'en_ejecucion') updates.fecha_inicio = new Date().toISOString();
    if (estado === 'completada') updates.fecha_fin = new Date().toISOString();

    const { error } = await supabase
      .from('ordenes_trabajo_mto')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    await fetchOrdenes();
  };

  const generarOTsPreventivas = async () => {
    if (!tenantId) return [];
    const { data, error } = await supabase.rpc('fn_generar_ots_preventivas', {
      p_tenant_id: tenantId,
    });
    if (error) throw error;
    await fetchOrdenes();
    return data;
  };

  return { ordenes, loading, fetchOrdenes, crearOT, actualizarEstado, generarOTsPreventivas };
}

// ============================================================================
// Hook: useCombustible
// ============================================================================
export function useCombustible(filtros?: FiltrosCombustible) {
  const tenantId = useTenantId();
  const [cargas, setCargas] = useState<CargaCombustible[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCargas = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);

    let query = supabase
      .from('cargas_combustible')
      .select('*, vehiculo:vehiculos(placa), conductor:conductores(nombre)')
      .eq('tenant_id', tenantId);

    if (filtros?.vehiculo_id) query = query.eq('vehiculo_id', filtros.vehiculo_id);
    if (filtros?.fecha_desde) query = query.gte('fecha_carga', filtros.fecha_desde);
    if (filtros?.fecha_hasta) query = query.lte('fecha_carga', filtros.fecha_hasta);
    if (filtros?.validado !== undefined) query = query.eq('validado', filtros.validado);

    const { data } = await query.order('fecha_carga', { ascending: false });
    setCargas(data || []);
    setLoading(false);
  }, [tenantId, filtros]);

  useEffect(() => { fetchCargas(); }, [fetchCargas]);

  const registrarCarga = async (form: CargaCombustibleForm) => {
    const { data, error } = await supabase
      .from('cargas_combustible')
      .insert({ ...form, tenant_id: tenantId })
      .select()
      .single();
    if (error) throw error;
    await fetchCargas();
    return data;
  };

  const validarCarga = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('cargas_combustible')
      .update({ validado: true, validado_por: user?.id })
      .eq('id', id);
    if (error) throw error;
    await fetchCargas();
  };

  return { cargas, loading, fetchCargas, registrarCarga, validarCarga };
}

// ============================================================================
// Hook: useChecklistPreoperativo
// ============================================================================
export function useChecklistPreoperativo(conductorId?: string) {
  const tenantId = useTenantId();
  const [checklists, setChecklists] = useState<ChecklistPreoperativo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChecklists = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);

    let query = supabase
      .from('checklist_preoperativo')
      .select('*, vehiculo:vehiculos(placa), conductor:conductores(nombre)')
      .eq('tenant_id', tenantId);

    if (conductorId) query = query.eq('conductor_id', conductorId);

    const { data } = await query.order('fecha', { ascending: false }).limit(50);
    setChecklists(data || []);
    setLoading(false);
  }, [tenantId, conductorId]);

  useEffect(() => { fetchChecklists(); }, [fetchChecklists]);

  const enviarChecklist = async (form: ChecklistForm) => {
    const { data: { user } } = await supabase.auth.getUser();
    // Get conductor_id from user
    const { data: conductor } = await supabase
      .from('conductores')
      .select('id')
      .eq('user_id', user?.id)
      .single();

    // Get geolocation
    let lat: number | undefined, lng: number | undefined;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      );
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
    } catch {}

    const { data, error } = await supabase
      .from('checklist_preoperativo')
      .insert({
        ...form,
        tenant_id: tenantId,
        conductor_id: conductor?.id || conductorId,
        latitud: lat,
        longitud: lng,
      })
      .select()
      .single();
    if (error) throw error;
    await fetchChecklists();
    return data;
  };

  const revisarChecklist = async (id: string, estado: string, observaciones?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('checklist_preoperativo')
      .update({
        estado,
        revisado_por: user?.id,
        fecha_revision: new Date().toISOString(),
        observaciones_supervisor: observaciones,
      })
      .eq('id', id);
    if (error) throw error;
    await fetchChecklists();
  };

  return { checklists, loading, fetchChecklists, enviarChecklist, revisarChecklist };
}

// ============================================================================
// Hook: useDocumentosConductor
// ============================================================================
export function useDocumentosConductor(conductorId?: string) {
  const tenantId = useTenantId();
  const [documentos, setDocumentos] = useState<DocumentoConductor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocumentos = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);

    let query = supabase
      .from('documentos_conductor')
      .select('*')
      .eq('tenant_id', tenantId);

    if (conductorId) query = query.eq('conductor_id', conductorId);

    const { data } = await query.order('fecha_vencimiento');
    setDocumentos(data || []);
    setLoading(false);
  }, [tenantId, conductorId]);

  useEffect(() => { fetchDocumentos(); }, [fetchDocumentos]);

  const agregarDocumento = async (doc: Partial<DocumentoConductor>) => {
    const { data, error } = await supabase
      .from('documentos_conductor')
      .insert({ ...doc, tenant_id: tenantId })
      .select()
      .single();
    if (error) throw error;
    await fetchDocumentos();
    return data;
  };

  return { documentos, loading, fetchDocumentos, agregarDocumento };
}

// ============================================================================
// Hook: useNotificacionesConductor
// ============================================================================
export function useNotificacionesConductor() {
  const tenantId = useTenantId();
  const [notificaciones, setNotificaciones] = useState<NotificacionConductor[]>([]);
  const [noLeidas, setNoLeidas] = useState(0);

  const fetchNotificaciones = useCallback(async () => {
    if (!tenantId) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data: conductor } = await supabase
      .from('conductores')
      .select('id')
      .eq('user_id', user?.id)
      .single();

    if (!conductor) return;

    const { data } = await supabase
      .from('notificaciones_conductor')
      .select('*')
      .eq('conductor_id', conductor.id)
      .order('created_at', { ascending: false })
      .limit(50);

    setNotificaciones(data || []);
    setNoLeidas(data?.filter((n: any) => !n.leida).length || 0);
  }, [tenantId]);

  useEffect(() => { fetchNotificaciones(); }, [fetchNotificaciones]);

  // Suscripción en tiempo real
  useEffect(() => {
    if (!tenantId) return;
    const channel = supabase
      .channel('notificaciones')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notificaciones_conductor',
      }, () => fetchNotificaciones())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tenantId, fetchNotificaciones]);

  const marcarLeida = async (id: string) => {
    await supabase.from('notificaciones_conductor').update({
      leida: true,
      fecha_lectura: new Date().toISOString(),
    }).eq('id', id);
    await fetchNotificaciones();
  };

  const marcarTodasLeidas = async () => {
    const ids = notificaciones.filter(n => !n.leida).map(n => n.id);
    if (ids.length === 0) return;
    await supabase.from('notificaciones_conductor').update({
      leida: true,
      fecha_lectura: new Date().toISOString(),
    }).in('id', ids);
    await fetchNotificaciones();
  };

  return { notificaciones, noLeidas, marcarLeida, marcarTodasLeidas };
}

// ============================================================================
// Hook: useJornadaConductor
// ============================================================================
export function useJornadaConductor() {
  const tenantId = useTenantId();
  const [jornada, setJornada] = useState<JornadaConductor | null>(null);
  const [historial, setHistorial] = useState<JornadaConductor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJornadaHoy = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data: conductor } = await supabase
      .from('conductores')
      .select('id')
      .eq('user_id', user?.id)
      .single();

    if (!conductor) { setLoading(false); return; }

    const hoy = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('jornada_conductor')
      .select('*')
      .eq('conductor_id', conductor.id)
      .eq('fecha', hoy)
      .single();

    setJornada(data);
    setLoading(false);
  }, [tenantId]);

  const fetchHistorial = useCallback(async (dias = 30) => {
    if (!tenantId) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data: conductor } = await supabase
      .from('conductores')
      .select('id')
      .eq('user_id', user?.id)
      .single();

    if (!conductor) return;

    const desde = new Date();
    desde.setDate(desde.getDate() - dias);

    const { data } = await supabase
      .from('jornada_conductor')
      .select('*')
      .eq('conductor_id', conductor.id)
      .gte('fecha', desde.toISOString().split('T')[0])
      .order('fecha', { ascending: false });

    setHistorial(data || []);
  }, [tenantId]);

  useEffect(() => {
    fetchJornadaHoy();
    fetchHistorial();
  }, [fetchJornadaHoy, fetchHistorial]);

  const iniciarJornada = async (vehiculoId: string, kmInicio: number, checklistId?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: conductor } = await supabase
      .from('conductores')
      .select('id')
      .eq('user_id', user?.id)
      .single();

    let lat: number | undefined, lng: number | undefined;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
    } catch {}

    const { data, error } = await supabase
      .from('jornada_conductor')
      .insert({
        tenant_id: tenantId,
        conductor_id: conductor?.id,
        vehiculo_id: vehiculoId,
        fecha: new Date().toISOString().split('T')[0],
        hora_inicio: new Date().toISOString(),
        km_inicio: kmInicio,
        checklist_id: checklistId,
        latitud_inicio: lat,
        longitud_inicio: lng,
      })
      .select()
      .single();
    if (error) throw error;
    setJornada(data);
    return data;
  };

  const finalizarJornada = async (kmFin: number, calificacion?: number, observaciones?: string) => {
    if (!jornada) return;

    let lat: number | undefined, lng: number | undefined;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
    } catch {}

    const { error } = await supabase
      .from('jornada_conductor')
      .update({
        hora_fin: new Date().toISOString(),
        km_fin: kmFin,
        calificacion_jornada: calificacion,
        observaciones,
        latitud_fin: lat,
        longitud_fin: lng,
      })
      .eq('id', jornada.id);
    if (error) throw error;
    await fetchJornadaHoy();
  };

  return { jornada, historial, loading, iniciarJornada, finalizarJornada, fetchHistorial };
}

// ============================================================================
// Hook: useAlertasMantenimiento
// ============================================================================
export function useAlertasMantenimiento() {
  const tenantId = useTenantId();
  const [alertas, setAlertas] = useState<AlertaMantenimiento[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlertas = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    const { data } = await supabase
      .from('alertas_mantenimiento')
      .select('*, vehiculo:vehiculos(placa), componente:componentes_vehiculo(tipo, marca, modelo)')
      .eq('tenant_id', tenantId)
      .eq('resuelta', false)
      .order('severidad')
      .order('created_at', { ascending: false });
    setAlertas(data || []);
    setLoading(false);
  }, [tenantId]);

  useEffect(() => { fetchAlertas(); }, [fetchAlertas]);

  const resolverAlerta = async (id: string, otId?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('alertas_mantenimiento').update({
      resuelta: true,
      resuelta_por: user?.id,
      fecha_resolucion: new Date().toISOString(),
      ot_generada: otId,
    }).eq('id', id);
    await fetchAlertas();
  };

  return { alertas, loading, fetchAlertas, resolverAlerta };
}

// ============================================================================
// Hook: useKPIFlota
// ============================================================================
export function useKPIFlota(fechaDesde?: string, fechaHasta?: string) {
  const tenantId = useTenantId();
  const [kpis, setKpis] = useState<KPIFlota | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchKPIs = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    const { data } = await supabase.rpc('fn_kpi_flota', {
      p_tenant_id: tenantId,
      p_fecha_desde: fechaDesde || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
      p_fecha_hasta: fechaHasta || new Date().toISOString().split('T')[0],
    });
    setKpis(data);
    setLoading(false);
  }, [tenantId, fechaDesde, fechaHasta]);

  useEffect(() => { fetchKPIs(); }, [fetchKPIs]);

  return { kpis, loading, fetchKPIs };
}

// ============================================================================
// Hook: useFlotaResumen
// ============================================================================
export function useFlotaResumen() {
  const tenantId = useTenantId();
  const [flota, setFlota] = useState<FlotaResumen[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFlota = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    const { data } = await supabase
      .from('v_flota_resumen')
      .select('*')
      .eq('tenant_id', tenantId);
    setFlota(data || []);
    setLoading(false);
  }, [tenantId]);

  useEffect(() => { fetchFlota(); }, [fetchFlota]);

  return { flota, loading, fetchFlota };
}
