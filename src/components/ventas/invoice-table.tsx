"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Factura } from "@/types/database";

type FacturaWithCliente = Factura & {
  clientes: { nombre: string } | null;
};

export function InvoiceTable({
  facturas,
}: {
  facturas: FacturaWithCliente[];
}) {
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("");

  const filtered = facturas.filter((f) => {
    const clienteNombre = f.clientes?.nombre ?? "";
    const matchSearch =
      !search ||
      String(f.numero).includes(search) ||
      clienteNombre.toLowerCase().includes(search.toLowerCase());
    const matchEstado = !filterEstado || f.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const estadoColors: Record<string, string> = {
    pendiente: "bg-yellow-900/50 text-yellow-400",
    pagada: "bg-green-900/50 text-green-400",
    cancelada: "bg-red-900/50 text-red-400",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por numero o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 px-3 py-2"
        >
          <option value="">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="pagada">Pagada</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filtered.map((f) => (
              <tr key={f.id} className="text-slate-300 hover:bg-slate-800/50">
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/ventas/${f.id}`}
                    className="font-medium text-white hover:text-blue-400"
                  >
                    #{f.numero}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {f.clientes?.nombre ?? "Sin cliente"}
                </td>
                <td className="px-4 py-3">
                  {new Date(f.fecha).toLocaleDateString("es-MX")}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  ${Number(f.total).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      estadoColors[f.estado] ?? ""
                    }`}
                  >
                    {f.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-slate-500 py-8">
            No se encontraron facturas
          </p>
        )}
      </div>
    </div>
  );
}
