import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Tractor } from "lucide-react";

const tipoColors: Record<string, string> = { corte: "bg-green-900/50 text-green-400", alce: "bg-yellow-900/50 text-yellow-400", transporte: "bg-blue-900/50 text-blue-400" };
const estadoColors: Record<string, string> = { programada: "bg-slate-700 text-slate-300", en_proceso: "bg-yellow-900/50 text-yellow-400", completada: "bg-green-900/50 text-green-400", cancelada: "bg-red-900/50 text-red-400" };

export default async function OperacionDetallePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: op } = await supabase.from("operaciones_campo").select("*, parcelas(nombre, codigo, hectareas)").eq("id", params.id).single();

  if (!op) notFound();

  const parcela = (op as Record<string, unknown>).parcelas as { nombre: string; codigo: string; hectareas: number } | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/operaciones" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Tractor className="w-6 h-6 text-green-400" />
        <h1 className="text-2xl font-bold text-white">Operación #{op.numero}</h1>
        <span className={`px-3 py-1 rounded-full text-xs ${tipoColors[op.tipo] ?? ""}`}>{op.tipo}</span>
        <span className={`px-3 py-1 rounded-full text-xs ${estadoColors[op.estado] ?? ""}`}>{op.estado}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white">Información General</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-400">Tipo</dt><dd className="text-white capitalize">{op.tipo}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Fecha</dt><dd className="text-white">{new Date(op.fecha).toLocaleString("es-MX")}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Turno</dt><dd className="text-white capitalize">{op.turno ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Cuadrilla</dt><dd className="text-white">{op.cuadrilla ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Chofer</dt><dd className="text-white">{op.chofer ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Estado</dt><dd className="text-white capitalize">{op.estado}</dd></div>
          </dl>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white">Producción y Parcela</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-400">Parcela</dt><dd className="text-white">{parcela ? `${parcela.codigo} - ${parcela.nombre}` : "-"}</dd></div>
            {parcela && <div className="flex justify-between"><dt className="text-slate-400">Hectáreas parcela</dt><dd className="text-white">{parcela.hectareas} ha</dd></div>}
            <div className="flex justify-between"><dt className="text-slate-400">Toneladas</dt><dd className="text-white font-semibold text-green-400">{Number(op.toneladas).toFixed(1)} tn</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Hectáreas trabajadas</dt><dd className="text-white font-semibold">{Number(op.hectareas_trabajadas).toFixed(1)} ha</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Origen</dt><dd className="text-white">{op.origen ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Destino</dt><dd className="text-white">{op.destino ?? "-"}</dd></div>
          </dl>
        </div>
      </div>

      {op.observaciones && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-2">Observaciones</h3>
          <p className="text-sm text-slate-300">{op.observaciones}</p>
        </div>
      )}
    </div>
  );
}
