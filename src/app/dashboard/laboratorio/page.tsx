import { createClient } from "@/lib/supabase/server";
import { Pagination } from "@/components/ui/pagination";
import { AdvancedFilters } from "@/components/ui/advanced-filters";
import Link from "next/link";
import { Plus, FlaskConical, BarChart3 } from "lucide-react";

const PAGE_SIZE = 15;

const tipoColors: Record<string, string> = {
  cana: "bg-green-900/50 text-green-400",
  jugo: "bg-yellow-900/50 text-yellow-400",
  melaza: "bg-amber-900/50 text-amber-400",
  azucar: "bg-white/10 text-white",
  bagazo: "bg-orange-900/50 text-orange-400",
  agua: "bg-blue-900/50 text-blue-400",
};

const estadoColors: Record<string, string> = {
  pendiente: "bg-slate-700 text-slate-300",
  en_analisis: "bg-yellow-900/50 text-yellow-400",
  completado: "bg-green-900/50 text-green-400",
  rechazado: "bg-red-900/50 text-red-400",
};

export default async function LaboratorioPage({
  searchParams,
}: {
  searchParams: { page?: string; tipo_muestra?: string; estado?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const supabase = createClient();

  let query = supabase.from("muestras_laboratorio").select("*, parcelas(nombre, codigo), analisis_calidad(brix, pol, pureza, fibra, rendimiento_estimado, calificacion)", { count: "exact" });
  if (searchParams.tipo_muestra) query = query.eq("tipo_muestra", searchParams.tipo_muestra);
  if (searchParams.estado) query = query.eq("estado", searchParams.estado);

  const from = (page - 1) * PAGE_SIZE;
  const { data: muestras, count } = await query.order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);

  const { data: allMuestras } = await supabase.from("muestras_laboratorio").select("estado");
  const all = allMuestras ?? [];
  const pendientes = all.filter((m) => m.estado === "pendiente").length;
  const completados = all.filter((m) => m.estado === "completado").length;

  const { data: analisisAll } = await supabase.from("analisis_calidad").select("brix, pol, rendimiento_estimado");
  const analisis = analisisAll ?? [];
  const avgBrix = analisis.length > 0 ? (analisis.reduce((s, a) => s + Number(a.brix), 0) / analisis.length).toFixed(2) : "0";

  const filterConfig = [
    {
      key: "tipo_muestra", label: "Tipo", type: "select" as const,
      options: [
        { value: "cana", label: "Caña" },
        { value: "jugo", label: "Jugo" },
        { value: "melaza", label: "Melaza" },
        { value: "azucar", label: "Azúcar" },
        { value: "bagazo", label: "Bagazo" },
        { value: "agua", label: "Agua" },
      ],
    },
    {
      key: "estado", label: "Estado", type: "select" as const,
      options: [
        { value: "pendiente", label: "Pendiente" },
        { value: "en_analisis", label: "En Análisis" },
        { value: "completado", label: "Completado" },
        { value: "rechazado", label: "Rechazado" },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FlaskConical className="w-7 h-7 text-emerald-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Laboratorio y Calidad</h1>
            <p className="text-slate-400 mt-1">Análisis de muestras, Brix, Pol, Fibra y rendimiento</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/laboratorio/analisis" className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-600 transition-colors">
            <BarChart3 className="w-4 h-4" />
            Análisis
          </Link>
          <Link href="/dashboard/laboratorio/nueva-muestra" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors">
            <Plus className="w-4 h-4" />
            Nueva Muestra
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Total Muestras</p>
          <p className="text-2xl font-bold text-white mt-1">{count ?? 0}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{pendientes}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Completados</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{completados}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Brix Promedio</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{avgBrix}%</p>
        </div>
      </div>

      <AdvancedFilters filters={filterConfig} />

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Parcela</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3 text-right">Brix</th>
              <th className="px-4 py-3 text-right">Pol</th>
              <th className="px-4 py-3 text-right">Pureza</th>
              <th className="px-4 py-3">Calif.</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {(muestras ?? []).map((m) => {
              const parcela = (m as Record<string, unknown>).parcelas as { nombre: string } | null;
              const analisisArr = (m as Record<string, unknown>).analisis_calidad as Array<{ brix: number; pol: number; pureza: number; calificacion: string }> | null;
              const a = analisisArr?.[0];
              return (
                <tr key={m.id} className="text-slate-300 hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-white">{m.codigo_muestra}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${tipoColors[m.tipo_muestra] ?? ""}`}>{m.tipo_muestra}</span>
                  </td>
                  <td className="px-4 py-3">{parcela?.nombre ?? "-"}</td>
                  <td className="px-4 py-3">{new Date(m.fecha_muestreo).toLocaleDateString("es-MX")}</td>
                  <td className="px-4 py-3 text-right font-medium">{a ? Number(a.brix).toFixed(2) : "-"}</td>
                  <td className="px-4 py-3 text-right">{a ? Number(a.pol).toFixed(2) : "-"}</td>
                  <td className="px-4 py-3 text-right">{a ? Number(a.pureza).toFixed(1) + "%" : "-"}</td>
                  <td className="px-4 py-3">
                    {a ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs ${a.calificacion === "A" ? "bg-green-900/50 text-green-400" : a.calificacion === "B" ? "bg-blue-900/50 text-blue-400" : a.calificacion === "C" ? "bg-yellow-900/50 text-yellow-400" : "bg-red-900/50 text-red-400"}`}>
                        {a.calificacion}
                      </span>
                    ) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${estadoColors[m.estado] ?? ""}`}>{m.estado}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(muestras ?? []).length === 0 && <p className="text-center text-slate-500 py-8">No hay muestras registradas</p>}
      </div>

      <Pagination totalItems={count ?? 0} pageSize={PAGE_SIZE} currentPage={page} />
    </div>
  );
}
