import { createClient } from "@/lib/supabase/server";
import { crearMantenimiento } from "@/lib/actions/transcana";
import Link from "next/link";
import { ArrowLeft, Wrench } from "lucide-react";

const tipoColors: Record<string, string> = { preventivo: "bg-blue-900/50 text-blue-400", correctivo: "bg-yellow-900/50 text-yellow-400", emergencia: "bg-red-900/50 text-red-400" };
const estadoColors: Record<string, string> = { programado: "bg-slate-700 text-slate-300", en_proceso: "bg-yellow-900/50 text-yellow-400", completado: "bg-green-900/50 text-green-400" };

export default async function MantenimientoPage() {
  const supabase = createClient();
  const { data: mantenimientos } = await supabase.from("mantenimientos").select("*, vehiculos(placa, tipo)").order("fecha", { ascending: false });
  const { data: vehiculos } = await supabase.from("vehiculos").select("id, placa, tipo").order("placa");

  const totalCosto = (mantenimientos ?? []).reduce((s, m) => s + Number(m.costo), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/flota" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Wrench className="w-6 h-6 text-yellow-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Mantenimientos</h1>
            <p className="text-slate-400 mt-1">{(mantenimientos ?? []).length} registros &middot; ${totalCosto.toLocaleString("es-MX", { minimumFractionDigits: 2 })} total</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Vehículo</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3 text-right">Costo</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {(mantenimientos ?? []).map((m) => {
                const v = (m as Record<string, unknown>).vehiculos as { placa: string; tipo: string } | null;
                return (
                  <tr key={m.id} className="text-slate-300 hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono text-white">{v?.placa ?? "-"}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${tipoColors[m.tipo] ?? ""}`}>{m.tipo}</span></td>
                    <td className="px-4 py-3">{m.descripcion}</td>
                    <td className="px-4 py-3 text-xs">{new Date(m.fecha).toLocaleDateString("es-MX")}</td>
                    <td className="px-4 py-3 text-right font-medium">${Number(m.costo).toFixed(2)}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${estadoColors[m.estado] ?? ""}`}>{m.estado}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {(mantenimientos ?? []).length === 0 && <p className="text-center text-slate-500 py-8">Sin mantenimientos</p>}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Nuevo Mantenimiento</h3>
          <form action={crearMantenimiento} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Vehículo *</label>
              <select name="vehiculo_id" required className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar...</option>
                {(vehiculos ?? []).map((v) => (
                  <option key={v.id} value={v.id}>{v.placa} ({v.tipo})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Tipo *</label>
              <select name="tipo" required className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="preventivo">Preventivo</option>
                <option value="correctivo">Correctivo</option>
                <option value="emergencia">Emergencia</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Descripción *</label>
              <textarea name="descripcion" required rows={2} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Fecha</label>
                <input name="fecha" type="date" defaultValue={new Date().toISOString().split("T")[0]} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Costo</label>
                <input name="costo" type="number" step="0.01" min="0" defaultValue="0" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Taller</label>
              <input name="taller" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors">Registrar Mantenimiento</button>
          </form>
        </div>
      </div>
    </div>
  );
}
