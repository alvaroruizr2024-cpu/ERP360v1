import { createClient } from "@/lib/supabase/server";
import { Pagination } from "@/components/ui/pagination";
import { AdvancedFilters } from "@/components/ui/advanced-filters";
import Link from "next/link";
import { Plus, CalendarDays, Target } from "lucide-react";

const PAGE_SIZE = 15;

const estadoColors: Record<string, string> = {
  planificada: "bg-slate-700 text-slate-300",
  activa: "bg-green-900/50 text-green-400",
  pausada: "bg-yellow-900/50 text-yellow-400",
  completada: "bg-blue-900/50 text-blue-400",
  cancelada: "bg-red-900/50 text-red-400",
};

export default async function ZafraPage({
  searchParams,
}: {
  searchParams: { page?: string; estado?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const estado = searchParams.estado || "";
  const supabase = createClient();

  let query = supabase.from("zafras").select("*", { count: "exact" });
  if (estado) query = query.eq("estado", estado);

  const from = (page - 1) * PAGE_SIZE;
  const { data: zafras, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  const items = zafras ?? [];
  const totalMeta = items.reduce((s, z) => s + Number(z.meta_toneladas), 0);
  const totalProcesado = items.reduce((s, z) => s + Number(z.toneladas_procesadas), 0);
  const activas = items.filter((z) => z.estado === "activa").length;
  const cumplimiento = totalMeta > 0 ? ((totalProcesado / totalMeta) * 100).toFixed(1) : "0";

  const filterConfig = [
    {
      key: "estado",
      label: "Estado",
      type: "select" as const,
      options: [
        { value: "planificada", label: "Planificada" },
        { value: "activa", label: "Activa" },
        { value: "pausada", label: "Pausada" },
        { value: "completada", label: "Completada" },
        { value: "cancelada", label: "Cancelada" },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-7 h-7 text-amber-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Planificación de Zafra</h1>
            <p className="text-slate-400 mt-1">Campañas de cosecha, metas y seguimiento</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/zafra/metas"
            className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-600 transition-colors"
          >
            <Target className="w-4 h-4" />
            Metas
          </Link>
          <Link
            href="/dashboard/zafra/nueva"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Zafra
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Total Campañas</p>
          <p className="text-2xl font-bold text-white mt-1">{count ?? 0}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Activas</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{activas}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Meta (Ton)</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{totalMeta.toLocaleString("es-MX")}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Cumplimiento</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">{cumplimiento}%</p>
        </div>
      </div>

      <AdvancedFilters filters={filterConfig} />

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Inicio</th>
              <th className="px-4 py-3">Fin</th>
              <th className="px-4 py-3 text-right">Meta (Ton)</th>
              <th className="px-4 py-3 text-right">Procesado</th>
              <th className="px-4 py-3 text-right">Avance</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {items.map((z) => {
              const avance = Number(z.meta_toneladas) > 0
                ? ((Number(z.toneladas_procesadas) / Number(z.meta_toneladas)) * 100).toFixed(1)
                : "0";
              return (
                <tr key={z.id} className="text-slate-300 hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/zafra/${z.id}`} className="font-medium text-white hover:text-blue-400">
                      {z.codigo}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{z.nombre}</td>
                  <td className="px-4 py-3">{new Date(z.fecha_inicio).toLocaleDateString("es-MX")}</td>
                  <td className="px-4 py-3">{z.fecha_fin ? new Date(z.fecha_fin).toLocaleDateString("es-MX") : "-"}</td>
                  <td className="px-4 py-3 text-right font-medium">{Number(z.meta_toneladas).toLocaleString("es-MX")}</td>
                  <td className="px-4 py-3 text-right">{Number(z.toneladas_procesadas).toLocaleString("es-MX")}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-16 bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, Number(avance))}%` }}
                        />
                      </div>
                      <span className="text-xs">{avance}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${estadoColors[z.estado] ?? ""}`}>
                      {z.estado}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length === 0 && (
          <p className="text-center text-slate-500 py-8">No hay zafras registradas</p>
        )}
      </div>

      <Pagination totalItems={count ?? 0} pageSize={PAGE_SIZE} currentPage={page} />
    </div>
  );
}
