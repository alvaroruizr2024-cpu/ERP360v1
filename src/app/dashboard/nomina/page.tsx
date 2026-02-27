import { createClient } from "@/lib/supabase/server";
import { Pagination } from "@/components/ui/pagination";
import { AdvancedFilters } from "@/components/ui/advanced-filters";
import { NominaCharts } from "@/components/nomina/nomina-charts";
import { ExportButtons } from "@/components/reportes/export-buttons";
import Link from "next/link";
import { Plus, Banknote } from "lucide-react";

const PAGE_SIZE = 15;

const estadoColors: Record<string, string> = {
  borrador: "bg-slate-700 text-slate-300",
  calculado: "bg-blue-900/50 text-blue-400",
  aprobado: "bg-green-900/50 text-green-400",
  pagado: "bg-emerald-900/50 text-emerald-400",
  anulado: "bg-red-900/50 text-red-400",
};

const tipoLabels: Record<string, string> = {
  quincenal: "Quincenal",
  mensual: "Mensual",
  semanal: "Semanal",
  liquidacion: "Liquidación",
};

export default async function NominaPage({
  searchParams,
}: {
  searchParams: { page?: string; estado?: string; tipo?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const supabase = createClient();

  let query = supabase.from("periodos_nomina").select("*", { count: "exact" });
  if (searchParams.estado) query = query.eq("estado", searchParams.estado);
  if (searchParams.tipo) query = query.eq("tipo", searchParams.tipo);

  const from = (page - 1) * PAGE_SIZE;
  const { data: periodos, count } = await query.order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);

  const { data: allPeriodos } = await supabase.from("periodos_nomina").select("total_bruto, total_neto, estado");
  const all = allPeriodos ?? [];
  const totalBruto = all.reduce((s, p) => s + Number(p.total_bruto), 0);
  const totalNeto = all.reduce((s, p) => s + Number(p.total_neto), 0);
  const pagados = all.filter((p) => p.estado === "pagado").length;
  const totalDeducciones = totalBruto - totalNeto;
  const tasaDeduccion = totalBruto > 0 ? (totalDeducciones / totalBruto * 100) : 0;

  // Chart data - Deducciones breakdown (estimated IGSS 4.83%, ISR varies)
  const estIGSS = totalBruto * 0.0483;
  const estISR = totalDeducciones - estIGSS > 0 ? totalDeducciones - estIGSS : 0;
  const deduccionesBreakdown = [
    { name: "IGSS (4.83%)", monto: estIGSS },
    { name: "ISR", monto: estISR },
  ];

  // Salary distribution
  const salarioDistribution = [
    { rango: "< Q3,000", count: 0 },
    { rango: "Q3,000-5,000", count: 0 },
    { rango: "Q5,000-10,000", count: 0 },
    { rango: "Q10,000-20,000", count: 0 },
    { rango: "> Q20,000", count: 0 },
  ];
  all.forEach((p) => {
    const emp = (p.total_bruto || 0) / Math.max(1, 1); // per period aggregate
    if (emp < 3000) salarioDistribution[0].count++;
    else if (emp < 5000) salarioDistribution[1].count++;
    else if (emp < 10000) salarioDistribution[2].count++;
    else if (emp < 20000) salarioDistribution[3].count++;
    else salarioDistribution[4].count++;
  });

  // Export data
  const exportHeaders = ["Código", "Nombre", "Tipo", "Período", "Bruto", "Deducciones", "Neto", "Estado"];
  const exportRows = (periodos ?? []).map((p) => [
    p.codigo, p.nombre, tipoLabels[p.tipo] ?? p.tipo,
    `${new Date(p.fecha_inicio).toLocaleDateString("es-MX")} - ${new Date(p.fecha_fin).toLocaleDateString("es-MX")}`,
    `Q${Number(p.total_bruto).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
    `Q${Number(p.total_deducciones).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
    `Q${Number(p.total_neto).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
    p.estado,
  ]);

  const filterConfig = [
    {
      key: "tipo", label: "Tipo", type: "select" as const,
      options: [
        { value: "quincenal", label: "Quincenal" },
        { value: "mensual", label: "Mensual" },
        { value: "semanal", label: "Semanal" },
        { value: "liquidacion", label: "Liquidación" },
      ],
    },
    {
      key: "estado", label: "Estado", type: "select" as const,
      options: [
        { value: "borrador", label: "Borrador" },
        { value: "calculado", label: "Calculado" },
        { value: "aprobado", label: "Aprobado" },
        { value: "pagado", label: "Pagado" },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Banknote className="w-7 h-7 text-emerald-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Nómina y Liquidación</h1>
            <p className="text-slate-400 mt-1">Gestión de planilla, deducciones y pagos</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <ExportButtons title="Nómina y Liquidación" headers={exportHeaders} rows={exportRows} filename="nomina" />
          <Link href="/dashboard/nomina/nuevo-periodo" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors">
            <Plus className="w-4 h-4" />
            Nuevo Período
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Períodos</p>
          <p className="text-2xl font-bold text-white mt-1">{count ?? 0}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Total Bruto</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">Q{totalBruto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Total Neto</p>
          <p className="text-2xl font-bold text-green-400 mt-1">Q{totalNeto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Pagados</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{pagados}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Tasa Ded. Prom.</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{tasaDeduccion.toFixed(1)}%</p>
        </div>
      </div>

      {/* IGSS/ISR Reference Card */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Referencia Deducciones Guatemala</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400 font-medium mb-1">IGSS Laboral: 4.83%</p>
            <p className="text-slate-500 text-xs">Cuota trabajador sobre salario bruto</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium mb-1">ISR Progresivo</p>
            <div className="text-slate-500 text-xs space-y-0.5">
              <p>Q0 - Q300,000 anual: 5%</p>
              <p>Q300,001+ anual: 7%</p>
              <p>Exento anual: Q48,000 (Q4,000/mes)</p>
            </div>
          </div>
        </div>
      </div>

      <NominaCharts deduccionesBreakdown={deduccionesBreakdown} salarioDistribution={salarioDistribution} />

      <AdvancedFilters filters={filterConfig} />

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Período</th>
              <th className="px-4 py-3 text-right">Bruto</th>
              <th className="px-4 py-3 text-right">Deducciones</th>
              <th className="px-4 py-3 text-right">Neto</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {(periodos ?? []).map((p) => (
              <tr key={p.id} className="text-slate-300 hover:bg-slate-800/50">
                <td className="px-4 py-3">
                  <Link href={`/dashboard/nomina/${p.id}`} className="font-medium text-white hover:text-blue-400">{p.codigo}</Link>
                </td>
                <td className="px-4 py-3">{p.nombre}</td>
                <td className="px-4 py-3">{tipoLabels[p.tipo] ?? p.tipo}</td>
                <td className="px-4 py-3">{new Date(p.fecha_inicio).toLocaleDateString("es-MX")} - {new Date(p.fecha_fin).toLocaleDateString("es-MX")}</td>
                <td className="px-4 py-3 text-right">Q{Number(p.total_bruto).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-right text-red-400">Q{Number(p.total_deducciones).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-right font-medium text-green-400">Q{Number(p.total_neto).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${estadoColors[p.estado] ?? ""}`}>{p.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(periodos ?? []).length === 0 && <p className="text-center text-slate-500 py-8">No hay períodos de nómina registrados</p>}
      </div>

      <Pagination totalItems={count ?? 0} pageSize={PAGE_SIZE} currentPage={page} />
    </div>
  );
}
