import { createClient } from "@/lib/supabase/server";
import { Pagination } from "@/components/ui/pagination";
import Link from "next/link";
import { Plus, ArrowLeft, Package } from "lucide-react";

const PAGE_SIZE = 15;

const estadoColors: Record<string, string> = {
  pendiente: "bg-slate-700 text-slate-300",
  verificado: "bg-blue-900/50 text-blue-400",
  liquidado: "bg-green-900/50 text-green-400",
  pagado: "bg-emerald-900/50 text-emerald-400",
  rechazado: "bg-red-900/50 text-red-400",
};

const calColors: Record<string, string> = {
  A: "bg-green-900/50 text-green-400",
  B: "bg-blue-900/50 text-blue-400",
  C: "bg-yellow-900/50 text-yellow-400",
  D: "bg-red-900/50 text-red-400",
};

export default async function EntregasColonoPage({
  searchParams,
}: {
  searchParams: { page?: string; estado?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const supabase = createClient();

  let query = supabase.from("entregas_colono").select("*, colonos(codigo, nombre), parcelas(nombre)", { count: "exact" });
  if (searchParams.estado) query = query.eq("estado", searchParams.estado);

  const from = (page - 1) * PAGE_SIZE;
  const { data: entregas, count } = await query.order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/colonos" className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
          <Package className="w-7 h-7 text-lime-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Entregas de Colonos</h1>
            <p className="text-slate-400 mt-1">Registro y liquidación de entregas de caña</p>
          </div>
        </div>
        <Link href="/dashboard/colonos/entregas/nueva" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors">
          <Plus className="w-4 h-4" />
          Nueva Entrega
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">Colono</th>
              <th className="px-4 py-3">Parcela</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3 text-right">Ton. Brutas</th>
              <th className="px-4 py-3 text-right">Ton. Netas</th>
              <th className="px-4 py-3 text-right">Monto Neto</th>
              <th className="px-4 py-3">Calidad</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {(entregas ?? []).map((e) => {
              const colono = (e as Record<string, unknown>).colonos as { codigo: string; nombre: string } | null;
              const parcela = (e as Record<string, unknown>).parcelas as { nombre: string } | null;
              return (
                <tr key={e.id} className="text-slate-300 hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-white">#{e.numero}</td>
                  <td className="px-4 py-3">{colono?.nombre ?? "-"}</td>
                  <td className="px-4 py-3">{parcela?.nombre ?? "-"}</td>
                  <td className="px-4 py-3">{new Date(e.fecha_entrega).toLocaleDateString("es-MX")}</td>
                  <td className="px-4 py-3 text-right">{Number(e.toneladas_brutas).toFixed(1)}</td>
                  <td className="px-4 py-3 text-right font-medium">{Number(e.toneladas_netas).toFixed(1)}</td>
                  <td className="px-4 py-3 text-right font-medium text-green-400">Q{Number(e.monto_neto).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${calColors[e.calificacion_calidad] ?? ""}`}>{e.calificacion_calidad}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${estadoColors[e.estado] ?? ""}`}>{e.estado}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(entregas ?? []).length === 0 && <p className="text-center text-slate-500 py-8">No hay entregas registradas</p>}
      </div>

      <Pagination totalItems={count ?? 0} pageSize={PAGE_SIZE} currentPage={page} />
    </div>
  );
}
