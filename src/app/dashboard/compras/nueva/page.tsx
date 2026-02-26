import { createClient } from "@/lib/supabase/server";
import { PurchaseOrderForm } from "@/components/compras/purchase-order-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NuevaOrdenCompraPage() {
  const supabase = createClient();
  const [provRes, prodRes] = await Promise.all([
    supabase.from("proveedores").select("id, nombre").order("nombre"),
    supabase.from("productos").select("id, nombre, sku, costo").eq("estado", "activo").order("nombre"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/compras" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Nueva Orden de Compra</h1>
      </div>
      <PurchaseOrderForm
        proveedores={provRes.data ?? []}
        productos={prodRes.data ?? []}
      />
    </div>
  );
}
