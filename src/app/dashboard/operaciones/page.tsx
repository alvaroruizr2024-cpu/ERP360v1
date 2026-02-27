import { createClient } from "@/lib/supabase/server";
import { Pagination } from "@/components/ui/pagination";
import { AdvancedFilters } from "@/components/ui/advanced-filters";
import { OperacionesCharts } from "@/components/operaciones/operaciones-charts";
import { ExportButtons } from "@/components/reportes/export-buttons";
import Link from "next/link";
import { Plus, Tractor } from "lucide-react";

const PAGE_SIZE = 15;

const tipoColors: Record<string, string> = {
  corte: "bg-green-900/50 text-green-400",
  alce: "bg-yellow-900/50 text-yellow-400",
  transporte: "bg-blue-900/50 text-blue-400",
};

const estadoColors: Record<string, string> = {
  programada: "bg-slate-700 text-slate-300",
  en_proceso: "bg-yellow-900/50 text-yellow-400",
  completada: "bg-green-900/50 text-green-400",
  cancelada: "bg-red-900/50 text-red-400",
};

export default async function OperacionesPage({
  searchParams,
}: {
  searchParams: { page?: string; tipo?: string; estado?: string; turno?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const tipo = searchParams.tipo || "";
  const estado = searchParams.estado || "";
  const turno = searchParams.turno || "";

  const supabase = createClient();

  let query = supabase.from("operaciones_campo").select("*, parcelas(nombre, codigo)", { count: "exact" });

  if (tipo) query = query.eq("tipo", tipo as "corte" | "alce" | "transporte");
  if (estado) query = query.eq("estado", estado as "programada" | "en_proceso" | "completada" | "cancelada");
  if (turno) query = query.eq("turno", turno as "diurno" | "nocturno");

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: operaciones, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  // KPIs
  const { data: allOps } = await supabase.from("operaciones_campo").select("tipo, toneladas, hectareas_trabajadas, estado");
  const ops = allOps ?? [];
  const totalToneladas = ops.reduce((s, o) => s + Number(o.toneladas), 0);
  const totalHectareas = ops.reduce((s, o) => s + Number(o.hectareas_trabajadas), 0);
  const enProceso = ops.filter((o) => o.estado === "en_proceso").length;
  const rendimiento = totalHectareas > 0 ? totalToneladas / totalHectareas : 0;

  // Chart data
  const byType = ["corte", "alce", "transporte"].map((t) => {
    const filtered = ops.filter((o) => o.tipo === t);
    return {
      name: t.charAt(0).toUpperCase() + t.slice(1),
      toneladas: filtered.reduce((s, o) => s + Number(o.toneladas), 0),
      hectareas: filtered.reduce((s, o) => s + Number(o.hectareas_trabajadas), 0),
    };
  });
  const byEstado = ["programada", "en_proceso", "completada", "cancelada"].map((e) => ({
    name: e.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    count: ops.filter((o) => o.estado === e).length,
  }));

  // Export data
  const exportHeaders = ["No.", "Tipo", "Parcela", "Fecha", "Turno", "Toneladas", "Hectáreas", "Estado"];
  const exportRows = (operaciones ?? []).map((op) => {
    const parcela = (op as Record<string, unknown>).parcelas as { nombre: string } | null;
    return [op.numero, op.tipo, parcela?.nombre ?? "-", new Date(op.fecha).toLocaleDateString("es-MX"), op.turno ?? "-", Number(op.toneladas).toFixed(1), Number(op.hectareas_trabajadas).toFixed(1), op.estado];
  });

  const filterConfig = [
    {
      key: "tipo",
      label: "Tipo",
      type: "select" as const,
      options: [
        { value: "corte", label: "Corte" },
        { value: "alce", label: "Alce" },
        { value: "transporte", label: "Transporte" },
      ],
    },
    {
      key: "estado",
      label: "Estado",
      type: "select" as const,
      options: [
        { value: "programada", label: "Programada" },
        { value: "en_proceso", label: "En Proceso" },
        { value: "completada", label: "Completada" },
        { value: "cancelada", label: "Cancelada" },
      ],
    },
    {
      key: "turno",
      label: "Turno",
      type: "select" as const,
      options: [
        { value: "diurno", label: "Diurno" },
        { value: "nocturno", label: "Nocturno" },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tractor className="w-7 h-7 text-green-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Operaciones de Campo</h1>
            <p className="text-slate-400 mt-1">Gestión de corte, alce y transporte de caña</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <ExportButtons title="Operaciones de Campo" headers={exportHeaders} rows={exportRows} filename="operaciones_campo" />
          <Link
            href="/dashboard/operaciones/parcelas"
            className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-600 transition-colors"
          >
            Parcelas
          </Link>
          <Link
            href="/dashboard/operaciones/nueva"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Operación
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Total Operaciones</p>
          <p className="text-2xl font-bold text-white mt-1">{count ?? 0}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Toneladas</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{totalToneladas.toLocaleString("es-MX", { minimumFractionDigits: 1 })}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Hectáreas</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">{totalHectareas.toLocaleString("es-MX", { minimumFractionDigits: 1 })}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">En Proceso</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{enProceso}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Rendimiento (tn/ha)</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{rendimiento.toFixed(2)}</p>
        </div>
      </div>

      <OperacionesCharts byType={byType} byEstado={byEstado} />

      <AdvancedFilters filters={filterConfig} />

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Parcela</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Turno</th>
              <th className="px-4 py-3 text-right">Toneladas</th>
              <th className="px-4 py-3 text-right">Hectáreas</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {(operaciones ?? []).map((op) => {
              const parcela = (op as Record<string, unknown>).parcelas as { nombre: string; codigo: string } | null;
              return (
                <tr key={op.id} className="text-slate-300 hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/operaciones/${op.id}`} className="font-medium text-white hover:text-blue-400">
                      #{op.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${tipoColors[op.tipo] ?? ""}`}>
                      {op.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3">{parcela?.nombre ?? "-"}</td>
                  <td className="px-4 py-3">{new Date(op.fecha).toLocaleDateString("es-MX")}</td>
                  <td className="px-4 py-3 capitalize">{op.turno ?? "-"}</td>
                  <td className="px-4 py-3 text-right font-medium">{Number(op.toneladas).toFixed(1)}</td>
                  <td className="px-4 py-3 text-right">{Number(op.hectareas_trabajadas).toFixed(1)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${estadoColors[op.estado] ?? ""}`}>
                      {op.estado}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(operaciones ?? []).length === 0 && (
          <p className="text-center text-slate-500 py-8">No hay operaciones registradas</p>
        )}
      </div>

      <Pagination totalItems={count ?? 0} pageSize={PAGE_SIZE} currentPage={page} />
    </div>
  );
}
