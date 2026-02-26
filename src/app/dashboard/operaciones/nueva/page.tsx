import { createClient } from "@/lib/supabase/server";
import { crearOperacion } from "@/lib/actions/transcana";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NuevaOperacionPage() {
  const supabase = createClient();
  const { data: parcelas } = await supabase.from("parcelas").select("id, nombre, codigo").order("nombre");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/operaciones" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Nueva Operación de Campo</h1>
      </div>

      <form action={crearOperacion} className="max-w-2xl space-y-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Tipo *</label>
              <select name="tipo" required className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="corte">Corte</option>
                <option value="alce">Alce</option>
                <option value="transporte">Transporte</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Parcela</label>
              <select name="parcela_id" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar...</option>
                {(parcelas ?? []).map((p) => (
                  <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Fecha</label>
              <input name="fecha" type="datetime-local" defaultValue={new Date().toISOString().slice(0, 16)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Turno</label>
              <select name="turno" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="diurno">Diurno</option>
                <option value="nocturno">Nocturno</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Cuadrilla</label>
              <input name="cuadrilla" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Toneladas</label>
              <input name="toneladas" type="number" step="0.1" min="0" defaultValue="0" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Hectáreas Trabajadas</label>
              <input name="hectareas_trabajadas" type="number" step="0.1" min="0" defaultValue="0" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Chofer</label>
              <input name="chofer" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Origen</label>
              <input name="origen" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Destino</label>
              <input name="destino" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Estado</label>
            <select name="estado" defaultValue="en_proceso" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="programada">Programada</option>
              <option value="en_proceso">En Proceso</option>
              <option value="completada">Completada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Observaciones</label>
            <textarea name="observaciones" rows={3} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors">
          Crear Operación
        </button>
      </form>
    </div>
  );
}
