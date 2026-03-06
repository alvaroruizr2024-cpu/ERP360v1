"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FileText, Download, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { generarPLEVentas14, nombreArchivoPLE14 } from "@/lib/export/ple-ventas";
import { generarPLECompras8, nombreArchivoPLE8 } from "@/lib/export/ple-compras";

const RUC_EMPRESA = "20606205105"; // INNOVAQ SOLUTIONS SAC

export default function PLEPage() {
  const [periodo, setPeriodo] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, { lines: number; size: string; status: string }>>({});

  const downloadTXT = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generatePLE = async (tipo: "ventas" | "compras") => {
    setLoading(tipo);
    const supabase = createClient();
    const year = periodo.substring(0, 4);
    const month = periodo.substring(4, 6);
    const startDate = `${year}-${month}-01`;
    const endDate = `${year}-${month}-${new Date(Number(year), Number(month), 0).getDate()}`;

    try {
      if (tipo === "ventas") {
        const { data: facturas } = await supabase
          .from("facturas")
          .select("id, numero, fecha, subtotal, impuesto, total, estado, cliente_id, clientes(nombre, rfc)")
          .gte("fecha", startDate)
          .lte("fecha", endDate)
          .order("numero");

        const mapped = (facturas || []).map((f: any) => ({
          ...f,
          cliente_nombre: f.clientes?.nombre,
          cliente_ruc: f.clientes?.rfc,
        }));

        const content = generarPLEVentas14(RUC_EMPRESA, periodo, mapped);
        const filename = nombreArchivoPLE14(RUC_EMPRESA, periodo);
        downloadTXT(content, filename);
        setResults(prev => ({
          ...prev,
          ventas: { lines: mapped.length, size: `${(content.length / 1024).toFixed(1)} KB`, status: "ok" }
        }));
      } else {
        const { data: compras } = await supabase
          .from("ordenes_compra")
          .select("id, numero, fecha, subtotal, impuesto, total, estado, proveedor_id, proveedores(nombre, rfc)")
          .gte("fecha", startDate)
          .lte("fecha", endDate)
          .order("numero");

        const mapped = (compras || []).map((c: any) => ({
          ...c,
          proveedor_nombre: c.proveedores?.nombre,
          proveedor_ruc: c.proveedores?.rfc,
        }));

        const content = generarPLECompras8(RUC_EMPRESA, periodo, mapped);
        const filename = nombreArchivoPLE8(RUC_EMPRESA, periodo);
        downloadTXT(content, filename);
        setResults(prev => ({
          ...prev,
          compras: { lines: mapped.length, size: `${(content.length / 1024).toFixed(1)} KB`, status: "ok" }
        }));
      }
    } catch (err) {
      setResults(prev => ({ ...prev, [tipo]: { lines: 0, size: "0 KB", status: "error" } }));
    }
    setLoading(null);
  };

  const books = [
    { key: "ventas", label: "14.1 Registro de Ventas", desc: "Facturas, boletas, NC, ND del periodo", action: () => generatePLE("ventas") },
    { key: "compras", label: "8.1 Registro de Compras", desc: "Ordenes de compra y facturas proveedores", action: () => generatePLE("compras") },
    { key: "diario", label: "5.1 Libro Diario", desc: "Asientos contables del periodo", action: () => {} },
    { key: "mayor", label: "6.1 Libro Mayor", desc: "Movimientos agrupados por cuenta", action: () => {} },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FileText className="w-7 h-7 text-blue-400" /> Libros Electronicos PLE
        </h1>
        <p className="text-slate-400 mt-1">Generacion de archivos TXT formato SUNAT — Res. 112-2021</p>
      </div>

      <div className="flex items-center gap-4">
        <label className="text-sm text-slate-400">Periodo:</label>
        <input
          type="month"
          value={`${periodo.substring(0, 4)}-${periodo.substring(4, 6)}`}
          onChange={(e) => setPeriodo(e.target.value.replace("-", ""))}
          className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm"
        />
        <span className="text-xs text-slate-500">RUC: {RUC_EMPRESA}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {books.map((book) => {
          const result = results[book.key];
          const isLoading = loading === book.key;
          return (
            <div key={book.key} className="rounded-xl bg-slate-800 border border-slate-700 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold">{book.label}</h3>
                  <p className="text-xs text-slate-500 mt-1">{book.desc}</p>
                </div>
                {result?.status === "ok" && <CheckCircle className="w-5 h-5 text-green-400" />}
                {result?.status === "error" && <AlertTriangle className="w-5 h-5 text-red-400" />}
              </div>

              {result && result.status === "ok" && (
                <div className="flex gap-4 text-xs text-slate-400 mb-3">
                  <span>{result.lines} registros</span>
                  <span>{result.size}</span>
                </div>
              )}

              <button
                onClick={book.action}
                disabled={isLoading || book.key === "diario" || book.key === "mayor"}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isLoading ? "Generando..." : book.key === "diario" || book.key === "mayor" ? "Proximamente" : "Generar TXT"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl bg-slate-800/50 border border-slate-700 p-4">
        <p className="text-xs text-slate-500">
          Los archivos se generan en formato TXT con separador pipe (|) conforme a la estructura oficial SUNAT.
          Nomenclatura: LE + RUC + Periodo + Codigo libro + Operacion + Contenido + Moneda + IGV.TXT
        </p>
      </div>
    </div>
  );
}
