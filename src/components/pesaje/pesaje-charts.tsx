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

const COLORS = ["#3b82f6", "#a855f7", "#22c55e", "#f59e0b"];

interface PesajeChartsProps {
  byTipo: Array<{ name: string; peso_neto: number; count: number }>;
  byEstado: Array<{ name: string; count: number }>;
}

export function PesajeCharts({ byTipo, byEstado }: PesajeChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Peso Neto por Tipo</h3>
        {byTipo.length === 0 ? (
          <p className="text-slate-500 text-center py-16 text-sm">Sin datos aún</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={byTipo}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 }} />
              <Bar dataKey="peso_neto" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Peso Neto (tn)" />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Registros" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Registros por Estado</h3>
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
