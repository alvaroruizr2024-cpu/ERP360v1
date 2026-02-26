"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Save } from "lucide-react";

export function ProfileForm({ email }: { email: string }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Contraseña actualizada correctamente");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  return (
    <div className="space-y-6">
      {/* Email (read-only) */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-medium text-slate-400 mb-3">Correo electrónico</h3>
        <p className="text-white">{email}</p>
      </div>

      {/* Change password */}
      <form onSubmit={handlePasswordChange} className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-medium text-slate-400 mb-1">Cambiar Contraseña</h3>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Nueva contraseña</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            minLength={6}
            required
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Confirmar contraseña</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            minLength={6}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? "Actualizando..." : "Actualizar Contraseña"}
        </button>
      </form>
    </div>
  );
}
