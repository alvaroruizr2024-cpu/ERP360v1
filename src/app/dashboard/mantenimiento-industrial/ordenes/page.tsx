import { createClient } from "@/lib/supabase/server";
import { Pagination } from "@/components/ui/pagination";
import { AdvancedFilters } from "@/components/ui/advanced-filters";
import Link from "next/link";
import { Plus, ArrowLeft, ClipboardList } from "lucide-react";

const PAGE_SIZE = 15;

const estadoColors: Record<string, string> = {
  abierta: "bg-blue-900/50 text-blue-400",
  asignada: "bg-indigo-900/50 text-indigo-400",
  en_progreso: "bg-yellow-900/50 text-yellow-400",
  en_espera: "bg-orange-900/50 text-orange-400",
  completada: "bg-green-900/50 text-green-400",
  cerrada: "bg-slate-700 text-slate-300",
  cancelada: "bg-red-900/50 text-red-400",
};

const prioridadColors: Record<string, string> = {
  critica: "bg-red-900/50 text-red-400",
  alta: "bg-orange-900/50 text-orange-400",
  media: "bg-yellow-900/50 text-yellow-400",
  baja: "bg-green-900/50 text-green-400",
};

export default async function OrdenesTrabajoPage({
  searchParams,
}: {
  searchParams: { page?: string; estado?: string; tipo?: string; prioridad?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const supabase = createClient();

  let query = supabase.from("ordenes_trabajo").select("*, equipos_industriales(codigo, nombre, area)", { count: "exact" });
  if (searchParams.estado) query = query.eq("estado", searchParams.estado);
  if (searchParams.tipo) query = query.eq("tipo", searchParams.tipo);
  if (searchParams.prioridad) query = query.eq("prioridad", searchParams.prioridad);

  const from = (page - 1) * PAGE_SIZE;
  const { data: ordenes, count } = await query.order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);

  const { data: allOT } = await supabase.from("ordenes_trabajo").select("costo_total, estado, prioridad");
  const all = allOT ?? [];
  const abiertas = all.filter((o) => !["completada", "cerrada", "cancelada"].includes(o.estado)).length;
  const totalCosto = all.reduce((s, o) => s + Number(o.costo_total), 0);
  const criticas = all.filter((o) => o.prioridad === "critica" && !["completada", "cerrada", "cancelada"].includes(o.estado)).length;

  const filterConfig = [
    {
      key: "tipo", label: "Tipo", type: "select" as const,
      options: [
        { value: "preventivo", label: "Preventivo" },
        { value: "correctivo", label: "Correctivo" },
        { value: "predictivo", label: "Predictivo" },
        { value: "emergencia", label: "Emergencia" },
        { value: "mejora", label: "Mejora" },
      ],
    },
    {
      key: "prioridad", label: "Prioridad", type: "select" as const,
      options: [
        { value: "critica", label: "Crítica" },
        { value: "alta", label: "Alta" },
        { value: "media", label: "Media" },
        { value: "baja", label: "Baja" },
      ],
    },
    {
      key: "estado", label: "Estado", type: "select" as const,
      options: [
        { value: "abierta", label: "Abierta" },
        { value: "en_progreso", label: "En Progreso" },
        { value: "completada", label: "Completada" },
        { value: "cerrada", label: "Cerrada" },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/mantenimiento-industrial" className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
          <ClipboardList className="w-7 h-7 text-orange-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Órdenes de Trabajo</h1>
            <p className="text-slate-400 mt-1">Mantenimiento preventivo, correctivo y predictivo</p>
          </div>
        </div>
        <Link href="/dashboard/mantenimiento-industrial/ordenes/nueva" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors">
          <Plus className="w-4 h-4" />
          Nueva Orden
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Total OT</p>
          <p className="text-2xl font-bold text-white mt-1">{count ?? 0}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Abiertas</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{abiertas}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Críticas Pendientes</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{criticas}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Costo Total</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">Q{totalCosto.toLocaleString("es-MX")}</p>
        </div>
      </div>

      <AdvancedFilters filters={filterConfig} />

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Equipo</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Prioridad</th>
              <th className="px-4 py-3">Técnico</th>
              <th className="px-4 py-3 text-right">Costo</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {(ordenes ?? []).map((o) => {
              const equipo = (o as Record<string, unknown>).equipos_industriales as { codigo: string; nombre: string } | null;
              return (
                <tr key={o.id} className="text-slate-300 hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-white">#{o.numero}</td>
                  <td className="px-4 py-3">{o.titulo}</td>
                  <td className="px-4 py-3 text-xs">{equipo ? `${equipo.codigo} - ${equipo.nombre}` : "-"}</td>
                  <td className="px-4 py-3 capitalize">{o.tipo}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${prioridadColors[o.prioridad] ?? ""}`}>{o.prioridad}</span>
                  </td>
                  <td className="px-4 py-3">{o.tecnico_asignado ?? "-"}</td>
                  <td className="px-4 py-3 text-right">Q{Number(o.costo_total).toLocaleString("es-MX")}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${estadoColors[o.estado] ?? ""}`}>{o.estado}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(ordenes ?? []).length === 0 && <p className="text-center text-slate-500 py-8">No hay órdenes de trabajo registradas</p>}
      </div>

      <Pagination totalItems={count ?? 0} pageSize={PAGE_SIZE} currentPage={page} />
    </div>
  );
}
