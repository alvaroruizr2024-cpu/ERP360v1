import { createClient } from "@/lib/supabase/server";
import { Pagination } from "@/components/ui/pagination";
import Link from "next/link";
import { Plus, ArrowLeft, Truck } from "lucide-react";

const PAGE_SIZE = 15;

const estadoColors: Record<string, string> = {
  programado: "bg-slate-700 text-slate-300",
  en_transito: "bg-yellow-900/50 text-yellow-400",
  entregado: "bg-green-900/50 text-green-400",
  cancelado: "bg-red-900/50 text-red-400",
};

export default async function ViajesPage({
  searchParams,
}: {
  searchParams: { page?: string; estado?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const supabase = createClient();

  let query = supabase.from("viajes").select("*, rutas_transporte(nombre, codigo), vehiculos(placa, tipo)", { count: "exact" });
  if (searchParams.estado) query = query.eq("estado", searchParams.estado);

  const from = (page - 1) * PAGE_SIZE;
  const { data: viajes, count } = await query.order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);

  const { data: allViajes } = await supabase.from("viajes").select("toneladas_transportadas, costo_flete, estado");
  const items = allViajes ?? [];
  const totalTon = items.reduce((s, v) => s + Number(v.toneladas_transportadas), 0);
  const totalFlete = items.reduce((s, v) => s + Number(v.costo_flete), 0);
  const enTransito = items.filter((v) => v.estado === "en_transito").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/logistica" className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
          <Truck className="w-7 h-7 text-indigo-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Control de Viajes</h1>
            <p className="text-slate-400 mt-1">Seguimiento de viajes y entregas</p>
          </div>
        </div>
        <Link href="/dashboard/logistica/viajes/nuevo" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors">
          <Plus className="w-4 h-4" />
          Nuevo Viaje
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Total Viajes</p>
          <p className="text-2xl font-bold text-white mt-1">{count ?? 0}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">En Tránsito</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{enTransito}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Toneladas Mov.</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{totalTon.toLocaleString("es-MX", { minimumFractionDigits: 1 })}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Costo Fletes</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">Q{totalFlete.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">Ruta</th>
              <th className="px-4 py-3">Vehículo</th>
              <th className="px-4 py-3">Chofer</th>
              <th className="px-4 py-3">Salida</th>
              <th className="px-4 py-3 text-right">Toneladas</th>
              <th className="px-4 py-3 text-right">Flete</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {(viajes ?? []).map((v) => {
              const ruta = (v as Record<string, unknown>).rutas_transporte as { nombre: string; codigo: string } | null;
              const vehiculo = (v as Record<string, unknown>).vehiculos as { placa: string; tipo: string } | null;
              return (
                <tr key={v.id} className="text-slate-300 hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-white">#{v.numero}</td>
                  <td className="px-4 py-3">{ruta?.nombre ?? "-"}</td>
                  <td className="px-4 py-3">{vehiculo?.placa ?? "-"}</td>
                  <td className="px-4 py-3">{v.chofer ?? "-"}</td>
                  <td className="px-4 py-3">{new Date(v.fecha_salida).toLocaleString("es-MX")}</td>
                  <td className="px-4 py-3 text-right font-medium">{Number(v.toneladas_transportadas).toFixed(1)}</td>
                  <td className="px-4 py-3 text-right">Q{Number(v.costo_flete).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${estadoColors[v.estado] ?? ""}`}>{v.estado}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(viajes ?? []).length === 0 && <p className="text-center text-slate-500 py-8">No hay viajes registrados</p>}
      </div>

      <Pagination totalItems={count ?? 0} pageSize={PAGE_SIZE} currentPage={page} />
    </div>
  );
}
