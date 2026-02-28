import { createClient } from "@/lib/supabase/server";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
    const supabase = createClient();
    const {
          data: { user },
    } = await supabase.auth.getUser();

  let totalProductos = 0, totalClientes = 0, totalEmpleados = 0;
    let facturas: any[] = [], ordenes: any[] = [], leads: any[] = [];
    let productos: any[] = [], recentFacturas: any[] = [];
    let zafrasActivas = 0, totalViajes = 0, toneladasTransportadas = 0;
    let totalMuestras = 0, totalColonos = 0, otPendientes = 0;
    let equiposOperativos = 0, totalEquipos = 0;

  try {
        const [
                productosRes, clientesRes, facturasRes, ordenesRes, empleadosRes, leadsRes,
                productosAllRes, facturasAllRes,
                zafrasRes, viajesRes, muestrasRes, colonosRes, ordenesTrabajoRes, equiposRes,
              ] = await Promise.all([
                supabase.from("productos").select("id", { count: "exact", head: true }),
                supabase.from("clientes").select("id", { count: "exact", head: true }),
                supabase.from("facturas").select("total, estado"),
                supabase.from("ordenes_compra").select("total, estado"),
                supabase.from("empleados").select("id", { count: "exact", head: true }),
                supabase.from("leads").select("etapa, valor_estimado"),
                supabase.from("productos").select("nombre, stock, stock_minimo, precio, categoria").eq("estado", "activo"),
                supabase.from("facturas").select("numero, total, fecha, estado").order("created_at", { ascending: false }).limit(5),
                supabase.from("zafras").select("id, estado", { count: "exact" }).eq("estado", "activa"),
                supabase.from("viajes").select("id, estado, toneladas_netas", { count: "exact" }),
                supabase.from("muestras_laboratorio").select("id", { count: "exact", head: true }),
                supabase.from("colonos").select("id", { count: "exact", head: true }),
                supabase.from("ordenes_trabajo").select("id, estado", { count: "exact" }).eq("estado", "pendiente"),
                supabase.from("equipos_industriales").select("id, estado", { count: "exact" }),
              ]);

      totalProductos = productosRes.count ?? 0;
        totalClientes = clientesRes.count ?? 0;
        totalEmpleados = empleadosRes.count ?? 0;
        facturas = facturasRes.data ?? [];
        ordenes = ordenesRes.data ?? [];
        leads = leadsRes.data ?? [];
        productos = productosAllRes.data ?? [];
        recentFacturas = facturasAllRes.data ?? [];
        zafrasActivas = zafrasRes.count ?? 0;
        const viajes = viajesRes.data ?? [];
        totalViajes = viajesRes.count ?? 0;
        toneladasTransportadas = viajes.reduce((sum: number, v: any) => sum + Number(v.toneladas_netas || 0), 0);
        totalMuestras = muestrasRes.count ?? 0;
        totalColonos = colonosRes.count ?? 0;
        otPendientes = ordenesTrabajoRes.count ?? 0;
        const equipos = equiposRes.data ?? [];
        equiposOperativos = equipos.filter((e: any) => e.estado === "operativo").length;
        totalEquipos = equiposRes.count ?? 0;
  } catch (error) {
        console.error("Dashboard data fetch error:", error);
  }

  const totalVentas = facturas.reduce((sum: number, f: any) => sum + Number(f.total), 0);
    const totalCompras = ordenes.reduce((sum: number, o: any) => sum + Number(o.total), 0);
    const totalFacturas = facturas.length;
    const facturasPendientes = facturas.filter((f: any) => f.estado === "pendiente").length;
    const leadsActivos = leads.filter((l: any) => l.etapa !== "ganado" && l.etapa !== "perdido").length;
    const valorPipeline = leads.filter((l: any) => l.etapa !== "perdido").reduce((s: number, l: any) => s + Number(l.valor_estimado), 0);
    const stockBajo = productos.filter((p: any) => p.stock <= p.stock_minimo).length;

  const ventasPorMes: Record<string, number> = {};
    for (const f of facturas) {
          const d = new Date();
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          ventasPorMes[key] = (ventasPorMes[key] ?? 0) + Number(f.total);
    }
    const invPorCat: Record<string, number> = {};
    for (const p of productos) {
          const cat = p.categoria || "Sin categoria";
          invPorCat[cat] = (invPorCat[cat] ?? 0) + p.stock;
    }
    const ventasChartData = Object.entries(ventasPorMes).map(([m, t]) => ({ mes: m, total: t }));
    const invChartData = Object.entries(invPorCat).map(([c, q]) => ({ categoria: c, cantidad: q }));

  return (
        <DashboardClient
                email={user?.email || ""}
                totalVentas={totalVentas}
                totalCompras={totalCompras}
                valorPipeline={valorPipeline}
                leadsActivos={leadsActivos}
                totalFacturas={totalFacturas}
                facturasPendientes={facturasPendientes}
                totalProductos={totalProductos}
                totalClientes={totalClientes}
                stockBajo={stockBajo}
                totalEmpleados={totalEmpleados}
                zafrasActivas={zafrasActivas}
                totalViajes={totalViajes}
                toneladasTransportadas={toneladasTransportadas}
                totalMuestras={totalMuestras}
                totalColonos={totalColonos}
                otPendientes={otPendientes}
                equiposOperativos={equiposOperativos}
                totalEquipos={totalEquipos}
                ventasChartData={ventasChartData}
                invChartData={invChartData}
                recentFacturas={recentFacturas}
                productosStockBajo={productos.filter((p: any) => p.stock <= p.stock_minimo).map((p: any) => ({ nombre: p.nombre, stock: p.stock, minimo: p.stock_minimo }))}
              />
      );
}
