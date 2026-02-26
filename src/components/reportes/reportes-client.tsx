"use client";

import { BarChart3, Package, TrendingUp, TrendingDown, AlertTriangle, Trophy } from "lucide-react";
import { SalesChart } from "./sales-chart";
import { InventoryChart } from "./inventory-chart";
import { ExportButtons } from "./export-buttons";

interface ReportesClientProps {
  ventasData: { mes: string; total: number; cantidad: number }[];
  inventarioData: { categoria: string; cantidad: number; valor: number }[];
  totalVentas: number;
  totalCompras: number;
  valorInventario: number;
  leadsGanados: number;
  productosStockBajo: number;
  ventasExport: (string | number)[][];
  inventarioExport: (string | number)[][];
}

function fmt(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
}

export function ReportesClient({
  ventasData,
  inventarioData,
  totalVentas,
  totalCompras,
  valorInventario,
  leadsGanados,
  productosStockBajo,
  ventasExport,
  inventarioExport,
}: ReportesClientProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reportes</h1>
          <p className="text-slate-400 mt-1">Análisis y exportación de datos</p>
        </div>
        <BarChart3 className="w-8 h-8 text-blue-400" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard icon={TrendingUp} label="Ventas" value={fmt(totalVentas)} color="text-green-400" />
        <KpiCard icon={TrendingDown} label="Compras" value={fmt(totalCompras)} color="text-red-400" />
        <KpiCard icon={Package} label="Inventario" value={fmt(valorInventario)} color="text-blue-400" />
        <KpiCard icon={Trophy} label="Leads Ganados" value={String(leadsGanados)} color="text-yellow-400" />
        <KpiCard icon={AlertTriangle} label="Stock Bajo" value={String(productosStockBajo)} color="text-orange-400" />
        <KpiCard
          icon={TrendingUp}
          label="Margen"
          value={totalVentas > 0 ? fmt(totalVentas - totalCompras) : "$0.00"}
          color="text-emerald-400"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={ventasData} />
        <InventoryChart data={inventarioData} />
      </div>

      {/* Export sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Exportar Ventas</h3>
            <ExportButtons
              title="Reporte de Ventas"
              headers={["No.", "Fecha", "Estado", "Subtotal", "Impuesto", "Total"]}
              rows={ventasExport}
              filename="reporte-ventas"
            />
          </div>
          <p className="text-sm text-slate-400">
            {ventasExport.length} facturas disponibles para exportar
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Exportar Inventario</h3>
            <ExportButtons
              title="Reporte de Inventario"
              headers={["SKU", "Producto", "Categoría", "Stock", "Precio", "Valor"]}
              rows={inventarioExport}
              filename="reporte-inventario"
            />
          </div>
          <p className="text-sm text-slate-400">
            {inventarioExport.length} productos disponibles para exportar
          </p>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <Icon className={`w-5 h-5 ${color} mb-2`} />
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-lg font-bold text-white mt-1">{value}</p>
    </div>
  );
}
