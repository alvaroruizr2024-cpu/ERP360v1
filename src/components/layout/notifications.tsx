"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, AlertTriangle, TrendingUp, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Notification {
  id: string;
  type: "stock_bajo" | "venta" | "info";
  title: string;
  message: string;
  time: string;
}

export function Notifications() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadNotifications() {
      const supabase = createClient();
      const { data: productos } = await supabase
        .from("productos")
        .select("nombre, stock, stock_minimo")
        .filter("estado", "eq", "activo");

      const alerts: Notification[] = [];

      if (productos) {
        for (const p of productos) {
          if (p.stock <= p.stock_minimo) {
            alerts.push({
              id: `stock-${p.nombre}`,
              type: "stock_bajo",
              title: "Stock Bajo",
              message: `${p.nombre}: ${p.stock} unidades (mín: ${p.stock_minimo})`,
              time: "Ahora",
            });
          }
        }
      }

      if (alerts.length === 0) {
        alerts.push({
          id: "no-alerts",
          type: "info",
          title: "Todo en orden",
          message: "No hay alertas pendientes",
          time: "Ahora",
        });
      }

      setNotifs(alerts);
    }

    loadNotifications();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const stockBajoCount = notifs.filter((n) => n.type === "stock_bajo").length;

  const iconMap = {
    stock_bajo: AlertTriangle,
    venta: TrendingUp,
    info: Package,
  };

  const colorMap = {
    stock_bajo: "text-orange-400",
    venta: "text-green-400",
    info: "text-blue-400",
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center text-slate-400 hover:text-white transition-colors p-1.5"
      >
        <Bell className="w-5 h-5" />
        {stockBajoCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            {stockBajoCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-slate-700">
            <h3 className="text-sm font-semibold text-white">Notificaciones</h3>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifs.map((n) => {
              const Icon = iconMap[n.type];
              return (
                <div
                  key={n.id}
                  className="px-4 py-3 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${colorMap[n.type]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{n.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                    </div>
                    <span className="text-xs text-slate-500 shrink-0">{n.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
