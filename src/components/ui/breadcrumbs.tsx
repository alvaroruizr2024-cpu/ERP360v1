"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const labels: Record<string, string> = {
  dashboard: "Dashboard",
  ventas: "Ventas",
  compras: "Compras",
  inventario: "Inventario",
  contabilidad: "Contabilidad",
  rrhh: "RRHH",
  crm: "CRM",
  reportes: "Reportes",
  configuracion: "Configuración",
  nuevo: "Nuevo",
  nueva: "Nueva",
  editar: "Editar",
  clientes: "Clientes",
  proveedores: "Proveedores",
  cuentas: "Cuentas",
  asiento: "Asiento",
  departamentos: "Departamentos",
  perfil: "Perfil",
  empresa: "Empresa",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = labels[seg] || (seg.length > 8 ? "Detalle" : seg);
    const isLast = i === segments.length - 1;

    return (
      <li key={href} className="flex items-center gap-1">
        <ChevronRight className="w-3 h-3 text-slate-600" />
        {isLast ? (
          <span className="text-slate-300 text-xs">{label}</span>
        ) : (
          <Link href={href} className="text-slate-500 text-xs hover:text-slate-300 transition-colors">
            {label}
          </Link>
        )}
      </li>
    );
  });

  return (
    <nav className="mb-4">
      <ol className="flex items-center gap-1">
        <li>
          <Link href="/dashboard" className="text-slate-500 hover:text-slate-300 transition-colors">
            <Home className="w-3.5 h-3.5" />
          </Link>
        </li>
        {crumbs}
      </ol>
    </nav>
  );
}
