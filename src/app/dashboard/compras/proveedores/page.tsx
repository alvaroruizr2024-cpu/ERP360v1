import { createClient } from "@/lib/supabase/server";
import { crearProveedor } from "@/lib/actions/compras";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ProveedoresPage() {
  const supabase = createClient();
  const { data: proveedores } = await supabase
    .from("proveedores")
    .select("*")
    .order("nombre");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/compras"
          className="text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Proveedores</h1>
      </div>

      <form
        action={crearProveedor}
        className="bg-slate-800 border border-slate-700 rounded-xl p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">
          Agregar proveedor
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Nombre *</label>
            <input
              name="nombre"
              required
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Contacto</label>
            <input
              name="contacto"
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
            <label className="block text-sm text-slate-300 mb-1">Telefono</label>
            <input
              name="telefono"
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
          Agregar proveedor
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Contacto</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Telefono</th>
              <th className="px-4 py-3">RFC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {(proveedores ?? []).map((p) => (
              <tr key={p.id} className="text-slate-300 hover:bg-slate-800/50">
                <td className="px-4 py-3 font-medium text-white">{p.nombre}</td>
                <td className="px-4 py-3">{p.contacto ?? "-"}</td>
                <td className="px-4 py-3">{p.email ?? "-"}</td>
                <td className="px-4 py-3">{p.telefono ?? "-"}</td>
                <td className="px-4 py-3">{p.rfc ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(proveedores ?? []).length === 0 && (
          <p className="text-center text-slate-500 py-8">
            No hay proveedores registrados
          </p>
        )}
      </div>
    </div>
  );
}
