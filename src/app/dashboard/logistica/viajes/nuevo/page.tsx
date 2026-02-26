import { createClient } from "@/lib/supabase/server";
import { crearViaje } from "@/lib/actions/logistica";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NuevoViajePage() {
  const supabase = createClient();
  const { data: rutas } = await supabase.from("rutas_transporte").select("id, codigo, nombre").eq("estado", "activa").order("nombre");
  const { data: vehiculos } = await supabase.from("vehiculos").select("id, placa, tipo").eq("estado", "disponible").order("placa");
  const { data: parcelas } = await supabase.from("parcelas").select("id, codigo, nombre").order("nombre");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/logistica/viajes" className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-white">Nuevo Viaje</h1>
      </div>

      <form action={crearViaje} className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Ruta</label>
            <select name="ruta_id" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
              <option value="">Sin ruta definida</option>
              {(rutas ?? []).map((r) => <option key={r.id} value={r.id}>{r.codigo} - {r.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Vehículo</label>
            <select name="vehiculo_id" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
              <option value="">Seleccionar...</option>
              {(vehiculos ?? []).map((v) => <option key={v.id} value={v.id}>{v.placa} ({v.tipo})</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Chofer</label>
            <input name="chofer" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Parcela Origen</label>
            <select name="parcela_origen_id" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
              <option value="">Sin parcela</option>
              {(parcelas ?? []).map((p) => <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Destino / Ingenio</label>
            <input name="destino_ingenio" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Ticket Pesaje</label>
            <input name="ticket_pesaje" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Toneladas</label>
            <input type="number" step="0.01" name="toneladas_transportadas" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Km Inicio</label>
            <input type="number" step="0.1" name="kilometraje_inicio" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Costo Flete</label>
            <input type="number" step="0.01" name="costo_flete" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Link href="/dashboard/logistica/viajes" className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancelar</Link>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500">Registrar Viaje</button>
        </div>
      </form>
    </div>
  );
}
