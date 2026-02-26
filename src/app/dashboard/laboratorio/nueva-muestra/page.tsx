import { createClient } from "@/lib/supabase/server";
import { crearMuestra } from "@/lib/actions/laboratorio";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NuevaMuestraPage() {
  const supabase = createClient();
  const { data: parcelas } = await supabase.from("parcelas").select("id, codigo, nombre").order("nombre");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/laboratorio" className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-white">Nueva Muestra de Laboratorio</h1>
      </div>

      <form action={crearMuestra} className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Código Muestra *</label>
            <input name="codigo_muestra" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="LAB-001" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Tipo de Muestra *</label>
            <select name="tipo_muestra" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
              <option value="cana">Caña</option>
              <option value="jugo">Jugo</option>
              <option value="melaza">Melaza</option>
              <option value="azucar">Azúcar</option>
              <option value="bagazo">Bagazo</option>
              <option value="agua">Agua</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Parcela</label>
            <select name="parcela_id" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
              <option value="">Sin parcela</option>
              {(parcelas ?? []).map((p) => <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Ticket Pesaje</label>
            <input name="ticket_pesaje" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Punto de Muestreo</label>
            <input name="punto_muestreo" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="Molino #1" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Responsable</label>
            <input name="responsable" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Temperatura (°C)</label>
            <input type="number" step="0.1" name="temperatura" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Observaciones</label>
          <textarea name="observaciones" rows={2} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Link href="/dashboard/laboratorio" className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancelar</Link>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500">Registrar Muestra</button>
        </div>
      </form>
    </div>
  );
}
