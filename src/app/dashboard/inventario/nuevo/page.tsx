import { ProductForm } from "@/components/inventario/product-form";
import { crearProducto } from "@/lib/actions/productos";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NuevoProductoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/inventario"
          className="text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Nuevo Producto</h1>
      </div>
      <ProductForm action={crearProducto} />
    </div>
  );
}
