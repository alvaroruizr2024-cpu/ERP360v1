import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

export default async function AsistenciaPage() {
  const supabase = createClient();
  const { data: asist } = await supabase.from("asistencias").select("*, empleados(nombre)").order("fecha",{ascending:false}).limit(50);
  const { data: empleados } = await supabase.from("empleados").select("id, nombre").eq("estado","activo");
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/nomina" className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5"/></Link>
        <div><h1 className="text-2xl font-bold text-white flex items-center gap-2"><Clock className="w-6 h-6 text-blue-400"/>Control de Asistencia</h1><p className="text-slate-400">{(empleados||[]).length} empleados activos</p></div>
      </div>
      {(asist||[]).length>0?<div className="overflow-x-auto rounded-xl border border-slate-700"><table className="w-full text-sm"><thead className="bg-slate-800 text-slate-400 text-xs uppercase"><tr><th className="px-3 py-3 text-left">Empleado</th><th className="px-3 py-3">Fecha</th><th className="px-3 py-3">Entrada</th><th className="px-3 py-3">Salida</th><th className="px-3 py-3 text-right">Horas</th><th className="px-3 py-3 text-center">Estado</th></tr></thead>
      <tbody className="divide-y divide-slate-700">{(asist||[]).map((a:any)=>(
        <tr key={a.id} className="text-slate-300"><td className="px-3 py-2">{a.empleados?.nombre}</td><td className="px-3 py-2 text-center">{a.fecha}</td><td className="px-3 py-2 text-center">{a.hora_entrada?new Date(a.hora_entrada).toLocaleTimeString("es-PE",{hour:"2-digit",minute:"2-digit"}):""}</td><td className="px-3 py-2 text-center">{a.hora_salida?new Date(a.hora_salida).toLocaleTimeString("es-PE",{hour:"2-digit",minute:"2-digit"}):""}</td><td className="px-3 py-2 text-right">{a.horas_trabajadas||"—"}</td><td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded text-xs ${a.estado==="presente"?"bg-green-900/50 text-green-400":a.estado==="falta"?"bg-red-900/50 text-red-400":"bg-yellow-900/50 text-yellow-400"}`}>{a.estado}</span></td></tr>
      ))}</tbody></table></div>
      :<p className="text-center py-12 text-slate-500">Sin registros de asistencia. Los registros se generan por marcación biométrica o manual.</p>}
    </div>
  );
}
