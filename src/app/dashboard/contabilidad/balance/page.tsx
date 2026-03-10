import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, FileText, Download } from "lucide-react";

export default async function BalancePage() {
  const supabase = createClient();
  const { data: balance } = await supabase.rpc("fn_balance_comprobacion");
  const rows = balance ?? [];
  const totalDebe = rows.reduce((s:number, r:any) => s + Number(r.debe_periodo||0), 0);
  const totalHaber = rows.reduce((s:number, r:any) => s + Number(r.haber_periodo||0), 0);
  const totalSD = rows.reduce((s:number, r:any) => s + Number(r.saldo_deudor||0), 0);
  const totalSA = rows.reduce((s:number, r:any) => s + Number(r.saldo_acreedor||0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/contabilidad" className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5"/></Link>
          <div><h1 className="text-2xl font-bold text-white">Balance de Comprobación</h1><p className="text-slate-400">PCGE — Saldos acumulados</p></div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[["Total Debe", totalDebe],["Total Haber", totalHaber],["Saldo Deudor", totalSD],["Saldo Acreedor", totalSA]].map(([l,v]:any) => (
          <div key={l} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase">{l}</p>
            <p className="text-xl font-bold text-white mt-1">S/ {Number(v).toLocaleString("es-PE",{minimumFractionDigits:2})}</p>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm"><thead className="bg-slate-800 text-slate-400 uppercase text-xs">
          <tr><th className="px-3 py-3 text-left">Código</th><th className="px-3 py-3 text-left">Cuenta</th><th className="px-3 py-3 text-right">Debe</th><th className="px-3 py-3 text-right">Haber</th><th className="px-3 py-3 text-right">Saldo Deudor</th><th className="px-3 py-3 text-right">Saldo Acreedor</th></tr>
        </thead><tbody className="divide-y divide-slate-700">
          {rows.map((r:any,i:number) => (
            <tr key={i} className="text-slate-300 hover:bg-slate-800/50">
              <td className="px-3 py-2 font-mono font-bold">{r.codigo}</td>
              <td className="px-3 py-2">{r.nombre}</td>
              <td className="px-3 py-2 text-right">{Number(r.debe_periodo||0).toLocaleString("es-PE",{minimumFractionDigits:2})}</td>
              <td className="px-3 py-2 text-right">{Number(r.haber_periodo||0).toLocaleString("es-PE",{minimumFractionDigits:2})}</td>
              <td className="px-3 py-2 text-right text-blue-400">{Number(r.saldo_deudor||0)>0?Number(r.saldo_deudor).toLocaleString("es-PE",{minimumFractionDigits:2}):""}</td>
              <td className="px-3 py-2 text-right text-emerald-400">{Number(r.saldo_acreedor||0)>0?Number(r.saldo_acreedor).toLocaleString("es-PE",{minimumFractionDigits:2}):""}</td>
            </tr>
          ))}
          <tr className="bg-slate-800 text-white font-bold">
            <td className="px-3 py-3" colSpan={2}>TOTALES</td>
            <td className="px-3 py-3 text-right">{totalDebe.toLocaleString("es-PE",{minimumFractionDigits:2})}</td>
            <td className="px-3 py-3 text-right">{totalHaber.toLocaleString("es-PE",{minimumFractionDigits:2})}</td>
            <td className="px-3 py-3 text-right text-blue-400">{totalSD.toLocaleString("es-PE",{minimumFractionDigits:2})}</td>
            <td className="px-3 py-3 text-right text-emerald-400">{totalSA.toLocaleString("es-PE",{minimumFractionDigits:2})}</td>
          </tr>
        </tbody></table>
      </div>
    </div>
  );
}
