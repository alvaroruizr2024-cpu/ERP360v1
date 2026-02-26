import { createClient } from "@/lib/supabase/server";
import { Pagination } from "@/components/ui/pagination";
import Link from "next/link";
import { Plus, ArrowLeft, Box } from "lucide-react";

const PAGE_SIZE = 15;

const catColors: Record<string, string> = {
  mecanico: "bg-blue-900/50 text-blue-400",
  electrico: "bg-yellow-900/50 text-yellow-400",
  hidraulico: "bg-cyan-900/50 text-cyan-400",
  neumatico: "bg-green-900/50 text-green-400",
  instrumentacion: "bg-purple-900/50 text-purple-400",
  general: "bg-slate-700 text-slate-300",
};

export default async function RepuestosPage({
  searchParams,
}: {
  searchParams: { page?: string; categoria?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const supabase = createClient();

  let query = supabase.from("repuestos").select("*", { count: "exact" });
  if (searchParams.categoria) query = query.eq("categoria", searchParams.categoria);

  const from = (page - 1) * PAGE_SIZE;
  const { data: repuestos, count } = await query.order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);

  const { data: allRep } = await supabase.from("repuestos").select("stock_actual, stock_minimo, precio_unitario");
  const all = allRep ?? [];
  const valorInventario = all.reduce((s, r) => s + Number(r.stock_actual) * Number(r.precio_unitario), 0);
  const stockBajo = all.filter((r) => Number(r.stock_actual) <= Number(r.stock_minimo) && Number(r.stock_actual) > 0).length;
  const agotados = all.filter((r) => Number(r.stock_actual) <= 0).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/mantenimiento-industrial" className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
          <Box className="w-7 h-7 text-orange-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Inventario de Repuestos</h1>
            <p className="text-slate-400 mt-1">Gestión de repuestos y piezas industriales</p>
          </div>
        </div>
        <Link href="/dashboard/mantenimiento-industrial/repuestos/nuevo" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors">
          <Plus className="w-4 h-4" />
          Nuevo Repuesto
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Total Repuestos</p>
          <p className="text-2xl font-bold text-white mt-1">{count ?? 0}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Valor Inventario</p>
          <p className="text-2xl font-bold text-green-400 mt-1">Q{valorInventario.toLocaleString("es-MX")}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Stock Bajo</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{stockBajo}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Agotados</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{agotados}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3 text-right">Mínimo</th>
              <th className="px-4 py-3 text-right">Precio Unit.</th>
              <th className="px-4 py-3">Proveedor</th>
              <th className="px-4 py-3">Ubicación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {(repuestos ?? []).map((r) => {
              const stockAlert = Number(r.stock_actual) <= Number(r.stock_minimo);
              return (
                <tr key={r.id} className="text-slate-300 hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-white">{r.codigo}</td>
                  <td className="px-4 py-3">{r.nombre}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${catColors[r.categoria] ?? ""}`}>{r.categoria}</span>
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${stockAlert ? "text-red-400" : "text-white"}`}>
                    {Number(r.stock_actual).toLocaleString("es-MX")}
                  </td>
                  <td className="px-4 py-3 text-right">{Number(r.stock_minimo).toLocaleString("es-MX")}</td>
                  <td className="px-4 py-3 text-right">Q{Number(r.precio_unitario).toFixed(2)}</td>
                  <td className="px-4 py-3">{r.proveedor ?? "-"}</td>
                  <td className="px-4 py-3">{r.ubicacion_almacen ?? "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(repuestos ?? []).length === 0 && <p className="text-center text-slate-500 py-8">No hay repuestos registrados</p>}
      </div>

      <Pagination totalItems={count ?? 0} pageSize={PAGE_SIZE} currentPage={page} />
    </div>
  );
}
