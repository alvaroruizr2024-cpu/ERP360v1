import { createClient } from "@/lib/supabase/server";
import { Shield, Users, Clock, AlertTriangle } from "lucide-react";

export default async function AdminPage() {
  const supabase = createClient();

  const [rolesRes, auditRes] = await Promise.all([
    supabase.from("roles").select("*").order("created_at", { ascending: false }),
    supabase.from("auditoria").select("*").order("created_at", { ascending: false }).limit(20),
  ]);

  const roles = rolesRes.data ?? [];
  const auditLogs = auditRes.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-7 h-7 text-red-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
          <p className="text-slate-400 mt-1">Roles, permisos, auditoría y logs del sistema</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-slate-500 uppercase">Roles</p>
          </div>
          <p className="text-2xl font-bold text-white">{roles.length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <p className="text-xs text-slate-500 uppercase">Logs Recientes</p>
          </div>
          <p className="text-2xl font-bold text-white">{auditLogs.length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-green-400" />
            <p className="text-xs text-slate-500 uppercase">Módulos Activos</p>
          </div>
          <p className="text-2xl font-bold text-white">17</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <p className="text-xs text-slate-500 uppercase">Alertas</p>
          </div>
          <p className="text-2xl font-bold text-white">0</p>
        </div>
      </div>

      {/* Roles */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" />
          Roles del Sistema
        </h3>
        {roles.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-slate-500 text-sm">No hay roles configurados</p>
            <p className="text-xs text-slate-600 mt-1">Crea roles para asignar permisos a usuarios</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-slate-400 uppercase text-xs border-b border-slate-700">
                <tr>
                  <th className="px-4 py-2">Nombre</th>
                  <th className="px-4 py-2">Descripción</th>
                  <th className="px-4 py-2 text-right">Permisos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {roles.map((r) => {
                  const permisos = Array.isArray(r.permisos) ? r.permisos : [];
                  return (
                    <tr key={r.id} className="text-slate-300 hover:bg-slate-700/30">
                      <td className="px-4 py-3 font-medium text-white">{r.nombre}</td>
                      <td className="px-4 py-3">{r.descripcion ?? "-"}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="bg-blue-900/50 text-blue-400 px-2 py-0.5 rounded-full text-xs">
                          {permisos.length} permisos
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Logs */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          Registro de Auditoría
        </h3>
        {auditLogs.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-slate-500 text-sm">Sin registros de auditoría</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-slate-400 uppercase text-xs border-b border-slate-700">
                <tr>
                  <th className="px-4 py-2">Fecha/Hora</th>
                  <th className="px-4 py-2">Módulo</th>
                  <th className="px-4 py-2">Acción</th>
                  <th className="px-4 py-2">Detalle</th>
                  <th className="px-4 py-2">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="text-slate-300 hover:bg-slate-700/30">
                    <td className="px-4 py-3 text-xs font-mono">
                      {new Date(log.created_at).toLocaleString("es-MX")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-slate-700 px-2 py-0.5 rounded text-xs">{log.modulo}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{log.accion}</td>
                    <td className="px-4 py-3 text-xs">{log.detalle ?? "-"}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-500">{log.ip ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
