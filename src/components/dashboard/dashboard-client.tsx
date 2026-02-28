"use client";

import {
    DollarSign, FileText, Package, Users, ShoppingCart, TrendingUp,
    AlertTriangle, Contact, Tractor, FlaskConical, UserCheck, Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DashboardCharts } from "./dashboard-charts";
import { RecentActivity } from "./recent-activity";
import { useI18n } from "@/lib/i18n/provider";

interface DashboardClientProps {
    email: string;
    totalVentas: number;
    totalCompras: number;
    valorPipeline: number;
    leadsActivos: number;
    totalFacturas: number;
    facturasPendientes: number;
    totalProductos: number;
    totalClientes: number;
    stockBajo: number;
    totalEmpleados: number;
    zafrasActivas: number;
    totalViajes: number;
    toneladasTransportadas: number;
    totalMuestras: number;
    totalColonos: number;
    otPendientes: number;
    equiposOperativos: number;
    totalEquipos: number;
    ventasChartData: any[];
    invChartData: any[];
    recentFacturas: any[];
    productosStockBajo: any[];
}

export function DashboardClient(props: DashboardClientProps) {
    const { t } = useI18n();
    const fmt = (n: number) => `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

  return (
        <div className="space-y-6">
              <div>
                      <h1 className="text-2xl font-bold text-white">{t("dashboard.title")}</h1>h1>
                      <p className="text-slate-400 mt-1">
                        {t("dashboard.welcome")}{props.email ? `, ${props.email}` : ""} a ERP360
                      </p>p>
              </div>div>
        
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <KPICard title={t("dashboard.ventas_totales")} value={fmt(props.totalVentas)} description={t("dashboard.facturado")} icon={DollarSign} color="text-green-400" />
                      <KPICard title={t("dashboard.compras")} value={fmt(props.totalCompras)} description={t("dashboard.ordenes_compra")} icon={ShoppingCart} color="text-red-400" />
                      <KPICard title={t("dashboard.margen")} value={fmt(props.totalVentas - props.totalCompras)} description={t("dashboard.ventas_compras")} icon={TrendingUp} color="text-emerald-400" />
                      <KPICard title={t("dashboard.pipeline")} value={fmt(props.valorPipeline)} description={`${props.leadsActivos} ${t("dashboard.leads_activos")}`} icon={Contact} color="text-purple-400" />
              </div>div>
        
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <KPICard title={t("dashboard.facturas")} value={String(props.totalFacturas)} description={`${props.facturasPendientes} ${t("dashboard.pendientes")}`} icon={FileText} color="text-blue-400" />
                      <KPICard title={t("dashboard.productos")} value={String(props.totalProductos)} description={t("dashboard.en_catalogo")} icon={Package} color="text-cyan-400" />
                      <KPICard title={t("dashboard.clientes")} value={String(props.totalClientes)} description={t("dashboard.registrados")} icon={Users} color="text-yellow-400" />
                      <KPICard title={t("dashboard.stock_bajo")} value={String(props.stockBajo)} description={`${props.totalEmpleados} ${t("dashboard.empleados")}`} icon={AlertTriangle} color={props.stockBajo > 0 ? "text-orange-400" : "text-slate-500"} />
              </div>div>
        
              <div>
                      <h2 className="text-lg font-semibold text-slate-300 mb-3">TransCaña</h2>h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <KPICard title="Zafras Activas" value={String(props.zafrasActivas)} description={`${props.totalViajes} viajes registrados`} icon={Tractor} color="text-green-400" />
                                <KPICard title="Toneladas" value={props.toneladasTransportadas.toLocaleString("es-MX")} description="Transportadas" icon={TrendingUp} color="text-amber-400" />
                                <KPICard title="Muestras Lab" value={String(props.totalMuestras)} description="Análisis realizados" icon={FlaskConical} color="text-violet-400" />
                                <KPICard title="Colonos" value={String(props.totalColonos)} description={t("dashboard.registrados")} icon={UserCheck} color="text-teal-400" />
                      </div>div>
              </div>div>
        
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <KPICard title="OT Pendientes" value={String(props.otPendientes)} description="Órdenes de trabajo" icon={Wrench} color={props.otPendientes > 5 ? "text-orange-400" : "text-blue-400"} />
                      <KPICard title="Equipos" value={`${props.equiposOperativos}/${props.totalEquipos}`} description="Operativos" icon={Package} color={props.equiposOperativos < props.totalEquipos ? "text-yellow-400" : "text-green-400"} />
              </div>div>
        
              <DashboardCharts ventasData={props.ventasChartData} inventarioData={props.invChartData} />
              <RecentActivity facturas={props.recentFacturas} productosStockBajo={props.productosStockBajo} />
        </div>div>
      );
}

function KPICard({ title, value, description, icon: Icon, color = "text-slate-500" }: {
    title: string; value: string; description: string; icon: LucideIcon; color?: string;
}) {
    return (
          <div className="rounded-xl bg-slate-800 border border-slate-700 p-5">
                <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-slate-400 uppercase tracking-wide">{title}</p>p>
                        <Icon className={`w-5 h-5 ${color}`} />
                </div>div>
                <p className="text-2xl font-bold text-white">{value}</p>p>
                <p className="text-xs text-slate-500 mt-1">{description}</p>p>
          </div>div>
        );
}</div>
