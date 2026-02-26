import { createClient } from "@/lib/supabase/server";
import { InvoiceTable } from "@/components/ventas/invoice-table";
import { Pagination } from "@/components/ui/pagination";
import { AdvancedFilters } from "@/components/ui/advanced-filters";
import Link from "next/link";
import { Plus } from "lucide-react";

const PAGE_SIZE = 15;

export default async function VentasPage({
  searchParams,
}: {
  searchParams: { page?: string; estado?: string; fecha_from?: string; fecha_to?: string; total_min?: string; total_max?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const estado = searchParams.estado || "";
  const fechaFrom = searchParams.fecha_from || "";
  const fechaTo = searchParams.fecha_to || "";
  const totalMin = searchParams.total_min ? Number(searchParams.total_min) : null;
  const totalMax = searchParams.total_max ? Number(searchParams.total_max) : null;

  const supabase = createClient();

  let query = supabase.from("facturas").select("*, clientes(nombre)", { count: "exact" });

  if (estado) query = query.eq("estado", estado as "pendiente" | "pagada" | "cancelada");
  if (fechaFrom) query = query.gte("fecha", fechaFrom);
  if (fechaTo) query = query.lte("fecha", fechaTo);
  if (totalMin !== null) query = query.gte("total", totalMin);
  if (totalMax !== null) query = query.lte("total", totalMax);

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: facturas, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

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
    {
      key: "total",
      label: "Total",
      type: "number_range" as const,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Ventas</h1>
          <p className="text-slate-400 mt-1">{count ?? 0} facturas</p>
        </div>
        <Link
          href="/dashboard/ventas/nueva"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Factura
        </Link>
      </div>

      <AdvancedFilters filters={filterConfig} />

      <InvoiceTable facturas={(facturas as never[]) ?? []} />

      <Pagination totalItems={count ?? 0} pageSize={PAGE_SIZE} currentPage={page} />
    </div>
  );
}
