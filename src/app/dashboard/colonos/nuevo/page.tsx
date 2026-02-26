import { crearColono } from "@/lib/actions/colonos";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NuevoColonoPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/colonos" className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-white">Nuevo Colono</h1>
      </div>

      <form action={crearColono} className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Código *</label>
            <input name="codigo" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="COL-001" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Nombre Completo *</label>
            <input name="nombre" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">DPI</label>
            <input name="dpi" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">NIT</label>
            <input name="nit" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Teléfono</label>
            <input name="telefono" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input type="email" name="email" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Dirección</label>
          <input name="direccion" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Tipo de Contrato</label>
            <select name="tipo_contrato" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
              <option value="individual">Individual</option>
              <option value="cooperativa">Cooperativa</option>
              <option value="asociacion">Asociación</option>
              <option value="arrendamiento">Arrendamiento</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Precio por Tonelada (Q)</label>
            <input type="number" step="0.01" name="precio_tonelada" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Banco</label>
            <input name="banco" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="Banrural" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Cuenta Bancaria</label>
            <input name="cuenta_bancaria" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Link href="/dashboard/colonos" className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancelar</Link>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500">Registrar Colono</button>
        </div>
      </form>
    </div>
  );
}
