"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Filter, X } from "lucide-react";

interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "date" | "number_range";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface AdvancedFiltersProps {
  filters: FilterConfig[];
}

export function AdvancedFilters({ filters }: AdvancedFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const activeFilters = filters.filter((f) => {
    if (f.type === "number_range") {
      return searchParams.get(`${f.key}_min`) || searchParams.get(`${f.key}_max`);
    }
    return searchParams.get(f.key);
  });

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearAll() {
    router.push(pathname);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors border ${
            open || activeFilters.length > 0
              ? "bg-blue-600/20 border-blue-600/30 text-blue-400"
              : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtros
          {activeFilters.length > 0 && (
            <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {activeFilters.length}
            </span>
          )}
        </button>
        {activeFilters.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-3 h-3" />
            Limpiar
          </button>
        )}
      </div>

      {open && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filters.map((f) => (
            <div key={f.key}>
              <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
              {f.type === "select" && (
                <select
                  value={searchParams.get(f.key) ?? ""}
                  onChange={(e) => updateParam(f.key, e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              )}
              {f.type === "date" && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={searchParams.get(`${f.key}_from`) ?? ""}
                    onChange={(e) => updateParam(`${f.key}_from`, e.target.value)}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-slate-500 text-xs">-</span>
                  <input
                    type="date"
                    value={searchParams.get(`${f.key}_to`) ?? ""}
                    onChange={(e) => updateParam(`${f.key}_to`, e.target.value)}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              {f.type === "number_range" && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Mín"
                    value={searchParams.get(`${f.key}_min`) ?? ""}
                    onChange={(e) => updateParam(`${f.key}_min`, e.target.value)}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-slate-500 text-xs">-</span>
                  <input
                    type="number"
                    placeholder="Máx"
                    value={searchParams.get(`${f.key}_max`) ?? ""}
                    onChange={(e) => updateParam(`${f.key}_max`, e.target.value)}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
