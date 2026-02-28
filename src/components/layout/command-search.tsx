"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

const routes = [
  { name: "Dashboard", href: "/dashboard", keywords: "inicio home principal" },
    // TransCaña modules
  { name: "Operaciones", href: "/dashboard/operaciones", keywords: "campo corte alce transporte caña operaciones" },
  { name: "Nueva Operación", href: "/dashboard/operaciones/nueva", keywords: "crear operacion campo" },
  { name: "Parcelas", href: "/dashboard/operaciones/parcelas", keywords: "parcelas terrenos hectareas" },
  { name: "Pesaje", href: "/dashboard/pesaje", keywords: "bascula peso bruto tara neto pesaje" },
  { name: "Nuevo Pesaje", href: "/dashboard/pesaje/nuevo", keywords: "crear registro pesaje ticket" },
  { name: "Flota", href: "/dashboard/flota", keywords: "vehiculos camiones tractores flota" },
  { name: "Nuevo Vehículo", href: "/dashboard/flota/nuevo", keywords: "crear vehiculo" },
  { name: "Mantenimientos", href: "/dashboard/flota/mantenimiento", keywords: "mantenimiento preventivo correctivo" },
  { name: "Combustible", href: "/dashboard/combustible", keywords: "diesel gasolina galones despacho combustible" },
  { name: "Nuevo Despacho", href: "/dashboard/combustible/nuevo", keywords: "crear despacho combustible" },
  { name: "Costos", href: "/dashboard/costos", keywords: "analisis costos hectarea tonelada centro costo" },
  { name: "Centros de Costo", href: "/dashboard/costos/centros", keywords: "centros costo" },
  { name: "Zafra", href: "/dashboard/zafra", keywords: "zafra campaña cosecha planificacion" },
  { name: "Nueva Zafra", href: "/dashboard/zafra/nueva", keywords: "crear zafra campaña" },
  { name: "Metas de Zafra", href: "/dashboard/zafra/metas", keywords: "metas semanal cumplimiento" },
  { name: "Logística", href: "/dashboard/logistica", keywords: "rutas transporte gps logistica" },
  { name: "Nueva Ruta", href: "/dashboard/logistica/nueva", keywords: "crear ruta" },
  { name: "Viajes", href: "/dashboard/logistica/viajes", keywords: "viajes entregas transito fletes" },
  { name: "Laboratorio", href: "/dashboard/laboratorio", keywords: "laboratorio muestras brix pol fibra calidad" },
  { name: "Nueva Muestra", href: "/dashboard/laboratorio/nueva", keywords: "crear muestra laboratorio" },
  { name: "Análisis", href: "/dashboard/laboratorio/analisis", keywords: "analisis calidad brix pol fibra" },
  { name: "Colonos", href: "/dashboard/colonos", keywords: "colonos proveedores caña entregas liquidaciones" },
  { name: "Nuevo Colono", href: "/dashboard/colonos/nuevo", keywords: "crear colono" },
  { name: "Entregas", href: "/dashboard/colonos/entregas", keywords: "entregas colonos toneladas" },
    // Comercial modules
  { name: "Ventas", href: "/dashboard/ventas", keywords: "facturas invoices ventas" },
  { name: "Nueva Factura", href: "/dashboard/ventas/nueva", keywords: "crear factura" },
  { name: "Clientes", href: "/dashboard/ventas/clientes", keywords: "clientes customers" },
  { name: "Productos", href: "/dashboard/ventas/productos", keywords: "productos catalogo" },
  { name: "Compras", href: "/dashboard/compras", keywords: "ordenes compra" },
  { name: "Nueva Orden de Compra", href: "/dashboard/compras/nueva", keywords: "crear orden" },
  { name: "Proveedores", href: "/dashboard/compras/proveedores", keywords: "suppliers proveedores" },
  { name: "Inventario", href: "/dashboard/inventario", keywords: "productos stock inventario" },
  { name: "Nuevo Producto", href: "/dashboard/inventario/nuevo", keywords: "crear producto" },
  { name: "Facturación", href: "/dashboard/facturacion", keywords: "facturacion" },
    // Gestión modules
  { name: "Contabilidad", href: "/dashboard/contabilidad", keywords: "cuentas asientos contabilidad" },
  { name: "Plan de Cuentas", href: "/dashboard/contabilidad/cuentas", keywords: "catalogo" },
  { name: "Nuevo Asiento", href: "/dashboard/contabilidad/asiento", keywords: "journal entry" },
  { name: "RRHH", href: "/dashboard/rrhh", keywords: "empleados recursos humanos" },
  { name: "Nuevo Empleado", href: "/dashboard/rrhh/nuevo", keywords: "crear empleado" },
  { name: "Departamentos", href: "/dashboard/rrhh/departamentos", keywords: "areas" },
  { name: "Nómina", href: "/dashboard/nomina", keywords: "nomina salarios pagos" },
  { name: "CRM", href: "/dashboard/crm", keywords: "leads pipeline crm" },
  { name: "Nuevo Lead", href: "/dashboard/crm/nuevo", keywords: "crear lead" },
  { name: "Analytics", href: "/dashboard/analytics", keywords: "analytics graficas" },
  { name: "Inteligencia", href: "/dashboard/bi", keywords: "bi inteligencia negocios" },
  { name: "Reportes", href: "/dashboard/reportes", keywords: "graficas exportar pdf excel reportes" },
  { name: "Mant. Industrial", href: "/dashboard/mantenimiento-industrial", keywords: "mantenimiento industrial equipos" },
    // Admin & Config
  { name: "Administración", href: "/dashboard/admin", keywords: "admin roles permisos auditoria" },
  { name: "Configuración", href: "/dashboard/configuracion", keywords: "settings ajustes configuracion" },
  { name: "Perfil", href: "/dashboard/configuracion/perfil", keywords: "usuario password perfil" },
  { name: "Empresa", href: "/dashboard/configuracion/empresa", keywords: "datos empresa rfc" },
  { name: "Roles", href: "/dashboard/configuracion/roles", keywords: "permisos acceso roles" },
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
                        <span className="hidden md:inline">Buscar...</span>span>
                        <kbd className="hidden md:inline text-xs bg-slate-600 px-1.5 py-0.5 rounded">⌘K</kbd>kbd>
                </button>button>
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
                                  </button>button>
                        </div>div>
                        <div className="max-h-72 overflow-y-auto py-2">
                          {filtered.length === 0 && (
                        <p className="text-sm text-slate-500 text-center py-6">Sin resultados</p>p>
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
                                      <span className="text-xs text-slate-500 ml-2">{r.href}</span>span>
                        </button>button>
                      ))}
                        </div>div>
                </div>div>
          </div>div>
        );
}</button>
