import { createClient } from "@/lib/supabase/server";
import { InvoiceForm } from "@/components/ventas/invoice-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NuevaFacturaPage() {
  const supabase = createClient();
  const [clientesRes, productosRes] = await Promise.all([
    supabase.from("clientes").select("id, nombre").order("nombre"),
    supabase
      .from("productos")
      .select("id, nombre, sku, precio, stock")
      .eq("estado", "activo")
      .order("nombre"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/ventas"
          className="text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Nueva Factura</h1>
      </div>
      <InvoiceForm
        clientes={clientesRes.data ?? []}
        productos={productosRes.data ?? []}
      />
    </div>
  );
}
