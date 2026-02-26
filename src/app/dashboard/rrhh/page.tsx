import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function RRHHPage() {
  const supabase = createClient();
  const [empRes, deptRes] = await Promise.all([
    supabase.from("empleados").select("*, departamentos(nombre)").order("nombre"),
    supabase.from("departamentos").select("*").order("nombre"),
  ]);

  const empleados = empRes.data ?? [];
  const departamentos = deptRes.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Recursos Humanos</h1>
          <p className="text-slate-400 mt-1">
            {empleados.filter((e) => e.estado === "activo").length} empleados activos
            {departamentos.length > 0 && ` en ${departamentos.length} departamentos`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/rrhh/departamentos"
            className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-600 transition-colors"
          >
            Departamentos
          </Link>
          <Link
            href="/dashboard/rrhh/nuevo"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Empleado
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Cargo</th>
              <th className="px-4 py-3">Departamento</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Ingreso</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {empleados.map((e) => {
              const dept = (e as Record<string, unknown>).departamentos as { nombre: string } | null;
              return (
                <tr key={e.id} className="text-slate-300 hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/rrhh/${e.id}`}
                      className="font-medium text-white hover:text-blue-400"
                    >
                      {e.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{e.cargo ?? "-"}</td>
                  <td className="px-4 py-3">{dept?.nombre ?? "-"}</td>
                  <td className="px-4 py-3">{e.email ?? "-"}</td>
                  <td className="px-4 py-3">
                    {new Date(e.fecha_ingreso).toLocaleDateString("es-MX")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        e.estado === "activo"
                          ? "bg-green-900/50 text-green-400"
                          : "bg-red-900/50 text-red-400"
                      }`}
                    >
                      {e.estado}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {empleados.length === 0 && (
          <p className="text-center text-slate-500 py-8">No hay empleados registrados</p>
        )}
      </div>
    </div>
  );
}
