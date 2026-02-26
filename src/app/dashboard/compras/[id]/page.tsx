import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PackageCheck } from "lucide-react";
import { recibirOrden } from "@/lib/actions/compras";

export default async function OrdenCompraDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: orden } = await supabase
    .from("ordenes_compra")
    .select("*, proveedores(nombre, email), orden_compra_detalle(*, productos(nombre, sku))")
    .eq("id", params.id)
    .single();

  if (!orden) notFound();

  const proveedor = (orden as Record<string, unknown>).proveedores as { nombre: string; email: string | null } | null;
  const detalles = ((orden as Record<string, unknown>).orden_compra_detalle ?? []) as Array<{
    id: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    productos: { nombre: string; sku: string } | null;
  }>;

  const estadoColors: Record<string, string> = {
    pendiente: "bg-yellow-900/50 text-yellow-400",
    recibida: "bg-green-900/50 text-green-400",
    cancelada: "bg-red-900/50 text-red-400",
  };

  const recibirAction = recibirOrden.bind(null, orden.id);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/compras" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Orden de Compra #{orden.numero}</h1>
          <p className="text-slate-400 text-sm">{new Date(orden.fecha).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-sm ${estadoColors[orden.estado] ?? ""}`}>{orden.estado}</span>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-sm text-slate-400 uppercase mb-2">Proveedor</h2>
          <p className="text-white font-medium">{proveedor?.nombre ?? "Sin proveedor"}</p>
          {proveedor?.email && <p className="text-slate-400 text-sm">{proveedor.email}</p>}
        </div>
        {orden.estado === "pendiente" && (
          <form action={recibirAction}>
            <button type="submit" className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-500 transition-colors h-full">
              <PackageCheck className="w-4 h-4" /> Marcar como recibida
            </button>
          </form>
        )}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-700/50 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3 text-right">Cantidad</th>
              <th className="px-4 py-3 text-right">P. Unitario</th>
              <th className="px-4 py-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {detalles.map((d) => (
              <tr key={d.id} className="text-slate-300">
                <td className="px-4 py-3 text-white">{d.productos?.nombre ?? "-"}</td>
                <td className="px-4 py-3 font-mono text-xs">{d.productos?.sku ?? "-"}</td>
                <td className="px-4 py-3 text-right">{d.cantidad}</td>
                <td className="px-4 py-3 text-right">${Number(d.precio_unitario).toFixed(2)}</td>
                <td className="px-4 py-3 text-right">${Number(d.subtotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-2 text-right">
        <p className="text-sm text-slate-400">Subtotal: <span className="text-white">${Number(orden.subtotal).toFixed(2)}</span></p>
        <p className="text-sm text-slate-400">IVA (16%): <span className="text-white">${Number(orden.impuesto).toFixed(2)}</span></p>
        <p className="text-xl font-bold text-white">Total: ${Number(orden.total).toFixed(2)}</p>
      </div>
    </div>
  );
}
