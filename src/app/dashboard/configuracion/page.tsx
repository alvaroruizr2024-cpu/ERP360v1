import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Settings, User, Building2, Shield } from "lucide-react";

export default async function ConfiguracionPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sections = [
    {
      icon: User,
      title: "Perfil de Usuario",
      desc: "Actualiza tu correo, contraseña y preferencias",
      href: "/dashboard/configuracion/perfil",
    },
    {
      icon: Building2,
      title: "Datos de Empresa",
      desc: "Nombre, RFC, dirección y logo de la empresa",
      href: "/dashboard/configuracion/empresa",
    },
    {
      icon: Shield,
      title: "Roles y Permisos",
      desc: "Gestiona los niveles de acceso del equipo",
      href: "/dashboard/configuracion/roles",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Configuración</h1>
          <p className="text-slate-400 mt-1">Administra tu cuenta y empresa</p>
        </div>
        <Settings className="w-8 h-8 text-blue-400" />
      </div>

      {/* User info summary */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600/20 rounded-full flex items-center justify-center">
            <User className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">{user?.email ?? "Usuario"}</p>
            <p className="text-sm text-slate-400">
              Cuenta creada: {user?.created_at ? new Date(user.created_at).toLocaleDateString("es-MX") : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Settings sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-blue-600/30 hover:bg-slate-800/80 transition-all group"
            >
              <Icon className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white mb-1">{s.title}</h3>
              <p className="text-sm text-slate-400">{s.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
