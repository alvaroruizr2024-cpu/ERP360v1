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

const COLORS = ["#f59e0b", "#ef4444", "#3b82f6", "#22c55e"];

interface CombustibleChartsProps {
  byTipo: Array<{ name: string; galones: number; gasto: number }>;
  topVehicles: Array<{ name: string; galones: number }>;
}

export function CombustibleCharts({ byTipo, topVehicles }: CombustibleChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Consumo por Tipo de Combustible</h3>
        {byTipo.length === 0 ? (
          <p className="text-slate-500 text-center py-16 text-sm">Sin datos aún</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={byTipo.filter((t) => t.galones > 0)} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="galones" nameKey="name">
                {byTipo.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 }}
                formatter={(value: number) => `${value.toLocaleString("es-MX", { minimumFractionDigits: 1 })} gal`}
              />
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Top 5 Vehículos por Consumo</h3>
        {topVehicles.length === 0 ? (
          <p className="text-slate-500 text-center py-16 text-sm">Sin datos aún</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topVehicles} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={80} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 }} />
              <Bar dataKey="galones" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Galones" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
