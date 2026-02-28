import { createClient } from "@/lib/supabase/server";
import { Package, Plus } from "lucide-react";
import Link from "next/link";

export default async function ProductosVentaPage() {
    const supabase = createClient();
    const { data: productos } = await supabase
      .from("productos")
      .select("*")
      .order("nombre");

  const items = productos ?? [];

  return (
        <div className="space-y-6">
              <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                                <Link href="/dashboard/ventas" className="text-slate-400 hover:text-white">
                                            &larr;
                                </Link>Link>
                                <div>
                                            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                                          <Package className="w-6 h-6 text-cyan-400" />
                                                          Productos
                                            </h1>h1>
                                            <p className="text-slate-400 text-sm">Catálogo de productos para venta</p>p>
                                </div>div>
                      </div>div>
                      <Link
                                  href="/dashboard/inventario/nuevo"
                                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                >
                                <Plus className="w-4 h-4" />
                                Nuevo Producto
                      </Link>Link>
              </div>div>
        
              <div className="rounded-xl border border-slate-700 overflow-hidden">
                      <table className="w-full text-sm">
                                <thead>
                                            <tr className="bg-slate-800/80 border-b border-slate-700">
                                                          <th className="text-left px-4 py-3 text-slate-400 font-medium">NOMBRE</th>th>
                                                          <th className="text-left px-4 py-3 text-slate-400 font-medium">CATEGORÍA</th>th>
                                                          <th className="text-left px-4 py-3 text-slate-400 font-medium">PRECIO</th>th>
                                                          <th className="text-left px-4 py-3 text-slate-400 font-medium">STOCK</th>th>
                                                          <th className="text-left px-4 py-3 text-slate-400 font-medium">ESTADO</th>th>
                                            </tr>tr>
                                </thead>thead>
                                <tbody>
                                  {items.length === 0 ? (
                        <tr>
                                        <td colSpan={5} className="text-center py-8 text-slate-500">
                                                          No hay productos registrados
                                        </td>td>
                        </tr>tr>
                      ) : (
                        items.map((p: any) => (
                                          <tr key={p.id} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                                                            <td className="px-4 py-3 text-white">{p.nombre}</td>td>
                                                            <td className="px-4 py-3 text-slate-300">{p.categoria || "—"}</td>td>
                                                            <td className="px-4 py-3 text-green-400">
                                                                                ${Number(p.precio || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                                                            </td>td>
                                                            <td className="px-4 py-3 text-slate-300">{p.stock ?? 0}</td>td>
                                                            <td className="px-4 py-3">
                                                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                                  p.estado === "activo" ? "bg-green-500/20 text-green-400" : "bg-slate-600/30 text-slate-400"
                                          }`}>
                                                                                  {p.estado || "activo"}
                                                                                  </span>span>
                                                            </td>td>
                                          </tr>tr>
                                        ))
                      )}
                                </tbody>tbody>
                      </table>table>
              </div>div>
        </div>div>
      );
}</div>
