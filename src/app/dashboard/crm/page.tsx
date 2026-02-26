import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";

const etapas = ["nuevo", "contactado", "propuesta", "negociacion", "ganado", "perdido"] as const;

const etapaLabels: Record<string, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  propuesta: "Propuesta",
  negociacion: "Negociacion",
  ganado: "Ganado",
  perdido: "Perdido",
};

const etapaColors: Record<string, string> = {
  nuevo: "bg-blue-900/50 text-blue-400 border-blue-700",
  contactado: "bg-yellow-900/50 text-yellow-400 border-yellow-700",
  propuesta: "bg-purple-900/50 text-purple-400 border-purple-700",
  negociacion: "bg-orange-900/50 text-orange-400 border-orange-700",
  ganado: "bg-green-900/50 text-green-400 border-green-700",
  perdido: "bg-red-900/50 text-red-400 border-red-700",
};

export default async function CRMPage() {
  const supabase = createClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  const allLeads = leads ?? [];

  const pipeline = etapas.map((etapa) => {
    const etapaLeads = allLeads.filter((l) => l.etapa === etapa);
    const valor = etapaLeads.reduce((s, l) => s + Number(l.valor_estimado), 0);
    return { etapa, count: etapaLeads.length, valor };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">CRM</h1>
          <p className="text-slate-400 mt-1">Pipeline de ventas y seguimiento</p>
        </div>
        <Link
          href="/dashboard/crm/nuevo"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Lead
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {pipeline.map((p) => (
          <div key={p.etapa} className={`rounded-xl border p-4 ${etapaColors[p.etapa]}`}>
            <p className="text-xs uppercase font-semibold">{etapaLabels[p.etapa]}</p>
            <p className="text-2xl font-bold mt-1">{p.count}</p>
            <p className="text-xs opacity-70 mt-0.5">
              ${p.valor.toLocaleString("es-MX", { minimumFractionDigits: 0 })}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Etapa</th>
              <th className="px-4 py-3 text-right">Valor Est.</th>
              <th className="px-4 py-3">Origen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {allLeads.map((l) => (
              <tr key={l.id} className="text-slate-300 hover:bg-slate-800/50">
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/crm/${l.id}`}
                    className="font-medium text-white hover:text-blue-400"
                  >
                    {l.nombre}
                  </Link>
                </td>
                <td className="px-4 py-3">{l.empresa ?? "-"}</td>
                <td className="px-4 py-3">{l.email ?? "-"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${etapaColors[l.etapa]}`}>
                    {etapaLabels[l.etapa]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  ${Number(l.valor_estimado).toLocaleString("es-MX")}
                </td>
                <td className="px-4 py-3">{l.origen ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {allLeads.length === 0 && (
          <p className="text-center text-slate-500 py-8">No hay leads registrados</p>
        )}
      </div>
    </div>
  );
}
