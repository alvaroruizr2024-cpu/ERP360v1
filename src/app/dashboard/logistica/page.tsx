import { createClient } from "@/lib/supabase/server";
import { Pagination } from "@/components/ui/pagination";
import { AdvancedFilters } from "@/components/ui/advanced-filters";
import Link from "next/link";
import { Plus, Route, MapPin } from "lucide-react";

const PAGE_SIZE = 15;

const tipoColors: Record<string, string> = {
  cana: "bg-green-900/50 text-green-400",
  insumos: "bg-blue-900/50 text-blue-400",
  producto_terminado: "bg-purple-900/50 text-purple-400",
  personal: "bg-yellow-900/50 text-yellow-400",
};

const estadoColors: Record<string, string> = {
  activa: "bg-green-900/50 text-green-400",
  inactiva: "bg-slate-700 text-slate-300",
  en_revision: "bg-yellow-900/50 text-yellow-400",
};

export default async function LogisticaPage({
  searchParams,
}: {
  searchParams: { page?: string; tipo?: string; estado?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const supabase = createClient();

  let query = supabase.from("rutas_transporte").select("*", { count: "exact" });
  if (searchParams.tipo) query = query.eq("tipo", searchParams.tipo);
  if (searchParams.estado) query = query.eq("estado", searchParams.estado);

  const from = (page - 1) * PAGE_SIZE;
  const { data: rutas, count } = await query.order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);

  const { data: allRutas } = await supabase.from("rutas_transporte").select("distancia_km, estado");
  const items = allRutas ?? [];
  const totalKm = items.reduce((s, r) => s + Number(r.distancia_km), 0);
  const activas = items.filter((r) => r.estado === "activa").length;

  const { data: viajesCount } = await supabase.from("viajes").select("id", { count: "exact", head: true });

  const filterConfig = [
    {
      key: "tipo", label: "Tipo", type: "select" as const,
      options: [
        { value: "cana", label: "Caña" },
        { value: "insumos", label: "Insumos" },
        { value: "producto_terminado", label: "Producto Terminado" },
        { value: "personal", label: "Personal" },
      ],
    },
    {
      key: "estado", label: "Estado", type: "select" as const,
      options: [
        { value: "activa", label: "Activa" },
        { value: "inactiva", label: "Inactiva" },
        { value: "en_revision", label: "En Revisión" },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Route className="w-7 h-7 text-indigo-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Logística Avanzada</h1>
            <p className="text-slate-400 mt-1">Rutas de transporte, viajes y seguimiento GPS</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/logistica/viajes" className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-600 transition-colors">
            <MapPin className="w-4 h-4" />
            Viajes
          </Link>
          <Link href="/dashboard/logistica/nueva-ruta" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors">
            <Plus className="w-4 h-4" />
            Nueva Ruta
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Total Rutas</p>
          <p className="text-2xl font-bold text-white mt-1">{count ?? 0}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Rutas Activas</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{activas}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Km Totales</p>
          <p className="text-2xl font-bold text-indigo-400 mt-1">{totalKm.toLocaleString("es-MX")}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Viajes Registrados</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">{viajesCount?.length ?? 0}</p>
        </div>
      </div>

      <AdvancedFilters filters={filterConfig} />

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Origen</th>
              <th className="px-4 py-3">Destino</th>
              <th className="px-4 py-3 text-right">Distancia (km)</th>
              <th className="px-4 py-3 text-right">Tiempo Est.</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {(rutas ?? []).map((r) => (
              <tr key={r.id} className="text-slate-300 hover:bg-slate-800/50">
                <td className="px-4 py-3 font-medium text-white">{r.codigo}</td>
                <td className="px-4 py-3">{r.nombre}</td>
                <td className="px-4 py-3">{r.origen}</td>
                <td className="px-4 py-3">{r.destino}</td>
                <td className="px-4 py-3 text-right font-medium">{Number(r.distancia_km).toFixed(1)}</td>
                <td className="px-4 py-3 text-right">{r.tiempo_estimado_min} min</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${tipoColors[r.tipo] ?? ""}`}>{r.tipo}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${estadoColors[r.estado] ?? ""}`}>{r.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(rutas ?? []).length === 0 && <p className="text-center text-slate-500 py-8">No hay rutas registradas</p>}
      </div>

      <Pagination totalItems={count ?? 0} pageSize={PAGE_SIZE} currentPage={page} />
    </div>
  );
}
