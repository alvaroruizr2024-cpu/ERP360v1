"use client";

import { LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { CommandSearch } from "./command-search";
import { Notifications } from "./notifications";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LocaleToggle } from "@/components/ui/locale-toggle";
import { useI18n } from "@/lib/i18n/provider";

export function Header() {
  const { user, signOut } = useAuth();
  const { t } = useI18n();

  return (
    <div className="shrink-0">
      <header className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
        <CommandSearch />
        <div className="flex items-center gap-4">
          <LocaleToggle />
          <ThemeToggle />
          <Notifications />
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <User className="w-4 h-4" />
            <span className="hidden md:inline">{user?.email ?? ""}</span>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">{t("common.logout")}</span>
          </button>
        </div>
      </header>
      <div className="px-6 pt-4">
        <Breadcrumbs />
      </div>
    </div>
  );
}
