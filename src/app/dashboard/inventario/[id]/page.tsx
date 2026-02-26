import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { eliminarProducto } from "@/lib/actions/productos";

export default async function ProductoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: producto } = await supabase
    .from("productos")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!producto) notFound();

  const deleteAction = eliminarProducto.bind(null, producto.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/inventario"
            className="text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {producto.nombre}
            </h1>
            <p className="text-slate-400 text-sm">SKU: {producto.sku}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/inventario/${params.id}/editar`}
            className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-600 transition-colors"
          >
            <Edit className="w-4 h-4" /> Editar
          </Link>
          <form action={deleteAction}>
            <button
              type="submit"
              className="flex items-center gap-2 bg-red-600/20 text-red-400 px-4 py-2 rounded-lg text-sm hover:bg-red-600/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Eliminar
            </button>
          </form>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Field label="Nombre" value={producto.nombre} />
          <Field label="SKU" value={producto.sku} />
          <Field label="Categoria" value={producto.categoria ?? "-"} />
          <Field
            label="Precio"
            value={`$${Number(producto.precio).toFixed(2)}`}
          />
          <Field
            label="Costo"
            value={`$${Number(producto.costo).toFixed(2)}`}
          />
          <Field label="Stock" value={String(producto.stock)} />
          <Field
            label="Stock minimo"
            value={String(producto.stock_minimo)}
          />
          <Field label="Estado" value={producto.estado} />
          <Field
            label="Creado"
            value={new Date(producto.created_at).toLocaleDateString("es-MX")}
          />
        </div>
        {producto.descripcion && (
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-sm text-slate-400 mb-1">Descripcion</p>
            <p className="text-slate-300">{producto.descripcion}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-white font-medium mt-0.5">{value}</p>
    </div>
  );
}
