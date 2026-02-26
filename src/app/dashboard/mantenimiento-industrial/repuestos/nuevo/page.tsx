import { crearRepuesto } from "@/lib/actions/mantenimiento-industrial";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NuevoRepuestoPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/mantenimiento-industrial/repuestos" className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-white">Nuevo Repuesto</h1>
      </div>

      <form action={crearRepuesto} className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Código *</label>
            <input name="codigo" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="REP-001" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Nombre *</label>
            <input name="nombre" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="Rodamiento SKF 6205" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Descripción</label>
          <input name="descripcion" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Categoría</label>
            <select name="categoria" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
              <option value="mecanico">Mecánico</option>
              <option value="electrico">Eléctrico</option>
              <option value="hidraulico">Hidráulico</option>
              <option value="neumatico">Neumático</option>
              <option value="instrumentacion">Instrumentación</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Unidad de Medida</label>
            <input name="unidad_medida" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="unidad" defaultValue="unidad" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Stock Actual</label>
            <input type="number" step="0.01" name="stock_actual" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Stock Mínimo</label>
            <input type="number" step="0.01" name="stock_minimo" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Precio Unitario (Q)</label>
            <input type="number" step="0.01" name="precio_unitario" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Proveedor</label>
            <input name="proveedor" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Ubicación Almacén</label>
            <input name="ubicacion_almacen" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="Estante A-3" />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Link href="/dashboard/mantenimiento-industrial/repuestos" className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancelar</Link>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500">Registrar Repuesto</button>
        </div>
      </form>
    </div>
  );
}
