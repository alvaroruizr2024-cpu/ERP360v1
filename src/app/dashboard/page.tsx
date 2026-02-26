import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">
          Bienvenido{user?.email ? `, ${user.email}` : ""} a ERP360
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Ventas" value="--" description="Total del mes" />
        <DashboardCard title="Compras" value="--" description="Total del mes" />
        <DashboardCard title="Inventario" value="--" description="Productos activos" />
        <DashboardCard title="Clientes" value="--" description="Registrados" />
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl bg-slate-800 border border-slate-700 p-6">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{description}</p>
    </div>
  );
}
