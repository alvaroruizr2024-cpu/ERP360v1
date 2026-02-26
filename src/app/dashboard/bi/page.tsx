import { createClient } from "@/lib/supabase/server";
import { BIDashboardCharts } from "@/components/bi/bi-dashboard-charts";
import { Activity, TrendingUp, AlertTriangle, Target } from "lucide-react";

export default async function BusinessIntelligencePage() {
  const supabase = createClient();

  // Aggregate KPIs from all modules
  const [
    { data: operaciones },
    { data: pesajes },
    { data: viajes },
    { data: entregas },
    { data: ordenesTrabajo },
    { data: analisisCalidad },
    { data: costos },
    { data: facturas },
    { data: zafras },
    { data: alertas },
  ] = await Promise.all([
    supabase.from("operaciones_campo").select("tipo, toneladas, hectareas_trabajadas, estado, created_at"),
    supabase.from("registros_pesaje").select("peso_neto_ajustado, estado, created_at"),
    supabase.from("viajes").select("toneladas_transportadas, costo_flete, estado, created_at"),
    supabase.from("entregas_colono").select("toneladas_netas, monto_neto, calificacion_calidad, estado, created_at"),
    supabase.from("ordenes_trabajo").select("tipo, prioridad, costo_total, estado, created_at"),
    supabase.from("analisis_calidad").select("brix, pol, pureza, rendimiento_estimado, calificacion, created_at"),
    supabase.from("registros_costo").select("monto, categoria, created_at"),
    supabase.from("facturas").select("total, estado, created_at"),
    supabase.from("zafras").select("meta_toneladas, toneladas_procesadas, estado"),
    supabase.from("alertas_sistema").select("*").eq("leida", false).order("created_at", { ascending: false }).limit(10),
  ]);

  const ops = operaciones ?? [];
  const totalToneladas = ops.reduce((s, o) => s + Number(o.toneladas), 0);
  const totalHectareas = ops.reduce((s, o) => s + Number(o.hectareas_trabajadas), 0);
  const rendimiento = totalHectareas > 0 ? (totalToneladas / totalHectareas).toFixed(1) : "0";

  const pesajesData = pesajes ?? [];
  const totalPesoNeto = pesajesData.reduce((s, p) => s + Number(p.peso_neto_ajustado), 0);

  const viajesData = viajes ?? [];
  const totalFlete = viajesData.reduce((s, v) => s + Number(v.costo_flete), 0);
  const viajesEntregados = viajesData.filter((v) => v.estado === "entregado").length;

  const entregasData = entregas ?? [];
  const totalEntregas = entregasData.reduce((s, e) => s + Number(e.monto_neto), 0);

  const otData = ordenesTrabajo ?? [];
  const otAbiertas = otData.filter((o) => !["completada", "cerrada", "cancelada"].includes(o.estado)).length;
  const otCostoTotal = otData.reduce((s, o) => s + Number(o.costo_total), 0);

  const calidadData = analisisCalidad ?? [];
  const avgPureza = calidadData.length > 0 ? (calidadData.reduce((s, a) => s + Number(a.pureza), 0) / calidadData.length).toFixed(1) : "0";
  const avgRendimiento = calidadData.length > 0 ? (calidadData.reduce((s, a) => s + Number(a.rendimiento_estimado), 0) / calidadData.length).toFixed(2) : "0";

  const costosData = costos ?? [];
  const totalCostos = costosData.reduce((s, c) => s + Number(c.monto), 0);

  const facturasData = facturas ?? [];
  const totalFacturado = facturasData.reduce((s, f) => s + Number(f.total), 0);

  const zafrasData = zafras ?? [];
  const zafraActiva = zafrasData.find((z) => z.estado === "activa");
  const cumplimientoZafra = zafraActiva && Number(zafraActiva.meta_toneladas) > 0
    ? ((Number(zafraActiva.toneladas_procesadas) / Number(zafraActiva.meta_toneladas)) * 100).toFixed(1)
    : null;

  // Chart data: operations by type
  const opsByType = ["corte", "alce", "transporte"].map((tipo) => ({
    name: tipo.charAt(0).toUpperCase() + tipo.slice(1),
    toneladas: ops.filter((o) => o.tipo === tipo).reduce((s, o) => s + Number(o.toneladas), 0),
    count: ops.filter((o) => o.tipo === tipo).length,
  }));

  // Chart data: costs by category
  const costCategories = ["mano_obra", "combustible", "mantenimiento", "insumos", "transporte", "otros"];
  const costsByCategory = costCategories.map((cat) => ({
    name: cat.replace("_", " ").charAt(0).toUpperCase() + cat.replace("_", " ").slice(1),
    monto: costosData.filter((c) => c.categoria === cat).reduce((s, c) => s + Number(c.monto), 0),
  }));

  // Chart data: quality distribution
  const calDistribution = ["A", "B", "C", "D"].map((cal) => ({
    name: `Grado ${cal}`,
    count: calidadData.filter((a) => a.calificacion === cal).length,
  }));

  // Chart data: OT by type
  const otByType = ["preventivo", "correctivo", "predictivo", "emergencia", "mejora"].map((tipo) => ({
    name: tipo.charAt(0).toUpperCase() + tipo.slice(1),
    count: otData.filter((o) => o.tipo === tipo).length,
    costo: otData.filter((o) => o.tipo === tipo).reduce((s, o) => s + Number(o.costo_total), 0),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="w-7 h-7 text-violet-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Business Intelligence</h1>
          <p className="text-slate-400 mt-1">KPIs, métricas operativas y análisis predictivo</p>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-green-900/40 to-green-900/10 border border-green-800/50 rounded-xl p-4">
          <p className="text-xs text-green-400/70 uppercase font-medium">Toneladas Totales</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{totalToneladas.toLocaleString("es-MX")}</p>
          <p className="text-xs text-slate-500 mt-1">{rendimiento} ton/ha</p>
        </div>
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-900/10 border border-blue-800/50 rounded-xl p-4">
          <p className="text-xs text-blue-400/70 uppercase font-medium">Peso Neto (Báscula)</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{totalPesoNeto.toLocaleString("es-MX")}</p>
          <p className="text-xs text-slate-500 mt-1">{pesajesData.length} pesajes</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-900/40 to-indigo-900/10 border border-indigo-800/50 rounded-xl p-4">
          <p className="text-xs text-indigo-400/70 uppercase font-medium">Fletes</p>
          <p className="text-2xl font-bold text-indigo-400 mt-1">Q{totalFlete.toLocaleString("es-MX")}</p>
          <p className="text-xs text-slate-500 mt-1">{viajesEntregados} entregados</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-900/10 border border-emerald-800/50 rounded-xl p-4">
          <p className="text-xs text-emerald-400/70 uppercase font-medium">Facturado</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">Q{totalFacturado.toLocaleString("es-MX")}</p>
          <p className="text-xs text-slate-500 mt-1">{facturasData.length} facturas</p>
        </div>
        <div className="bg-gradient-to-br from-amber-900/40 to-amber-900/10 border border-amber-800/50 rounded-xl p-4">
          <p className="text-xs text-amber-400/70 uppercase font-medium">Costos Operativos</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">Q{totalCostos.toLocaleString("es-MX")}</p>
          <p className="text-xs text-slate-500 mt-1">{costosData.length} registros</p>
        </div>
        <div className="bg-gradient-to-br from-violet-900/40 to-violet-900/10 border border-violet-800/50 rounded-xl p-4">
          <p className="text-xs text-violet-400/70 uppercase font-medium">Pureza Promedio</p>
          <p className="text-2xl font-bold text-violet-400 mt-1">{avgPureza}%</p>
          <p className="text-xs text-slate-500 mt-1">Rend: {avgRendimiento}%</p>
        </div>
      </div>

      {/* Zafra Progress */}
      {cumplimientoZafra && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Avance Zafra Activa</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-slate-700 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-amber-500 to-green-500 h-4 rounded-full transition-all"
                style={{ width: `${Math.min(100, Number(cumplimientoZafra))}%` }}
              />
            </div>
            <span className="text-xl font-bold text-white">{cumplimientoZafra}%</span>
          </div>
          <div className="flex justify-between mt-2 text-sm text-slate-400">
            <span>Procesado: {Number(zafraActiva?.toneladas_procesadas).toLocaleString("es-MX")} ton</span>
            <span>Meta: {Number(zafraActiva?.meta_toneladas).toLocaleString("es-MX")} ton</span>
          </div>
        </div>
      )}

      {/* Secondary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <h3 className="text-sm font-semibold text-white">Colonos</h3>
          </div>
          <p className="text-lg font-bold text-white">Q{totalEntregas.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-slate-500">{entregasData.length} entregas registradas</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <h3 className="text-sm font-semibold text-white">Órdenes de Trabajo</h3>
          </div>
          <p className="text-lg font-bold text-yellow-400">{otAbiertas} abiertas</p>
          <p className="text-xs text-slate-500">Costo total: Q{otCostoTotal.toLocaleString("es-MX")}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-white">Hectáreas</h3>
          </div>
          <p className="text-lg font-bold text-white">{totalHectareas.toLocaleString("es-MX")}</p>
          <p className="text-xs text-slate-500">{ops.length} operaciones de campo</p>
        </div>
      </div>

      {/* Charts */}
      <BIDashboardCharts
        opsByType={opsByType}
        costsByCategory={costsByCategory}
        calDistribution={calDistribution}
        otByType={otByType}
      />

      {/* Alerts */}
      {(alertas ?? []).length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Alertas del Sistema</h2>
          <div className="space-y-2">
            {(alertas ?? []).map((a) => (
              <div key={a.id} className={`flex items-start gap-3 p-3 rounded-lg ${a.tipo === "critica" ? "bg-red-900/20 border border-red-800/50" : a.tipo === "advertencia" ? "bg-yellow-900/20 border border-yellow-800/50" : "bg-blue-900/20 border border-blue-800/50"}`}>
                <AlertTriangle className={`w-4 h-4 mt-0.5 ${a.tipo === "critica" ? "text-red-400" : a.tipo === "advertencia" ? "text-yellow-400" : "text-blue-400"}`} />
                <div>
                  <p className="text-sm font-medium text-white">{a.titulo}</p>
                  <p className="text-xs text-slate-400">{a.mensaje}</p>
                  <p className="text-xs text-slate-500 mt-1">{a.modulo} | {new Date(a.created_at).toLocaleString("es-MX")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
