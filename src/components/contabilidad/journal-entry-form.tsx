"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { crearAsiento } from "@/lib/actions/contabilidad";

type CuentaOption = { id: string; codigo: string; nombre: string };
type Linea = { cuenta_id: string; debe: number; haber: number };

export function JournalEntryForm({ cuentas }: { cuentas: CuentaOption[] }) {
  const [descripcion, setDescripcion] = useState("");
  const [lineas, setLineas] = useState<Linea[]>([
    { cuenta_id: "", debe: 0, haber: 0 },
    { cuenta_id: "", debe: 0, haber: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addLinea() {
    setLineas([...lineas, { cuenta_id: "", debe: 0, haber: 0 }]);
  }

  function removeLinea(i: number) {
    if (lineas.length <= 2) return;
    setLineas(lineas.filter((_, idx) => idx !== i));
  }

  function updateLinea(i: number, field: keyof Linea, value: string | number) {
    const updated = [...lineas];
    (updated[i] as Record<string, string | number>)[field] = value;
    setLineas(updated);
  }

  const totalDebe = lineas.reduce((s, l) => s + l.debe, 0);
  const totalHaber = lineas.reduce((s, l) => s + l.haber, 0);
  const balanced = Math.abs(totalDebe - totalHaber) < 0.01 && totalDebe > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!descripcion.trim()) { setError("Ingresa una descripcion"); return; }
    if (lineas.some((l) => !l.cuenta_id)) { setError("Selecciona una cuenta en cada linea"); return; }
    if (!balanced) { setError("El asiento debe estar balanceado (Debe = Haber)"); return; }

    setLoading(true);
    try {
      await crearAsiento({ descripcion, lineas });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear asiento");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <label className="block text-sm text-slate-300 mb-1">Descripcion *</label>
        <input
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
          placeholder="Descripcion del asiento contable..."
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Lineas</h2>
          <button type="button" onClick={addLinea} className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">
            <Plus className="w-4 h-4" /> Agregar linea
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-2 text-xs text-slate-400 uppercase px-1">
            <div className="col-span-6">Cuenta</div>
            <div className="col-span-2">Debe</div>
            <div className="col-span-2">Haber</div>
            <div className="col-span-2" />
          </div>
          {lineas.map((linea, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-6">
                <select
                  value={linea.cuenta_id}
                  onChange={(e) => updateLinea(i, "cuenta_id", e.target.value)}
                  className="w-full px-2 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar cuenta...</option>
                  {cuentas.map((c) => (
                    <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <input type="number" step="0.01" min="0" value={linea.debe || ""}
                  onChange={(e) => updateLinea(i, "debe", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full px-2 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-2">
                <input type="number" step="0.01" min="0" value={linea.haber || ""}
                  onChange={(e) => updateLinea(i, "haber", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full px-2 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-2 text-right">
                {lineas.length > 2 && (
                  <button type="button" onClick={() => removeLinea(i)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-700 pt-4 grid grid-cols-12 gap-2 text-sm font-semibold">
          <div className="col-span-6 text-slate-400">Totales</div>
          <div className={`col-span-2 ${balanced ? "text-green-400" : "text-red-400"}`}>${totalDebe.toFixed(2)}</div>
          <div className={`col-span-2 ${balanced ? "text-green-400" : "text-red-400"}`}>${totalHaber.toFixed(2)}</div>
          <div className="col-span-2" />
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button type="submit" disabled={loading || !balanced} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50">
        {loading ? "Registrando..." : "Registrar asiento"}
      </button>
    </form>
  );
}
