import { createClient } from "@/lib/supabase/server";
import { BarChart3 } from "lucide-react";
import { AnalyticsCharts } from "@/components/analytics/analytics-charts";

export default async function AnalyticsPage() {
  const supabase = createClient();

  const [opsRes, pesajeRes, combustibleRes, costosRes, parcelasRes] = await Promise.all([
    supabase.from("operaciones_campo").select("tipo, toneladas, hectareas_trabajadas, fecha, estado"),
    supabase.from("registros_pesaje").select("peso_neto, peso_neto_ajustado, fecha_hora, estado"),
    supabase.from("despachos_combustible").select("galones, total, tipo_combustible, fecha"),
    supabase.from("registros_costo").select("monto, categoria, fecha"),
    supabase.from("parcelas").select("nombre, hectareas, variedad_cana, estado"),
  ]);

  const ops = opsRes.data ?? [];
  const pesajes = pesajeRes.data ?? [];
  const combustible = combustibleRes.data ?? [];
  const costos = costosRes.data ?? [];
  const parcelas = parcelasRes.data ?? [];

  // Toneladas by operation type
  const toneladasPorTipo = ["corte", "alce", "transporte"].map((tipo) => ({
    tipo,
    toneladas: ops.filter((o) => o.tipo === tipo).reduce((s, o) => s + Number(o.toneladas), 0),
  }));

  // Costos by category
  const catLabels: Record<string, string> = {
    mano_obra: "Mano de Obra",
    combustible: "Combustible",
    mantenimiento: "Mantenimiento",
    insumos: "Insumos",
    transporte: "Transporte",
    otros: "Otros",
  };
  const costosPorCat = Object.keys(catLabels).map((cat) => ({
    categoria: catLabels[cat],
    monto: costos.filter((c) => c.categoria === cat).reduce((s, c) => s + Number(c.monto), 0),
  })).filter((c) => c.monto > 0);

  // Combustible by type
  const combPorTipo = ["diesel", "gasolina_90", "gasolina_95", "glp"].map((t) => ({
    tipo: t === "diesel" ? "Diésel" : t === "gasolina_90" ? "Gasolina 90" : t === "gasolina_95" ? "Gasolina 95" : "GLP",
    galones: combustible.filter((c) => c.tipo_combustible === t).reduce((s, c) => s + Number(c.galones), 0),
  })).filter((c) => c.galones > 0);

  // Parcelas by state
  const parcelasPorEstado = ["activa", "en_corte", "cosechada", "en_reposo"].map((e) => ({
    estado: e.replace(/_/g, " "),
    count: parcelas.filter((p) => p.estado === e).length,
    hectareas: parcelas.filter((p) => p.estado === e).reduce((s, p) => s + Number(p.hectareas), 0),
  }));

  // Summary KPIs
  const totalToneladas = ops.reduce((s, o) => s + Number(o.toneladas), 0);
  const totalPesoNeto = pesajes.reduce((s, p) => s + Number(p.peso_neto), 0);
  const totalGalones = combustible.reduce((s, c) => s + Number(c.galones), 0);
  const totalCostos = costos.reduce((s, c) => s + Number(c.monto), 0);
  const totalHectareas = parcelas.reduce((s, p) => s + Number(p.hectareas), 0);
  const rendimiento = totalHectareas > 0 ? totalToneladas / totalHectareas : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-7 h-7 text-indigo-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 mt-1">Producción, rendimiento y tendencias — TransCañaERP</p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Toneladas</p>
          <p className="text-xl font-bold text-green-400 mt-1">{totalToneladas.toLocaleString("es-MX", { minimumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Peso Neto</p>
          <p className="text-xl font-bold text-cyan-400 mt-1">{totalPesoNeto.toLocaleString("es-MX", { minimumFractionDigits: 0 })} tn</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Hectáreas</p>
          <p className="text-xl font-bold text-blue-400 mt-1">{totalHectareas.toFixed(1)}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Rendimiento tn/ha</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">{rendimiento.toFixed(2)}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Combustible</p>
          <p className="text-xl font-bold text-orange-400 mt-1">{totalGalones.toLocaleString("es-MX", { minimumFractionDigits: 0 })} gal</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Costos Total</p>
          <p className="text-xl font-bold text-red-400 mt-1">${totalCostos.toLocaleString("es-MX", { minimumFractionDigits: 0 })}</p>
        </div>
      </div>

      {/* Charts */}
      <AnalyticsCharts
        toneladasPorTipo={toneladasPorTipo}
        costosPorCategoria={costosPorCat}
        combustiblePorTipo={combPorTipo}
        parcelasPorEstado={parcelasPorEstado}
      />
    </div>
  );
}
