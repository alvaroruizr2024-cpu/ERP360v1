import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/inventario/product-form";
import { actualizarProducto } from "@/lib/actions/productos";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditarProductoPage({
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

  const updateAction = actualizarProducto.bind(null, params.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/inventario/${params.id}`}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Editar Producto</h1>
      </div>
      <ProductForm action={updateAction} producto={producto} />
    </div>
  );
}
