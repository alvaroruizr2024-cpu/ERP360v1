import { crearLead } from "@/lib/actions/crm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NuevoLeadPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/crm" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Nuevo Lead</h1>
      </div>

      <form action={crearLead} className="max-w-2xl bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Nombre *</label>
            <input name="nombre" required className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Empresa</label>
            <input name="empresa" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <input name="email" type="email" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Telefono</label>
            <input name="telefono" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Origen</label>
            <select name="origen" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar...</option>
              <option value="web">Web</option>
              <option value="referido">Referido</option>
              <option value="redes_sociales">Redes Sociales</option>
              <option value="llamada">Llamada</option>
              <option value="evento">Evento</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Valor estimado</label>
            <input name="valor_estimado" type="number" step="0.01" min="0" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Notas</label>
          <textarea name="notas" rows={3} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors">
          Crear lead
        </button>
      </form>
    </div>
  );
}
