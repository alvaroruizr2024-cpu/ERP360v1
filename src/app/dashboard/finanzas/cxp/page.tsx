import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";

export default async function CxPPage() {
  const supabase = createClient();
  const { data: comps } = await supabase.from("comprobantes").select("*").in("tipo",["factura_compra"]).neq("estado","pagado").order("fecha_vencimiento");
  const pendientes = comps || [];
  const total = pendientes.reduce((s,c)=>s+Number(c.total||0),0);
  const vencidas = pendientes.filter(c => c.fecha_vencimiento && new Date(c.fecha_vencimiento) < new Date());
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/finanzas" className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5"/></Link>
        <div><h1 className="text-2xl font-bold text-white">Cuentas por Pagar</h1><p className="text-slate-400">Programación de pagos a proveedores</p></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4"><p className="text-xs text-slate-400">Total Pendiente</p><p className="text-xl font-bold text-orange-400 mt-1">S/ {total.toLocaleString("es-PE",{minimumFractionDigits:2})}</p></div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4"><p className="text-xs text-slate-400">Comprobantes</p><p className="text-xl font-bold text-white mt-1">{pendientes.length}</p></div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4"><p className="text-xs text-slate-400">Vencidas</p><p className="text-xl font-bold text-red-400 mt-1">{vencidas.length}</p></div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-700"><table className="w-full text-sm"><thead className="bg-slate-800 text-slate-400 text-xs uppercase"><tr><th className="px-3 py-3 text-left">Comprobante</th><th className="px-3 py-3">Emisión</th><th className="px-3 py-3">Vencimiento</th><th className="px-3 py-3 text-right">Total</th><th className="px-3 py-3 text-center">Estado</th></tr></thead>
      <tbody className="divide-y divide-slate-700">{pendientes.map((c:any)=>{
        const vencida = c.fecha_vencimiento && new Date(c.fecha_vencimiento) < new Date();
        return(<tr key={c.id} className="text-slate-300"><td className="px-3 py-2 font-mono">{c.serie}-{c.numero}</td><td className="px-3 py-2 text-center">{c.fecha_emision}</td><td className={`px-3 py-2 text-center ${vencida?"text-red-400 font-bold":""}`}>{c.fecha_vencimiento||"—"}</td><td className="px-3 py-2 text-right font-bold">S/ {Number(c.total).toLocaleString("es-PE",{minimumFractionDigits:2})}</td><td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded text-xs ${vencida?"bg-red-900/50 text-red-400":"bg-yellow-900/50 text-yellow-400"}`}>{vencida?"Vencida":"Pendiente"}</span></td></tr>);
      })}</tbody></table></div>
    </div>
  );
}
