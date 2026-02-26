import { createClient } from "@/lib/supabase/server";
import { Pagination } from "@/components/ui/pagination";
import { AdvancedFilters } from "@/components/ui/advanced-filters";
import Link from "next/link";
import { Plus, Wrench, ClipboardList, Box } from "lucide-react";

const PAGE_SIZE = 15;

const tipoColors: Record<string, string> = {
  molino: "bg-amber-900/50 text-amber-400",
  caldera: "bg-red-900/50 text-red-400",
  centrifuga: "bg-blue-900/50 text-blue-400",
  evaporador: "bg-purple-900/50 text-purple-400",
  cristalizador: "bg-cyan-900/50 text-cyan-400",
  filtro: "bg-green-900/50 text-green-400",
  bomba: "bg-indigo-900/50 text-indigo-400",
  motor: "bg-yellow-900/50 text-yellow-400",
  transportador: "bg-orange-900/50 text-orange-400",
  otro: "bg-slate-700 text-slate-300",
};

const estadoColors: Record<string, string> = {
  operativo: "bg-green-900/50 text-green-400",
  en_mantenimiento: "bg-yellow-900/50 text-yellow-400",
  fuera_servicio: "bg-red-900/50 text-red-400",
  en_reserva: "bg-blue-900/50 text-blue-400",
  dado_baja: "bg-slate-700 text-slate-300",
};

const critColors: Record<string, string> = {
  critica: "bg-red-900/50 text-red-400",
  alta: "bg-orange-900/50 text-orange-400",
  media: "bg-yellow-900/50 text-yellow-400",
  baja: "bg-green-900/50 text-green-400",
};

export default async function MantenimientoIndustrialPage({
  searchParams,
}: {
  searchParams: { page?: string; tipo?: string; estado?: string; area?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const supabase = createClient();

  let query = supabase.from("equipos_industriales").select("*", { count: "exact" });
  if (searchParams.tipo) query = query.eq("tipo", searchParams.tipo);
  if (searchParams.estado) query = query.eq("estado", searchParams.estado);
  if (searchParams.area) query = query.eq("area", searchParams.area);

  const from = (page - 1) * PAGE_SIZE;
  const { data: equipos, count } = await query.order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);

  const { data: allEquipos } = await supabase.from("equipos_industriales").select("estado, criticidad");
  const all = allEquipos ?? [];
  const operativos = all.filter((e) => e.estado === "operativo").length;
  const criticos = all.filter((e) => e.criticidad === "critica").length;

  const { data: otCount } = await supabase.from("ordenes_trabajo").select("estado");
  const otAbiertas = (otCount ?? []).filter((o) => !["completada", "cerrada", "cancelada"].includes(o.estado)).length;

  const filterConfig = [
    {
      key: "tipo", label: "Tipo", type: "select" as const,
      options: [
        { value: "molino", label: "Molino" }, { value: "caldera", label: "Caldera" },
        { value: "centrifuga", label: "Centrífuga" }, { value: "evaporador", label: "Evaporador" },
        { value: "bomba", label: "Bomba" }, { value: "motor", label: "Motor" },
      ],
    },
    {
      key: "estado", label: "Estado", type: "select" as const,
      options: [
        { value: "operativo", label: "Operativo" }, { value: "en_mantenimiento", label: "En Mantenimiento" },
        { value: "fuera_servicio", label: "Fuera de Servicio" },
      ],
    },
    {
      key: "area", label: "Área", type: "select" as const,
      options: [
        { value: "molinos", label: "Molinos" }, { value: "calderas", label: "Calderas" },
        { value: "evaporacion", label: "Evaporación" }, { value: "cristalizacion", label: "Cristalización" },
        { value: "centrifugado", label: "Centrifugado" }, { value: "patio", label: "Patio" },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wrench className="w-7 h-7 text-orange-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Mantenimiento Industrial</h1>
            <p className="text-slate-400 mt-1">Equipos, órdenes de trabajo y repuestos</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/mantenimiento-industrial/ordenes" className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-600 transition-colors">
            <ClipboardList className="w-4 h-4" />
            Órdenes
          </Link>
          <Link href="/dashboard/mantenimiento-industrial/repuestos" className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-600 transition-colors">
            <Box className="w-4 h-4" />
            Repuestos
          </Link>
          <Link href="/dashboard/mantenimiento-industrial/nuevo-equipo" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors">
            <Plus className="w-4 h-4" />
            Nuevo Equipo
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Total Equipos</p>
          <p className="text-2xl font-bold text-white mt-1">{count ?? 0}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Operativos</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{operativos}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Criticidad Alta</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{criticos}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">OT Abiertas</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{otAbiertas}</p>
        </div>
      </div>

      <AdvancedFilters filters={filterConfig} />

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Área</th>
              <th className="px-4 py-3">Marca/Modelo</th>
              <th className="px-4 py-3 text-right">Horas Op.</th>
              <th className="px-4 py-3">Criticidad</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {(equipos ?? []).map((e) => (
              <tr key={e.id} className="text-slate-300 hover:bg-slate-800/50">
                <td className="px-4 py-3 font-medium text-white">{e.codigo}</td>
                <td className="px-4 py-3">{e.nombre}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${tipoColors[e.tipo] ?? ""}`}>{e.tipo}</span>
                </td>
                <td className="px-4 py-3 capitalize">{e.area ?? "-"}</td>
                <td className="px-4 py-3">{[e.marca, e.modelo].filter(Boolean).join(" ") || "-"}</td>
                <td className="px-4 py-3 text-right">{Number(e.horas_operacion).toLocaleString("es-MX")}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${critColors[e.criticidad] ?? ""}`}>{e.criticidad}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${estadoColors[e.estado] ?? ""}`}>{e.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(equipos ?? []).length === 0 && <p className="text-center text-slate-500 py-8">No hay equipos registrados</p>}
      </div>

      <Pagination totalItems={count ?? 0} pageSize={PAGE_SIZE} currentPage={page} />
    </div>
  );
}
