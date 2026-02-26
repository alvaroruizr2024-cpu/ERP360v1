import { Shield, Lock } from "lucide-react";

const roles = [
  {
    name: "Administrador",
    desc: "Acceso completo a todos los módulos y configuración",
    permisos: ["Dashboard", "Ventas", "Compras", "Inventario", "Contabilidad", "RRHH", "CRM", "Reportes", "Configuración"],
    color: "text-red-400 bg-red-600/10",
  },
  {
    name: "Gerente",
    desc: "Acceso a módulos operativos y reportes",
    permisos: ["Dashboard", "Ventas", "Compras", "Inventario", "Reportes", "CRM"],
    color: "text-yellow-400 bg-yellow-600/10",
  },
  {
    name: "Vendedor",
    desc: "Acceso a ventas, clientes y CRM",
    permisos: ["Dashboard", "Ventas", "CRM"],
    color: "text-green-400 bg-green-600/10",
  },
  {
    name: "Contador",
    desc: "Acceso a contabilidad, compras y reportes",
    permisos: ["Dashboard", "Contabilidad", "Compras", "Reportes"],
    color: "text-blue-400 bg-blue-600/10",
  },
];

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Roles y Permisos</h1>
          <p className="text-slate-400 mt-1">Niveles de acceso predefinidos</p>
        </div>
        <Shield className="w-8 h-8 text-blue-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => (
          <div key={role.name} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${role.color}`}>
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{role.name}</h3>
                <p className="text-xs text-slate-400">{role.desc}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {role.permisos.map((p) => (
                <span
                  key={p}
                  className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-md"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
        <p className="text-sm text-slate-400">
          Los roles personalizados estarán disponibles en una próxima actualización.
          <br />
          Actualmente todos los usuarios tienen acceso de Administrador.
        </p>
      </div>
    </div>
  );
}
