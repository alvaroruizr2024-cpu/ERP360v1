import { createClient } from "@/lib/supabase/server";
import { crearCuenta } from "@/lib/actions/contabilidad";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function CuentasPage() {
  const supabase = createClient();
  const { data: cuentas } = await supabase
    .from("cuentas_contables")
    .select("*")
    .order("codigo");

  const tipoColors: Record<string, string> = {
    activo: "bg-blue-900/50 text-blue-400",
    pasivo: "bg-red-900/50 text-red-400",
    capital: "bg-purple-900/50 text-purple-400",
    ingreso: "bg-green-900/50 text-green-400",
    gasto: "bg-orange-900/50 text-orange-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/contabilidad" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Plan de Cuentas</h1>
      </div>

      <form action={crearCuenta} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Agregar cuenta</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Codigo *</label>
            <input name="codigo" required placeholder="1000" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Nombre *</label>
            <input name="nombre" required className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Tipo *</label>
            <select name="tipo" required className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="activo">Activo</option>
              <option value="pasivo">Pasivo</option>
              <option value="capital">Capital</option>
              <option value="ingreso">Ingreso</option>
              <option value="gasto">Gasto</option>
            </select>
          </div>
        </div>
        <button type="submit" className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors">
          Agregar cuenta
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Codigo</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3 text-right">Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {(cuentas ?? []).map((c) => (
              <tr key={c.id} className="text-slate-300 hover:bg-slate-800/50">
                <td className="px-4 py-3 font-mono text-xs">{c.codigo}</td>
                <td className="px-4 py-3 text-white font-medium">{c.nombre}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${tipoColors[c.tipo] ?? ""}`}>{c.tipo}</span>
                </td>
                <td className="px-4 py-3 text-right">${Number(c.saldo).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(cuentas ?? []).length === 0 && (
          <p className="text-center text-slate-500 py-8">No hay cuentas registradas</p>
        )}
      </div>
    </div>
  );
}
