"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowLeft, TrendingUp } from "lucide-react";

export default function CashflowPage() {
  const [data, setData] = useState<any[]>([]);
  const supabase = createClient();
  useEffect(()=>{ supabase.rpc("fn_cashflow_proyeccion",{p_dias:90}).then(({data:d})=>setData(d||[])); },[]);
  const hoy = new Date().toISOString().split("T")[0];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/finanzas" className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5"/></Link>
        <div><h1 className="text-2xl font-bold text-white flex items-center gap-2"><TrendingUp className="w-6 h-6 text-teal-400"/>Cashflow 360</h1><p className="text-slate-400">Proyección de flujo de caja a 90 días</p></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[["Hoy",data[0]?.saldo_proyectado],["30 días",data[29]?.saldo_proyectado],["90 días",data[89]?.saldo_proyectado]].map(([l,v]:any)=>(
          <div key={l} className="bg-slate-800 border border-slate-700 rounded-xl p-4"><p className="text-xs text-slate-400">Saldo {l}</p><p className={`text-xl font-bold mt-1 ${Number(v||0)>=0?"text-emerald-400":"text-red-400"}`}>S/ {Number(v||0).toLocaleString("es-PE",{minimumFractionDigits:2})}</p></div>
        ))}
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[500px]"><table className="w-full text-sm"><thead className="bg-slate-900 text-slate-400 text-xs uppercase sticky top-0"><tr><th className="px-3 py-2 text-left">Fecha</th><th className="px-3 py-2 text-right">Ingresos</th><th className="px-3 py-2 text-right">Egresos</th><th className="px-3 py-2 text-right">Saldo</th></tr></thead>
        <tbody className="divide-y divide-slate-700">{data.filter((_:any,i:number)=>i%7===0||i<7).map((r:any,i:number)=>(
          <tr key={i} className="text-slate-300"><td className="px-3 py-2">{r.fecha}</td><td className="px-3 py-2 text-right text-emerald-400">{Number(r.ingresos||0)>0?`+${Number(r.ingresos).toLocaleString()}`:""}</td><td className="px-3 py-2 text-right text-red-400">{Number(r.egresos||0)>0?`-${Number(r.egresos).toLocaleString()}`:""}</td><td className={`px-3 py-2 text-right font-bold ${Number(r.saldo_proyectado||0)>=0?"text-white":"text-red-400"}`}>S/ {Number(r.saldo_proyectado||0).toLocaleString("es-PE",{minimumFractionDigits:2})}</td></tr>
        ))}</tbody></table></div>
      </div>
    </div>
  );
}
