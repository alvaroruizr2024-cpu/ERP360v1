import { createClient } from "@/lib/supabase/server";
import { Pagination } from "@/components/ui/pagination";
import { AdvancedFilters } from "@/components/ui/advanced-filters";
import Link from "next/link";
import { Plus, UserCheck, Truck } from "lucide-react";

const PAGE_SIZE = 15;

const estadoColors: Record<string, string> = {
  activo: "bg-green-900/50 text-green-400",
  inactivo: "bg-slate-700 text-slate-300",
  suspendido: "bg-red-900/50 text-red-400",
};

const contratoLabels: Record<string, string> = {
  individual: "Individual",
  cooperativa: "Cooperativa",
  asociacion: "Asociación",
  arrendamiento: "Arrendamiento",
};

export default async function ColonosPage({
  searchParams,
}: {
  searchParams: { page?: string; estado?: string; tipo_contrato?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const supabase = createClient();

  let query = supabase.from("colonos").select("*", { count: "exact" });
  if (searchParams.estado) query = query.eq("estado", searchParams.estado);
  if (searchParams.tipo_contrato) query = query.eq("tipo_contrato", searchParams.tipo_contrato);

  const from = (page - 1) * PAGE_SIZE;
  const { data: colonos, count } = await query.order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);

  const { data: allColonos } = await supabase.from("colonos").select("estado, precio_tonelada");
  const all = allColonos ?? [];
  const activos = all.filter((c) => c.estado === "activo").length;

  const { data: entregasData } = await supabase.from("entregas_colono").select("toneladas_netas, monto_neto");
  const entregas = entregasData ?? [];
  const totalTon = entregas.reduce((s, e) => s + Number(e.toneladas_netas), 0);
  const totalPago = entregas.reduce((s, e) => s + Number(e.monto_neto), 0);

  const filterConfig = [
    {
      key: "estado", label: "Estado", type: "select" as const,
      options: [
        { value: "activo", label: "Activo" },
        { value: "inactivo", label: "Inactivo" },
        { value: "suspendido", label: "Suspendido" },
      ],
    },
    {
      key: "tipo_contrato", label: "Contrato", type: "select" as const,
      options: [
        { value: "individual", label: "Individual" },
        { value: "cooperativa", label: "Cooperativa" },
        { value: "asociacion", label: "Asociación" },
        { value: "arrendamiento", label: "Arrendamiento" },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCheck className="w-7 h-7 text-lime-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Portal de Colonos</h1>
            <p className="text-slate-400 mt-1">Gestión de colonos, entregas y liquidaciones</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/colonos/entregas" className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-600 transition-colors">
            <Truck className="w-4 h-4" />
            Entregas
          </Link>
          <Link href="/dashboard/colonos/nuevo" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors">
            <Plus className="w-4 h-4" />
            Nuevo Colono
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Total Colonos</p>
          <p className="text-2xl font-bold text-white mt-1">{count ?? 0}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Activos</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{activos}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Ton. Entregadas</p>
          <p className="text-2xl font-bold text-lime-400 mt-1">{totalTon.toLocaleString("es-MX", { minimumFractionDigits: 1 })}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Total Liquidado</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">Q{totalPago.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <AdvancedFilters filters={filterConfig} />

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3">Contrato</th>
              <th className="px-4 py-3 text-right">Precio/Ton</th>
              <th className="px-4 py-3">Banco</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {(colonos ?? []).map((c) => (
              <tr key={c.id} className="text-slate-300 hover:bg-slate-800/50">
                <td className="px-4 py-3">
                  <Link href={`/dashboard/colonos/${c.id}`} className="font-medium text-white hover:text-blue-400">{c.codigo}</Link>
                </td>
                <td className="px-4 py-3">{c.nombre}</td>
                <td className="px-4 py-3">{c.telefono ?? "-"}</td>
                <td className="px-4 py-3">{contratoLabels[c.tipo_contrato] ?? c.tipo_contrato}</td>
                <td className="px-4 py-3 text-right font-medium">Q{Number(c.precio_tonelada).toFixed(2)}</td>
                <td className="px-4 py-3">{c.banco ?? "-"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${estadoColors[c.estado] ?? ""}`}>{c.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(colonos ?? []).length === 0 && <p className="text-center text-slate-500 py-8">No hay colonos registrados</p>}
      </div>

      <Pagination totalItems={count ?? 0} pageSize={PAGE_SIZE} currentPage={page} />
    </div>
  );
}
