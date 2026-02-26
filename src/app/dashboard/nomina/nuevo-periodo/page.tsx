import { crearPeriodoNomina } from "@/lib/actions/nomina";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NuevoPeriodoPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/nomina" className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-white">Nuevo Período de Nómina</h1>
      </div>

      <form action={crearPeriodoNomina} className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Código *</label>
            <input name="codigo" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="NOM-2026-02" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Nombre *</label>
            <input name="nombre" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="Febrero 2026" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Tipo *</label>
          <select name="tipo" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
            <option value="quincenal">Quincenal</option>
            <option value="mensual">Mensual</option>
            <option value="semanal">Semanal</option>
            <option value="liquidacion">Liquidación</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Fecha Inicio *</label>
            <input type="date" name="fecha_inicio" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Fecha Fin *</label>
            <input type="date" name="fecha_fin" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Fecha de Pago</label>
          <input type="date" name="fecha_pago" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Notas</label>
          <textarea name="notas" rows={2} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Link href="/dashboard/nomina" className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancelar</Link>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500">Crear Período</button>
        </div>
      </form>
    </div>
  );
}
