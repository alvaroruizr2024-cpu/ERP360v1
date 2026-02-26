import { createClient } from "@/lib/supabase/server";
import { crearCentroCosto } from "@/lib/actions/transcana";
import Link from "next/link";
import { ArrowLeft, Building } from "lucide-react";

const tipoColors: Record<string, string> = { operativo: "bg-green-900/50 text-green-400", administrativo: "bg-blue-900/50 text-blue-400", logistico: "bg-purple-900/50 text-purple-400" };

export default async function CentrosCostoPage() {
  const supabase = createClient();
  const { data: centros } = await supabase.from("centros_costo").select("*").order("codigo");

  const totalPresupuesto = (centros ?? []).reduce((s, c) => s + Number(c.presupuesto), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/costos" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Building className="w-6 h-6 text-emerald-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Centros de Costo</h1>
            <p className="text-slate-400 mt-1">{(centros ?? []).length} centros &middot; ${totalPresupuesto.toLocaleString("es-MX", { minimumFractionDigits: 2 })} presupuesto total</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3 text-right">Presupuesto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {(centros ?? []).map((c) => (
                <tr key={c.id} className="text-slate-300 hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-mono font-medium text-white">{c.codigo}</td>
                  <td className="px-4 py-3">{c.nombre}</td>
                  <td className="px-4 py-3">
                    {c.tipo ? <span className={`px-2 py-0.5 rounded-full text-xs ${tipoColors[c.tipo] ?? ""}`}>{c.tipo}</span> : "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">${Number(c.presupuesto).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(centros ?? []).length === 0 && <p className="text-center text-slate-500 py-8">No hay centros de costo</p>}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Nuevo Centro de Costo</h3>
          <form action={crearCentroCosto} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Código *</label>
                <input name="codigo" required placeholder="CC-001" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Nombre *</label>
                <input name="nombre" required className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Tipo</label>
                <select name="tipo" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Seleccionar...</option>
                  <option value="operativo">Operativo</option>
                  <option value="administrativo">Administrativo</option>
                  <option value="logistico">Logístico</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Presupuesto</label>
                <input name="presupuesto" type="number" step="0.01" min="0" defaultValue="0" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors">Crear Centro de Costo</button>
          </form>
        </div>
      </div>
    </div>
  );
}
