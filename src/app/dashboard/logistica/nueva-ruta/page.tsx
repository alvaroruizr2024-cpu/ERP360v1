import { crearRuta } from "@/lib/actions/logistica";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NuevaRutaPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/logistica" className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-white">Nueva Ruta de Transporte</h1>
      </div>

      <form action={crearRuta} className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Código *</label>
            <input name="codigo" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="RUT-001" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Nombre *</label>
            <input name="nombre" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="Parcela Norte - Ingenio" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Origen *</label>
            <input name="origen" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Destino *</label>
            <input name="destino" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Distancia (km)</label>
            <input type="number" step="0.1" name="distancia_km" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Tiempo Estimado (min)</label>
            <input type="number" name="tiempo_estimado_min" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Tipo</label>
            <select name="tipo" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
              <option value="cana">Caña</option>
              <option value="insumos">Insumos</option>
              <option value="producto_terminado">Producto Terminado</option>
              <option value="personal">Personal</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Link href="/dashboard/logistica" className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancelar</Link>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500">Crear Ruta</button>
        </div>
      </form>
    </div>
  );
}
