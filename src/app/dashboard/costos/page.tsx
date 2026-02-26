import { createClient } from "@/lib/supabase/server";
import { Pagination } from "@/components/ui/pagination";
import { AdvancedFilters } from "@/components/ui/advanced-filters";
import Link from "next/link";
import { Plus, Calculator } from "lucide-react";

const PAGE_SIZE = 15;

const catLabels: Record<string, string> = {
  mano_obra: "Mano de Obra",
  combustible: "Combustible",
  mantenimiento: "Mantenimiento",
  insumos: "Insumos",
  transporte: "Transporte",
  otros: "Otros",
};

const catColors: Record<string, string> = {
  mano_obra: "bg-blue-900/50 text-blue-400",
  combustible: "bg-orange-900/50 text-orange-400",
  mantenimiento: "bg-yellow-900/50 text-yellow-400",
  insumos: "bg-green-900/50 text-green-400",
  transporte: "bg-purple-900/50 text-purple-400",
  otros: "bg-slate-700 text-slate-300",
};

export default async function CostosPage({
  searchParams,
}: {
  searchParams: { page?: string; categoria?: string; fecha_from?: string; fecha_to?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const categoria = searchParams.categoria || "";
  const fechaFrom = searchParams.fecha_from || "";
  const fechaTo = searchParams.fecha_to || "";

  const supabase = createClient();

  let query = supabase.from("registros_costo").select("*, centros_costo(nombre, codigo), parcelas(nombre)", { count: "exact" });

  if (categoria) query = query.eq("categoria", categoria as "mano_obra" | "combustible" | "mantenimiento" | "insumos" | "transporte" | "otros");
  if (fechaFrom) query = query.gte("fecha", fechaFrom);
  if (fechaTo) query = query.lte("fecha", fechaTo);

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: registros, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  // KPIs
  const { data: allCostos } = await supabase.from("registros_costo").select("monto, categoria");
  const c = allCostos ?? [];
  const totalCosto = c.reduce((s, x) => s + Number(x.monto), 0);
  const costoManoObra = c.filter((x) => x.categoria === "mano_obra").reduce((s, x) => s + Number(x.monto), 0);
  const costoCombustible = c.filter((x) => x.categoria === "combustible").reduce((s, x) => s + Number(x.monto), 0);

  // Hectáreas for cost/ha calculation
  const { data: parcelasData } = await supabase.from("parcelas").select("hectareas");
  const totalHa = (parcelasData ?? []).reduce((s, p) => s + Number(p.hectareas), 0);
  const costoPorHa = totalHa > 0 ? totalCosto / totalHa : 0;

  // Centros de costo for filter
  const { data: centrosData } = await supabase.from("centros_costo").select("id, nombre");

  const filterConfig = [
    {
      key: "categoria",
      label: "Categoría",
      type: "select" as const,
      options: Object.entries(catLabels).map(([v, l]) => ({ value: v, label: l })),
    },
    {
      key: "fecha",
      label: "Fecha",
      type: "date" as const,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calculator className="w-7 h-7 text-emerald-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Análisis de Costos</h1>
            <p className="text-slate-400 mt-1">Costos por hectárea, por tonelada y centros de costo</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/costos/centros"
            className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-600 transition-colors"
          >
            Centros de Costo ({(centrosData ?? []).length})
          </Link>
          <Link
            href="/dashboard/costos/nuevo"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Registro
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Costo Total</p>
          <p className="text-2xl font-bold text-white mt-1">${totalCosto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Costo / Hectárea</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">${costoPorHa.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-slate-500">{totalHa.toFixed(1)} ha totales</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Mano de Obra</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">${costoManoObra.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Combustible</p>
          <p className="text-2xl font-bold text-orange-400 mt-1">${costoCombustible.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <AdvancedFilters filters={filterConfig} />

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Concepto</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Centro Costo</th>
              <th className="px-4 py-3">Parcela</th>
              <th className="px-4 py-3 text-right">Monto</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Referencia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {(registros ?? []).map((r) => {
              const centro = (r as Record<string, unknown>).centros_costo as { nombre: string; codigo: string } | null;
              const parcela = (r as Record<string, unknown>).parcelas as { nombre: string } | null;
              return (
                <tr key={r.id} className="text-slate-300 hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-white">{r.concepto}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${r.categoria ? catColors[r.categoria] ?? "" : ""}`}>
                      {r.categoria ? catLabels[r.categoria] ?? r.categoria : "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{centro?.nombre ?? "-"}</td>
                  <td className="px-4 py-3">{parcela?.nombre ?? "-"}</td>
                  <td className="px-4 py-3 text-right font-medium">${Number(r.monto).toFixed(2)}</td>
                  <td className="px-4 py-3">{new Date(r.fecha).toLocaleDateString("es-MX")}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{r.referencia ?? "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(registros ?? []).length === 0 && (
          <p className="text-center text-slate-500 py-8">No hay registros de costos</p>
        )}
      </div>

      <Pagination totalItems={count ?? 0} pageSize={PAGE_SIZE} currentPage={page} />
    </div>
  );
}
