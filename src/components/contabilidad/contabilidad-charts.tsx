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

const COLORS = ["#3b82f6", "#ef4444", "#8b5cf6", "#22c55e", "#f59e0b"];

interface ContabilidadChartsProps {
  balanceByType: Array<{ name: string; saldo: number }>;
  ecuacionContable: { activos: number; pasivos: number; capital: number };
}

export function ContabilidadCharts({ balanceByType, ecuacionContable }: ContabilidadChartsProps) {
  const ecuacionData = [
    { name: "Activos", monto: ecuacionContable.activos },
    { name: "Pasivos", monto: ecuacionContable.pasivos },
    { name: "Capital", monto: ecuacionContable.capital },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Saldos por Tipo de Cuenta</h3>
        {balanceByType.length === 0 ? (
          <p className="text-slate-500 text-center py-16 text-sm">Sin datos aún</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={balanceByType.filter((b) => b.saldo > 0)} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="saldo" nameKey="name">
                {balanceByType.map((_, idx) => (
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
        <h3 className="text-sm font-semibold text-white mb-4">Ecuación Contable</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={ecuacionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 }}
              formatter={(value: number) => `Q${value.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`}
            />
            <Bar dataKey="monto" radius={[4, 4, 0, 0]} name="Monto (Q)">
              {ecuacionData.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 text-center text-xs text-slate-400">
          Activos (Q{ecuacionContable.activos.toLocaleString("es-MX", { minimumFractionDigits: 2 })}) = Pasivos (Q{ecuacionContable.pasivos.toLocaleString("es-MX", { minimumFractionDigits: 2 })}) + Capital (Q{ecuacionContable.capital.toLocaleString("es-MX", { minimumFractionDigits: 2 })})
        </div>
      </div>
    </div>
  );
}
