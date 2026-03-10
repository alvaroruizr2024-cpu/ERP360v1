"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowLeft, Shield, AlertTriangle, CheckCircle2, Brain, RefreshCw } from "lucide-react";

export default function ShadowPage() {
  const [alertas, setAlertas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const supabase = createClient();

  const fetch_ = async () => { setLoading(true); const {data}=await supabase.from("alertas_contables").select("*").order("created_at",{ascending:false}); setAlertas(data||[]); setLoading(false); };
  useEffect(()=>{fetch_();},[]);

  const runScan = async () => {
    setScanning(true);
    const {data:{user}} = await supabase.auth.getUser();
    await supabase.rpc("fn_auditor_shadow",{p_user_id:user?.id});
    await fetch_();
    setScanning(false);
  };

  const resolver = async (id:string) => {
    const {data:{user}} = await supabase.auth.getUser();
    await supabase.from("alertas_contables").update({resuelta:true,resuelta_por:user?.id,fecha_resolucion:new Date().toISOString()}).eq("id",id);
    await fetch_();
  };

  const activas = alertas.filter(a=>!a.resuelta);
  const resueltas = alertas.filter(a=>a.resuelta);
  const sevColors:any = {critical:"bg-red-900/30 border-red-700 text-red-400",warning:"bg-orange-900/30 border-orange-700 text-orange-400",info:"bg-blue-900/30 border-blue-700 text-blue-400"};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/contabilidad" className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5"/></Link>
          <div><h1 className="text-2xl font-bold text-white flex items-center gap-2"><Brain className="w-6 h-6 text-purple-400"/>Auditor Shadow IA</h1><p className="text-slate-400">Detección inteligente de contingencias tributarias</p></div>
        </div>
        <button onClick={runScan} disabled={scanning} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm flex items-center gap-2"><RefreshCw className={`w-4 h-4 ${scanning?"animate-spin":""}`}/>{scanning?"Escaneando...":"Ejecutar Escaneo"}</button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[["Alertas Críticas",activas.filter(a=>a.severidad==="critical").length,"text-red-400"],["Alertas Warning",activas.filter(a=>a.severidad==="warning").length,"text-orange-400"],["Resueltas",resueltas.length,"text-emerald-400"]].map(([l,v,c]:any)=>(
          <div key={l} className="bg-slate-800 border border-slate-700 rounded-xl p-4"><p className="text-xs text-slate-400">{l}</p><p className={`text-2xl font-bold mt-1 ${c}`}>{v}</p></div>
        ))}
      </div>
      <div className="space-y-3">
        {activas.map(a=>(
          <div key={a.id} className={`rounded-xl border p-4 ${sevColors[a.severidad]||sevColors.info}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0"/>
                <div><p className="font-semibold">{a.titulo}</p><p className="text-sm opacity-80 mt-1">{a.descripcion}</p>{a.normativa&&<p className="text-xs mt-2 opacity-60">Normativa: {a.normativa}</p>}{a.recomendacion_ia&&<div className="mt-2 bg-black/20 rounded-lg p-3 text-sm"><p className="font-semibold flex items-center gap-1"><Brain className="w-3 h-3"/>Recomendación IA:</p><p className="mt-1">{a.recomendacion_ia}</p></div>}</div>
              </div>
              <button onClick={()=>resolver(a.id)} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs shrink-0">Resolver</button>
            </div>
          </div>
        ))}
        {activas.length===0&&<div className="text-center py-12 text-slate-500"><Shield className="w-12 h-12 mx-auto mb-3 opacity-30"/><p>Sin alertas activas. Ejecuta un escaneo para detectar contingencias.</p></div>}
      </div>
    </div>
  );
}
