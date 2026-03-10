"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowLeft, Calculator } from "lucide-react";

export default function ImpuestosPage() {
  const [monto, setMonto] = useState(10000);
  const [tipoOp, setTipoOp] = useState("compra");
  const [detracciones, setDetracciones] = useState<any[]>([]);
  const [detCodigo, setDetCodigo] = useState("027");
  const [esAgente, setEsAgente] = useState(false);
  const supabase = createClient();

  useEffect(() => { supabase.from("catalogo_detracciones").select("*").eq("activo",true).order("codigo").then(({data})=>setDetracciones(data||[])); }, []);

  const det = detracciones.find(d=>d.codigo===detCodigo);
  const igv = Math.round(monto * 18) / 100;
  const total = monto + igv;
  const detPct = det?.porcentaje || 0;
  const detMonto = Math.round(total * detPct) / 100;
  const retPct = esAgente ? 3 : 0;
  const retMonto = Math.round(total * retPct) / 100;
  const neto = total - detMonto - retMonto;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/contabilidad" className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5"/></Link>
        <div><h1 className="text-2xl font-bold text-white flex items-center gap-2"><Calculator className="w-6 h-6 text-purple-400"/>Motor de Impuestos</h1><p className="text-slate-400">Simulador IGV, Detracciones, Retenciones</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Parámetros</h2>
          <div><label className="text-xs text-slate-400">Base Imponible (S/)</label><input type="number" value={monto} onChange={e=>setMonto(Number(e.target.value))} className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 mt-1"/></div>
          <div><label className="text-xs text-slate-400">Tipo de operación</label><select value={tipoOp} onChange={e=>setTipoOp(e.target.value)} className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 mt-1"><option value="compra">Compra</option><option value="venta">Venta</option><option value="servicio">Servicio</option></select></div>
          <div><label className="text-xs text-slate-400">Detracción (Anexo SUNAT)</label><select value={detCodigo} onChange={e=>setDetCodigo(e.target.value)} className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 mt-1"><option value="">Sin detracción</option>{detracciones.map(d=><option key={d.codigo} value={d.codigo}>{d.codigo} - {d.descripcion} ({d.porcentaje}%)</option>)}</select></div>
          <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={esAgente} onChange={e=>setEsAgente(e.target.checked)} className="rounded"/> Agente de Retención (3%)</label>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Resultado</h2>
          <div className="space-y-3">
            {[["Base Imponible",monto],["IGV 18%",igv],["TOTAL COMPROBANTE",total]].map(([l,v]:any)=>(
              <div key={l} className="flex justify-between"><span className="text-slate-400">{l}</span><span className={l==="TOTAL COMPROBANTE"?"text-white font-bold text-lg":"text-white"}>S/ {v.toLocaleString("es-PE",{minimumFractionDigits:2})}</span></div>
            ))}
            <div className="border-t border-slate-700 pt-3">
              {detPct>0&&<div className="flex justify-between"><span className="text-orange-400">Detracción {detPct}% ({det?.descripcion})</span><span className="text-orange-400">- S/ {detMonto.toLocaleString("es-PE",{minimumFractionDigits:2})}</span></div>}
              {retMonto>0&&<div className="flex justify-between"><span className="text-yellow-400">Retención {retPct}%</span><span className="text-yellow-400">- S/ {retMonto.toLocaleString("es-PE",{minimumFractionDigits:2})}</span></div>}
            </div>
            <div className="border-t border-slate-700 pt-3 flex justify-between"><span className="text-emerald-400 font-bold text-lg">NETO A PAGAR</span><span className="text-emerald-400 font-bold text-xl">S/ {neto.toLocaleString("es-PE",{minimumFractionDigits:2})}</span></div>
          </div>
          <div className="mt-6 bg-slate-900 rounded-lg p-4 text-xs text-slate-400 space-y-1">
            <p className="font-bold text-slate-300">Asiento contable sugerido:</p>
            <p>DEBE: {tipoOp==="venta"?"1212 CxC":"6032 Suministros"} — S/ {monto.toFixed(2)}</p>
            {tipoOp!=="venta"&&<p>DEBE: 1671 IGV Crédito Fiscal — S/ {igv.toFixed(2)}</p>}
            <p>HABER: {tipoOp==="venta"?"7041 Ingresos":"4212 CxP"} — S/ {total.toFixed(2)}</p>
            {detMonto>0&&<p>HABER: 1071 Fondo Detracciones — S/ {detMonto.toFixed(2)}</p>}
          </div>
        </div>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-3">Catálogo de Detracciones SUNAT</h2>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-900 text-slate-400 text-xs uppercase"><tr><th className="px-3 py-2 text-left">Código</th><th className="px-3 py-2 text-left">Descripción</th><th className="px-3 py-2">Tipo</th><th className="px-3 py-2 text-right">%</th></tr></thead>
        <tbody className="divide-y divide-slate-700">{detracciones.map(d=>(<tr key={d.codigo} className={`text-slate-300 hover:bg-slate-700/50 ${d.codigo===detCodigo?"bg-blue-900/20":""}`}><td className="px-3 py-2 font-mono">{d.codigo}</td><td className="px-3 py-2">{d.descripcion}</td><td className="px-3 py-2 text-center capitalize">{d.tipo}</td><td className="px-3 py-2 text-right font-bold">{d.porcentaje}%</td></tr>))}</tbody></table></div>
      </div>
    </div>
  );
}
