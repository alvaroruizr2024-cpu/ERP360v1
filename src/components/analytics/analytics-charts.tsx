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

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const tooltipStyle = {
  backgroundColor: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "8px",
  color: "#f1f5f9",
  fontSize: 12,
};

interface AnalyticsChartsProps {
  toneladasPorTipo: { tipo: string; toneladas: number }[];
  costosPorCategoria: { categoria: string; monto: number }[];
  combustiblePorTipo: { tipo: string; galones: number }[];
  parcelasPorEstado: { estado: string; count: number; hectareas: number }[];
}

export function AnalyticsCharts({
  toneladasPorTipo,
  costosPorCategoria,
  combustiblePorTipo,
  parcelasPorEstado,
}: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Toneladas by type */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Toneladas por Tipo de Operación</h3>
        {toneladasPorTipo.every((t) => t.toneladas === 0) ? (
          <p className="text-slate-500 text-center py-16 text-sm">Sin datos</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={toneladasPorTipo}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="tipo" stroke="#94a3b8" fontSize={12} className="capitalize" />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="toneladas" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Costos by category */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Distribución de Costos</h3>
        {costosPorCategoria.length === 0 ? (
          <p className="text-slate-500 text-center py-16 text-sm">Sin datos</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={costosPorCategoria} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="monto" nameKey="categoria">
                {costosPorCategoria.map((_e, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Combustible by type */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Consumo de Combustible por Tipo</h3>
        {combustiblePorTipo.length === 0 ? (
          <p className="text-slate-500 text-center py-16 text-sm">Sin datos</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={combustiblePorTipo}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="tipo" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="galones" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Parcelas by state */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Parcelas por Estado</h3>
        {parcelasPorEstado.every((p) => p.count === 0) ? (
          <p className="text-slate-500 text-center py-16 text-sm">Sin datos</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={parcelasPorEstado}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="estado" stroke="#94a3b8" fontSize={11} className="capitalize" />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="hectareas" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Hectáreas" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
