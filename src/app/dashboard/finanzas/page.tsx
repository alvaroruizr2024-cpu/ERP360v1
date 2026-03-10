"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Landmark, TrendingUp, TrendingDown, CreditCard, Wallet, ArrowRight } from "lucide-react";

export default function FinanzasPage() {
  const [bancos, setBancos] = useState<any[]>([]);
  const [cxc, setCxc] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(()=>{
    supabase.from("cuentas_bancarias").select("*").eq("activa",true).then(({data})=>setBancos(data||[]));
    supabase.from("facturas").select("*, clientes(nombre)").neq("estado","pagado").order("fecha",{ascending:false}).limit(10).then(({data})=>setCxc(data||[]));
    supabase.from("pagos").select("*").order("fecha_pago",{ascending:false}).limit(10).then(({data})=>setPagos(data||[]));
  },[]);

  const totalBancos = bancos.filter(b=>b.moneda==="PEN").reduce((s,b)=>s+Number(b.saldo_actual),0);
  const totalCxC = cxc.reduce((s,f)=>s+Number(f.total||0),0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Landmark className="w-6 h-6 text-teal-400"/>Módulo Financiero</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[["Saldo Bancos (PEN)",`S/ ${totalBancos.toLocaleString("es-PE")}`,"text-emerald-400"],["CxC Pendientes",`S/ ${totalCxC.toLocaleString("es-PE")}`,"text-blue-400"],["Cuentas Bancarias",bancos.length,"text-teal-400"],["Pagos Registrados",pagos.length,"text-orange-400"]].map(([l,v,c]:any)=>(
          <div key={l} className="bg-slate-800 border border-slate-700 rounded-xl p-4"><p className="text-xs text-slate-400">{l}</p><p className={`text-xl font-bold mt-1 ${c}`}>{v}</p></div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[["Cashflow 360","/dashboard/finanzas/cashflow","Proyección de flujo de caja 30/60/90 días","text-teal-400"],["Cuentas x Cobrar","/dashboard/finanzas/cxc","Aging de cartera y gestión de cobranza","text-blue-400"],["Cuentas x Pagar","/dashboard/finanzas/cxp","Programación de pagos a proveedores","text-orange-400"],["Bancos","/dashboard/finanzas/bancos","Saldos y conciliación bancaria","text-emerald-400"]].map(([t,h,d,c]:any)=>(
          <Link key={t} href={h} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-500 transition-colors">
            <h3 className={`font-semibold ${c}`}>{t}</h3><p className="text-sm text-slate-400 mt-1">{d}</p>
            <ArrowRight className="w-4 h-4 text-slate-500 mt-3"/>
          </Link>
        ))}
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-3">Cuentas Bancarias</h2>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-900 text-slate-400 text-xs uppercase"><tr><th className="px-3 py-2 text-left">Banco</th><th className="px-3 py-2 text-left">Cuenta</th><th className="px-3 py-2">Moneda</th><th className="px-3 py-2">Tipo</th><th className="px-3 py-2 text-right">Saldo</th></tr></thead>
        <tbody className="divide-y divide-slate-700">{bancos.map(b=>(
          <tr key={b.id} className="text-slate-300"><td className="px-3 py-2 font-semibold">{b.banco}</td><td className="px-3 py-2 font-mono">{b.numero_cuenta}</td><td className="px-3 py-2 text-center">{b.moneda}</td><td className="px-3 py-2 text-center capitalize">{b.tipo_cuenta}</td><td className="px-3 py-2 text-right font-bold text-emerald-400">{b.moneda==="USD"?"$ ":"S/ "}{Number(b.saldo_actual).toLocaleString("es-PE",{minimumFractionDigits:2})}</td></tr>
        ))}</tbody></table></div>
      </div>
    </div>
  );
}
