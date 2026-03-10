import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, ClipboardList } from "lucide-react";

export default async function KardexPage() {
  const supabase = createClient();
  const { data: movs } = await supabase.from("movimientos_almacen").select("*, productos(nombre)").order("created_at",{ascending:false}).limit(50);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/inventario" className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5"/></Link>
        <div><h1 className="text-2xl font-bold text-white">Kardex Valorizado</h1><p className="text-slate-400">Movimientos de almacén con valorización</p></div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-700"><table className="w-full text-sm"><thead className="bg-slate-800 text-slate-400 text-xs uppercase"><tr><th className="px-3 py-3 text-left">Fecha</th><th className="px-3 py-3 text-left">Producto</th><th className="px-3 py-3">Tipo</th><th className="px-3 py-3">Documento</th><th className="px-3 py-3 text-right">Cantidad</th><th className="px-3 py-3 text-right">C.Unit</th><th className="px-3 py-3 text-right">Total</th></tr></thead>
      <tbody className="divide-y divide-slate-700">{(movs||[]).map((m:any)=>(
        <tr key={m.id} className="text-slate-300"><td className="px-3 py-2">{m.fecha}</td><td className="px-3 py-2">{m.productos?.nombre||"—"}</td><td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded text-xs ${m.tipo_movimiento==="ingreso"?"bg-green-900/50 text-green-400":"bg-red-900/50 text-red-400"}`}>{m.tipo_movimiento}</span></td><td className="px-3 py-2 text-center font-mono">{m.documento_numero||"—"}</td><td className="px-3 py-2 text-right">{Number(m.cantidad).toLocaleString()}</td><td className="px-3 py-2 text-right">S/ {Number(m.costo_unitario||0).toFixed(2)}</td><td className="px-3 py-2 text-right font-bold">S/ {Number(m.costo_total||0).toLocaleString("es-PE",{minimumFractionDigits:2})}</td></tr>
      ))}</tbody></table></div>
    </div>
  );
}
