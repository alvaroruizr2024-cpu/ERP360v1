import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/configuracion/profile-form";

export default async function PerfilPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Perfil de Usuario</h1>
        <p className="text-slate-400 mt-1">Actualiza tu información personal</p>
      </div>

      <ProfileForm email={user?.email ?? ""} />
    </div>
  );
}
