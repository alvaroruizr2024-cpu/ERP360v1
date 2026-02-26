import { createClient } from "@/lib/supabase/server";
import { DollarSign, FileText, Package, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [productosRes, clientesRes, facturasRes] = await Promise.all([
    supabase.from("productos").select("id", { count: "exact", head: true }),
    supabase.from("clientes").select("id", { count: "exact", head: true }),
    supabase.from("facturas").select("total"),
  ]);

  const totalProductos = productosRes.count ?? 0;
  const totalClientes = clientesRes.count ?? 0;
  const facturas = facturasRes.data ?? [];
  const totalVentas = facturas.reduce((sum, f) => sum + Number(f.total), 0);
  const totalFacturas = facturas.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">
          Bienvenido{user?.email ? `, ${user.email}` : ""} a ERP360
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Ventas"
          value={`$${totalVentas.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`}
          description="Total facturado"
          icon={DollarSign}
        />
        <DashboardCard
          title="Facturas"
          value={String(totalFacturas)}
          description="Emitidas"
          icon={FileText}
        />
        <DashboardCard
          title="Productos"
          value={String(totalProductos)}
          description="Registrados"
          icon={Package}
        />
        <DashboardCard
          title="Clientes"
          value={String(totalClientes)}
          description="Registrados"
          icon={Users}
        />
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl bg-slate-800 border border-slate-700 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <Icon className="w-5 h-5 text-slate-500" />
      </div>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{description}</p>
    </div>
  );
}
