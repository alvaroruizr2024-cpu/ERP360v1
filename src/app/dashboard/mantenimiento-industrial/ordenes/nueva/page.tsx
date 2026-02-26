import { createClient } from "@/lib/supabase/server";
import { crearOrdenTrabajo } from "@/lib/actions/mantenimiento-industrial";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NuevaOrdenTrabajoPage() {
  const supabase = createClient();
  const { data: equipos } = await supabase
    .from("equipos_industriales")
    .select("id, codigo, nombre, area")
    .in("estado", ["operativo", "en_mantenimiento"])
    .order("nombre");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/mantenimiento-industrial/ordenes" className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-white">Nueva Orden de Trabajo</h1>
      </div>

      <form action={crearOrdenTrabajo} className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Equipo *</label>
          <select name="equipo_id" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
            <option value="">Seleccionar equipo...</option>
            {(equipos ?? []).map((e) => <option key={e.id} value={e.id}>{e.codigo} - {e.nombre} ({e.area})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Título *</label>
          <input name="titulo" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="Cambio de rodamientos molino #1" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Tipo *</label>
            <select name="tipo" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
              <option value="preventivo">Preventivo</option>
              <option value="correctivo">Correctivo</option>
              <option value="predictivo">Predictivo</option>
              <option value="emergencia">Emergencia</option>
              <option value="mejora">Mejora</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Prioridad</label>
            <select name="prioridad" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
              <option value="media">Media</option>
              <option value="critica">Crítica</option>
              <option value="alta">Alta</option>
              <option value="baja">Baja</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Solicitante</label>
            <input name="solicitante" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Técnico Asignado</label>
            <input name="tecnico_asignado" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Fecha Programada</label>
          <input type="date" name="fecha_programada" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Descripción</label>
          <textarea name="descripcion" rows={3} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Link href="/dashboard/mantenimiento-industrial/ordenes" className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancelar</Link>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500">Crear Orden</button>
        </div>
      </form>
    </div>
  );
}
