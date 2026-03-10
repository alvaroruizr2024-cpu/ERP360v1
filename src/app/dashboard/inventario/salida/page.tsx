import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, PackageMinus } from "lucide-react";

export default async function SalidaAlmacenPage() {
  const supabase = createClient();
  const { data: salidas } = await supabase.from("salidas_almacen").select("*").order("created_at",{ascending:false}).limit(20);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/inventario" className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5"/></Link>
          <div><h1 className="text-2xl font-bold text-white">Salidas de Almacén</h1><p className="text-slate-400">Vales de salida con descargo automático</p></div>
        </div>
      </div>
      {(salidas||[]).length>0?<div className="overflow-x-auto rounded-xl border border-slate-700"><table className="w-full text-sm"><thead className="bg-slate-800 text-slate-400 text-xs uppercase"><tr><th className="px-3 py-3 text-left">Número</th><th className="px-3 py-3">Fecha</th><th className="px-3 py-3 text-left">Solicitante</th><th className="px-3 py-3">Centro Costo</th><th className="px-3 py-3 text-center">Estado</th></tr></thead>
      <tbody className="divide-y divide-slate-700">{(salidas||[]).map((s:any)=>(
        <tr key={s.id} className="text-slate-300"><td className="px-3 py-2 font-mono">{s.numero}</td><td className="px-3 py-2 text-center">{s.fecha}</td><td className="px-3 py-2">{s.solicitante}</td><td className="px-3 py-2 text-center">{s.centro_costo}</td><td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded text-xs ${s.estado==="procesada"?"bg-green-900/50 text-green-400":"bg-yellow-900/50 text-yellow-400"}`}>{s.estado}</span></td></tr>
      ))}</tbody></table></div>
      :<p className="text-center py-12 text-slate-500">Sin salidas registradas. Las salidas se generan desde órdenes de trabajo o solicitudes de materiales.</p>}
    </div>
  );
}
