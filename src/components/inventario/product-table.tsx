"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Producto } from "@/types/database";

export function ProductTable({ productos }: { productos: Producto[] }) {
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("");

  const categorias = Array.from(
    new Set(productos.map((p) => p.categoria).filter(Boolean))
  );
  const [filterCategoria, setFilterCategoria] = useState("");

  const filtered = productos.filter((p) => {
    const matchSearch =
      !search ||
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategoria = !filterCategoria || p.categoria === filterCategoria;
    const matchEstado = !filterEstado || p.estado === filterEstado;
    return matchSearch && matchCategoria && matchEstado;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {categorias.length > 0 && (
          <select
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 px-3 py-2"
          >
            <option value="">Todas las categorias</option>
            {categorias.map((c) => (
              <option key={c} value={c!}>
                {c}
              </option>
            ))}
          </select>
        )}
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 px-3 py-2"
        >
          <option value="">Todos</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3 text-right">Precio</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filtered.map((p) => (
              <tr key={p.id} className="text-slate-300 hover:bg-slate-800/50">
                <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/inventario/${p.id}`}
                    className="font-medium text-white hover:text-blue-400"
                  >
                    {p.nombre}
                  </Link>
                </td>
                <td className="px-4 py-3">{p.categoria ?? "-"}</td>
                <td className="px-4 py-3 text-right">
                  ${Number(p.precio).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={
                      p.stock <= p.stock_minimo
                        ? "text-red-400 font-semibold"
                        : ""
                    }
                  >
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      p.estado === "activo"
                        ? "bg-green-900/50 text-green-400"
                        : "bg-red-900/50 text-red-400"
                    }`}
                  >
                    {p.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-slate-500 py-8">
            No se encontraron productos
          </p>
        )}
      </div>
    </div>
  );
}
