"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

interface BIDashboardChartsProps {
  opsByType: Array<{ name: string; toneladas: number; count: number }>;
  costsByCategory: Array<{ name: string; monto: number }>;
  calDistribution: Array<{ name: string; count: number }>;
  otByType: Array<{ name: string; count: number; costo: number }>;
}

export function BIDashboardCharts({ opsByType, costsByCategory, calDistribution, otByType }: BIDashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Operations by Type */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Operaciones por Tipo</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={opsByType}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
            <Bar dataKey="toneladas" fill="#22c55e" radius={[4, 4, 0, 0]} name="Toneladas" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Costs by Category */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Costos por Categoría</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={costsByCategory.filter((c) => c.monto > 0)} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="monto" nameKey="name">
              {costsByCategory.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} formatter={(value: number) => `Q${value.toLocaleString("es-MX")}`} />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Quality Distribution */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Distribución de Calidad</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={calDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
            <Bar dataKey="count" name="Muestras" radius={[4, 4, 0, 0]}>
              {calDistribution.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Work Orders by Type */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Órdenes de Trabajo por Tipo</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={otByType}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Cantidad" />
            <Bar dataKey="costo" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Costo (Q)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
