import { createClient } from "@/lib/supabase/server";
import { crearDespachoCombustible } from "@/lib/actions/transcana";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NuevoDespachePage() {
  const supabase = createClient();
  const { data: vehiculos } = await supabase.from("vehiculos").select("id, placa, tipo").order("placa");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/combustible" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Nuevo Despacho de Combustible</h1>
      </div>

      <form action={crearDespachoCombustible} className="max-w-2xl space-y-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Placa Vehículo *</label>
              <input name="vehiculo_placa" required placeholder="ABC-123" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Vehículo (registro)</label>
              <select name="vehiculo_id" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar...</option>
                {(vehiculos ?? []).map((v) => (
                  <option key={v.id} value={v.id}>{v.placa} ({v.tipo})</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Tipo Combustible *</label>
            <select name="tipo_combustible" required className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="diesel">Diésel</option>
              <option value="gasolina_90">Gasolina 90</option>
              <option value="gasolina_95">Gasolina 95</option>
              <option value="glp">GLP</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Galones *</label>
              <input name="galones" type="number" step="0.01" min="0" required className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Precio/Galón *</label>
              <input name="precio_galon" type="number" step="0.01" min="0" required className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Kilometraje</label>
              <input name="kilometraje" type="number" min="0" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Operador</label>
              <input name="operador" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Estación</label>
              <input name="estacion" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors">Registrar Despacho</button>
      </form>
    </div>
  );
}
