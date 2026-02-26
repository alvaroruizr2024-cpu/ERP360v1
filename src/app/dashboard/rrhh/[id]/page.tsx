import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { actualizarEmpleado } from "@/lib/actions/rrhh";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EmpleadoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const [empRes, deptRes] = await Promise.all([
    supabase.from("empleados").select("*, departamentos(nombre)").eq("id", params.id).single(),
    supabase.from("departamentos").select("id, nombre").order("nombre"),
  ]);

  if (!empRes.data) notFound();
  const emp = empRes.data;
  const departamentos = deptRes.data ?? [];
  const updateAction = actualizarEmpleado.bind(null, params.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/rrhh" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">{emp.nombre}</h1>
      </div>

      <form action={updateAction} className="max-w-2xl bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Nombre *</label>
            <input name="nombre" required defaultValue={emp.nombre} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <input name="email" type="email" defaultValue={emp.email ?? ""} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Telefono</label>
            <input name="telefono" defaultValue={emp.telefono ?? ""} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Cargo</label>
            <input name="cargo" defaultValue={emp.cargo ?? ""} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Departamento</label>
            <select name="departamento_id" defaultValue={emp.departamento_id ?? ""} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Sin departamento</option>
              {departamentos.map((d) => (
                <option key={d.id} value={d.id}>{d.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Salario</label>
            <input name="salario" type="number" step="0.01" min="0" defaultValue={emp.salario ?? ""} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Estado</label>
            <select name="estado" defaultValue={emp.estado} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors">
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
