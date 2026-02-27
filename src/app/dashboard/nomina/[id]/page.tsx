import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ExportButtons } from "@/components/reportes/export-buttons";
import Link from "next/link";
import { ArrowLeft, Banknote } from "lucide-react";

const estadoColors: Record<string, string> = {
  borrador: "bg-slate-700 text-slate-300",
  calculado: "bg-blue-900/50 text-blue-400",
  aprobado: "bg-green-900/50 text-green-400",
  pagado: "bg-emerald-900/50 text-emerald-400",
  anulado: "bg-red-900/50 text-red-400",
};

export default async function NominaDetallePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: periodo } = await supabase.from("periodos_nomina").select("*").eq("id", params.id).single();
  if (!periodo) notFound();

  const { data: detalles } = await supabase
    .from("nomina_detalle")
    .select("*, empleados(nombre, cargo, departamento_id)")
    .eq("periodo_id", params.id)
    .order("created_at");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/nomina" className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
        <Banknote className="w-6 h-6 text-emerald-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">{periodo.nombre}</h1>
          <p className="text-slate-400">{periodo.codigo} | {periodo.tipo}</p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-xs ${estadoColors[periodo.estado] ?? ""}`}>{periodo.estado}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Total Bruto</p>
          <p className="text-xl font-bold text-white mt-1">Q{Number(periodo.total_bruto).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Deducciones</p>
          <p className="text-xl font-bold text-red-400 mt-1">Q{Number(periodo.total_deducciones).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Total Neto</p>
          <p className="text-xl font-bold text-green-400 mt-1">Q{Number(periodo.total_neto).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Empleados</p>
          <p className="text-xl font-bold text-cyan-400 mt-1">{(detalles ?? []).length}</p>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm grid grid-cols-3 gap-4">
        <div><span className="text-slate-500">Período:</span> <span className="text-white ml-1">{new Date(periodo.fecha_inicio).toLocaleDateString("es-MX")} - {new Date(periodo.fecha_fin).toLocaleDateString("es-MX")}</span></div>
        <div><span className="text-slate-500">Fecha Pago:</span> <span className="text-white ml-1">{periodo.fecha_pago ? new Date(periodo.fecha_pago).toLocaleDateString("es-MX") : "-"}</span></div>
        {periodo.aprobado_por && <div><span className="text-slate-500">Aprobado por:</span> <span className="text-white ml-1">{periodo.aprobado_por}</span></div>}
      </div>

      {/* IGSS/ISR Summary */}
      {(detalles ?? []).length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Resumen de Deducciones</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-500 text-xs uppercase">Total IGSS (4.83%)</p>
              <p className="text-red-400 font-medium">Q{(detalles ?? []).reduce((s, d) => s + Number(d.deduccion_igss), 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase">Total ISR</p>
              <p className="text-red-400 font-medium">Q{(detalles ?? []).reduce((s, d) => s + Number(d.deduccion_isr), 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase">Otras Deducciones</p>
              <p className="text-red-400 font-medium">Q{(detalles ?? []).reduce((s, d) => s + Number(d.otras_deducciones), 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase">Salario Neto Prom.</p>
              <p className="text-white font-medium">Q{((detalles ?? []).reduce((s, d) => s + Number(d.salario_neto), 0) / Math.max(1, (detalles ?? []).length)).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Detalle por Empleado</h2>
          {(detalles ?? []).length > 0 && (
            <ExportButtons
              title={`Nómina - ${periodo.nombre}`}
              headers={["Empleado", "Cargo", "Salario Base", "IGSS", "ISR", "Total Ded.", "Neto", "Estado"]}
              rows={(detalles ?? []).map((d) => {
                const emp = (d as Record<string, unknown>).empleados as { nombre: string; cargo: string } | null;
                return [emp?.nombre ?? "-", emp?.cargo ?? "-", `Q${Number(d.salario_base).toFixed(2)}`, `Q${Number(d.deduccion_igss).toFixed(2)}`, `Q${Number(d.deduccion_isr).toFixed(2)}`, `Q${Number(d.total_deducciones).toFixed(2)}`, `Q${Number(d.salario_neto).toFixed(2)}`, d.estado];
              })}
              filename={`nomina_${periodo.codigo}`}
            />
          )}
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Empleado</th>
                <th className="px-4 py-3">Cargo</th>
                <th className="px-4 py-3 text-right">Salario Base</th>
                <th className="px-4 py-3 text-right">IGSS</th>
                <th className="px-4 py-3 text-right">ISR</th>
                <th className="px-4 py-3 text-right">Total Ded.</th>
                <th className="px-4 py-3 text-right">Neto</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {(detalles ?? []).map((d) => {
                const emp = (d as Record<string, unknown>).empleados as { nombre: string; cargo: string } | null;
                return (
                  <tr key={d.id} className="text-slate-300 hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium text-white">{emp?.nombre ?? "-"}</td>
                    <td className="px-4 py-3">{emp?.cargo ?? "-"}</td>
                    <td className="px-4 py-3 text-right">Q{Number(d.salario_base).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right text-red-400">Q{Number(d.deduccion_igss).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-red-400">Q{Number(d.deduccion_isr).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-red-400">Q{Number(d.total_deducciones).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-medium text-green-400">Q{Number(d.salario_neto).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${estadoColors[d.estado] ?? ""}`}>{d.estado}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {(detalles ?? []).length === 0 && <p className="text-center text-slate-500 py-8">Período sin detalles. Ejecute el cálculo de nómina.</p>}
        </div>
      </div>
    </div>
  );
}
