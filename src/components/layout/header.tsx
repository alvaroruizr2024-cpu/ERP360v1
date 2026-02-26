"use client";

import { LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-end px-6 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <User className="w-4 h-4" />
          <span>{user?.email ?? ""}</span>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Salir
        </button>
      </div>
    </header>
  );
}
