import { createClient } from "@/lib/supabase/server";
import { InvoiceTable } from "@/components/ventas/invoice-table";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function VentasPage() {
  const supabase = createClient();
  const { data: facturas } = await supabase
    .from("facturas")
    .select("*, clientes(nombre)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Ventas</h1>
          <p className="text-slate-400 mt-1">Gestiona tus facturas</p>
        </div>
        <Link
          href="/dashboard/ventas/nueva"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Factura
        </Link>
      </div>

      <InvoiceTable facturas={(facturas as never[]) ?? []} />
    </div>
  );
}
