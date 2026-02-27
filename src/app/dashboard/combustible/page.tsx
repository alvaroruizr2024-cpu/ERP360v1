import { createClient } from "@/lib/supabase/server";
import { Pagination } from "@/components/ui/pagination";
import { AdvancedFilters } from "@/components/ui/advanced-filters";
import { CombustibleCharts } from "@/components/combustible/combustible-charts";
import { ExportButtons } from "@/components/reportes/export-buttons";
import Link from "next/link";
import { Plus, Fuel } from "lucide-react";

const PAGE_SIZE = 15;

const tipoCombLabels: Record<string, string> = {
  diesel: "Diésel",
  gasolina_90: "Gasolina 90",
  gasolina_95: "Gasolina 95",
  glp: "GLP",
};

export default async function CombustiblePage({
  searchParams,
}: {
  searchParams: { page?: string; tipo_combustible?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const tipoComb = searchParams.tipo_combustible || "";

  const supabase = createClient();

  let query = supabase.from("despachos_combustible").select("*, vehiculos(placa, tipo)", { count: "exact" });

  if (tipoComb) query = query.eq("tipo_combustible", tipoComb as "diesel" | "gasolina_90" | "gasolina_95" | "glp");

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: despachos, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  // KPIs
  const { data: allDespachos } = await supabase.from("despachos_combustible").select("galones, total, tipo_combustible");
  const d = allDespachos ?? [];
  const totalGalones = d.reduce((s, x) => s + Number(x.galones), 0);
  const totalGasto = d.reduce((s, x) => s + Number(x.total), 0);
  const galonesDiesel = d.filter((x) => x.tipo_combustible === "diesel").reduce((s, x) => s + Number(x.galones), 0);
  const precioPromedio = totalGalones > 0 ? totalGasto / totalGalones : 0;

  // Chart data
  const byTipo = Object.entries(tipoCombLabels).map(([key, label]) => {
    const filtered = d.filter((x) => x.tipo_combustible === key);
    return { name: label, galones: filtered.reduce((s, x) => s + Number(x.galones), 0), gasto: filtered.reduce((s, x) => s + Number(x.total), 0) };
  });

  // Top vehicles by consumption
  const vehicleMap = new Map<string, number>();
  (despachos ?? []).forEach((dp) => {
    const placa = dp.vehiculo_placa;
    vehicleMap.set(placa, (vehicleMap.get(placa) || 0) + Number(dp.galones));
  });
  const topVehicles = Array.from(vehicleMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, galones]) => ({ name, galones }));

  // Export data
  const exportHeaders = ["No.", "Placa", "Tipo", "Galones", "Precio/Gal", "Total", "Km", "Operador", "Fecha"];
  const exportRows = (despachos ?? []).map((dp) => [
    dp.numero, dp.vehiculo_placa, tipoCombLabels[dp.tipo_combustible] ?? dp.tipo_combustible,
    Number(dp.galones).toFixed(2), `$${Number(dp.precio_galon).toFixed(2)}`, `$${Number(dp.total).toFixed(2)}`,
    dp.kilometraje ? Number(dp.kilometraje).toLocaleString("es-MX") : "-", dp.operador ?? "-",
    new Date(dp.fecha).toLocaleDateString("es-MX"),
  ]);

  const filterConfig = [
    {
      key: "tipo_combustible",
      label: "Tipo Combustible",
      type: "select" as const,
      options: Object.entries(tipoCombLabels).map(([v, l]) => ({ value: v, label: l })),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Fuel className="w-7 h-7 text-orange-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Control de Combustible</h1>
            <p className="text-slate-400 mt-1">Despachos y consumo por vehículo</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <ExportButtons title="Control de Combustible" headers={exportHeaders} rows={exportRows} filename="combustible" />
          <Link
            href="/dashboard/combustible/nuevo"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Despacho
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Despachos</p>
          <p className="text-2xl font-bold text-white mt-1">{count ?? 0}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Total Galones</p>
          <p className="text-2xl font-bold text-orange-400 mt-1">{totalGalones.toLocaleString("es-MX", { minimumFractionDigits: 1 })}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Gasto Total</p>
          <p className="text-2xl font-bold text-red-400 mt-1">${totalGasto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Diésel (gal)</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{galonesDiesel.toLocaleString("es-MX", { minimumFractionDigits: 1 })}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Precio Prom./Gal</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">${precioPromedio.toFixed(2)}</p>
        </div>
      </div>

      <CombustibleCharts byTipo={byTipo} topVehicles={topVehicles} />

      <AdvancedFilters filters={filterConfig} />

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">Placa</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3 text-right">Galones</th>
              <th className="px-4 py-3 text-right">Precio/Gal</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Km</th>
              <th className="px-4 py-3">Operador</th>
              <th className="px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {(despachos ?? []).map((d) => (
              <tr key={d.id} className="text-slate-300 hover:bg-slate-800/50">
                <td className="px-4 py-3">
                  <Link href={`/dashboard/combustible/${d.id}`} className="font-medium text-white hover:text-blue-400">
                    #{d.numero}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono">{d.vehiculo_placa}</td>
                <td className="px-4 py-3">{tipoCombLabels[d.tipo_combustible] ?? d.tipo_combustible}</td>
                <td className="px-4 py-3 text-right">{Number(d.galones).toFixed(2)}</td>
                <td className="px-4 py-3 text-right">${Number(d.precio_galon).toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-medium">${Number(d.total).toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-mono">{d.kilometraje ? Number(d.kilometraje).toLocaleString("es-MX") : "-"}</td>
                <td className="px-4 py-3">{d.operador ?? "-"}</td>
                <td className="px-4 py-3 text-xs">{new Date(d.fecha).toLocaleDateString("es-MX")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(despachos ?? []).length === 0 && (
          <p className="text-center text-slate-500 py-8">No hay despachos registrados</p>
        )}
      </div>

      <Pagination totalItems={count ?? 0} pageSize={PAGE_SIZE} currentPage={page} />
    </div>
  );
}
