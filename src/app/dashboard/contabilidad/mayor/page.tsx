"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function MayorPage() {
  const [codigo, setCodigo] = useState("");
  const [movs, setMovs] = useState<any[]>([]);
  const [cuenta, setCuenta] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const buscar = async () => {
    if(!codigo) return;
    setLoading(true);
    const { data: c } = await supabase.from("cuentas_contables").select("nombre").eq("codigo",codigo).single();
    setCuenta(c?.nombre || "No encontrada");
    const { data } = await supabase.rpc("fn_libro_mayor", { p_cuenta_codigo: codigo });
    setMovs(data || []);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/contabilidad" className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5"/></Link>
        <div><h1 className="text-2xl font-bold text-white">Libro Mayor</h1><p className="text-slate-400">Movimientos por cuenta contable</p></div>
      </div>
      <div className="flex gap-3">
        <input value={codigo} onChange={e=>setCodigo(e.target.value)} placeholder="Código cuenta (ej: 4212)" className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 w-48 text-sm" onKeyDown={e=>e.key==="Enter"&&buscar()}/>
        <button onClick={buscar} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2"><Search className="w-4 h-4"/>{loading?"Buscando...":"Buscar"}</button>
        {cuenta && <span className="text-slate-300 self-center text-sm">{codigo} — {cuenta}</span>}
      </div>
      {movs.length > 0 && <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm"><thead className="bg-slate-800 text-slate-400 uppercase text-xs">
          <tr><th className="px-3 py-3 text-left">Fecha</th><th className="px-3 py-3 text-left">Descripción</th><th className="px-3 py-3 text-right">Debe</th><th className="px-3 py-3 text-right">Haber</th><th className="px-3 py-3 text-right">Saldo</th></tr>
        </thead><tbody className="divide-y divide-slate-700">
          {movs.map((m:any,i:number) => (
            <tr key={i} className="text-slate-300 hover:bg-slate-800/50">
              <td className="px-3 py-2">{new Date(m.fecha).toLocaleDateString("es-PE")}</td>
              <td className="px-3 py-2">{m.descripcion}</td>
              <td className="px-3 py-2 text-right">{Number(m.debe||0)>0?Number(m.debe).toLocaleString("es-PE",{minimumFractionDigits:2}):""}</td>
              <td className="px-3 py-2 text-right">{Number(m.haber||0)>0?Number(m.haber).toLocaleString("es-PE",{minimumFractionDigits:2}):""}</td>
              <td className="px-3 py-2 text-right font-bold">{Number(m.saldo_acum||0).toLocaleString("es-PE",{minimumFractionDigits:2})}</td>
            </tr>
          ))}
        </tbody></table>
      </div>}
      {movs.length===0 && cuenta && <div className="text-center py-12 text-slate-500">Sin movimientos para esta cuenta</div>}
    </div>
  );
}
