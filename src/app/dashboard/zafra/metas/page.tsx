import { createClient } from "@/lib/supabase/server";
import { crearMetaZafra } from "@/lib/actions/zafra";
import Link from "next/link";
import { ArrowLeft, Target } from "lucide-react";

export default async function MetasZafraPage() {
  const supabase = createClient();
  const { data: zafras } = await supabase.from("zafras").select("id, codigo, nombre").order("created_at", { ascending: false });
  const { data: parcelas } = await supabase.from("parcelas").select("id, nombre, codigo").order("nombre");
  const { data: metas } = await supabase
    .from("metas_zafra")
    .select("*, zafras(nombre, codigo), parcelas(nombre)")
    .order("semana", { ascending: true })
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/zafra" className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Target className="w-6 h-6 text-amber-400" />
        <h1 className="text-2xl font-bold text-white">Metas de Zafra</h1>
      </div>

      <form action={crearMetaZafra} className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Registrar Meta Semanal</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Zafra *</label>
            <select name="zafra_id" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
              <option value="">Seleccionar...</option>
              {(zafras ?? []).map((z) => <option key={z.id} value={z.id}>{z.codigo} - {z.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Parcela</label>
            <select name="parcela_id" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
              <option value="">General</option>
              {(parcelas ?? []).map((p) => <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Semana *</label>
            <input type="number" name="semana" min="1" max="52" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Meta Toneladas</label>
            <input type="number" step="0.01" name="meta_toneladas" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Toneladas Real</label>
            <input type="number" step="0.01" name="toneladas_real" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Meta Hectáreas</label>
            <input type="number" step="0.01" name="meta_hectareas" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Observaciones</label>
          <input name="observaciones" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500">Registrar Meta</button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Zafra</th>
              <th className="px-4 py-3">Semana</th>
              <th className="px-4 py-3">Parcela</th>
              <th className="px-4 py-3 text-right">Meta (Ton)</th>
              <th className="px-4 py-3 text-right">Real (Ton)</th>
              <th className="px-4 py-3 text-right">Cumplimiento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {(metas ?? []).map((m) => {
              const zafra = (m as Record<string, unknown>).zafras as { nombre: string; codigo: string } | null;
              const parcela = (m as Record<string, unknown>).parcelas as { nombre: string } | null;
              return (
                <tr key={m.id} className="text-slate-300 hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-white">{zafra?.codigo}</td>
                  <td className="px-4 py-3">S{m.semana}</td>
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
          <p className="text-center text-slate-500 py-8">No hay metas registradas</p>
        )}
      </div>
    </div>
  );
}
