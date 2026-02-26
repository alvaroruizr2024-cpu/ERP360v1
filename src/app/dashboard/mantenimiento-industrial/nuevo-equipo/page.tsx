import { crearEquipoIndustrial } from "@/lib/actions/mantenimiento-industrial";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NuevoEquipoPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/mantenimiento-industrial" className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-white">Nuevo Equipo Industrial</h1>
      </div>

      <form action={crearEquipoIndustrial} className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Código *</label>
            <input name="codigo" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="EQ-MOL-001" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Nombre *</label>
            <input name="nombre" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="Molino Principal #1" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Tipo *</label>
            <select name="tipo" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
              <option value="molino">Molino</option>
              <option value="caldera">Caldera</option>
              <option value="centrifuga">Centrífuga</option>
              <option value="evaporador">Evaporador</option>
              <option value="cristalizador">Cristalizador</option>
              <option value="filtro">Filtro</option>
              <option value="bomba">Bomba</option>
              <option value="motor">Motor</option>
              <option value="transportador">Transportador</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Área</label>
            <select name="area" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
              <option value="">Sin asignar</option>
              <option value="patio">Patio de Caña</option>
              <option value="molinos">Molinos</option>
              <option value="calderas">Calderas</option>
              <option value="clarificacion">Clarificación</option>
              <option value="evaporacion">Evaporación</option>
              <option value="cristalizacion">Cristalización</option>
              <option value="centrifugado">Centrifugado</option>
              <option value="secado">Secado</option>
              <option value="empaque">Empaque</option>
              <option value="laboratorio">Laboratorio</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Marca</label>
            <input name="marca" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Modelo</label>
            <input name="modelo" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">No. Serie</label>
            <input name="numero_serie" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Fecha Instalación</label>
            <input type="date" name="fecha_instalacion" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Potencia</label>
            <input name="potencia" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="500 HP" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Capacidad</label>
            <input name="capacidad" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="200 ton/hr" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Criticidad</label>
          <select name="criticidad" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
            <option value="media">Media</option>
            <option value="critica">Crítica</option>
            <option value="alta">Alta</option>
            <option value="baja">Baja</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Link href="/dashboard/mantenimiento-industrial" className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancelar</Link>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500">Registrar Equipo</button>
        </div>
      </form>
    </div>
  );
}
