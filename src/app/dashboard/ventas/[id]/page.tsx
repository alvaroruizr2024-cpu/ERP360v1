import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function FacturaDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: factura } = await supabase
    .from("facturas")
    .select(
      "*, clientes(nombre, email, rfc), factura_detalle(*, productos(nombre, sku))"
    )
    .eq("id", params.id)
    .single();

  if (!factura) notFound();

  const cliente = factura.clientes as {
    nombre: string;
    email: string | null;
    rfc: string | null;
  } | null;
  const detalles = (factura.factura_detalle ?? []) as Array<{
    id: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    productos: { nombre: string; sku: string } | null;
  }>;

  const estadoColors: Record<string, string> = {
    pendiente: "bg-yellow-900/50 text-yellow-400",
    pagada: "bg-green-900/50 text-green-400",
    cancelada: "bg-red-900/50 text-red-400",
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/ventas"
          className="text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">
            Factura #{factura.numero}
          </h1>
          <p className="text-slate-400 text-sm">
            {new Date(factura.fecha).toLocaleDateString("es-MX", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <span
          className={`ml-auto px-3 py-1 rounded-full text-sm ${
            estadoColors[factura.estado] ?? ""
          }`}
        >
          {factura.estado}
        </span>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-sm text-slate-400 uppercase mb-2">Cliente</h2>
        <p className="text-white font-medium">
          {cliente?.nombre ?? "Sin cliente"}
        </p>
        {cliente?.email && (
          <p className="text-slate-400 text-sm">{cliente.email}</p>
        )}
        {cliente?.rfc && (
          <p className="text-slate-400 text-sm">RFC: {cliente.rfc}</p>
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
                <td className="px-4 py-3 text-white">
                  {d.productos?.nombre ?? "-"}
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {d.productos?.sku ?? "-"}
                </td>
                <td className="px-4 py-3 text-right">{d.cantidad}</td>
                <td className="px-4 py-3 text-right">
                  ${Number(d.precio_unitario).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right">
                  ${Number(d.subtotal).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-2 text-right">
        <p className="text-sm text-slate-400">
          Subtotal:{" "}
          <span className="text-white">
            ${Number(factura.subtotal).toFixed(2)}
          </span>
        </p>
        <p className="text-sm text-slate-400">
          IVA (16%):{" "}
          <span className="text-white">
            ${Number(factura.impuesto).toFixed(2)}
          </span>
        </p>
        <p className="text-xl font-bold text-white">
          Total: ${Number(factura.total).toFixed(2)}
        </p>
      </div>

      {factura.notas && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-sm text-slate-400 uppercase mb-2">Notas</h2>
          <p className="text-slate-300">{factura.notas}</p>
        </div>
      )}
    </div>
  );
}
