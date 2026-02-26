"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { crearOrdenCompra } from "@/lib/actions/compras";

type ProveedorOption = { id: string; nombre: string };
type ProductoOption = { id: string; nombre: string; sku: string; costo: number };
type LineItem = {
  producto_id: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
};

export function PurchaseOrderForm({
  proveedores,
  productos,
}: {
  proveedores: ProveedorOption[];
  productos: ProductoOption[];
}) {
  const [proveedorId, setProveedorId] = useState("");
  const [notas, setNotas] = useState("");
  const [items, setItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addItem() {
    setItems([...items, { producto_id: "", nombre: "", cantidad: 1, precio_unitario: 0 }]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    const updated = [...items];
    if (field === "producto_id") {
      const prod = productos.find((p) => p.id === value);
      if (prod) {
        updated[index] = {
          ...updated[index],
          producto_id: prod.id,
          nombre: prod.nombre,
          precio_unitario: prod.costo,
        };
      }
    } else {
      (updated[index] as Record<string, string | number>)[field] = value;
    }
    setItems(updated);
  }

  const subtotal = items.reduce((s, i) => s + i.cantidad * i.precio_unitario, 0);
  const impuesto = subtotal * 0.16;
  const total = subtotal + impuesto;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!proveedorId) { setError("Selecciona un proveedor"); return; }
    if (items.length === 0 || items.some((i) => !i.producto_id)) {
      setError("Agrega al menos un producto valido");
      return;
    }
    setLoading(true);
    try {
      await crearOrdenCompra({
        proveedor_id: proveedorId,
        notas,
        items: items.map((i) => ({
          producto_id: i.producto_id,
          cantidad: i.cantidad,
          precio_unitario: i.precio_unitario,
        })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear orden");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Proveedor *</label>
            <select
              value={proveedorId}
              onChange={(e) => setProveedorId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar proveedor...</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Notas</label>
            <input
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Productos</h2>
          <button type="button" onClick={addItem} className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">
            <Plus className="w-4 h-4" /> Agregar linea
          </button>
        </div>
        {items.length === 0 ? (
          <p className="text-slate-500 text-sm py-4 text-center">Agrega productos a la orden</p>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 text-xs text-slate-400 uppercase px-1">
              <div className="col-span-5">Producto</div>
              <div className="col-span-2">Cantidad</div>
              <div className="col-span-2">Costo</div>
              <div className="col-span-2 text-right">Subtotal</div>
              <div className="col-span-1" />
            </div>
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <select
                    value={item.producto_id}
                    onChange={(e) => updateItem(i, "producto_id", e.target.value)}
                    className="w-full px-2 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <input type="number" min="1" value={item.cantidad} onChange={(e) => updateItem(i, "cantidad", parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-2">
                  <input type="number" step="0.01" min="0" value={item.precio_unitario} onChange={(e) => updateItem(i, "precio_unitario", parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-2 text-right text-white text-sm">${(item.cantidad * item.precio_unitario).toFixed(2)}</div>
                <div className="col-span-1 text-right">
                  <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
        {items.length > 0 && (
          <div className="border-t border-slate-700 pt-4 space-y-1 text-right">
            <p className="text-sm text-slate-400">Subtotal: <span className="text-white">${subtotal.toFixed(2)}</span></p>
            <p className="text-sm text-slate-400">IVA (16%): <span className="text-white">${impuesto.toFixed(2)}</span></p>
            <p className="text-lg font-bold text-white">Total: ${total.toFixed(2)}</p>
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50">
        {loading ? "Creando orden..." : "Crear orden de compra"}
      </button>
    </form>
  );
}
