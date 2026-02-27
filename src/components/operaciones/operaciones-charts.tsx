"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#22c55e", "#f59e0b", "#3b82f6", "#ef4444"];

interface OperacionesChartsProps {
  byType: Array<{ name: string; toneladas: number; hectareas: number }>;
  byEstado: Array<{ name: string; count: number }>;
}

export function OperacionesCharts({ byType, byEstado }: OperacionesChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Toneladas y Hectáreas por Tipo</h3>
        {byType.length === 0 ? (
          <p className="text-slate-500 text-center py-16 text-sm">Sin datos aún</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={byType}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 }}
              />
              <Bar dataKey="toneladas" fill="#22c55e" radius={[4, 4, 0, 0]} name="Toneladas" />
              <Bar dataKey="hectareas" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Hectáreas" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Operaciones por Estado</h3>
        {byEstado.length === 0 ? (
          <p className="text-slate-500 text-center py-16 text-sm">Sin datos aún</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={byEstado.filter((e) => e.count > 0)} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="count" nameKey="name">
                {byEstado.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 }} />
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
