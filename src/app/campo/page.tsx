"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type Tab = "escanear" | "tickets" | "operaciones" | "nueva-op";
type Ticket = {
  id: string; ticket: string; vehiculo_placa: string; chofer: string;
  tipo: string; peso_bruto: number; tara: number; peso_neto: number;
  bascula: string; estado: string; created_at: string; observaciones: string;
  parcela?: string; impurezas?: number; origen_registro?: string;
};
type Operacion = {
  id: string; tipo: string; parcela: string; fecha: string; turno: string;
  cuadrilla: string; toneladas: number; hectareas: number; chofer: string;
  equipo: string; origen: string; destino: string; observaciones: string;
  estado: string; created_at: string; origen_registro?: string;
};

export default function CampoPage() {
  const [tab, setTab] = useState<Tab>("escanear");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [operaciones, setOperaciones] = useState<Operacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [aiResults, setAiResults] = useState<Record<string, string> | null>(null);
  const [aiProcessing, setAiProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const nativeCaptureRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ vehiculo_placa: "", chofer: "", tipo: "entrada", peso_bruto: "", tara: "", bascula: "Bascula 1", observaciones: "", parcela: "", impurezas: "0" });
  const [opsForm, setOpsForm] = useState({ tipo: "corte", parcela: "", fecha: new Date().toISOString().slice(0, 16), turno: "diurno", cuadrilla: "", viajes: "", toneladas: "", hectareas: "", chofer: "", equipo: "", origen: "", destino: "", observaciones: "" });
  const supabase = createClient();
  const accessLink = typeof window !== "undefined" ? window.location.origin + "/campo" : "/campo";
  const pesoNeto = (parseFloat(form.peso_bruto) || 0) - (parseFloat(form.tara) || 0);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("registros_pesaje").select("*").order("created_at", { ascending: false }).limit(50);
    if (data) setTickets(data as Ticket[]);
    setLoading(false);
  }, []);
  const loadOperaciones = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("operaciones_campo").select("*").order("created_at", { ascending: false }).limit(50);
    if (data) setOperaciones(data as Operacion[]);
    setLoading(false);
  }, []);
  useEffect(() => { if (tab === "tickets") loadTickets(); }, [tab, loadTickets]);
  useEffect(() => { if (tab === "operaciones") loadOperaciones(); }, [tab, loadOperaciones]);
  useEffect(() => { return () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); }; }, []);

  async function startCamera() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMsg("⚠️ Su navegador no soporta camara en vivo. Use el boton '📸 Tomar Foto' que abre la camara nativa.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setCameraActive(true); setCapturedImage(null); setAiResults(null); setMsg("");
    } catch (err: any) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setMsg("⚠️ Permiso de camara denegado. Use el boton '📸 Tomar Foto' que abre la camara nativa sin permisos del navegador.");
      } else if (err.name === "NotFoundError") {
        setMsg("⚠️ No se detecto camara. Use 'Importar Imagen' para subir una foto existente.");
      } else if (err.name === "NotReadableError") {
        setMsg("⚠️ Camara en uso por otra app. Cierre otras apps o use '📸 Tomar Foto'.");
      } else if (err.name === "OverconstrainedError") {
        try {
          const fallback = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = fallback;
          if (videoRef.current) { videoRef.current.srcObject = fallback; videoRef.current.play(); }
          setCameraActive(true); setCapturedImage(null); setAiResults(null); setMsg("");
          return;
        } catch { setMsg("⚠️ No se pudo configurar la camara. Use '📸 Tomar Foto'."); }
      } else {
        setMsg("⚠️ Error de camara (" + err.name + "). Use el boton '📸 Tomar Foto' como alternativa.");
      }
    }
  }
  function handleNativeCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { const d = ev.target?.result as string; setCapturedImage(d); setCameraActive(false); processImageAI(d); };
    reader.onerror = () => { setMsg("Error al leer la imagen. Intente de nuevo."); };
    reader.readAsDataURL(file);
    e.target.value = "";
  }
  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current, c = canvasRef.current;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d")?.drawImage(v, 0, 0);
    const dataUrl = c.toDataURL("image/jpeg", 0.8);
    setCapturedImage(dataUrl);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setCameraActive(false);
    processImageAI(dataUrl);
  }
  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { const d = ev.target?.result as string; setCapturedImage(d); setCameraActive(false); processImageAI(d); };
    reader.readAsDataURL(file);
  }
  
  function handleDocImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Para PDFs e imágenes, convertir a base64 y enviar al OCR
    const reader = new FileReader();
    reader.onload = (ev) => {
      const d = ev.target?.result as string;
      if (file.type.startsWith("image/")) {
        setCapturedImage(d);
      } else {
        setCapturedImage(null);
      }
      setCameraActive(false);
      processImageAI(d);
    };
    reader.readAsDataURL(file);
  }

  async function processImageAI(imageData: string) {
    setAiProcessing(true); setAiResults(null); setMsg("");
    try {
      const res = await fetch("/api/ocr-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setMsg("⚠️ " + (json.error || "Error procesando imagen"));
        setAiProcessing(false);
        return;
      }
      const d = json.data;
      const results: Record<string, string> = {};
      const fieldLabels: Record<string, string> = {
        tipoDocumento: "Tipo Documento", empresa: "Empresa", ticket: "Ticket/Folio",
        placa: "Placa", chofer: "Chofer", transportista: "Transportista",
        producto: "Producto", origen: "Origen", destino: "Destino",
        pesoBruto: "Peso Bruto", tara: "Tara", pesoNeto: "Peso Neto", unidadPeso: "Unidad",
        fecha: "Fecha", hora: "Hora",
        fechaPesoBruto: "Fecha P.Bruto", horaPesoBruto: "Hora P.Bruto",
        fechaTara: "Fecha Tara", horaTara: "Hora Tara",
        bascula: "Bascula", parcela: "Parcela/Campo", variedad: "Variedad",
        impurezas: "Impurezas %", guiaRemision: "Guia Remision",
        nroViaje: "Nro Viaje", turno: "Turno",
        observaciones: "Observaciones", datosAdicionales: "Datos Adicionales",
        camposNoLegibles: "No Legibles",
      };
      for (const [key, label] of Object.entries(fieldLabels)) {
        if (d[key] && String(d[key]).trim() !== "") {
          results[label] = String(d[key]);
        }
      }
      results["confianza"] = d.confianza || "0";
      results["_placa"] = d.placa || "";
      results["_chofer"] = d.chofer || "";
      results["_pesoBruto"] = d.pesoBruto || "";
      results["_tara"] = d.tara || "";
      results["_bascula"] = d.bascula || "";
      results["_parcela"] = d.parcela || d.origen || "";
      results["_impurezas"] = d.impurezas || "";
      results["_observaciones"] = d.observaciones || "";
      setAiResults(results);
      setAiProcessing(false);
      setMsg("✅ Documento escaneado - Confianza: " + (d.confianza || "?") + "% - Verifique los datos");
    } catch (err: any) {
      setAiProcessing(false);
      setMsg("⚠️ Error de conexion: " + (err.message || "No se pudo conectar con el servidor"));
    }
  }
  function applyAiData() {
    if (!aiResults) return;
    setForm(f => ({
      ...f,
      vehiculo_placa: aiResults["_placa"] || f.vehiculo_placa,
      chofer: aiResults["_chofer"] || f.chofer,
      peso_bruto: aiResults["_pesoBruto"] || f.peso_bruto,
      tara: aiResults["_tara"] || f.tara,
      bascula: aiResults["_bascula"] || f.bascula,
      parcela: aiResults["_parcela"] || f.parcela,
      impurezas: aiResults["_impurezas"] || f.impurezas,
      observaciones: aiResults["_observaciones"] || f.observaciones,
    }));
    setMsg("✅ Datos extraidos aplicados al formulario - Verifique antes de registrar");
  }
  async function submitTicket(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setMsg("");
    const pesoB = parseFloat(form.peso_bruto) || 0, taraV = parseFloat(form.tara) || 0, neto = pesoB - taraV;
    const ticket = "TK-" + String(Date.now()).slice(-6);
    const { data: { user } } = await supabase.auth.getUser();
    const record: any = { ticket, vehiculo_placa: form.vehiculo_placa, chofer: form.chofer, tipo: form.tipo, peso_bruto: pesoB, tara: taraV, peso_neto: neto, bascula: form.bascula, observaciones: form.observaciones, estado: "pendiente", origen_registro: "campo", parcela: form.parcela, impurezas: parseFloat(form.impurezas) || 0 };
    if (user?.id) record.user_id = user.id;
    const { data, error } = await supabase.from("registros_pesaje").insert(record).select().single();
    if (error) { setMsg("Error: " + error.message); }
    else {
      setMsg("Ticket " + (data?.ticket || ticket) + " registrado - Pendiente validacion ERP 360");
      if (user?.id) await supabase.from("auditoria").insert({ user_id: user.id, accion: "crear_ticket_campo", modulo: "campo", detalle: "Ticket " + ticket + " placa " + form.vehiculo_placa });
      setForm({ vehiculo_placa: "", chofer: "", tipo: "entrada", peso_bruto: "", tara: "", bascula: "Bascula 1", observaciones: "", parcela: "", impurezas: "0" });
      setCapturedImage(null); setAiResults(null); setTab("tickets"); loadTickets();
    }
    setLoading(false);
  }
  async function submitOperacion(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setMsg("");
    const { data: { user } } = await supabase.auth.getUser();
    const record: any = { tipo: opsForm.tipo, parcela: opsForm.parcela, fecha: opsForm.fecha, turno: opsForm.turno, cuadrilla: opsForm.cuadrilla, toneladas: parseFloat(opsForm.toneladas) || 0, hectareas: parseFloat(opsForm.hectareas) || 0, chofer: opsForm.chofer, equipo: opsForm.equipo, origen: opsForm.origen, destino: opsForm.destino, observaciones: opsForm.observaciones, estado: "pendiente", origen_registro: "campo" };
    if (user?.id) record.user_id = user.id;
    const { error } = await supabase.from("operaciones_campo").insert(record);
    if (error) { setMsg("Error: " + error.message); }
    else {
      setMsg("Operacion registrada - Pendiente validacion ERP 360");
      setOpsForm({ tipo: "corte", parcela: "", fecha: new Date().toISOString().slice(0,16), turno: "diurno", cuadrilla: "", viajes: "", toneladas: "", hectareas: "", chofer: "", equipo: "", origen: "", destino: "", observaciones: "" });
      setTab("operaciones"); loadOperaciones();
    }
    setLoading(false);
  }
  function copyLink() { navigator.clipboard.writeText(accessLink); setMsg("Link copiado al portapapeles"); }
  const S: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#0a0e1a", color: "white", fontFamily: "system-ui, sans-serif" },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#0d1224", borderBottom: "1px solid #1e293b", position: "sticky" as const, top: 0, zIndex: 100 },
    badge: { background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white", fontSize: 10, padding: "3px 10px", borderRadius: 6, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" as const },
    tabs: { display: "flex", background: "#111827", borderBottom: "1px solid #1e293b", overflowX: "auto" as const },
    tabBtn: { padding: "14px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none", background: "transparent", color: "#64748b", borderBottom: "3px solid transparent", whiteSpace: "nowrap" as const, display: "flex", alignItems: "center", gap: 8 },
    tabActive: { color: "#a78bfa", borderBottomColor: "#7c3aed" },
    content: { maxWidth: 900, margin: "0 auto", padding: "16px" },
    card: { background: "#1a2235", border: "1px solid #2d3a4f", borderRadius: 16, padding: 24, marginBottom: 16 },
    input: { width: "100%", padding: "12px 14px", background: "#1e293b", border: "1px solid #2d3a4f", borderRadius: 8, color: "white", fontSize: 14, boxSizing: "border-box" as const, outline: "none" },
    select: { width: "100%", padding: "12px 14px", background: "#1e293b", border: "1px solid #2d3a4f", borderRadius: 8, color: "white", fontSize: 14, boxSizing: "border-box" as const },
    label: { display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6, marginTop: 0, textTransform: "uppercase" as const, letterSpacing: 0.5 },
    btn: { width: "100%", padding: "14px 32px", background: "linear-gradient(135deg, #14b8a6, #0d9488)", color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
    msg: { padding: "12px 16px", borderRadius: 12, fontSize: 13, marginBottom: 16 },
    linkBar: { background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(20,184,166,0.05))", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 12, padding: 16, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" as const },
    temporal: { background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.05))", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#f59e0b" },
    scanZone: { border: "2px dashed #2d3a4f", borderRadius: 12, padding: "40px 20px", textAlign: "center" as const, cursor: "pointer", background: "rgba(139,92,246,0.03)" },
    statCard: { background: "#1a2235", border: "1px solid #2d3a4f", borderRadius: 12, padding: 16, textAlign: "center" as const },
    table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 13 },
    th: { background: "rgba(139,92,246,0.1)", color: "#94a3b8", fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 0.5, padding: "12px 14px", textAlign: "left" as const, borderBottom: "1px solid #2d3a4f" },
    td: { padding: "12px 14px", borderBottom: "1px solid rgba(45,58,79,0.5)", color: "#f1f5f9" },
    estadoPendiente: { background: "rgba(245,158,11,0.15)", color: "#f59e0b", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, border: "1px solid rgba(245,158,11,0.3)" },
    estadoAprobado: { background: "rgba(34,197,94,0.15)", color: "#22c55e", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, border: "1px solid rgba(34,197,94,0.3)" },
  };

  const pendingTickets = tickets.filter(t => t.estado === "pendiente").length;
  const pendingOps = operaciones.filter(o => o.estado === "pendiente").length;
  const totalPesoNeto = tickets.reduce((s, t) => s + (t.peso_neto || 0), 0);

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20, fontWeight: "bold" }}>Trans<span style={{ color: "#14b8a6" }}>CaÃ±a</span></span>
          <span style={S.badge}>CAMPO</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
          <span style={{ fontSize: 12, color: "#22c55e" }}>En linea</span>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #7c3aed, #14b8a6)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: "bold", border: "2px solid #2d3a4f" }}>TC</div>
        </div>
      </div>

      <div style={S.tabs}>
        {([["escanear", "Escanear Ticket"], ["tickets", "Tickets"], ["operaciones", "Operaciones"], ["nueva-op", "Nueva Operacion"]] as [Tab, string][]).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{ ...S.tabBtn, ...(tab === t ? S.tabActive : {}) }}>
            {label}
            {t === "tickets" && tickets.length > 0 && <span style={{ background: "#f59e0b", color: "#000", padding: "1px 7px", borderRadius: 10, fontSize: 10, fontWeight: 700 }}>{tickets.length}</span>}
            {t === "operaciones" && operaciones.length > 0 && <span style={{ background: "#f59e0b", color: "#000", padding: "1px 7px", borderRadius: 10, fontSize: 10, fontWeight: 700 }}>{operaciones.length}</span>}
          </button>
        ))}
      </div>

      <div style={S.content}>
        {msg && <div style={{ ...S.msg, background: msg.includes("Error") ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)", color: msg.includes("Error") ? "#ef4444" : "#22c55e" }}>{msg}</div>}

        {tab === "escanear" && (
          <div>
            <div style={S.linkBar}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>&#128279;</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Link de Acceso Independiente - Sub Sistema Campo</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>Comparta este enlace con el personal de campo</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ background: "#1e293b", border: "1px solid #2d3a4f", borderRadius: 8, padding: "10px 14px", color: "#a78bfa", fontSize: 13, fontFamily: "monospace" }}>{accessLink}</div>
                <button onClick={copyLink} style={{ background: "#7c3aed", color: "white", border: "none", padding: "10px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Copiar Link</button>
              </div>
            </div>

            <div style={S.temporal}>
              <span style={{ fontSize: 18 }}>&#9200;</span>
              <div><strong>Acceso Temporal:</strong> Los datos registrados aqui quedan pendientes de validacion en el modulo de Operaciones y Pesaje del ERP 360 principal para su autorizacion formal a la base de datos.</div>
            </div>

            <div style={S.card}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Escaneo de Ticket de Pesaje</h2>
              <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>Capture foto del ticket con la camara, importe una imagen o documento (PDF) para lectura automatica por IA</p>

              {!cameraActive && !capturedImage && (
                <div style={S.scanZone}>
                  <div style={{ fontSize: 56, marginBottom: 10 }}>&#128248;</div>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Toque para escanear ticket de pesaje</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Use la camara nativa o importe una imagen</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
                    <button onClick={() => nativeCaptureRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 32px", borderRadius: 12, border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white", width: "100%", maxWidth: 360, justifyContent: "center", boxShadow: "0 4px 15px rgba(124,58,237,0.4)" }}>📸 Tomar Foto del Ticket</button>
                    <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                      <button onClick={startCamera} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(139,92,246,0.3)", fontSize: 13, fontWeight: 600, cursor: "pointer", background: "rgba(139,92,246,0.1)", color: "#a78bfa" }}>Vista en Vivo</button>
                      <button onClick={() => fileInputRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, border: "1px solid #2d3a4f", fontSize: 13, fontWeight: 600, cursor: "pointer", background: "#1e293b", color: "white" }}>Importar Imagen</button>
                      <button onClick={() => docInputRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, border: "1px solid #0d9488", fontSize: 13, fontWeight: 600, cursor: "pointer", background: "rgba(20,184,166,0.1)", color: "white" }}>Importar Documento</button>
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, maxWidth: 360, lineHeight: 1.5 }}>💡 <strong style={{ color: "#e2e8f0" }}>Recomendado:</strong> &quot;Tomar Foto&quot; abre la camara nativa del dispositivo sin necesitar permisos del navegador.</div>
                  </div>
                </div>
              )}
              {cameraActive && (
                <div><video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", borderRadius: 12, background: "#000" }} /><button onClick={capturePhoto} style={{ width: "100%", padding: 14, background: "#dc2626", color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 8 }}>Capturar Foto</button></div>
              )}
              {capturedImage && (
                <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid #2d3a4f" }}>
                  <img src={capturedImage} alt="Ticket" style={{ width: "100%", maxHeight: 300, objectFit: "contain", background: "#000" }} />
                  <button onClick={() => { setCapturedImage(null); setAiResults(null); }} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.7)", border: "none", color: "white", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>X</button>
                </div>
              )}
              <canvas ref={canvasRef} style={{ display: "none" }} />
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileImport} />
              <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,image/*" style={{ display: "none" }} onChange={handleDocImport} />
              <input ref={nativeCaptureRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleNativeCapture} />

              {aiProcessing && (
                <div style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(20,184,166,0.1))", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 12, padding: 16, marginTop: 16, display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 24, height: 24, border: "3px solid rgba(139,92,246,0.2)", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                  <div><div style={{ fontWeight: 600, marginBottom: 4 }}>Procesando imagen con IA...</div><div style={{ fontSize: 12, color: "#64748b" }}>Extrayendo datos del ticket de pesaje</div></div>
                </div>
              )}
              {aiResults && (
                <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 12, padding: 16, marginTop: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontWeight: 600, color: "#22c55e" }}>Datos extraidos por IA - Confianza: {aiResults["confianza"]}%</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
                    {Object.entries(aiResults).filter(([k]) => k !== "confianza" && !k.startsWith("_")).map(([k, v]) => (
                      <div key={k} style={{ background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: 10 }}>
                        <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>{k}</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={applyAiData} style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white", border: "none", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 12 }}>Aplicar datos al formulario</button>
                </div>
              )}
            </div>

            <div style={S.card}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Datos del Ticket de Pesaje</h2>
              <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>Complete o corrija los datos extraidos del ticket</p>
              <form onSubmit={submitTicket}>
                <div style={S.grid2}>
                  <div><label style={S.label}>No. Ticket *</label><input style={S.input} placeholder="TK-001" readOnly value={"TK-" + String(Date.now()).slice(-6)} /></div>
                  <div><label style={S.label}>Placa Vehiculo *</label><input style={S.input} required value={form.vehiculo_placa} onChange={e => setForm({...form, vehiculo_placa: e.target.value.toUpperCase()})} placeholder="ABC-123" /></div>
                  <div><label style={S.label}>Chofer</label><input style={S.input} value={form.chofer} onChange={e => setForm({...form, chofer: e.target.value})} placeholder="Nombre del chofer" /></div>
                  <div><label style={S.label}>Tipo *</label><select style={S.select} value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}><option value="entrada">Entrada</option><option value="salida">Salida</option></select></div>
                  <div><label style={S.label}>Bascula</label><select style={S.select} value={form.bascula} onChange={e => setForm({...form, bascula: e.target.value})}><option>Bascula 1</option><option>Bascula 2</option><option>Bascula 3</option></select></div>
                  <div><label style={S.label}>Parcela</label><select style={S.select} value={form.parcela} onChange={e => setForm({...form, parcela: e.target.value})}><option value="">Seleccionar...</option><option>Parcela 1 - Norte</option><option>Parcela 2 - Sur</option><option>Parcela 3 - Este</option><option>Parcela 4 - Oeste</option></select></div>
                  <div><label style={S.label}>Peso Bruto (tn) *</label><input style={S.input} type="number" step="0.01" required value={form.peso_bruto} onChange={e => setForm({...form, peso_bruto: e.target.value})} placeholder="0.00" /></div>
                  <div><label style={S.label}>Tara (tn) *</label><input style={S.input} type="number" step="0.01" required value={form.tara} onChange={e => setForm({...form, tara: e.target.value})} placeholder="0.00" /></div>
                  <div><label style={S.label}>Peso Neto (tn)</label><input style={{...S.input, opacity: 0.7}} readOnly value={pesoNeto > 0 ? pesoNeto.toFixed(2) : ""} placeholder="Calculado automaticamente" /></div>
                  <div><label style={S.label}>% Impurezas</label><input style={S.input} type="number" step="0.1" value={form.impurezas} onChange={e => setForm({...form, impurezas: e.target.value})} /></div>
                </div>
                <div style={{ marginTop: 16 }}><label style={S.label}>Observaciones</label><textarea style={{...S.input, minHeight: 80, resize: "vertical"}} value={form.observaciones} onChange={e => setForm({...form, observaciones: e.target.value})} placeholder="Observaciones adicionales..." /></div>
                <button type="submit" disabled={loading || !form.vehiculo_placa} style={{...S.btn, opacity: loading || !form.vehiculo_placa ? 0.5 : 1}}>{loading ? "Enviando..." : "Registrar Ticket (Temporal - Pendiente Validacion ERP 360)"}</button>
              </form>
            </div>
          </div>
        )}

        {tab === "tickets" && (
          <div>
            <div style={S.temporal}><span style={{ fontSize: 18 }}>&#8505;</span><div>Los registros temporales seran visibles en el <strong>Modulo de Pesaje</strong> del ERP 360 principal para su validacion y aprobacion formal.</div></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
              <div style={S.statCard}><div style={{ fontSize: 24, fontWeight: 800, color: "#a78bfa" }}>{tickets.length}</div><div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>Total</div></div>
              <div style={S.statCard}><div style={{ fontSize: 24, fontWeight: 800, color: "#f59e0b" }}>{pendingTickets}</div><div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>Pendientes</div></div>
              <div style={S.statCard}><div style={{ fontSize: 24, fontWeight: 800, color: "#22c55e" }}>{tickets.length - pendingTickets}</div><div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>Aprobados</div></div>
              <div style={S.statCard}><div style={{ fontSize: 24, fontWeight: 800, color: "#14b8a6" }}>{totalPesoNeto.toFixed(1)}</div><div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>Peso Neto (tn)</div></div>
            </div>
            <div style={{...S.card, padding: 0, overflow: "hidden"}}>
              <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #2d3a4f" }}>
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Tickets Registrados - Acceso Temporal</h2>
                <button onClick={loadTickets} style={{ background: "#7c3aed", color: "white", border: "none", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{loading ? "..." : "Actualizar"}</button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={S.table}>
                  <thead><tr><th style={S.th}>Ticket</th><th style={S.th}>Placa</th><th style={S.th}>Chofer</th><th style={S.th}>Tipo</th><th style={{...S.th, textAlign: "right"}}>P.Bruto</th><th style={{...S.th, textAlign: "right"}}>Tara</th><th style={{...S.th, textAlign: "right"}}>P.Neto</th><th style={S.th}>Estado</th></tr></thead>
                  <tbody>
                    {tickets.length === 0 && !loading && <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#64748b" }}>No hay tickets registrados</td></tr>}
                    {tickets.map(t => (
                      <tr key={t.id}>
                        <td style={S.td}><strong>{t.ticket}</strong><br/><span style={{ background: "rgba(245,158,11,0.2)", color: "#f59e0b", fontSize: 9, padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>TEMPORAL</span></td>
                        <td style={S.td}>{t.vehiculo_placa}</td><td style={S.td}>{t.chofer || "-"}</td><td style={{...S.td, textTransform: "capitalize"}}>{t.tipo}</td>
                        <td style={{...S.td, textAlign: "right", fontWeight: 600}}>{t.peso_bruto?.toFixed(2)}</td><td style={{...S.td, textAlign: "right", fontWeight: 600}}>{t.tara?.toFixed(2)}</td>
                        <td style={{...S.td, textAlign: "right", fontWeight: 700, color: "#14b8a6"}}>{t.peso_neto?.toFixed(2)}</td>
                        <td style={S.td}><span style={t.estado === "pendiente" ? S.estadoPendiente : S.estadoAprobado}>{t.estado === "pendiente" ? "Pendiente" : "Aprobado"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "operaciones" && (
          <div>
            <div style={S.temporal}><span style={{ fontSize: 18 }}>&#8505;</span><div>Las operaciones registradas aqui quedan pendientes de validacion en el <strong>Modulo de Operaciones</strong> del ERP 360 principal.</div></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
              <div style={S.statCard}><div style={{ fontSize: 24, fontWeight: 800, color: "#a78bfa" }}>{operaciones.length}</div><div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>Total</div></div>
              <div style={S.statCard}><div style={{ fontSize: 24, fontWeight: 800, color: "#f59e0b" }}>{pendingOps}</div><div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>Pendientes</div></div>
              <div style={S.statCard}><div style={{ fontSize: 24, fontWeight: 800, color: "#14b8a6" }}>{operaciones.reduce((s,o) => s+(o.toneladas||0), 0).toFixed(1)}</div><div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>Toneladas</div></div>
              <div style={S.statCard}><div style={{ fontSize: 24, fontWeight: 800, color: "#14b8a6" }}>{operaciones.reduce((s,o) => s+(o.hectareas||0), 0).toFixed(1)}</div><div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>Hectareas</div></div>
            </div>
            <div style={{...S.card, padding: 0, overflow: "hidden"}}>
              <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #2d3a4f" }}>
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Operaciones de Campo - Acceso Temporal</h2>
                <button onClick={() => setTab("nueva-op")} style={{ background: "#7c3aed", color: "white", border: "none", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Nueva</button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={S.table}>
                  <thead><tr><th style={S.th}>ID</th><th style={S.th}>Tipo</th><th style={S.th}>Parcela</th><th style={S.th}>Fecha</th><th style={S.th}>Turno</th><th style={{...S.th, textAlign: "right"}}>Toneladas</th><th style={{...S.th, textAlign: "right"}}>Hectareas</th><th style={S.th}>Estado</th></tr></thead>
                  <tbody>
                    {operaciones.length === 0 && !loading && <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#64748b" }}>No hay operaciones registradas</td></tr>}
                    {operaciones.map(o => (
                      <tr key={o.id}>
                        <td style={S.td}><strong>{o.id.slice(0,8)}</strong><br/><span style={{ background: "rgba(245,158,11,0.2)", color: "#f59e0b", fontSize: 9, padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>TEMPORAL</span></td>
                        <td style={{...S.td, textTransform: "capitalize"}}>{o.tipo}</td><td style={S.td}>{o.parcela || "-"}</td>
                        <td style={S.td}>{o.fecha ? new Date(o.fecha).toLocaleDateString("es") : "-"}</td><td style={{...S.td, textTransform: "capitalize"}}>{o.turno}</td>
                        <td style={{...S.td, textAlign: "right", fontWeight: 600}}>{o.toneladas?.toFixed(2)}</td><td style={{...S.td, textAlign: "right", fontWeight: 600}}>{o.hectareas?.toFixed(2)}</td>
                        <td style={S.td}><span style={o.estado === "pendiente" ? S.estadoPendiente : S.estadoAprobado}>{o.estado === "pendiente" ? "Pendiente" : "Aprobado"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "nueva-op" && (
          <div>
            <div style={S.temporal}><span style={{ fontSize: 18 }}>&#9200;</span><div><strong>Registro Temporal:</strong> Esta operacion quedara pendiente de aprobacion en el modulo de Operaciones del ERP 360 principal.</div></div>
            <div style={S.card}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Nueva Operacion de Campo</h2>
              <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>Registre datos de corte, alce y transporte de cana desde campo</p>
              <form onSubmit={submitOperacion}>
                <div style={S.grid2}>
                  <div><label style={S.label}>Tipo Operacion *</label><select style={S.select} value={opsForm.tipo} onChange={e => setOpsForm({...opsForm, tipo: e.target.value})}><option value="corte">Corte</option><option value="alce">Alce</option><option value="transporte">Transporte</option><option value="quema">Quema</option></select></div>
                  <div><label style={S.label}>Parcela</label><select style={S.select} value={opsForm.parcela} onChange={e => setOpsForm({...opsForm, parcela: e.target.value})}><option value="">Seleccionar...</option><option>Parcela 1 - Norte</option><option>Parcela 2 - Sur</option><option>Parcela 3 - Este</option><option>Parcela 4 - Oeste</option><option>Parcela 5 - Central</option></select></div>
                  <div><label style={S.label}>Fecha y Hora *</label><input style={S.input} type="datetime-local" value={opsForm.fecha} onChange={e => setOpsForm({...opsForm, fecha: e.target.value})} /></div>
                  <div><label style={S.label}>Turno *</label><select style={S.select} value={opsForm.turno} onChange={e => setOpsForm({...opsForm, turno: e.target.value})}><option value="diurno">Diurno</option><option value="nocturno">Nocturno</option></select></div>
                  <div><label style={S.label}>Cuadrilla</label><input style={S.input} value={opsForm.cuadrilla} onChange={e => setOpsForm({...opsForm, cuadrilla: e.target.value})} placeholder="Ej: Cuadrilla 1" /></div>
                  <div><label style={S.label}>No. Viajes</label><input style={S.input} type="number" value={opsForm.viajes} onChange={e => setOpsForm({...opsForm, viajes: e.target.value})} placeholder="0" /></div>
                  <div><label style={S.label}>Toneladas</label><input style={S.input} type="number" step="0.01" value={opsForm.toneladas} onChange={e => setOpsForm({...opsForm, toneladas: e.target.value})} placeholder="0.00" /></div>
                  <div><label style={S.label}>Hectareas Trabajadas</label><input style={S.input} type="number" step="0.01" value={opsForm.hectareas} onChange={e => setOpsForm({...opsForm, hectareas: e.target.value})} placeholder="0.00" /></div>
                  <div><label style={S.label}>Chofer</label><input style={S.input} value={opsForm.chofer} onChange={e => setOpsForm({...opsForm, chofer: e.target.value})} placeholder="Nombre del chofer" /></div>
                  <div><label style={S.label}>Equipo/Maquinaria</label><input style={S.input} value={opsForm.equipo} onChange={e => setOpsForm({...opsForm, equipo: e.target.value})} placeholder="Ej: Cosechadora JD-3520" /></div>
                  <div><label style={S.label}>Origen</label><input style={S.input} value={opsForm.origen} onChange={e => setOpsForm({...opsForm, origen: e.target.value})} placeholder="Punto de origen" /></div>
                  <div><label style={S.label}>Destino</label><input style={S.input} value={opsForm.destino} onChange={e => setOpsForm({...opsForm, destino: e.target.value})} placeholder="Punto de destino" /></div>
                </div>
                <div style={{ marginTop: 16 }}><label style={S.label}>Observaciones</label><textarea style={{...S.input, minHeight: 80, resize: "vertical"}} value={opsForm.observaciones} onChange={e => setOpsForm({...opsForm, observaciones: e.target.value})} placeholder="Condiciones del terreno, clima, novedades..." /></div>
                <button type="submit" disabled={loading} style={{...S.btn, opacity: loading ? 0.5 : 1}}>{loading ? "Enviando..." : "Registrar Operacion (Temporal - Pendiente Validacion ERP 360)"}</button>
              </form>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
