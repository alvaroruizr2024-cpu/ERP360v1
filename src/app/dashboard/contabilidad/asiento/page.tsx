import { createClient } from "@/lib/supabase/server";
import { JournalEntryForm } from "@/components/contabilidad/journal-entry-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NuevoAsientoPage() {
  const supabase = createClient();
  const { data: cuentas } = await supabase
    .from("cuentas_contables")
    .select("id, codigo, nombre")
    .order("codigo");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/contabilidad" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Nuevo Asiento Contable</h1>
      </div>
      <JournalEntryForm cuentas={cuentas ?? []} />
    </div>
  );
}
