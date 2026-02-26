"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  ShoppingCart,
  Package,
  Calculator,
  Users,
  Contact,
  BarChart3,
  Settings,
  Tractor,
  Scale,
  Truck,
  FileText,
  Fuel,
  DollarSign,
  LineChart,
  Shield,
  CalendarDays,
  Route,
  FlaskConical,
  Banknote,
  UserCheck,
  Activity,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

interface NavSection {
  label: string;
  items: { key: string; href: string; icon: LucideIcon }[];
}

const sections: NavSection[] = [
  {
    label: "General",
    items: [
      { key: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "TransCaña",
    items: [
      { key: "nav.operaciones", href: "/dashboard/operaciones", icon: Tractor },
      { key: "nav.pesaje", href: "/dashboard/pesaje", icon: Scale },
      { key: "nav.flota", href: "/dashboard/flota", icon: Truck },
      { key: "nav.combustible", href: "/dashboard/combustible", icon: Fuel },
      { key: "nav.costos", href: "/dashboard/costos", icon: DollarSign },
      { key: "nav.zafra", href: "/dashboard/zafra", icon: CalendarDays },
      { key: "nav.logistica", href: "/dashboard/logistica", icon: Route },
      { key: "nav.laboratorio", href: "/dashboard/laboratorio", icon: FlaskConical },
      { key: "nav.colonos", href: "/dashboard/colonos", icon: UserCheck },
    ],
  },
  {
    label: "Comercial",
    items: [
      { key: "nav.ventas", href: "/dashboard/ventas", icon: TrendingUp },
      { key: "nav.compras", href: "/dashboard/compras", icon: ShoppingCart },
      { key: "nav.facturacion", href: "/dashboard/facturacion", icon: FileText },
      { key: "nav.inventario", href: "/dashboard/inventario", icon: Package },
      { key: "nav.crm", href: "/dashboard/crm", icon: Contact },
    ],
  },
  {
    label: "Gestión",
    items: [
      { key: "nav.contabilidad", href: "/dashboard/contabilidad", icon: Calculator },
      { key: "nav.rrhh", href: "/dashboard/rrhh", icon: Users },
      { key: "nav.nomina", href: "/dashboard/nomina", icon: Banknote },
      { key: "nav.analytics", href: "/dashboard/analytics", icon: LineChart },
      { key: "nav.bi", href: "/dashboard/bi", icon: Activity },
      { key: "nav.reportes", href: "/dashboard/reportes", icon: BarChart3 },
      { key: "nav.mantenimiento_industrial", href: "/dashboard/mantenimiento-industrial", icon: Wrench },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col shrink-0">
      <div className="p-5">
        <Link href="/dashboard" className="text-xl font-bold text-white">
          Trans<span className="text-green-400">Caña</span>
          <span className="text-xs text-slate-500 ml-1.5">ERP</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-4 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((mod) => {
                const isActive =
                  pathname === mod.href ||
                  (mod.href !== "/dashboard" && pathname.startsWith(mod.href));
                const Icon = mod.icon;

                return (
                  <Link
                    key={mod.href}
                    href={mod.href}
                    className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-blue-600/20 text-blue-400"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t(mod.key)}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 pb-2 space-y-0.5">
        <Link
          href="/dashboard/admin"
          className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            pathname.startsWith("/dashboard/admin")
              ? "bg-blue-600/20 text-blue-400"
              : "text-slate-300 hover:bg-slate-700 hover:text-white"
          }`}
        >
          <Shield className="w-4 h-4" />
          {t("nav.admin")}
        </Link>
        <Link
          href="/dashboard/configuracion"
          className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            pathname.startsWith("/dashboard/configuracion")
              ? "bg-blue-600/20 text-blue-400"
              : "text-slate-300 hover:bg-slate-700 hover:text-white"
          }`}
        >
          <Settings className="w-4 h-4" />
          {t("nav.configuracion")}
        </Link>
      </div>

      <div className="p-4 border-t border-slate-700">
        <p className="text-xs text-slate-500">INNOVAQ Solutions</p>
      </div>
    </aside>
  );
}
