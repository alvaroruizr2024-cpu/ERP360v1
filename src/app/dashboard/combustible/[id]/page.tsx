import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Fuel } from "lucide-react";

const tipoCombLabels: Record<string, string> = { diesel: "Diésel", gasolina_90: "Gasolina 90", gasolina_95: "Gasolina 95", glp: "GLP" };

export default async function DespachoDetallePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: d } = await supabase.from("despachos_combustible").select("*").eq("id", params.id).single();

  if (!d) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/combustible" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Fuel className="w-6 h-6 text-orange-400" />
        <h1 className="text-2xl font-bold text-white">Despacho #{d.numero}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Datos del Despacho</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-400">Placa</dt><dd className="text-white font-mono">{d.vehiculo_placa}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Tipo Combustible</dt><dd className="text-white">{tipoCombLabels[d.tipo_combustible] ?? d.tipo_combustible}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Galones</dt><dd className="text-white font-semibold">{Number(d.galones).toFixed(2)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Precio/Galón</dt><dd className="text-white">${Number(d.precio_galon).toFixed(2)}</dd></div>
            <div className="flex justify-between border-t border-slate-700 pt-3"><dt className="text-slate-400">Total</dt><dd className="text-orange-400 font-bold text-lg">${Number(d.total).toFixed(2)}</dd></div>
          </dl>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Información Adicional</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-400">Kilometraje</dt><dd className="text-white">{d.kilometraje ? `${Number(d.kilometraje).toLocaleString("es-MX")} km` : "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Operador</dt><dd className="text-white">{d.operador ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Estación</dt><dd className="text-white">{d.estacion ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Fecha</dt><dd className="text-white">{new Date(d.fecha).toLocaleString("es-MX")}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
