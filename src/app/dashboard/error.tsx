"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
          console.error("Dashboard error:", error);
    }, [error]);

  return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <AlertTriangle className="w-12 h-12 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">Error al cargar el módulo</h2>h2>
              <p className="text-slate-400 text-sm text-center max-w-md">
                      Hubo un problema de conexión con el servidor. Esto puede ser temporal.
              </p>p>
              <button
                        onClick={() => reset()}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                      <RefreshCw className="w-4 h-4" />
                      Reintentar
              </button>button>
        </div>div>
      );
}</div>
