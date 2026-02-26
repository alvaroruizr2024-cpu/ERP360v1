import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AsientoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: asiento } = await supabase
    .from("asientos_contables")
    .select("*, asiento_detalle(*, cuentas_contables(codigo, nombre))")
    .eq("id", params.id)
    .single();

  if (!asiento) notFound();

  const detalles = ((asiento as Record<string, unknown>).asiento_detalle ?? []) as Array<{
    id: string;
    debe: number;
    haber: number;
    cuentas_contables: { codigo: string; nombre: string } | null;
  }>;

  const totalDebe = detalles.reduce((s, d) => s + Number(d.debe), 0);
  const totalHaber = detalles.reduce((s, d) => s + Number(d.haber), 0);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/contabilidad" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Asiento #{asiento.numero}</h1>
          <p className="text-slate-400 text-sm">{new Date(asiento.fecha).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <p className="text-sm text-slate-400">Descripcion</p>
        <p className="text-white mt-1">{asiento.descripcion}</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-700/50 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Cuenta</th>
              <th className="px-4 py-3 text-right">Debe</th>
              <th className="px-4 py-3 text-right">Haber</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {detalles.map((d) => (
              <tr key={d.id} className="text-slate-300">
                <td className="px-4 py-3 text-white">
                  {d.cuentas_contables?.codigo} - {d.cuentas_contables?.nombre}
                </td>
                <td className="px-4 py-3 text-right">{Number(d.debe) > 0 ? `$${Number(d.debe).toFixed(2)}` : ""}</td>
                <td className="px-4 py-3 text-right">{Number(d.haber) > 0 ? `$${Number(d.haber).toFixed(2)}` : ""}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-700/50 font-semibold text-white">
            <tr>
              <td className="px-4 py-3">Totales</td>
              <td className="px-4 py-3 text-right">${totalDebe.toFixed(2)}</td>
              <td className="px-4 py-3 text-right">${totalHaber.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
