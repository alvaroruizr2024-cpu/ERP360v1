"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { FileText, Plus, CheckCircle2, Clock } from "lucide-react";

export default function LiquidacionesPage() {
  const [liquidaciones, setLiquidaciones] = useState<any[]>([]);
  const supabase = createClient();
  useEffect(()=>{supabase.from("liquidaciones").select("*").order("created_at",{ascending:false}).then(({data})=>setLiquidaciones(data||[]));},[]);
  const estColors:any={borrador:"bg-slate-700 text-slate-300",aprobada:"bg-green-900/50 text-green-400",pagada:"bg-blue-900/50 text-blue-400",anulada:"bg-red-900/50 text-red-400"};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white flex items-center gap-2"><FileText className="w-6 h-6 text-amber-400"/>Liquidaciones de Transporte</h1><p className="text-slate-400">Liquidación por tonelada transportada</p></div>
        <Link href="/dashboard/liquidaciones/nueva" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm flex items-center gap-2"><Plus className="w-4 h-4"/>Nueva Liquidación</Link>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[["Total",liquidaciones.length],["Borrador",liquidaciones.filter(l=>l.estado==="borrador").length],["Aprobadas",liquidaciones.filter(l=>l.estado==="aprobada").length],["Pagadas",liquidaciones.filter(l=>l.estado==="pagada").length]].map(([l,v]:any)=>(
          <div key={l} className="bg-slate-800 border border-slate-700 rounded-xl p-4"><p className="text-xs text-slate-400">{l}</p><p className="text-xl font-bold text-white mt-1">{v}</p></div>
        ))}
      </div>
      {liquidaciones.length>0?<div className="overflow-x-auto rounded-xl border border-slate-700"><table className="w-full text-sm"><thead className="bg-slate-800 text-slate-400 text-xs uppercase"><tr><th className="px-3 py-3 text-left">Número</th><th className="px-3 py-3">Período</th><th className="px-3 py-3 text-right">Viajes</th><th className="px-3 py-3 text-right">Toneladas</th><th className="px-3 py-3 text-right">Total</th><th className="px-3 py-3 text-center">Estado</th></tr></thead>
        <tbody className="divide-y divide-slate-700">{liquidaciones.map(l=>(
          <tr key={l.id} className="text-slate-300 hover:bg-slate-800/50"><td className="px-3 py-2 font-mono font-bold">{l.numero}</td><td className="px-3 py-2 text-center">{l.periodo_inicio} a {l.periodo_fin}</td><td className="px-3 py-2 text-right">{l.total_viajes}</td><td className="px-3 py-2 text-right">{Number(l.total_toneladas||0).toLocaleString()}</td><td className="px-3 py-2 text-right font-bold">S/ {Number(l.total||0).toLocaleString("es-PE",{minimumFractionDigits:2})}</td><td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded text-xs ${estColors[l.estado]||""}`}>{l.estado}</span></td></tr>
        ))}</tbody></table></div>
        :<div className="text-center py-12 text-slate-500"><Clock className="w-12 h-12 mx-auto mb-3 opacity-30"/><p>Sin liquidaciones. Las liquidaciones se generan a partir de los tickets de pesaje aprobados.</p></div>}
    </div>
  );
}
