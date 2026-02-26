import { crearZafra } from "@/lib/actions/zafra";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NuevaZafraPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/zafra" className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Nueva Campaña de Zafra</h1>
      </div>

      <form action={crearZafra} className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Código *</label>
            <input name="codigo" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="ZAF-2026" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Nombre *</label>
            <input name="nombre" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="Zafra 2025-2026" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Fecha Inicio *</label>
            <input type="date" name="fecha_inicio" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Fecha Fin</label>
            <input type="date" name="fecha_fin" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Meta Toneladas</label>
            <input type="number" step="0.01" name="meta_toneladas" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Meta Hectáreas</label>
            <input type="number" step="0.01" name="meta_hectareas" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="0" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Estado</label>
          <select name="estado" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
            <option value="planificada">Planificada</option>
            <option value="activa">Activa</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Notas</label>
          <textarea name="notas" rows={3} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/dashboard/zafra" className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancelar</Link>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500">Crear Zafra</button>
        </div>
      </form>
    </div>
  );
}
