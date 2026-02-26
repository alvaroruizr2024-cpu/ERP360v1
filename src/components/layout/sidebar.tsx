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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const modules: { name: string; href: string; icon: LucideIcon }[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Ventas", href: "/dashboard/ventas", icon: TrendingUp },
  { name: "Compras", href: "/dashboard/compras", icon: ShoppingCart },
  { name: "Inventario", href: "/dashboard/inventario", icon: Package },
  { name: "Contabilidad", href: "/dashboard/contabilidad", icon: Calculator },
  { name: "RRHH", href: "/dashboard/rrhh", icon: Users },
  { name: "CRM", href: "/dashboard/crm", icon: Contact },
];

export function Sidebar() {
  const pathname = usePathname();

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
              {mod.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <p className="text-xs text-slate-500">INNOVAQ Solutions</p>
      </div>
    </aside>
  );
}
