"use client";

import { useI18n } from "@/lib/i18n/provider";
import { Languages } from "lucide-react";

export function LocaleToggle() {
  const { locale, setLocale } = useI18n();

  return (
    <button
      onClick={() => setLocale(locale === "es" ? "en" : "es")}
      className="flex items-center gap-1.5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-xs font-medium"
      title={locale === "es" ? "Switch to English" : "Cambiar a Español"}
    >
      <Languages className="w-4 h-4" />
      <span className="uppercase">{locale}</span>
    </button>
  );
}
