"use client";
import { useState, useRef } from "react";
import { Brain, Upload, Camera, Loader2, CheckCircle2, X, FileText } from "lucide-react";

type DocType = "factura_compra"|"factura_venta"|"guia_recepcion"|"ticket_pesaje"|"nota_credito"|"recibo_honorarios"|"vale_combustible"|"orden_compra"|"boleta_pago"|"liquidacion"|"cotizacion"|"documento_general";

const DOC_LABELS: Record<DocType, string> = {
  factura_compra: "Factura de Compra",
  factura_venta: "Factura de Venta",
  guia_recepcion: "Guia de Remision / Ingreso",
  ticket_pesaje: "Ticket de Bascula",
  nota_credito: "Nota de Credito",
  recibo_honorarios: "Recibo por Honorarios",
  vale_combustible: "Vale de Combustible",
  orden_compra: "Orden de Compra",
  boleta_pago: "Boleta de Pago",
  liquidacion: "Liquidacion de Transporte",
  cotizacion: "Cotizacion de Proveedor",
  documento_general: "Documento General",
};

interface DocScannerProps {
  tipo: DocType;
  onResult: (data: any) => void;
  allowedTypes?: DocType[];
  compact?: boolean;
}

export function DocScanner({ tipo: initialTipo, onResult, allowedTypes, compact }: DocScannerProps) {
  const [tipo, setTipo] = useState<DocType>(initialTipo);
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState<string|null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string|null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const types = allowedTypes || [initialTipo];

  const handleFile = async (file: File) => {
    setError(null);
    setResult(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    setScanning(true);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("tipo", tipo);
      const res = await fetch("/api/ai-scan", { method: "POST", body: form });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        onResult(data.data);
      } else {
        setError(data.error || "Error procesando documento");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setScanning(false);
    }
  };

  const reset = () => { setPreview(null); setResult(null); setError(null); };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={scanning}
          className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-sm transition-colors">
          {scanning ? <Loader2 className="w-4 h-4 animate-spin"/> : <Brain className="w-4 h-4"/>}
          {scanning ? "Escaneando..." : "Importar con IA"}
        </button>
        {result && <CheckCircle2 className="w-5 h-5 text-green-400"/>}
        {error && <span className="text-red-400 text-xs">{error}</span>}
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-purple-700/50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-purple-300 flex items-center gap-2">
          <Brain className="w-4 h-4"/> Importar Documento con IA
        </h3>
        {(result || error) && <button onClick={reset} className="text-slate-400 hover:text-white"><X className="w-4 h-4"/></button>}
      </div>

      {types.length > 1 && (
        <select value={tipo} onChange={e=>setTipo(e.target.value as DocType)}
          className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm mb-3">
          {types.map(t => <option key={t} value={t}>{DOC_LABELS[t]}</option>)}
        </select>
      )}

      {!preview && !result && (
        <div className="flex gap-3">
          <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <button type="button" onClick={() => cameraRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-4 border-2 border-dashed border-purple-700/50 rounded-lg text-purple-300 hover:bg-purple-900/20 transition-colors">
            <Camera className="w-5 h-5"/> Tomar Foto
          </button>
          <button type="button" onClick={() => fileRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:bg-slate-700/50 transition-colors">
            <Upload className="w-5 h-5"/> Subir Archivo
          </button>
        </div>
      )}

      {scanning && (
        <div className="flex flex-col items-center py-6 gap-3">
          <div className="relative">
            <Brain className="w-10 h-10 text-purple-400 animate-pulse"/>
            <Loader2 className="w-5 h-5 text-purple-300 animate-spin absolute -top-1 -right-1"/>
          </div>
          <p className="text-sm text-purple-300">Analizando {DOC_LABELS[tipo]}...</p>
          <p className="text-xs text-slate-500">Claude Vision esta extrayendo los datos</p>
        </div>
      )}

      {error && <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">{error}</div>}

      {result && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-green-400 text-sm"><CheckCircle2 className="w-4 h-4"/> Datos extraidos correctamente</div>
          <div className="bg-slate-900 rounded-lg p-3 max-h-48 overflow-y-auto">
            <pre className="text-xs text-slate-300 whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </div>
          <p className="text-xs text-slate-500">Los datos fueron cargados al formulario. Revisa y ajusta antes de guardar.</p>
        </div>
      )}

      {preview && !scanning && !result && (
        <div className="mt-3"><img src={preview} alt="Preview" className="max-h-32 rounded-lg border border-slate-700 mx-auto"/></div>
      )}
    </div>
  );
}
