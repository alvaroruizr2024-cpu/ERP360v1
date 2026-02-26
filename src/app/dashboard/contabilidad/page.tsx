import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function ContabilidadPage() {
  const supabase = createClient();
  const [cuentasRes, asientosRes] = await Promise.all([
    supabase.from("cuentas_contables").select("*").order("codigo"),
    supabase
      .from("asientos_contables")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const cuentas = cuentasRes.data ?? [];
  const asientos = asientosRes.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Contabilidad</h1>
          <p className="text-slate-400 mt-1">Plan de cuentas y libro diario</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/contabilidad/cuentas"
            className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-600 transition-colors"
          >
            Plan de Cuentas
          </Link>
          <Link
            href="/dashboard/contabilidad/asiento"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Asiento
          </Link>
        </div>
      </div>

      {/* Balance summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(["activo", "pasivo", "capital", "ingreso", "gasto"] as const).map((tipo) => {
          const total = cuentas
            .filter((c) => c.tipo === tipo)
            .reduce((s, c) => s + Number(c.saldo), 0);
          return (
            <div key={tipo} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-xs text-slate-400 uppercase">{tipo}</p>
              <p className="text-xl font-bold text-white mt-1">
                ${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent journal entries */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Libro Diario</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">No.</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Descripcion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {asientos.map((a) => (
                <tr key={a.id} className="text-slate-300 hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/contabilidad/asiento/${a.id}`}
                      className="font-medium text-white hover:text-blue-400"
                    >
                      #{a.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(a.fecha).toLocaleDateString("es-MX")}
                  </td>
                  <td className="px-4 py-3">{a.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {asientos.length === 0 && (
            <p className="text-center text-slate-500 py-8">No hay asientos contables</p>
          )}
        </div>
      </div>
    </div>
  );
}
