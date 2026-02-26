"use client";

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
  nuevo: "bg-blue-600",
  contactado: "bg-yellow-600",
  propuesta: "bg-purple-600",
  negociacion: "bg-orange-600",
  ganado: "bg-green-600",
  perdido: "bg-red-600",
};

export function LeadStageSelector({
  leadId,
  currentStage,
  onUpdate,
}: {
  leadId: string;
  currentStage: string;
  onUpdate: (id: string, etapa: string) => Promise<void>;
}) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <p className="text-xs text-slate-400 uppercase mb-3">Pipeline</p>
      <div className="flex flex-wrap gap-2">
        {etapas.map((etapa) => {
          const isActive = currentStage === etapa;
          return (
            <button
              key={etapa}
              onClick={() => {
                if (!isActive) onUpdate(leadId, etapa);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? `${etapaColors[etapa]} text-white`
                  : "bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white"
              }`}
            >
              {etapaLabels[etapa]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
