import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { actualizarEtapaLead, eliminarLead } from "@/lib/actions/crm";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { LeadStageSelector } from "@/components/crm/lead-stage-selector";

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!lead) notFound();

  const deleteAction = eliminarLead.bind(null, lead.id);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/crm" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{lead.nombre}</h1>
            {lead.empresa && <p className="text-slate-400 text-sm">{lead.empresa}</p>}
          </div>
        </div>
        <form action={deleteAction}>
          <button type="submit" className="flex items-center gap-2 bg-red-600/20 text-red-400 px-4 py-2 rounded-lg text-sm hover:bg-red-600/30 transition-colors">
            <Trash2 className="w-4 h-4" /> Eliminar
          </button>
        </form>
      </div>

      <LeadStageSelector leadId={lead.id} currentStage={lead.etapa} onUpdate={actualizarEtapaLead} />

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-slate-400">Email</p>
            <p className="text-white mt-0.5">{lead.email ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Telefono</p>
            <p className="text-white mt-0.5">{lead.telefono ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Origen</p>
            <p className="text-white mt-0.5">{lead.origen ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Valor estimado</p>
            <p className="text-white mt-0.5 font-semibold">
              ${Number(lead.valor_estimado).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Creado</p>
            <p className="text-white mt-0.5">
              {new Date(lead.created_at).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
        {lead.notas && (
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-sm text-slate-400 mb-1">Notas</p>
            <p className="text-slate-300 whitespace-pre-wrap">{lead.notas}</p>
          </div>
        )}
      </div>
    </div>
  );
}
