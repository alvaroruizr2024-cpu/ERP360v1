import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserCheck } from "lucide-react";

export default async function ColonoDetallePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: colono } = await supabase.from("colonos").select("*").eq("id", params.id).single();
  if (!colono) notFound();

  const { data: entregas } = await supabase
    .from("entregas_colono")
    .select("*, parcelas(nombre)")
    .eq("colono_id", params.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const totalTon = (entregas ?? []).reduce((s, e) => s + Number(e.toneladas_netas), 0);
  const totalMonto = (entregas ?? []).reduce((s, e) => s + Number(e.monto_neto), 0);

  const estadoColors: Record<string, string> = {
    activo: "bg-green-900/50 text-green-400",
    inactivo: "bg-slate-700 text-slate-300",
    suspendido: "bg-red-900/50 text-red-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/colonos" className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
        <UserCheck className="w-6 h-6 text-lime-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">{colono.nombre}</h1>
          <p className="text-slate-400">{colono.codigo}</p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-xs ${estadoColors[colono.estado] ?? ""}`}>{colono.estado}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Entregas</p>
          <p className="text-xl font-bold text-white mt-1">{(entregas ?? []).length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Ton. Entregadas</p>
          <p className="text-xl font-bold text-green-400 mt-1">{totalTon.toLocaleString("es-MX", { minimumFractionDigits: 1 })}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Total Liquidado</p>
          <p className="text-xl font-bold text-cyan-400 mt-1">Q{totalMonto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Precio/Ton</p>
          <p className="text-xl font-bold text-amber-400 mt-1">Q{Number(colono.precio_tonelada).toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 grid grid-cols-2 gap-4 text-sm">
        <div><span className="text-slate-500">DPI:</span> <span className="text-white ml-2">{colono.dpi ?? "-"}</span></div>
        <div><span className="text-slate-500">NIT:</span> <span className="text-white ml-2">{colono.nit ?? "-"}</span></div>
        <div><span className="text-slate-500">Teléfono:</span> <span className="text-white ml-2">{colono.telefono ?? "-"}</span></div>
        <div><span className="text-slate-500">Email:</span> <span className="text-white ml-2">{colono.email ?? "-"}</span></div>
        <div><span className="text-slate-500">Contrato:</span> <span className="text-white ml-2">{colono.tipo_contrato}</span></div>
        <div><span className="text-slate-500">Banco:</span> <span className="text-white ml-2">{colono.banco ?? "-"} {colono.cuenta_bancaria ? `(${colono.cuenta_bancaria})` : ""}</span></div>
        {colono.direccion && <div className="col-span-2"><span className="text-slate-500">Dirección:</span> <span className="text-white ml-2">{colono.direccion}</span></div>}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Historial de Entregas</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">No.</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Parcela</th>
                <th className="px-4 py-3 text-right">Ton. Netas</th>
                <th className="px-4 py-3 text-right">Monto Neto</th>
                <th className="px-4 py-3">Calidad</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {(entregas ?? []).map((e) => {
                const parcela = (e as Record<string, unknown>).parcelas as { nombre: string } | null;
                return (
                  <tr key={e.id} className="text-slate-300 hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium text-white">#{e.numero}</td>
                    <td className="px-4 py-3">{new Date(e.fecha_entrega).toLocaleDateString("es-MX")}</td>
                    <td className="px-4 py-3">{parcela?.nombre ?? "-"}</td>
                    <td className="px-4 py-3 text-right font-medium">{Number(e.toneladas_netas).toFixed(1)}</td>
                    <td className="px-4 py-3 text-right font-medium text-green-400">Q{Number(e.monto_neto).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${e.calificacion_calidad === "A" ? "bg-green-900/50 text-green-400" : e.calificacion_calidad === "B" ? "bg-blue-900/50 text-blue-400" : "bg-yellow-900/50 text-yellow-400"}`}>{e.calificacion_calidad}</span></td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300">{e.estado}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {(entregas ?? []).length === 0 && <p className="text-center text-slate-500 py-8">Sin entregas registradas</p>}
        </div>
      </div>
    </div>
  );
}
