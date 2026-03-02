"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ScanLine,
  Save,
  Loader2,
  Camera,
  FileText,
} from "lucide-react";
import { TicketScanner } from "@/components/pesaje/ticket-scanner";
import toast from "react-hot-toast";

interface ScanResult {
  ticket: string;
  vehiculo_placa: string;
  chofer: string;
  tipo: "entrada" | "salida";
  peso_bruto: string;
  tara: string;
  porcentaje_impurezas: string;
  bascula: string;
  observaciones: string;
  raw_text: string;
}

export default function EscaneoTicketPage() {
  const router = useRouter();
  const [scanned, setScanned] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    ticket: "",
    vehiculo_placa: "",
    chofer: "",
    tipo: "entrada" as "entrada" | "salida",
    peso_bruto: "",
    tara: "",
    porcentaje_impurezas: "0",
    bascula: "",
    observaciones: "",
  });

  const handleScanComplete = (result: ScanResult) => {
    setFormData({
      ticket: result.ticket,
      vehiculo_placa: result.vehiculo_placa,
      chofer: result.chofer,
      tipo: result.tipo,
      peso_bruto: result.peso_bruto,
      tara: result.tara,
      porcentaje_impurezas: result.porcentaje_impurezas,
      bascula: result.bascula,
      observaciones: result.observaciones,
    });
    setScanned(true);
    toast.success("Ticket escaneado. Complete los datos faltantes.");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vehiculo_placa) {
      toast.error("La placa del vehículo es requerida.");
      return;
    }

    setSaving(true);

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value);
      });
      form.append("estado", "pendiente");

      const response = await fetch("/api/pesaje/escaneo", {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al guardar el registro");
      }

      toast.success("Registro de pesaje creado exitosamente.");
      router.push("/dashboard/pesaje");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar el registro.");
    } finally {
      setSaving(false);
    }
  };

  const pesoNeto =
    (parseFloat(formData.peso_bruto) || 0) - (parseFloat(formData.tara) || 0);
  const impurezas = parseFloat(formData.porcentaje_impurezas) || 0;
  const pesoAjustado = pesoNeto * (1 - impurezas / 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/pesaje"
            className="text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <ScanLine className="w-7 h-7 text-cyan-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Escaneo de Ticket</h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Captura un ticket de pesaje con la cámara y registra los datos
              </p>
            </div>
          </div>
        </div>
        <Link
          href="/dashboard/pesaje/nuevo"
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <FileText className="w-4 h-4" />
          Registro Manual
        </Link>
      </div>

      {/* Scanner Section */}
      {!scanned && <TicketScanner onScanComplete={handleScanComplete} />}

      {/* Form Section - shown after scan */}
      {scanned && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Scan indicator */}
          <div className="bg-cyan-900/20 border border-cyan-800/50 rounded-xl p-4 flex items-center gap-3">
            <Camera className="w-5 h-5 text-cyan-400 shrink-0" />
            <div className="flex-1">
              <p className="text-cyan-300 text-sm font-medium">
                Ticket escaneado exitosamente
              </p>
              <p className="text-cyan-400/70 text-xs mt-0.5">
                Verifica y completa los datos extraídos. Los campos marcados con * son obligatorios.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setScanned(false)}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors underline"
            >
              Escanear otro
            </button>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Ticket
                </label>
                <input
                  name="ticket"
                  value={formData.ticket}
                  onChange={handleChange}
                  placeholder="TK-001"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Tipo *
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Placa Vehículo *
                </label>
                <input
                  name="vehiculo_placa"
                  value={formData.vehiculo_placa}
                  onChange={handleChange}
                  required
                  placeholder="ABC-123"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Chofer
                </label>
                <input
                  name="chofer"
                  value={formData.chofer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Báscula
                </label>
                <input
                  name="bascula"
                  value={formData.bascula}
                  onChange={handleChange}
                  placeholder="Báscula 1"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Peso Bruto (tn) *
                </label>
                <input
                  name="peso_bruto"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.peso_bruto}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Tara (tn) *
                </label>
                <input
                  name="tara"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.tara}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  % Impurezas
                </label>
                <input
                  name="porcentaje_impurezas"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.porcentaje_impurezas}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Calculated fields */}
            {(formData.peso_bruto || formData.tara) && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-700">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <span className="text-slate-500 text-xs block">
                    Peso Neto (calculado)
                  </span>
                  <span className="text-xl font-bold text-cyan-400">
                    {pesoNeto.toFixed(2)} tn
                  </span>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <span className="text-slate-500 text-xs block">
                    Peso Neto Ajustado
                  </span>
                  <span className="text-xl font-bold text-green-400">
                    {pesoAjustado.toFixed(2)} tn
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Observaciones
              </label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Guardando..." : "Registrar Pesaje"}
            </button>
            <Link
              href="/dashboard/pesaje"
              className="flex items-center gap-2 bg-slate-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-600 transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
