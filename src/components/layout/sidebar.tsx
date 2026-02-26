import Link from "next/link";

const modules = [
  { name: "Dashboard", href: "/dashboard", icon: "grid" },
  { name: "Ventas", href: "/dashboard/ventas", icon: "trending-up" },
  { name: "Compras", href: "/dashboard/compras", icon: "shopping-cart" },
  { name: "Inventario", href: "/dashboard/inventario", icon: "package" },
  { name: "Contabilidad", href: "/dashboard/contabilidad", icon: "calculator" },
  { name: "RRHH", href: "/dashboard/rrhh", icon: "users" },
  { name: "CRM", href: "/dashboard/crm", icon: "contact" },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
      <div className="p-6">
        <Link href="/dashboard" className="text-xl font-bold text-white">
          ERP<span className="text-blue-400">360</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {modules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <span className="w-5 h-5 flex items-center justify-center text-slate-400">
              {mod.icon.charAt(0).toUpperCase()}
            </span>
            {mod.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <p className="text-xs text-slate-500">INNOVAQ Solutions</p>
      </div>
    </aside>
  );
}
