import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function ComprasPage() {
  const supabase = createClient();
  const { data: ordenes } = await supabase
    .from("ordenes_compra")
    .select("*, proveedores(nombre)")
    .order("created_at", { ascending: false });

  const estadoColors: Record<string, string> = {
    pendiente: "bg-yellow-900/50 text-yellow-400",
    recibida: "bg-green-900/50 text-green-400",
    cancelada: "bg-red-900/50 text-red-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Compras</h1>
          <p className="text-slate-400 mt-1">Ordenes de compra a proveedores</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/compras/proveedores"
            className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-600 transition-colors"
          >
            Proveedores
          </Link>
          <Link
            href="/dashboard/compras/nueva"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Orden
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">Proveedor</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {(ordenes ?? []).map((o) => {
              const prov = (o as Record<string, unknown>).proveedores as { nombre: string } | null;
              return (
                <tr
                  key={o.id}
                  className="text-slate-300 hover:bg-slate-800/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/compras/${o.id}`}
                      className="font-medium text-white hover:text-blue-400"
                    >
                      #{o.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{prov?.nombre ?? "Sin proveedor"}</td>
                  <td className="px-4 py-3">
                    {new Date(o.fecha).toLocaleDateString("es-MX")}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    ${Number(o.total).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${estadoColors[o.estado] ?? ""}`}
                    >
                      {o.estado}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(ordenes ?? []).length === 0 && (
          <p className="text-center text-slate-500 py-8">
            No hay ordenes de compra
          </p>
        )}
      </div>
    </div>
  );
}
