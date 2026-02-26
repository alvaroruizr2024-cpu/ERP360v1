import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";

const estadoColors: Record<string, string> = { pendiente: "bg-yellow-900/50 text-yellow-400", completo: "bg-green-900/50 text-green-400", anulado: "bg-red-900/50 text-red-400" };

export default async function PesajeDetallePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: reg } = await supabase.from("registros_pesaje").select("*, parcelas(nombre, codigo)").eq("id", params.id).single();

  if (!reg) notFound();

  const parcela = (reg as Record<string, unknown>).parcelas as { nombre: string; codigo: string } | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/pesaje" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Scale className="w-6 h-6 text-cyan-400" />
        <h1 className="text-2xl font-bold text-white">Pesaje {reg.ticket ?? `#${reg.numero}`}</h1>
        <span className={`px-3 py-1 rounded-full text-xs ${reg.tipo === "entrada" ? "bg-blue-900/50 text-blue-400" : "bg-purple-900/50 text-purple-400"}`}>{reg.tipo}</span>
        <span className={`px-3 py-1 rounded-full text-xs ${estadoColors[reg.estado] ?? ""}`}>{reg.estado}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white">Datos del Vehículo</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-400">Placa</dt><dd className="text-white font-mono">{reg.vehiculo_placa}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Chofer</dt><dd className="text-white">{reg.chofer ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Parcela</dt><dd className="text-white">{parcela ? `${parcela.codigo} - ${parcela.nombre}` : "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Báscula</dt><dd className="text-white">{reg.bascula ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Fecha/Hora</dt><dd className="text-white">{new Date(reg.fecha_hora).toLocaleString("es-MX")}</dd></div>
          </dl>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white">Pesos</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-400">Peso Bruto</dt><dd className="text-white font-semibold">{Number(reg.peso_bruto).toFixed(2)} tn</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Tara</dt><dd className="text-white font-semibold">{Number(reg.tara).toFixed(2)} tn</dd></div>
            <div className="flex justify-between border-t border-slate-700 pt-3"><dt className="text-slate-400">Peso Neto</dt><dd className="text-cyan-400 font-bold text-lg">{Number(reg.peso_neto).toFixed(2)} tn</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">% Impurezas</dt><dd className="text-white">{Number(reg.porcentaje_impurezas).toFixed(2)}%</dd></div>
            <div className="flex justify-between border-t border-slate-700 pt-3"><dt className="text-slate-400">Peso Neto Ajustado</dt><dd className="text-green-400 font-bold text-lg">{Number(reg.peso_neto_ajustado).toFixed(2)} tn</dd></div>
          </dl>
        </div>
      </div>

      {reg.observaciones && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-2">Observaciones</h3>
          <p className="text-sm text-slate-300">{reg.observaciones}</p>
        </div>
      )}
    </div>
  );
}
