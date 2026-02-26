import { createClient } from "@/lib/supabase/server";
import { crearAnalisis } from "@/lib/actions/laboratorio";
import Link from "next/link";
import { ArrowLeft, FlaskConical } from "lucide-react";

export default async function AnalisisPage() {
  const supabase = createClient();
  const { data: muestras } = await supabase
    .from("muestras_laboratorio")
    .select("id, codigo_muestra, tipo_muestra")
    .in("estado", ["pendiente", "en_analisis"])
    .order("created_at", { ascending: false });

  const { data: analisis } = await supabase
    .from("analisis_calidad")
    .select("*, muestras_laboratorio(codigo_muestra, tipo_muestra)")
    .order("created_at", { ascending: false })
    .limit(20);

  const calColors: Record<string, string> = {
    A: "bg-green-900/50 text-green-400",
    B: "bg-blue-900/50 text-blue-400",
    C: "bg-yellow-900/50 text-yellow-400",
    D: "bg-red-900/50 text-red-400",
    rechazado: "bg-red-900/50 text-red-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/laboratorio" className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
        <FlaskConical className="w-6 h-6 text-emerald-400" />
        <h1 className="text-2xl font-bold text-white">Registro de Análisis de Calidad</h1>
      </div>

      <form action={crearAnalisis} className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Nuevo Análisis</h2>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Muestra *</label>
          <select name="muestra_id" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
            <option value="">Seleccionar muestra...</option>
            {(muestras ?? []).map((m) => <option key={m.id} value={m.id}>{m.codigo_muestra} ({m.tipo_muestra})</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Brix (%)</label>
            <input type="number" step="0.01" name="brix" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="18.5" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Pol (%)</label>
            <input type="number" step="0.01" name="pol" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="15.2" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Fibra (%)</label>
            <input type="number" step="0.01" name="fibra" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="13.5" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Humedad (%)</label>
            <input type="number" step="0.01" name="humedad" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">pH</label>
            <input type="number" step="0.01" name="ph" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Cenizas (%)</label>
            <input type="number" step="0.01" name="cenizas" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Color ICUMSA</label>
            <input type="number" step="0.01" name="color_icumsa" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Sacarosa (%)</label>
            <input type="number" step="0.01" name="sacarosa" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Azúcares Reductores (%)</label>
            <input type="number" step="0.01" name="azucares_reductores" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Analista</label>
            <input name="analista" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Notas</label>
          <textarea name="notas" rows={2} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500">Registrar Análisis</button>
        </div>
      </form>

      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Análisis Recientes</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Muestra</th>
                <th className="px-4 py-3 text-right">Brix</th>
                <th className="px-4 py-3 text-right">Pol</th>
                <th className="px-4 py-3 text-right">Pureza</th>
                <th className="px-4 py-3 text-right">Fibra</th>
                <th className="px-4 py-3 text-right">Rend. Est.</th>
                <th className="px-4 py-3">Calif.</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {(analisis ?? []).map((a) => {
                const muestra = (a as Record<string, unknown>).muestras_laboratorio as { codigo_muestra: string; tipo_muestra: string } | null;
                return (
                  <tr key={a.id} className="text-slate-300 hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium text-white">{muestra?.codigo_muestra}</td>
                    <td className="px-4 py-3 text-right">{Number(a.brix).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">{Number(a.pol).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">{Number(a.pureza).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-right">{Number(a.fibra).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-medium">{Number(a.rendimiento_estimado).toFixed(2)}%</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${calColors[a.calificacion] ?? ""}`}>{a.calificacion}</span>
                    </td>
                    <td className="px-4 py-3">{new Date(a.fecha_analisis).toLocaleDateString("es-MX")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {(analisis ?? []).length === 0 && <p className="text-center text-slate-500 py-8">No hay análisis registrados</p>}
        </div>
      </div>
    </div>
  );
}
