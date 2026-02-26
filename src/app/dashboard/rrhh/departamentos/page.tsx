import { createClient } from "@/lib/supabase/server";
import { crearDepartamento } from "@/lib/actions/rrhh";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function DepartamentosPage() {
  const supabase = createClient();
  const { data: departamentos } = await supabase
    .from("departamentos")
    .select("*, empleados(id)")
    .order("nombre");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/rrhh" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Departamentos</h1>
      </div>

      <form action={crearDepartamento} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Agregar departamento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Nombre *</label>
            <input name="nombre" required className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Descripcion</label>
            <input name="descripcion" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <button type="submit" className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors">
          Agregar departamento
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Descripcion</th>
              <th className="px-4 py-3 text-right">Empleados</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {(departamentos ?? []).map((d) => {
              const emps = (d as Record<string, unknown>).empleados as Array<{ id: string }> | null;
              return (
                <tr key={d.id} className="text-slate-300 hover:bg-slate-800/50">
                  <td className="px-4 py-3 text-white font-medium">{d.nombre}</td>
                  <td className="px-4 py-3">{d.descripcion ?? "-"}</td>
                  <td className="px-4 py-3 text-right">{emps?.length ?? 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(departamentos ?? []).length === 0 && (
          <p className="text-center text-slate-500 py-8">No hay departamentos</p>
        )}
      </div>
    </div>
  );
}
