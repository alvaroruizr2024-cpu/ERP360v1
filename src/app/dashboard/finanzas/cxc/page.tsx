"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

export default function CxCPage() {
  const [aging, setAging] = useState<any[]>([]);
  const supabase = createClient();
  useEffect(()=>{ supabase.rpc("fn_aging_cuentas_cobrar").then(({data})=>setAging(data||[])); },[]);
  const total = aging.reduce((s,a)=>s+Number(a.total_deuda||0),0);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/finanzas" className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5"/></Link>
        <div><h1 className="text-2xl font-bold text-white">Cuentas por Cobrar — Aging</h1><p className="text-slate-400">Antigüedad de saldos por cliente</p></div>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4"><p className="text-xs text-slate-400">Total CxC Pendiente</p><p className="text-2xl font-bold text-blue-400 mt-1">S/ {total.toLocaleString("es-PE",{minimumFractionDigits:2})}</p></div>
      <div className="overflow-x-auto rounded-xl border border-slate-700"><table className="w-full text-sm"><thead className="bg-slate-800 text-slate-400 text-xs uppercase"><tr><th className="px-3 py-3 text-left">Cliente</th><th className="px-3 py-3 text-right">Total</th><th className="px-3 py-3 text-right">Vigente</th><th className="px-3 py-3 text-right">0-30d</th><th className="px-3 py-3 text-right">31-60d</th><th className="px-3 py-3 text-right">61-90d</th><th className="px-3 py-3 text-right">&gt;90d</th></tr></thead>
      <tbody className="divide-y divide-slate-700">{aging.map((a:any,i:number)=>(
        <tr key={i} className="text-slate-300"><td className="px-3 py-2 font-semibold">{a.cliente}</td><td className="px-3 py-2 text-right font-bold">{Number(a.total_deuda||0).toLocaleString("es-PE",{minimumFractionDigits:2})}</td>
        {["vigente","vencido_30","vencido_60","vencido_90","vencido_mas"].map(k=><td key={k} className={`px-3 py-2 text-right ${k.includes("90")|| k.includes("mas")?"text-red-400":k.includes("60")?"text-orange-400":""}`}>{Number(a[k]||0)>0?Number(a[k]).toLocaleString("es-PE",{minimumFractionDigits:2}):""}</td>)}
        </tr>))}</tbody></table></div>
    </div>
  );
}
