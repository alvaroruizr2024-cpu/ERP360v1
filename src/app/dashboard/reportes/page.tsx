import { createClient } from "@/lib/supabase/server";
import { ReportesClient } from "@/components/reportes/reportes-client";

export default async function ReportesPage() {
  const supabase = createClient();

  const [facturasRes, productosRes, ordenesRes, leadsRes] = await Promise.all([
    supabase.from("facturas").select("*").order("fecha", { ascending: true }),
    supabase.from("productos").select("*"),
    supabase.from("ordenes_compra").select("*"),
    supabase.from("leads").select("*"),
  ]);

  const facturas = facturasRes.data ?? [];
  const productos = productosRes.data ?? [];
  const ordenes = ordenesRes.data ?? [];
  const leads = leadsRes.data ?? [];

  // Aggregate sales by month
  const ventasPorMes: Record<string, { total: number; cantidad: number }> = {};
  for (const f of facturas) {
    const date = new Date(f.fecha);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!ventasPorMes[key]) ventasPorMes[key] = { total: 0, cantidad: 0 };
    ventasPorMes[key].total += Number(f.total);
    ventasPorMes[key].cantidad += 1;
  }
  const ventasData = Object.entries(ventasPorMes)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, d]) => ({ mes, total: d.total, cantidad: d.cantidad }));

  // Aggregate inventory by category
  const invPorCat: Record<string, { cantidad: number; valor: number }> = {};
  for (const p of productos) {
    const cat = p.categoria || "Sin categoría";
    if (!invPorCat[cat]) invPorCat[cat] = { cantidad: 0, valor: 0 };
    invPorCat[cat].cantidad += p.stock;
    invPorCat[cat].valor += p.stock * Number(p.precio);
  }
  const inventarioData = Object.entries(invPorCat).map(([categoria, d]) => ({
    categoria,
    cantidad: d.cantidad,
    valor: d.valor,
  }));

  // KPIs
  const totalVentas = facturas.reduce((s, f) => s + Number(f.total), 0);
  const totalCompras = ordenes.reduce((s, o) => s + Number(o.total), 0);
  const valorInventario = productos.reduce((s, p) => s + p.stock * Number(p.precio), 0);
  const leadsGanados = leads.filter((l) => l.etapa === "ganado").length;
  const productosStockBajo = productos.filter((p) => p.stock <= p.stock_minimo).length;

  // Table data for export
  const ventasExport = facturas.map((f) => [
    f.numero,
    new Date(f.fecha).toLocaleDateString("es-MX"),
    f.estado,
    Number(f.subtotal).toFixed(2),
    Number(f.impuesto).toFixed(2),
    Number(f.total).toFixed(2),
  ]);

  const inventarioExport = productos.map((p) => [
    p.sku,
    p.nombre,
    p.categoria || "N/A",
    p.stock,
    Number(p.precio).toFixed(2),
    (p.stock * Number(p.precio)).toFixed(2),
  ]);

  return (
    <ReportesClient
      ventasData={ventasData}
      inventarioData={inventarioData}
      totalVentas={totalVentas}
      totalCompras={totalCompras}
      valorInventario={valorInventario}
      leadsGanados={leadsGanados}
      productosStockBajo={productosStockBajo}
      ventasExport={ventasExport}
      inventarioExport={inventarioExport}
    />
  );
}
