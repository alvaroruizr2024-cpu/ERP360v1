import { createClient } from "@/lib/supabase/server";
import { crearRegistroCosto } from "@/lib/actions/transcana";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NuevoCostoPage() {
  const supabase = createClient();
  const [centrosRes, parcelasRes] = await Promise.all([
    supabase.from("centros_costo").select("id, codigo, nombre").order("codigo"),
    supabase.from("parcelas").select("id, codigo, nombre").order("codigo"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/costos" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Nuevo Registro de Costo</h1>
      </div>

      <form action={crearRegistroCosto} className="max-w-2xl space-y-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Concepto *</label>
            <input name="concepto" required className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Categoría</label>
              <select name="categoria" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar...</option>
                <option value="mano_obra">Mano de Obra</option>
                <option value="combustible">Combustible</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="insumos">Insumos</option>
                <option value="transporte">Transporte</option>
                <option value="otros">Otros</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Monto *</label>
              <input name="monto" type="number" step="0.01" min="0" required className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Centro de Costo</label>
              <select name="centro_costo_id" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar...</option>
                {(centrosRes.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Parcela</label>
              <select name="parcela_id" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar...</option>
                {(parcelasRes.data ?? []).map((p) => (
                  <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Fecha</label>
              <input name="fecha" type="date" defaultValue={new Date().toISOString().split("T")[0]} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Referencia</label>
              <input name="referencia" placeholder="Factura, orden, etc." className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors">Registrar Costo</button>
      </form>
    </div>
  );
}
