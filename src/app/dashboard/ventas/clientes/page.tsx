import { createClient } from "@/lib/supabase/server";
import { crearCliente } from "@/lib/actions/clientes";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ClientesPage() {
  const supabase = createClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("*")
    .order("nombre");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/ventas"
          className="text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Clientes</h1>
      </div>

      <form
        action={crearCliente}
        className="bg-slate-800 border border-slate-700 rounded-xl p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">
          Agregar cliente
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Nombre *
            </label>
            <input
              name="nombre"
              required
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <input
              name="email"
              type="email"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Telefono
            </label>
            <input
              name="telefono"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Direccion
            </label>
            <input
              name="direccion"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">RFC</label>
            <input
              name="rfc"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors"
        >
          Agregar cliente
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Telefono</th>
              <th className="px-4 py-3">RFC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {(clientes ?? []).map((c) => (
              <tr key={c.id} className="text-slate-300 hover:bg-slate-800/50">
                <td className="px-4 py-3 font-medium text-white">
                  {c.nombre}
                </td>
                <td className="px-4 py-3">{c.email ?? "-"}</td>
                <td className="px-4 py-3">{c.telefono ?? "-"}</td>
                <td className="px-4 py-3">{c.rfc ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(clientes ?? []).length === 0 && (
          <p className="text-center text-slate-500 py-8">
            No hay clientes registrados
          </p>
        )}
      </div>
    </div>
  );
}
