import { createClient } from "@/lib/supabase/server";
import { Pagination } from "@/components/ui/pagination";
import { AdvancedFilters } from "@/components/ui/advanced-filters";
import Link from "next/link";
import { Plus } from "lucide-react";

const PAGE_SIZE = 15;

const estadoColors: Record<string, string> = {
  pendiente: "bg-yellow-900/50 text-yellow-400",
  recibida: "bg-green-900/50 text-green-400",
  cancelada: "bg-red-900/50 text-red-400",
};

export default async function ComprasPage({
  searchParams,
}: {
  searchParams: { page?: string; estado?: string; fecha_from?: string; fecha_to?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const estado = searchParams.estado || "";
  const fechaFrom = searchParams.fecha_from || "";
  const fechaTo = searchParams.fecha_to || "";

  const supabase = createClient();

  let query = supabase.from("ordenes_compra").select("*, proveedores(nombre)", { count: "exact" });

  if (estado) query = query.eq("estado", estado as "pendiente" | "recibida" | "cancelada");
  if (fechaFrom) query = query.gte("fecha", fechaFrom);
  if (fechaTo) query = query.lte("fecha", fechaTo);

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: ordenes, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  const filterConfig = [
    {
      key: "estado",
      label: "Estado",
      type: "select" as const,
      options: [
        { value: "pendiente", label: "Pendiente" },
        { value: "recibida", label: "Recibida" },
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
        <div>
          <h1 className="text-2xl font-bold text-white">Compras</h1>
          <p className="text-slate-400 mt-1">{count ?? 0} órdenes de compra</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/compras/proveedores"
            className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-600 transition-colors"
          >
            Proveedores
          </Link>
          <Link
            href="/dashboard/compras/nueva"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Orden
          </Link>
        </div>
      </div>

      <AdvancedFilters filters={filterConfig} />

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">Proveedor</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {(ordenes ?? []).map((o) => {
              const prov = (o as Record<string, unknown>).proveedores as { nombre: string } | null;
              return (
                <tr key={o.id} className="text-slate-300 hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/compras/${o.id}`}
                      className="font-medium text-white hover:text-blue-400"
                    >
                      #{o.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{prov?.nombre ?? "Sin proveedor"}</td>
                  <td className="px-4 py-3">
                    {new Date(o.fecha).toLocaleDateString("es-MX")}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    ${Number(o.total).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${estadoColors[o.estado] ?? ""}`}>
                      {o.estado}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(ordenes ?? []).length === 0 && (
          <p className="text-center text-slate-500 py-8">No hay órdenes de compra</p>
        )}
      </div>

      <Pagination totalItems={count ?? 0} pageSize={PAGE_SIZE} currentPage={page} />
    </div>
  );
}
