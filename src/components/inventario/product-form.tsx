"use client";

import type { Producto } from "@/types/database";

export function ProductForm({
  action,
  producto,
}: {
  action: (formData: FormData) => Promise<void>;
  producto?: Producto;
}) {
  return (
    <form action={action} className="max-w-2xl space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Nombre *
            </label>
            <input
              name="nombre"
              required
              defaultValue={producto?.nombre}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">SKU *</label>
            <input
              name="sku"
              required
              defaultValue={producto?.sku}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">
            Descripcion
          </label>
          <textarea
            name="descripcion"
            rows={3}
            defaultValue={producto?.descripcion ?? ""}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Precio *
            </label>
            <input
              name="precio"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={producto?.precio}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Costo</label>
            <input
              name="costo"
              type="number"
              step="0.01"
              min="0"
              defaultValue={producto?.costo ?? 0}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Stock</label>
            <input
              name="stock"
              type="number"
              min="0"
              defaultValue={producto?.stock ?? 0}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Stock minimo
            </label>
            <input
              name="stock_minimo"
              type="number"
              min="0"
              defaultValue={producto?.stock_minimo ?? 0}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Categoria
            </label>
            <input
              name="categoria"
              defaultValue={producto?.categoria ?? ""}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Estado</label>
            <select
              name="estado"
              defaultValue={producto?.estado ?? "activo"}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors"
        >
          {producto ? "Guardar cambios" : "Crear producto"}
        </button>
      </div>
    </form>
  );
}
