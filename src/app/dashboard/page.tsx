import { createClient } from "@/lib/supabase/server";
import {
  DollarSign,
  FileText,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Contact,
  Tractor,
  FlaskConical,
  UserCheck,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    productosRes,
    clientesRes,
    facturasRes,
    ordenesRes,
    empleadosRes,
    leadsRes,
    productosAllRes,
    facturasAllRes,
    // TransCaña KPIs
    zafrasRes,
    viajesRes,
    muestrasRes,
    colonosRes,
    ordenesTrabajoRes,
    equiposRes,
  ] = await Promise.all([
    supabase.from("productos").select("id", { count: "exact", head: true }),
    supabase.from("clientes").select("id", { count: "exact", head: true }),
    supabase.from("facturas").select("total, estado"),
    supabase.from("ordenes_compra").select("total, estado"),
    supabase.from("empleados").select("id", { count: "exact", head: true }),
    supabase.from("leads").select("etapa, valor_estimado"),
    supabase.from("productos").select("nombre, stock, stock_minimo, precio, categoria").eq("estado", "activo"),
    supabase.from("facturas").select("numero, total, fecha, estado").order("created_at", { ascending: false }).limit(5),
    // TransCaña queries
    supabase.from("zafras").select("id, estado", { count: "exact" }).eq("estado", "activa"),
    supabase.from("viajes").select("id, estado, toneladas_netas", { count: "exact" }),
    supabase.from("muestras_laboratorio").select("id", { count: "exact", head: true }),
    supabase.from("colonos").select("id", { count: "exact", head: true }),
    supabase.from("ordenes_trabajo").select("id, estado", { count: "exact" }).eq("estado", "pendiente"),
    supabase.from("equipos_industriales").select("id, estado", { count: "exact" }),
  ]);

  const totalProductos = productosRes.count ?? 0;
  const totalClientes = clientesRes.count ?? 0;
  const totalEmpleados = empleadosRes.count ?? 0;
  const facturas = facturasRes.data ?? [];
  const ordenes = ordenesRes.data ?? [];
  const leads = leadsRes.data ?? [];
  const productos = productosAllRes.data ?? [];
  const recentFacturas = facturasAllRes.data ?? [];

  // TransCaña KPI values
  const zafrasActivas = zafrasRes.count ?? 0;
  const viajes = viajesRes.data ?? [];
  const totalViajes = viajesRes.count ?? 0;
  const toneladasTransportadas = viajes.reduce((sum, v) => sum + Number(v.toneladas_netas || 0), 0);
  const totalMuestras = muestrasRes.count ?? 0;
  const totalColonos = colonosRes.count ?? 0;
  const otPendientes = ordenesTrabajoRes.count ?? 0;
  const equipos = equiposRes.data ?? [];
  const equiposOperativos = equipos.filter((e) => e.estado === "operativo").length;
  const totalEquipos = equiposRes.count ?? 0;

  const totalVentas = facturas.reduce((sum, f) => sum + Number(f.total), 0);
  const totalCompras = ordenes.reduce((sum, o) => sum + Number(o.total), 0);
  const totalFacturas = facturas.length;
  const facturasPendientes = facturas.filter((f) => f.estado === "pendiente").length;
  const leadsActivos = leads.filter((l) => l.etapa !== "ganado" && l.etapa !== "perdido").length;
  const valorPipeline = leads
    .filter((l) => l.etapa !== "perdido")
    .reduce((s, l) => s + Number(l.valor_estimado), 0);
  const stockBajo = productos.filter((p) => p.stock <= p.stock_minimo).length;

  // Chart data: sales by month
  const ventasPorMes: Record<string, number> = {};
  for (const f of facturas) {
    const d = new Date();
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    ventasPorMes[key] = (ventasPorMes[key] ?? 0) + Number(f.total);
  }

  // Chart data: inventory by category
  const invPorCat: Record<string, number> = {};
  for (const p of productos) {
    const cat = p.categoria || "Sin categoría";
    invPorCat[cat] = (invPorCat[cat] ?? 0) + p.stock;
  }

  const ventasChartData = Object.entries(ventasPorMes).map(([m, t]) => ({ mes: m, total: t }));
  const invChartData = Object.entries(invPorCat).map(([c, q]) => ({ categoria: c, cantidad: q }));

  const fmt = (n: number) => `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">
          Bienvenido{user?.email ? `, ${user.email}` : ""} a ERP360
        </p>
      </div>

      {/* KPI Cards - Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardCard title="Ventas Totales" value={fmt(totalVentas)} description="Facturado" icon={DollarSign} color="text-green-400" />
        <DashboardCard title="Compras" value={fmt(totalCompras)} description="Órdenes de compra" icon={ShoppingCart} color="text-red-400" />
        <DashboardCard title="Margen Bruto" value={fmt(totalVentas - totalCompras)} description="Ventas - Compras" icon={TrendingUp} color="text-emerald-400" />
        <DashboardCard title="Pipeline CRM" value={fmt(valorPipeline)} description={`${leadsActivos} leads activos`} icon={Contact} color="text-purple-400" />
      </div>

      {/* KPI Cards - Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardCard title="Facturas" value={String(totalFacturas)} description={`${facturasPendientes} pendientes`} icon={FileText} color="text-blue-400" />
        <DashboardCard title="Productos" value={String(totalProductos)} description="En catálogo" icon={Package} color="text-cyan-400" />
        <DashboardCard title="Clientes" value={String(totalClientes)} description="Registrados" icon={Users} color="text-yellow-400" />
        <DashboardCard title="Stock Bajo" value={String(stockBajo)} description={`${totalEmpleados} empleados`} icon={AlertTriangle} color={stockBajo > 0 ? "text-orange-400" : "text-slate-500"} />
      </div>

      {/* KPI Cards - Row 3: TransCaña */}
      <div>
        <h2 className="text-lg font-semibold text-slate-300 mb-3">TransCaña</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DashboardCard title="Zafras Activas" value={String(zafrasActivas)} description={`${totalViajes} viajes registrados`} icon={Tractor} color="text-green-400" />
          <DashboardCard title="Toneladas" value={toneladasTransportadas.toLocaleString("es-MX")} description="Transportadas" icon={TrendingUp} color="text-amber-400" />
          <DashboardCard title="Muestras Lab" value={String(totalMuestras)} description="Análisis realizados" icon={FlaskConical} color="text-violet-400" />
          <DashboardCard title="Colonos" value={String(totalColonos)} description="Registrados" icon={UserCheck} color="text-teal-400" />
        </div>
      </div>

      {/* KPI Cards - Row 4: Mantenimiento */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardCard title="OT Pendientes" value={String(otPendientes)} description="Órdenes de trabajo" icon={Wrench} color={otPendientes > 5 ? "text-orange-400" : "text-blue-400"} />
        <DashboardCard title="Equipos" value={`${equiposOperativos}/${totalEquipos}`} description="Operativos" icon={Package} color={equiposOperativos < totalEquipos ? "text-yellow-400" : "text-green-400"} />
      </div>

      {/* Charts */}
      <DashboardCharts ventasData={ventasChartData} inventarioData={invChartData} />

      {/* Recent Activity */}
      <RecentActivity facturas={recentFacturas} productosStockBajo={productos.filter((p) => p.stock <= p.stock_minimo).map((p) => ({ nombre: p.nombre, stock: p.stock, minimo: p.stock_minimo }))} />
    </div>
  );
}

function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  color = "text-slate-500",
}: {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  color?: string;
}) {
  return (
    <div className="rounded-xl bg-slate-800 border border-slate-700 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-400 uppercase tracking-wide">{title}</p>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{description}</p>
    </div>
  );
}
