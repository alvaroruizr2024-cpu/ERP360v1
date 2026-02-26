import { FileText, AlertTriangle } from "lucide-react";

interface RecentActivityProps {
  facturas: { numero: number; total: number; fecha: string; estado: string }[];
  productosStockBajo: { nombre: string; stock: number; minimo: number }[];
}

export function RecentActivity({ facturas, productosStockBajo }: RecentActivityProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent invoices */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          Últimas Facturas
        </h3>
        {facturas.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">No hay facturas</p>
        ) : (
          <div className="space-y-3">
            {facturas.map((f) => (
              <div key={f.numero} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium">#{f.numero}</span>
                  <span className="text-slate-500 text-xs">
                    {new Date(f.fecha).toLocaleDateString("es-MX")}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      f.estado === "pagada"
                        ? "bg-green-900/50 text-green-400"
                        : f.estado === "cancelada"
                        ? "bg-red-900/50 text-red-400"
                        : "bg-yellow-900/50 text-yellow-400"
                    }`}
                  >
                    {f.estado}
                  </span>
                  <span className="text-white font-medium">
                    ${Number(f.total).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stock alerts */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          Alertas de Stock
        </h3>
        {productosStockBajo.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-green-400 text-sm font-medium">Todo en orden</p>
            <p className="text-slate-500 text-xs mt-1">No hay productos con stock bajo</p>
          </div>
        ) : (
          <div className="space-y-3">
            {productosStockBajo.slice(0, 5).map((p) => (
              <div key={p.nombre} className="flex items-center justify-between text-sm">
                <span className="text-white">{p.nombre}</span>
                <div className="flex items-center gap-2">
                  <span className="text-orange-400 font-medium">{p.stock}</span>
                  <span className="text-slate-500 text-xs">/ mín {p.minimo}</span>
                </div>
              </div>
            ))}
            {productosStockBajo.length > 5 && (
              <p className="text-xs text-slate-500 text-center mt-2">
                +{productosStockBajo.length - 5} productos más
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
