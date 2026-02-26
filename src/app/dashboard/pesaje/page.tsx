import { createClient } from "@/lib/supabase/server";
import { Pagination } from "@/components/ui/pagination";
import { AdvancedFilters } from "@/components/ui/advanced-filters";
import Link from "next/link";
import { Plus, Scale } from "lucide-react";

const PAGE_SIZE = 15;

const estadoColors: Record<string, string> = {
  pendiente: "bg-yellow-900/50 text-yellow-400",
  completo: "bg-green-900/50 text-green-400",
  anulado: "bg-red-900/50 text-red-400",
};

export default async function PesajePage({
  searchParams,
}: {
  searchParams: { page?: string; tipo?: string; estado?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const tipo = searchParams.tipo || "";
  const estado = searchParams.estado || "";

  const supabase = createClient();

  let query = supabase.from("registros_pesaje").select("*, parcelas(nombre)", { count: "exact" });

  if (tipo) query = query.eq("tipo", tipo as "entrada" | "salida");
  if (estado) query = query.eq("estado", estado as "pendiente" | "completo" | "anulado");

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: registros, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  // KPIs
  const { data: allPesajes } = await supabase.from("registros_pesaje").select("peso_neto, peso_neto_ajustado, estado");
  const pesajes = allPesajes ?? [];
  const totalPesoNeto = pesajes.reduce((s, p) => s + Number(p.peso_neto), 0);
  const totalAjustado = pesajes.reduce((s, p) => s + Number(p.peso_neto_ajustado), 0);
  const pendientes = pesajes.filter((p) => p.estado === "pendiente").length;

  const filterConfig = [
    {
      key: "tipo",
      label: "Tipo",
      type: "select" as const,
      options: [
        { value: "entrada", label: "Entrada" },
        { value: "salida", label: "Salida" },
      ],
    },
    {
      key: "estado",
      label: "Estado",
      type: "select" as const,
      options: [
        { value: "pendiente", label: "Pendiente" },
        { value: "completo", label: "Completo" },
        { value: "anulado", label: "Anulado" },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scale className="w-7 h-7 text-cyan-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Control de Pesaje</h1>
            <p className="text-slate-400 mt-1">Registros de báscula: entrada, salida, tara y peso neto</p>
          </div>
        </div>
        <Link
          href="/dashboard/pesaje/nuevo"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Pesaje
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Total Registros</p>
          <p className="text-2xl font-bold text-white mt-1">{count ?? 0}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Peso Neto Total</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">{totalPesoNeto.toLocaleString("es-MX", { minimumFractionDigits: 1 })} tn</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Peso Ajustado</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{totalAjustado.toLocaleString("es-MX", { minimumFractionDigits: 1 })} tn</p>
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
              <th className="px-4 py-3">Ticket</th>
              <th className="px-4 py-3">Placa</th>
              <th className="px-4 py-3">Chofer</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3 text-right">Peso Bruto</th>
              <th className="px-4 py-3 text-right">Tara</th>
              <th className="px-4 py-3 text-right">Peso Neto</th>
              <th className="px-4 py-3">Fecha/Hora</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {(registros ?? []).map((r) => (
              <tr key={r.id} className="text-slate-300 hover:bg-slate-800/50">
                <td className="px-4 py-3">
                  <Link href={`/dashboard/pesaje/${r.id}`} className="font-medium text-white hover:text-blue-400">
                    {r.ticket ?? `#${r.numero}`}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono">{r.vehiculo_placa}</td>
                <td className="px-4 py-3">{r.chofer ?? "-"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${r.tipo === "entrada" ? "bg-blue-900/50 text-blue-400" : "bg-purple-900/50 text-purple-400"}`}>
                    {r.tipo}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">{Number(r.peso_bruto).toFixed(2)}</td>
                <td className="px-4 py-3 text-right">{Number(r.tara).toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-medium">{Number(r.peso_neto).toFixed(2)}</td>
                <td className="px-4 py-3 text-xs">{new Date(r.fecha_hora).toLocaleString("es-MX")}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${estadoColors[r.estado] ?? ""}`}>
                    {r.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(registros ?? []).length === 0 && (
          <p className="text-center text-slate-500 py-8">No hay registros de pesaje</p>
        )}
      </div>

      <Pagination totalItems={count ?? 0} pageSize={PAGE_SIZE} currentPage={page} />
    </div>
  );
}
