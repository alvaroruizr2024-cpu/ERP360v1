import { createClient } from "@/lib/supabase/server";
import { ContabilidadCharts } from "@/components/contabilidad/contabilidad-charts";
import { ExportButtons } from "@/components/reportes/export-buttons";
import Link from "next/link";
import { Plus, Calculator } from "lucide-react";

export default async function ContabilidadPage() {
  const supabase = createClient();
  const [cuentasRes, asientosRes] = await Promise.all([
    supabase.from("cuentas_contables").select("*").order("codigo"),
    supabase
      .from("asientos_contables")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const cuentas = cuentasRes.data ?? [];
  const asientos = asientosRes.data ?? [];

  // Calculate financial totals by type
  const tipoTotals: Record<string, number> = {};
  for (const tipo of ["activo", "pasivo", "capital", "ingreso", "gasto"]) {
    tipoTotals[tipo] = cuentas.filter((c) => c.tipo === tipo).reduce((s, c) => s + Number(c.saldo), 0);
  }

  // Chart data
  const balanceByType = Object.entries(tipoTotals).map(([name, saldo]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    saldo: Math.abs(saldo),
  }));
  const ecuacionContable = {
    activos: tipoTotals.activo,
    pasivos: tipoTotals.pasivo,
    capital: tipoTotals.capital,
  };

  // Income statement data
  const utilidadBruta = tipoTotals.ingreso - tipoTotals.gasto;

  // Export data
  const exportHeaders = ["No.", "Fecha", "Descripción"];
  const exportRows = asientos.map((a) => [
    `#${a.numero}`, new Date(a.fecha).toLocaleDateString("es-MX"), a.descripcion,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calculator className="w-7 h-7 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Contabilidad</h1>
            <p className="text-slate-400 mt-1">Plan de cuentas, libro diario y estados financieros</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <ExportButtons title="Libro Diario" headers={exportHeaders} rows={exportRows} filename="contabilidad" />
          <Link
            href="/dashboard/contabilidad/cuentas"
            className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-600 transition-colors"
          >
            Plan de Cuentas
          </Link>
          <Link
            href="/dashboard/contabilidad/asiento"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Asiento
          </Link>
        </div>
      </div>

      {/* Balance summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(["activo", "pasivo", "capital", "ingreso", "gasto"] as const).map((tipo) => {
          const total = cuentas
            .filter((c) => c.tipo === tipo)
            .reduce((s, c) => s + Number(c.saldo), 0);
          return (
            <div key={tipo} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-xs text-slate-400 uppercase">{tipo}</p>
              <p className="text-xl font-bold text-white mt-1">
                ${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </p>
            </div>
          );
        })}
      </div>

      {/* Financial Statements Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Balance General</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Total Activos</span><span className="text-blue-400 font-medium">Q{tipoTotals.activo.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Total Pasivos</span><span className="text-red-400 font-medium">Q{tipoTotals.pasivo.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Capital</span><span className="text-purple-400 font-medium">Q{tipoTotals.capital.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span></div>
            <hr className="border-slate-700" />
            <div className="flex justify-between font-medium"><span className="text-slate-300">Patrimonio Neto</span><span className="text-white">Q{(tipoTotals.activo - tipoTotals.pasivo).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span></div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Estado de Resultados</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Ingresos</span><span className="text-green-400 font-medium">Q{tipoTotals.ingreso.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Gastos</span><span className="text-orange-400 font-medium">Q{tipoTotals.gasto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span></div>
            <hr className="border-slate-700" />
            <div className="flex justify-between font-medium">
              <span className="text-slate-300">Utilidad</span>
              <span className={utilidadBruta >= 0 ? "text-green-400" : "text-red-400"}>Q{utilidadBruta.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Indicadores</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Cuentas</span><span className="text-white font-medium">{cuentas.length}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Asientos</span><span className="text-white font-medium">{asientos.length}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Ratio Deuda</span><span className="text-white font-medium">{tipoTotals.activo > 0 ? (tipoTotals.pasivo / tipoTotals.activo * 100).toFixed(1) : 0}%</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Margen</span><span className={`font-medium ${utilidadBruta >= 0 ? "text-green-400" : "text-red-400"}`}>{tipoTotals.ingreso > 0 ? (utilidadBruta / tipoTotals.ingreso * 100).toFixed(1) : 0}%</span></div>
          </div>
        </div>
      </div>

      <ContabilidadCharts balanceByType={balanceByType} ecuacionContable={ecuacionContable} />

      {/* Recent journal entries */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Libro Diario</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">No.</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Descripcion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {asientos.map((a) => (
                <tr key={a.id} className="text-slate-300 hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/contabilidad/asiento/${a.id}`}
                      className="font-medium text-white hover:text-blue-400"
                    >
                      #{a.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(a.fecha).toLocaleDateString("es-MX")}
                  </td>
                  <td className="px-4 py-3">{a.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {asientos.length === 0 && (
            <p className="text-center text-slate-500 py-8">No hay asientos contables</p>
          )}
        </div>
      </div>
    </div>
  );
}
