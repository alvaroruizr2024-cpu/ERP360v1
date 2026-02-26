import { createClient } from "@/lib/supabase/server";
import { crearParcela } from "@/lib/actions/transcana";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";

const estadoColors: Record<string, string> = { activa: "bg-green-900/50 text-green-400", en_corte: "bg-yellow-900/50 text-yellow-400", cosechada: "bg-blue-900/50 text-blue-400", en_reposo: "bg-slate-700 text-slate-300" };

export default async function ParcelasPage() {
  const supabase = createClient();
  const { data: parcelas } = await supabase.from("parcelas").select("*").order("codigo");

  const totalHa = (parcelas ?? []).reduce((s, p) => s + Number(p.hectareas), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/operaciones" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <MapPin className="w-6 h-6 text-green-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Parcelas</h1>
            <p className="text-slate-400 mt-1">{(parcelas ?? []).length} parcelas &middot; {totalHa.toFixed(1)} ha totales</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3 text-right">Hectáreas</th>
                <th className="px-4 py-3">Variedad</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {(parcelas ?? []).map((p) => (
                <tr key={p.id} className="text-slate-300 hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-mono font-medium text-white">{p.codigo}</td>
                  <td className="px-4 py-3">{p.nombre}</td>
                  <td className="px-4 py-3 text-right">{Number(p.hectareas).toFixed(1)}</td>
                  <td className="px-4 py-3">{p.variedad_cana ?? "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${estadoColors[p.estado] ?? ""}`}>{p.estado.replace(/_/g, " ")}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(parcelas ?? []).length === 0 && <p className="text-center text-slate-500 py-8">No hay parcelas registradas</p>}
        </div>

        {/* Form */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Nueva Parcela</h3>
          <form action={crearParcela} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Código *</label>
                <input name="codigo" required placeholder="P-001" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Nombre *</label>
                <input name="nombre" required className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Ubicación</label>
              <input name="ubicacion" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Hectáreas *</label>
                <input name="hectareas" type="number" step="0.01" min="0" required className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Variedad Caña</label>
                <input name="variedad_cana" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Fecha Siembra</label>
                <input name="fecha_siembra" type="date" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Estado</label>
                <select name="estado" defaultValue="activa" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="activa">Activa</option>
                  <option value="en_corte">En Corte</option>
                  <option value="cosechada">Cosechada</option>
                  <option value="en_reposo">En Reposo</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors">Crear Parcela</button>
          </form>
        </div>
      </div>
    </div>
  );
}
