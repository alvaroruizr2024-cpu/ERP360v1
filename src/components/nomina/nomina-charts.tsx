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

const COLORS = ["#22c55e", "#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6"];

interface NominaChartsProps {
  deduccionesBreakdown: Array<{ name: string; monto: number }>;
  salarioDistribution: Array<{ rango: string; count: number }>;
}

export function NominaCharts({ deduccionesBreakdown, salarioDistribution }: NominaChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Desglose de Deducciones</h3>
        {deduccionesBreakdown.length === 0 ? (
          <p className="text-slate-500 text-center py-16 text-sm">Sin datos aún</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={deduccionesBreakdown.filter((d) => d.monto > 0)} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="monto" nameKey="name">
                {deduccionesBreakdown.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 }}
                formatter={(value: number) => `Q${value.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`}
              />
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Distribución Salarial</h3>
        {salarioDistribution.length === 0 ? (
          <p className="text-slate-500 text-center py-16 text-sm">Sin datos aún</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salarioDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="rango" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 }} />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Empleados" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
