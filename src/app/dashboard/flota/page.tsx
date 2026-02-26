import { createClient } from "@/lib/supabase/server";
import { Pagination } from "@/components/ui/pagination";
import { AdvancedFilters } from "@/components/ui/advanced-filters";
import Link from "next/link";
import { Plus, Truck } from "lucide-react";

const PAGE_SIZE = 15;

const tipoLabels: Record<string, string> = {
  camion: "Camión",
  tractor: "Tractor",
  alzadora: "Alzadora",
  cosechadora: "Cosechadora",
  vehiculo_liviano: "Vehículo Liviano",
  otro: "Otro",
};

const estadoColors: Record<string, string> = {
  disponible: "bg-green-900/50 text-green-400",
  en_operacion: "bg-blue-900/50 text-blue-400",
  en_mantenimiento: "bg-yellow-900/50 text-yellow-400",
  fuera_servicio: "bg-red-900/50 text-red-400",
};

export default async function FlotaPage({
  searchParams,
}: {
  searchParams: { page?: string; tipo?: string; estado?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const tipo = searchParams.tipo || "";
  const estado = searchParams.estado || "";

  const supabase = createClient();

  let query = supabase.from("vehiculos").select("*", { count: "exact" });

  if (tipo) query = query.eq("tipo", tipo as "camion" | "tractor" | "alzadora" | "cosechadora" | "vehiculo_liviano" | "otro");
  if (estado) query = query.eq("estado", estado as "disponible" | "en_operacion" | "en_mantenimiento" | "fuera_servicio");

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: vehiculos, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  // KPIs
  const { data: allVehiculos } = await supabase.from("vehiculos").select("estado, tipo");
  const v = allVehiculos ?? [];
  const disponibles = v.filter((x) => x.estado === "disponible").length;
  const enOperacion = v.filter((x) => x.estado === "en_operacion").length;
  const enMant = v.filter((x) => x.estado === "en_mantenimiento").length;

  const filterConfig = [
    {
      key: "tipo",
      label: "Tipo",
      type: "select" as const,
      options: Object.entries(tipoLabels).map(([v, l]) => ({ value: v, label: l })),
    },
    {
      key: "estado",
      label: "Estado",
      type: "select" as const,
      options: [
        { value: "disponible", label: "Disponible" },
        { value: "en_operacion", label: "En Operación" },
        { value: "en_mantenimiento", label: "En Mantenimiento" },
        { value: "fuera_servicio", label: "Fuera de Servicio" },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Truck className="w-7 h-7 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Flota Vehicular</h1>
            <p className="text-slate-400 mt-1">Camiones, tractores y mantenimiento</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/flota/mantenimiento"
            className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-600 transition-colors"
          >
            Mantenimientos
          </Link>
          <Link
            href="/dashboard/flota/nuevo"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Vehículo
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Total Flota</p>
          <p className="text-2xl font-bold text-white mt-1">{count ?? 0}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Disponibles</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{disponibles}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">En Operación</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{enOperacion}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">En Mantenimiento</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{enMant}</p>
        </div>
      </div>

      <AdvancedFilters filters={filterConfig} />

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Placa</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Marca / Modelo</th>
              <th className="px-4 py-3">Año</th>
              <th className="px-4 py-3 text-right">Capacidad (tn)</th>
              <th className="px-4 py-3 text-right">Kilometraje</th>
              <th className="px-4 py-3">Chofer</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {(vehiculos ?? []).map((v) => (
              <tr key={v.id} className="text-slate-300 hover:bg-slate-800/50">
                <td className="px-4 py-3">
                  <Link href={`/dashboard/flota/${v.id}`} className="font-mono font-medium text-white hover:text-blue-400">
                    {v.placa}
                  </Link>
                </td>
                <td className="px-4 py-3">{tipoLabels[v.tipo] ?? v.tipo}</td>
                <td className="px-4 py-3">{[v.marca, v.modelo].filter(Boolean).join(" ") || "-"}</td>
                <td className="px-4 py-3">{v.anio ?? "-"}</td>
                <td className="px-4 py-3 text-right">{v.capacidad_toneladas ? Number(v.capacidad_toneladas).toFixed(1) : "-"}</td>
                <td className="px-4 py-3 text-right font-mono">{Number(v.kilometraje).toLocaleString("es-MX")}</td>
                <td className="px-4 py-3">{v.chofer_asignado ?? "-"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${estadoColors[v.estado] ?? ""}`}>
                    {v.estado?.replace(/_/g, " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(vehiculos ?? []).length === 0 && (
          <p className="text-center text-slate-500 py-8">No hay vehículos registrados</p>
        )}
      </div>

      <Pagination totalItems={count ?? 0} pageSize={PAGE_SIZE} currentPage={page} />
    </div>
  );
}
