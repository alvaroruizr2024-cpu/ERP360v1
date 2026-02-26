import { createClient } from "@/lib/supabase/server";
import { Pagination } from "@/components/ui/pagination";
import { AdvancedFilters } from "@/components/ui/advanced-filters";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";

const PAGE_SIZE = 15;

const estadoColors: Record<string, string> = {
  pendiente: "bg-yellow-900/50 text-yellow-400",
  pagada: "bg-green-900/50 text-green-400",
  cancelada: "bg-red-900/50 text-red-400",
};

export default async function FacturacionPage({
  searchParams,
}: {
  searchParams: { page?: string; estado?: string; fecha_from?: string; fecha_to?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const estado = searchParams.estado || "";
  const fechaFrom = searchParams.fecha_from || "";
  const fechaTo = searchParams.fecha_to || "";

  const supabase = createClient();

  let query = supabase.from("facturas").select("*, clientes(nombre)", { count: "exact" });

  if (estado) query = query.eq("estado", estado as "pendiente" | "pagada" | "cancelada");
  if (fechaFrom) query = query.gte("fecha", fechaFrom);
  if (fechaTo) query = query.lte("fecha", fechaTo);

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: facturas, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  // KPIs
  const { data: allFacturas } = await supabase.from("facturas").select("total, estado");
  const facs = allFacturas ?? [];
  const totalFacturado = facs.reduce((s, f) => s + Number(f.total), 0);
  const totalPagado = facs.filter((f) => f.estado === "pagada").reduce((s, f) => s + Number(f.total), 0);
  const pendientes = facs.filter((f) => f.estado === "pendiente").length;

  const filterConfig = [
    {
      key: "estado",
      label: "Estado",
      type: "select" as const,
      options: [
        { value: "pendiente", label: "Pendiente" },
        { value: "pagada", label: "Pagada" },
        { value: "cancelada", label: "Cancelada" },
      ],
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
          <FileText className="w-7 h-7 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Facturación Electrónica</h1>
            <p className="text-slate-400 mt-1">Facturas, boletas y notas de crédito — SUNAT</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/facturacion/boletas"
            className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-600 transition-colors"
          >
            Boletas
          </Link>
          <Link
            href="/dashboard/facturacion/nueva"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Factura
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Total Documentos</p>
          <p className="text-2xl font-bold text-white mt-1">{count ?? 0}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Facturado</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">${totalFacturado.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Cobrado</p>
          <p className="text-2xl font-bold text-green-400 mt-1">${totalPagado.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{pendientes}</p>
        </div>
      </div>

      <AdvancedFilters filters={filterConfig} />

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3 text-right">Subtotal</th>
              <th className="px-4 py-3 text-right">IGV</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {(facturas ?? []).map((f) => {
              const cliente = (f as Record<string, unknown>).clientes as { nombre: string } | null;
              return (
                <tr key={f.id} className="text-slate-300 hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/facturacion/${f.id}`} className="font-medium text-white hover:text-blue-400">
                      #{f.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{cliente?.nombre ?? "-"}</td>
                  <td className="px-4 py-3">{new Date(f.fecha).toLocaleDateString("es-MX")}</td>
                  <td className="px-4 py-3 text-right">${Number(f.subtotal).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">${Number(f.impuesto).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-medium">${Number(f.total).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${estadoColors[f.estado] ?? ""}`}>
                      {f.estado}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(facturas ?? []).length === 0 && (
          <p className="text-center text-slate-500 py-8">No hay documentos de facturación</p>
        )}
      </div>

      <Pagination totalItems={count ?? 0} pageSize={PAGE_SIZE} currentPage={page} />
    </div>
  );
}
