import { createClient } from "@/lib/supabase/server";
import { ProductTable } from "@/components/inventario/product-table";
import { Pagination } from "@/components/ui/pagination";
import { AdvancedFilters } from "@/components/ui/advanced-filters";
import Link from "next/link";
import { Plus } from "lucide-react";

const PAGE_SIZE = 15;

export default async function InventarioPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; categoria?: string; estado?: string; precio_min?: string; precio_max?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const search = searchParams.search || "";
  const categoria = searchParams.categoria || "";
  const estado = searchParams.estado || "";
  const precioMin = searchParams.precio_min ? Number(searchParams.precio_min) : null;
  const precioMax = searchParams.precio_max ? Number(searchParams.precio_max) : null;

  const supabase = createClient();

  // Build query with filters
  let query = supabase.from("productos").select("*", { count: "exact" });

  if (search) {
    query = query.or(`nombre.ilike.%${search}%,sku.ilike.%${search}%`);
  }
  if (categoria) {
    query = query.eq("categoria", categoria);
  }
  if (estado) {
    query = query.eq("estado", estado as "activo" | "inactivo");
  }
  if (precioMin !== null) {
    query = query.gte("precio", precioMin);
  }
  if (precioMax !== null) {
    query = query.lte("precio", precioMax);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: productos, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  // Get unique categories for the filter
  const { data: allProds } = await supabase.from("productos").select("categoria");
  const categorias = Array.from(new Set((allProds ?? []).map((p) => p.categoria).filter(Boolean))) as string[];

  const filterConfig = [
    {
      key: "categoria",
      label: "Categoría",
      type: "select" as const,
      options: categorias.map((c) => ({ value: c, label: c })),
    },
    {
      key: "estado",
      label: "Estado",
      type: "select" as const,
      options: [
        { value: "activo", label: "Activo" },
        { value: "inactivo", label: "Inactivo" },
      ],
    },
    {
      key: "precio",
      label: "Precio",
      type: "number_range" as const,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventario</h1>
          <p className="text-slate-400 mt-1">
            {count ?? 0} productos
          </p>
        </div>
        <Link
          href="/dashboard/inventario/nuevo"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </Link>
      </div>

      <AdvancedFilters filters={filterConfig} />

      <ProductTable productos={productos ?? []} />

      <Pagination totalItems={count ?? 0} pageSize={PAGE_SIZE} currentPage={page} />
    </div>
  );
}
