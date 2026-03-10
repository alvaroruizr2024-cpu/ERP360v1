"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileSearch, Upload } from "lucide-react";

type SireResult = { serie: string; numero: string; ruc: string; total: number; estado: string };

export default function SirePage() {
  const [results] = useState<SireResult[]>([
    { serie:"F001", numero:"00892", ruc:"20539871456", total:4230.30, estado:"matched" },
  ]);
  const stats = { matched: results.filter(r=>r.estado==="matched").length, dif_monto: results.filter(r=>r.estado==="dif_monto").length, falta_erp: 0, falta_sunat: 0, duplicado: 0 };

  const estColors:any = { matched:"bg-green-900/50 text-green-400", dif_monto:"bg-orange-900/50 text-orange-400", falta_erp:"bg-red-900/50 text-red-400", falta_sunat:"bg-yellow-900/50 text-yellow-400", duplicado:"bg-purple-900/50 text-purple-400" };
  const estLabels:any = { matched:"Coincide", dif_monto:"Dif. Monto", falta_erp:"Falta ERP", falta_sunat:"Falta SUNAT", duplicado:"Duplicado" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/contabilidad" className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5"/></Link>
          <div><h1 className="text-2xl font-bold text-white flex items-center gap-2"><FileSearch className="w-6 h-6 text-blue-400"/>Conciliación SIRE</h1><p className="text-slate-400">ERP vs SUNAT — Sistema Integrado de Registros Electrónicos</p></div>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2"><Upload className="w-4 h-4"/>Importar TXT SUNAT</button>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {Object.entries(stats).map(([k,v])=>(<div key={k} className={`rounded-xl p-4 border ${estColors[k]||"bg-slate-800 border-slate-700"}`}><p className="text-xs opacity-80">{estLabels[k]||k}</p><p className="text-2xl font-bold mt-1">{v}</p></div>))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-700"><table className="w-full text-sm"><thead className="bg-slate-800 text-slate-400 text-xs uppercase"><tr><th className="px-3 py-3 text-left">Comprobante</th><th className="px-3 py-3">RUC</th><th className="px-3 py-3 text-right">Total ERP</th><th className="px-3 py-3 text-right">Total SUNAT</th><th className="px-3 py-3 text-center">Estado</th></tr></thead>
      <tbody className="divide-y divide-slate-700">{results.map((r,i)=>(
        <tr key={i} className="text-slate-300"><td className="px-3 py-2 font-mono">{r.serie}-{r.numero}</td><td className="px-3 py-2 text-center">{r.ruc}</td><td className="px-3 py-2 text-right">S/ {r.total.toFixed(2)}</td><td className="px-3 py-2 text-right">S/ {r.total.toFixed(2)}</td><td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded text-xs ${estColors[r.estado]}`}>{estLabels[r.estado]}</span></td></tr>
      ))}</tbody></table></div>
    </div>
  );
}
