import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Truck } from "lucide-react";

const tipoLabels: Record<string, string> = { camion: "Camión", tractor: "Tractor", alzadora: "Alzadora", cosechadora: "Cosechadora", vehiculo_liviano: "Vehículo Liviano", otro: "Otro" };
const estadoColors: Record<string, string> = { disponible: "bg-green-900/50 text-green-400", en_operacion: "bg-blue-900/50 text-blue-400", en_mantenimiento: "bg-yellow-900/50 text-yellow-400", fuera_servicio: "bg-red-900/50 text-red-400" };

export default async function VehiculoDetallePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: vehiculo } = await supabase.from("vehiculos").select("*").eq("id", params.id).single();

  if (!vehiculo) notFound();

  const { data: mantenimientos } = await supabase.from("mantenimientos").select("*").eq("vehiculo_id", params.id).order("fecha", { ascending: false }).limit(10);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/flota" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Truck className="w-6 h-6 text-blue-400" />
        <h1 className="text-2xl font-bold text-white font-mono">{vehiculo.placa}</h1>
        <span className={`px-3 py-1 rounded-full text-xs ${estadoColors[vehiculo.estado] ?? ""}`}>{vehiculo.estado.replace(/_/g, " ")}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Información del Vehículo</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-400">Placa</dt><dd className="text-white font-mono">{vehiculo.placa}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Tipo</dt><dd className="text-white">{tipoLabels[vehiculo.tipo] ?? vehiculo.tipo}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Marca</dt><dd className="text-white">{vehiculo.marca ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Modelo</dt><dd className="text-white">{vehiculo.modelo ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Año</dt><dd className="text-white">{vehiculo.anio ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Capacidad</dt><dd className="text-white">{vehiculo.capacidad_toneladas ? `${vehiculo.capacidad_toneladas} tn` : "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Kilometraje</dt><dd className="text-white font-mono">{Number(vehiculo.kilometraje).toLocaleString("es-MX")} km</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Chofer Asignado</dt><dd className="text-white">{vehiculo.chofer_asignado ?? "-"}</dd></div>
          </dl>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Últimos Mantenimientos</h3>
          {(mantenimientos ?? []).length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">Sin mantenimientos registrados</p>
          ) : (
            <div className="space-y-3">
              {(mantenimientos ?? []).map((m) => (
                <div key={m.id} className="flex items-center justify-between text-sm border-b border-slate-700 pb-2">
                  <div>
                    <p className="text-white">{m.descripcion}</p>
                    <p className="text-xs text-slate-500">{new Date(m.fecha).toLocaleDateString("es-MX")} &middot; {m.tipo}</p>
                  </div>
                  <span className="text-white font-medium">${Number(m.costo).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
