import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";

const estadoColors: Record<string, string> = {
  planificada: "bg-slate-700 text-slate-300",
  activa: "bg-green-900/50 text-green-400",
  pausada: "bg-yellow-900/50 text-yellow-400",
  completada: "bg-blue-900/50 text-blue-400",
  cancelada: "bg-red-900/50 text-red-400",
};

export default async function ZafraDetallePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: zafra } = await supabase.from("zafras").select("*").eq("id", params.id).single();
  if (!zafra) notFound();

  const { data: metas } = await supabase
    .from("metas_zafra")
    .select("*, parcelas(nombre)")
    .eq("zafra_id", params.id)
    .order("semana", { ascending: true });

  const avance = Number(zafra.meta_toneladas) > 0
    ? ((Number(zafra.toneladas_procesadas) / Number(zafra.meta_toneladas)) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/zafra" className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <CalendarDays className="w-6 h-6 text-amber-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">{zafra.nombre}</h1>
          <p className="text-slate-400">{zafra.codigo}</p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-xs ${estadoColors[zafra.estado] ?? ""}`}>
          {zafra.estado}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Meta Toneladas</p>
          <p className="text-xl font-bold text-white mt-1">{Number(zafra.meta_toneladas).toLocaleString("es-MX")}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Procesado</p>
          <p className="text-xl font-bold text-green-400 mt-1">{Number(zafra.toneladas_procesadas).toLocaleString("es-MX")}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Meta Hectáreas</p>
          <p className="text-xl font-bold text-cyan-400 mt-1">{Number(zafra.meta_hectareas).toLocaleString("es-MX")}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Avance</p>
          <p className="text-xl font-bold text-amber-400 mt-1">{avance}%</p>
          <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
            <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${Math.min(100, Number(avance))}%` }} />
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 grid grid-cols-2 gap-4 text-sm">
        <div><span className="text-slate-500">Fecha Inicio:</span> <span className="text-white ml-2">{new Date(zafra.fecha_inicio).toLocaleDateString("es-MX")}</span></div>
        <div><span className="text-slate-500">Fecha Fin:</span> <span className="text-white ml-2">{zafra.fecha_fin ? new Date(zafra.fecha_fin).toLocaleDateString("es-MX") : "-"}</span></div>
        <div><span className="text-slate-500">Rendimiento Promedio:</span> <span className="text-white ml-2">{Number(zafra.rendimiento_promedio).toFixed(2)} ton/ha</span></div>
        {zafra.notas && <div className="col-span-2"><span className="text-slate-500">Notas:</span> <span className="text-white ml-2">{zafra.notas}</span></div>}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Metas Semanales</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Semana</th>
                <th className="px-4 py-3">Parcela</th>
                <th className="px-4 py-3 text-right">Meta (Ton)</th>
                <th className="px-4 py-3 text-right">Real (Ton)</th>
                <th className="px-4 py-3 text-right">Cumplimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {(metas ?? []).map((m) => {
                const parcela = (m as Record<string, unknown>).parcelas as { nombre: string } | null;
                return (
                  <tr key={m.id} className="text-slate-300 hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium text-white">S{m.semana}</td>
                    <td className="px-4 py-3">{parcela?.nombre ?? "General"}</td>
                    <td className="px-4 py-3 text-right">{Number(m.meta_toneladas).toLocaleString("es-MX")}</td>
                    <td className="px-4 py-3 text-right font-medium">{Number(m.toneladas_real).toLocaleString("es-MX")}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={Number(m.cumplimiento_porcentaje) >= 90 ? "text-green-400" : Number(m.cumplimiento_porcentaje) >= 70 ? "text-yellow-400" : "text-red-400"}>
                        {Number(m.cumplimiento_porcentaje).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {(metas ?? []).length === 0 && (
            <p className="text-center text-slate-500 py-8">No hay metas registradas para esta zafra</p>
          )}
        </div>
      </div>
    </div>
  );
}
