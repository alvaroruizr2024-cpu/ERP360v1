"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type Tab = "escanear" | "tickets" | "operaciones";
type Ticket = {
  id: string; ticket: string; vehiculo_placa: string; chofer: string;
  tipo: string; peso_bruto: number; tara: number; peso_neto: number;
  bascula: string; estado: string; created_at: string; observaciones: string;
};

export default function CampoPage() {
  const [tab, setTab] = useState<Tab>("escanear");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [form, setForm] = useState({
    vehiculo_placa: "", chofer: "", tipo: "entrada",
    peso_bruto: "", tara: "", bascula: "Bascula 1", observaciones: "",
  });

  const supabase = createClient();

  const loadTickets = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("registros_pesaje")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setTickets(data as Ticket[]);
    setLoading(false);
  }, []);

  useEffect(() => { if (tab === "tickets") loadTickets(); }, [tab, loadTickets]);

  useEffect(() => {
    return () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); };
  }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setCameraActive(true);
      setCapturedImage(null);
      setMsg("");
    } catch (err: any) {
      setMsg("Error al acceder a la camara: " + err.message);
    }
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")?.drawImage(v, 0, 0);
    const dataUrl = c.toDataURL("image/jpeg", 0.8);
    setCapturedImage(dataUrl);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setCameraActive(false);
    setMsg("Foto capturada. Complete los datos del ticket.");
  }

  async function submitTicket(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const pesoB = parseFloat(form.peso_bruto) || 0;
    const taraV = parseFloat(form.tara) || 0;
    const neto = pesoB - taraV;
    const ticket = "TK-" + String(Date.now()).slice(-6);

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    const record: any = {
      ticket, vehiculo_placa: form.vehiculo_placa, chofer: form.chofer,
      tipo: form.tipo, peso_bruto: pesoB, tara: taraV, peso_neto: neto,
      bascula: form.bascula, observaciones: form.observaciones,
      estado: "pendiente",
    };
    if (userId) record.user_id = userId;

    const { data, error } = await supabase.from("registros_pesaje").insert(record).select().single();

    if (error) {
      setMsg("Error: " + error.message);
    } else {
      setMsg("Ticket " + (data?.ticket || ticket) + " registrado. Pendiente de validacion.");
      if (userId) {
        await supabase.from("auditoria").insert({
          user_id: userId, accion: "crear_ticket_campo",
          modulo: "campo", detalle: "Ticket " + ticket + " placa " + form.vehiculo_placa + (capturedImage ? " con foto" : ""),
        });
      }
      setForm({ vehiculo_placa: "", chofer: "", tipo: "entrada", peso_bruto: "", tara: "", bascula: "Bascula 1", observaciones: "" });
      setCapturedImage(null);
    }
    setLoading(false);
  }

  const S: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#0a0e1a", color: "white", fontFamily: "system-ui, sans-serif" },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#0d1224", borderBottom: "1px solid #1e293b" },
    logo: { display: "flex", alignItems: "center", gap: "8px" },
    badge: { background: "#0891b2", color: "white", fontSize: "12px", padding: "2px 8px", borderRadius: "4px", fontWeight: 600 },
    tabs: { display: "flex", gap: 0, borderBottom: "1px solid #1e293b" },
    tabBtn: { flex: 1, padding: "12px", textAlign: "center" as const, fontSize: 14, fontWeight: 600, cursor: "pointer", border: "none", background: "transparent", color: "#64748b" },
    tabActive: { color: "#22d3ee", borderBottom: "2px solid #22d3ee" },
    content: { padding: "16px" },
    card: { background: "#141b2d", border: "1px solid #1e293b", borderRadius: 8, padding: 16, marginBottom: 12 },
    input: { width: "100%", padding: "10px 12px", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "white", fontSize: 14, boxSizing: "border-box" as const, marginTop: 4 },
    select: { width: "100%", padding: "10px 12px", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "white", fontSize: 14, boxSizing: "border-box" as const, marginTop: 4 },
    label: { display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 2, marginTop: 12 },
    btn: { width: "100%", padding: "12px", background: "#0891b2", color: "white", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer", marginTop: 16 },
    btnCam: { width: "100%", padding: "14px", background: "#7c3aed", color: "white", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
    btnCapture: { width: "100%", padding: "12px", background: "#dc2626", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 8 },
    video: { width: "100%", borderRadius: 8, background: "#000" },
    img: { width: "100%", borderRadius: 8, border: "2px solid #22d3ee" },
    msg: { padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 12 },
    estado: { padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 600 },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  };

  const estadoColor = (e: string) => e === "pendiente" ? { background: "rgba(250,204,21,0.2)", color: "#facc15" } : e === "completo" ? { background: "rgba(74,222,128,0.2)", color: "#4ade80" } : { background: "rgba(248,113,113,0.2)", color: "#f87171" };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div style={S.logo}>
          <span style={{ fontSize: 20, fontWeight: "bold" }}>Trans<span style={{ color: "#22d3ee" }}>Cana</span></span>
          <span style={S.badge}>CAMPO</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#4ade80" }}>En linea</span>
          <div style={{ width: 32, height: 32, background: "#0891b2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: "bold" }}>TC</div>
        </div>
      </div>

      <div style={S.tabs}>
        {(["escanear", "tickets", "operaciones"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ ...S.tabBtn, ...(tab === t ? S.tabActive : {}) }}>
            {t === "escanear" ? "Escanear" : t === "tickets" ? "Tickets" : "Operaciones"}
          </button>
        ))}
      </div>

      <div style={S.content}>
        {msg && <div style={{ ...S.msg, background: msg.includes("Error") ? "rgba(248,113,113,0.15)" : "rgba(74,222,128,0.15)", color: msg.includes("Error") ? "#f87171" : "#4ade80" }}>{msg}</div>}

        {tab === "escanear" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 4 }}>Escaneo de Ticket</h2>
              <p style={{ fontSize: 13, color: "#94a3b8" }}>Capture foto del ticket con la camara del movil</p>
            </div>

            {!cameraActive && !capturedImage && (
              <button onClick={startCamera} style={S.btnCam}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                Abrir Camara
              </button>
            )}

            {cameraActive && (
              <div style={S.card}>
                <video ref={videoRef} autoPlay playsInline muted style={S.video} />
                <button onClick={capturePhoto} style={S.btnCapture}>Capturar Foto</button>
              </div>
            )}

            {capturedImage && (
              <div style={S.card}>
                <img src={capturedImage} alt="Ticket capturado" style={S.img} />
                <button onClick={startCamera} style={{ ...S.btnCapture, background: "#475569", marginTop: 8 }}>Tomar otra foto</button>
              </div>
            )}

            <canvas ref={canvasRef} style={{ display: "none" }} />

            <form onSubmit={submitTicket} style={{ marginTop: 16 }}>
              <div style={S.card}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#22d3ee" }}>Datos del Ticket</h3>
                <label style={S.label}>Placa del Vehiculo *</label>
                <input style={S.input} required value={form.vehiculo_placa} onChange={e => setForm({ ...form, vehiculo_placa: e.target.value.toUpperCase() })} placeholder="ABC-123" />

                <label style={S.label}>Chofer</label>
                <input style={S.input} value={form.chofer} onChange={e => setForm({ ...form, chofer: e.target.value })} placeholder="Nombre del chofer" />

                <div style={S.grid2}>
                  <div>
                    <label style={S.label}>Tipo</label>
                    <select style={S.select} value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                      <option value="entrada">Entrada</option>
                      <option value="salida">Salida</option>
                    </select>
                  </div>
                  <div>
                    <label style={S.label}>Bascula</label>
                    <select style={S.select} value={form.bascula} onChange={e => setForm({ ...form, bascula: e.target.value })}>
                      <option>Bascula 1</option>
                      <option>Bascula 2</option>
                    </select>
                  </div>
                </div>

                <div style={S.grid2}>
                  <div>
                    <label style={S.label}>Peso Bruto (tn)</label>
                    <input style={S.input} type="number" step="0.01" value={form.peso_bruto} onChange={e => setForm({ ...form, peso_bruto: e.target.value })} placeholder="0.00" />
                  </div>
                  <div>
                    <label style={S.label}>Tara (tn)</label>
                    <input style={S.input} type="number" step="0.01" value={form.tara} onChange={e => setForm({ ...form, tara: e.target.value })} placeholder="0.00" />
                  </div>
                </div>

                {form.peso_bruto && form.tara && (
                  <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(8,145,178,0.15)", borderRadius: 8, textAlign: "center" }}>
                    <span style={{ fontSize: 12, color: "#67e8f9" }}>Peso Neto: </span>
                    <span style={{ fontSize: 18, fontWeight: "bold", color: "#22d3ee" }}>{(parseFloat(form.peso_bruto) - parseFloat(form.tara)).toFixed(2)} tn</span>
                  </div>
                )}

                <label style={S.label}>Observaciones</label>
                <input style={S.input} value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })} placeholder="Opcional" />
              </div>

              <button type="submit" disabled={loading || !form.vehiculo_placa} style={{ ...S.btn, opacity: loading || !form.vehiculo_placa ? 0.5 : 1 }}>
                {loading ? "Enviando..." : "Registrar Ticket"}
              </button>
            </form>
          </div>
        )}

        {tab === "tickets" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: "bold" }}>Tickets Registrados</h2>
              <button onClick={loadTickets} style={{ padding: "6px 12px", background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#94a3b8", fontSize: 12, cursor: "pointer" }}>
                {loading ? "..." : "Actualizar"}
              </button>
            </div>
            {tickets.length === 0 && !loading && <p style={{ color: "#64748b", textAlign: "center", padding: 32 }}>No hay tickets registrados</p>}
            {tickets.map(t => (
              <div key={t.id} style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600 }}>{t.ticket} - {t.vehiculo_placa}</span>
                  <span style={{ ...S.estado, ...estadoColor(t.estado) }}>{t.estado}</span>
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                  {t.tipo.toUpperCase()} | Neto: {t.peso_neto} tn | {t.bascula}
                </div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>
                  {t.chofer && ("Chofer: " + t.chofer + " | ")}{new Date(t.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "operaciones" && (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>&#9881;</div>
            <h2 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>Operaciones de Campo</h2>
            <p style={{ fontSize: 13, color: "#94a3b8" }}>Modulo de operaciones disponible proximamente</p>
            <div style={{ ...S.card, marginTop: 24, textAlign: "left" }}>
              <p style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>RESUMEN</p>
              <div style={S.grid2}>
                <div><p style={{ fontSize: 12, color: "#94a3b8" }}>Tickets Hoy</p><p style={{ fontSize: 24, fontWeight: "bold", color: "#60a5fa" }}>{tickets.length}</p></div>
                <div><p style={{ fontSize: 12, color: "#94a3b8" }}>Pendientes</p><p style={{ fontSize: 24, fontWeight: "bold", color: "#facc15" }}>{tickets.filter(t => t.estado === "pendiente").length}</p></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
