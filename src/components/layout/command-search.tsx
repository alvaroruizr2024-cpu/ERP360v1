"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

const routes = [
  { name: "Dashboard", href: "/dashboard", keywords: "inicio home" },
  { name: "Ventas", href: "/dashboard/ventas", keywords: "facturas invoices" },
  { name: "Nueva Factura", href: "/dashboard/ventas/nueva", keywords: "crear factura" },
  { name: "Clientes", href: "/dashboard/ventas/clientes", keywords: "clientes customers" },
  { name: "Compras", href: "/dashboard/compras", keywords: "ordenes compra" },
  { name: "Nueva Orden de Compra", href: "/dashboard/compras/nueva", keywords: "crear orden" },
  { name: "Proveedores", href: "/dashboard/compras/proveedores", keywords: "suppliers" },
  { name: "Inventario", href: "/dashboard/inventario", keywords: "productos stock" },
  { name: "Nuevo Producto", href: "/dashboard/inventario/nuevo", keywords: "crear producto" },
  { name: "Contabilidad", href: "/dashboard/contabilidad", keywords: "cuentas asientos" },
  { name: "Plan de Cuentas", href: "/dashboard/contabilidad/cuentas", keywords: "catalogo" },
  { name: "Nuevo Asiento", href: "/dashboard/contabilidad/asiento", keywords: "journal entry" },
  { name: "RRHH", href: "/dashboard/rrhh", keywords: "empleados recursos humanos" },
  { name: "Nuevo Empleado", href: "/dashboard/rrhh/nuevo", keywords: "crear empleado" },
  { name: "Departamentos", href: "/dashboard/rrhh/departamentos", keywords: "areas" },
  { name: "CRM", href: "/dashboard/crm", keywords: "leads pipeline" },
  { name: "Nuevo Lead", href: "/dashboard/crm/nuevo", keywords: "crear lead" },
  { name: "Reportes", href: "/dashboard/reportes", keywords: "graficas exportar pdf excel" },
  { name: "Configuración", href: "/dashboard/configuracion", keywords: "settings ajustes" },
  { name: "Perfil", href: "/dashboard/configuracion/perfil", keywords: "usuario password" },
  { name: "Empresa", href: "/dashboard/configuracion/empresa", keywords: "datos empresa rfc" },
  { name: "Roles", href: "/dashboard/configuracion/roles", keywords: "permisos acceso" },
];

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = query.trim()
    ? routes.filter(
        (r) =>
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.keywords.toLowerCase().includes(query.toLowerCase())
      )
    : routes;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    },
    []
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  function navigate(href: string) {
    router.push(href);
    setOpen(false);
  }

  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      navigate(filtered[selectedIndex].href);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:inline">Buscar...</span>
        <kbd className="hidden md:inline text-xs bg-slate-600 px-1.5 py-0.5 rounded">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/60" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-lg bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Buscar módulo o página..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-500"
          />
          <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-6">Sin resultados</p>
          )}
          {filtered.map((r, i) => (
            <button
              key={r.href}
              onClick={() => navigate(r.href)}
              onMouseEnter={() => setSelectedIndex(i)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                i === selectedIndex
                  ? "bg-blue-600/20 text-blue-400"
                  : "text-slate-300 hover:bg-slate-700/50"
              }`}
            >
              {r.name}
              <span className="text-xs text-slate-500 ml-2">{r.href}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
