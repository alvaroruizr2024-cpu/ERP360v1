import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";

export default async function BancosPage() {
  const supabase = createClient();
  const { data: bancos } = await supabase.from("cuentas_bancarias").select("*").order("banco");
  const { data: movs } = await supabase.from("movimientos_banco").select("*").order("fecha",{ascending:false}).limit(20);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/finanzas" className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5"/></Link>
        <div><h1 className="text-2xl font-bold text-white">Cuentas Bancarias</h1><p className="text-slate-400">Saldos y conciliación</p></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(bancos||[]).map((b:any)=>(
          <div key={b.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-sm font-semibold text-white">{b.banco}</p>
            <p className="text-xs text-slate-400 font-mono">{b.numero_cuenta}</p>
            <p className="text-xs text-slate-500 capitalize">{b.tipo_cuenta} • {b.moneda}</p>
            <p className="text-xl font-bold text-emerald-400 mt-2">{b.moneda==="USD"?"$ ":"S/ "}{Number(b.saldo_actual).toLocaleString("es-PE",{minimumFractionDigits:2})}</p>
          </div>
        ))}
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-3">Últimos Movimientos</h2>
        {(movs||[]).length>0?<div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-900 text-slate-400 text-xs uppercase"><tr><th className="px-3 py-2 text-left">Fecha</th><th className="px-3 py-2 text-left">Descripción</th><th className="px-3 py-2 text-right">Monto</th><th className="px-3 py-2 text-center">Conciliado</th></tr></thead>
        <tbody className="divide-y divide-slate-700">{(movs||[]).map((m:any)=>(
          <tr key={m.id} className="text-slate-300"><td className="px-3 py-2">{m.fecha}</td><td className="px-3 py-2">{m.descripcion}</td><td className={`px-3 py-2 text-right font-bold ${Number(m.monto)>=0?"text-emerald-400":"text-red-400"}`}>{Number(m.monto)>=0?"+":""}S/ {Math.abs(Number(m.monto)).toLocaleString("es-PE",{minimumFractionDigits:2})}</td><td className="px-3 py-2 text-center">{m.conciliado?"✅":"⚪"}</td></tr>
        ))}</tbody></table></div>
        :<p className="text-slate-500 text-center py-8">Sin movimientos bancarios registrados. Los movimientos se generan automáticamente al ejecutar pagos.</p>}
      </div>
    </div>
  );
}
