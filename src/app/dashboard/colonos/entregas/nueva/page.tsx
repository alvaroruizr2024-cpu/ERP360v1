import { createClient } from "@/lib/supabase/server";
import { crearEntregaColono } from "@/lib/actions/colonos";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NuevaEntregaPage() {
  const supabase = createClient();
  const { data: colonos } = await supabase.from("colonos").select("id, codigo, nombre, precio_tonelada").eq("estado", "activo").order("nombre");
  const { data: parcelas } = await supabase.from("parcelas").select("id, codigo, nombre").order("nombre");
  const { data: zafras } = await supabase.from("zafras").select("id, codigo, nombre").in("estado", ["activa", "planificada"]).order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/colonos/entregas" className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-white">Nueva Entrega de Colono</h1>
      </div>

      <form action={crearEntregaColono} className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Colono *</label>
            <select name="colono_id" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
              <option value="">Seleccionar...</option>
              {(colonos ?? []).map((c) => <option key={c.id} value={c.id}>{c.codigo} - {c.nombre} (Q{Number(c.precio_tonelada).toFixed(2)}/ton)</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Zafra</label>
            <select name="zafra_id" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
              <option value="">Sin zafra</option>
              {(zafras ?? []).map((z) => <option key={z.id} value={z.id}>{z.codigo} - {z.nombre}</option>)}
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
            <label className="block text-sm text-slate-400 mb-1">Fecha Entrega</label>
            <input type="date" name="fecha_entrega" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Toneladas Brutas *</label>
            <input type="number" step="0.01" name="toneladas_brutas" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">% Impurezas</label>
            <input type="number" step="0.01" name="porcentaje_impurezas" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Precio/Ton (Q)</label>
            <input type="number" step="0.01" name="precio_tonelada" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Deducciones (Q)</label>
            <input type="number" step="0.01" name="deducciones" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Calificación Calidad</label>
            <select name="calificacion_calidad" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
              <option value="A">A - Excelente</option>
              <option value="B">B - Buena</option>
              <option value="C">C - Regular</option>
              <option value="D">D - Baja</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Ticket Pesaje</label>
          <input name="ticket_pesaje" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Concepto Deducciones</label>
          <input name="concepto_deducciones" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="Transporte, anticipos, etc." />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Link href="/dashboard/colonos/entregas" className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancelar</Link>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500">Registrar Entrega</button>
        </div>
      </form>
    </div>
  );
}
