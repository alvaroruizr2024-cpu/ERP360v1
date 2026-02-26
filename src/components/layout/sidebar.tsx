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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

const modules: { key: string; href: string; icon: LucideIcon }[] = [
  { key: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "nav.ventas", href: "/dashboard/ventas", icon: TrendingUp },
  { key: "nav.compras", href: "/dashboard/compras", icon: ShoppingCart },
  { key: "nav.inventario", href: "/dashboard/inventario", icon: Package },
  { key: "nav.contabilidad", href: "/dashboard/contabilidad", icon: Calculator },
  { key: "nav.rrhh", href: "/dashboard/rrhh", icon: Users },
  { key: "nav.crm", href: "/dashboard/crm", icon: Contact },
  { key: "nav.reportes", href: "/dashboard/reportes", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col shrink-0">
      <div className="p-6">
        <Link href="/dashboard" className="text-xl font-bold text-white">
          ERP<span className="text-blue-400">360</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {modules.map((mod) => {
          const isActive =
            pathname === mod.href ||
            (mod.href !== "/dashboard" && pathname.startsWith(mod.href));
          const Icon = mod.icon;

          return (
            <Link
              key={mod.href}
              href={mod.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-blue-600/20 text-blue-400"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              {t(mod.key)}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-2">
        <Link
          href="/dashboard/configuracion"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname.startsWith("/dashboard/configuracion")
              ? "bg-blue-600/20 text-blue-400"
              : "text-slate-300 hover:bg-slate-700 hover:text-white"
          }`}
        >
          <Settings className="w-5 h-5" />
          {t("nav.configuracion")}
        </Link>
      </div>

      <div className="p-4 border-t border-slate-700">
        <p className="text-xs text-slate-500">INNOVAQ Solutions</p>
      </div>
    </aside>
  );
}
