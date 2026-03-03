"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type Ticket = {
  id: string; ticket: string; vehiculo_placa: string; chofer: string;
  tipo: string; peso_bruto: number; tara: number; peso_neto: number;
  bascula: string; estado: string; created_at: string; observaciones: string;
  parcela?: string; impurezas?: number; origen_registro?: string;
};

type ModalMode = "edit" | "view" | null;

export default function PesajeDashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState("pendiente");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [user, setUser] = useState<any>(null);
  const [modal, setModal] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUser(data.user)); }, []);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("registros_pesaje_temporal").select("*").order("created_at", { ascending: false });
    if (filter !== "todos") query = query.eq("estado", filter);
    const { data } = await query.limit(200);
    if (data) setTickets(data as Ticket[]);
    setLoading(false);
  }, [filter]);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const filtered = tickets.filter(t => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (t.ticket||"").toLowerCase().includes(s) || (t.vehiculo_placa||"").toLowerCase().includes(s) || (t.chofer||"").toLowerCase().includes(s) || (t.parcela||"").toLowerCase().includes(s);
  });

  async function audit(accion: string, detalle: string) {
    if (user?.id) await supabase.from("auditoria").insert({ user_id: user.id, accion, modulo: "pesaje_dashboard", detalle });
  }

  async function handleApprove(id: string, tk: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/pesaje/aprobar", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "aprobar", id, aprobado_por: user?.email || "sistema" }),
      });
      const json = await res.json();
      if (!res.ok || json.error) { setMsg("Error: " + (json.error || "Error aprobando")); }
      else { setMsg("Ticket " + tk + " APROBADO — Movido a BD principal para procesamiento ERP"); await audit("aprobar_ticket", "Ticket " + tk + " aprobado y movido a BD principal por " + user?.email); loadTickets(); }
    } catch (err: any) { setMsg("Error: " + err.message); }
    setLoading(false); setTimeout(() => setMsg(""), 5000);
  }

  async function handleReject(id: string, tk: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/pesaje/aprobar", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rechazar", id, aprobado_por: user?.email || "sistema" }),
      });
      const json = await res.json();
      if (!res.ok || json.error) { setMsg("Error: " + (json.error || "Error rechazando")); }
      else { setMsg("Ticket " + tk + " RECHAZADO"); await audit("rechazar_ticket", "Ticket " + tk + " rechazado por " + user?.email); loadTickets(); }
    } catch (err: any) { setMsg("Error: " + err.message); }
    setLoading(false); setTimeout(() => setMsg(""), 4000);
  }

  async function handleDelete(id: string, tk: string) {
    setLoading(true);
    const { error } = await supabase.from("registros_pesaje_temporal").delete().eq("id", id);
    if (error) setMsg("Error: " + error.message);
    else { setMsg("Ticket " + tk + " ELIMINADO permanentemente"); await audit("eliminar_ticket", "Ticket " + tk + " eliminado por " + user?.email); loadTickets(); }
    setConfirmDelete(null); setLoading(false); setTimeout(() => setMsg(""), 4000);
  }

  function openEdit(t: Ticket) {
    setSelected(t);
    setEditForm({ vehiculo_placa: t.vehiculo_placa||"", chofer: t.chofer||"", tipo: t.tipo||"entrada", peso_bruto: String(t.peso_bruto||""), tara: String(t.tara||""), bascula: t.bascula||"", parcela: t.parcela||"", impurezas: String(t.impurezas||"0"), observaciones: t.observaciones||"" });
    setModal("edit");
  }

  function openView(t: Ticket) { setSelected(t); setModal("view"); }

  async function saveEdit() {
    if (!selected) return;
    setLoading(true);
    const pb = parseFloat(editForm.peso_bruto)||0, ta = parseFloat(editForm.tara)||0, neto = pb - ta;
    const { error } = await supabase.from("registros_pesaje_temporal").update({
      vehiculo_placa: editForm.vehiculo_placa, chofer: editForm.chofer, tipo: editForm.tipo,
      peso_bruto: pb, tara: ta, peso_neto: neto, bascula: editForm.bascula, parcela: editForm.parcela,
      impurezas: parseFloat(editForm.impurezas)||0, observaciones: editForm.observaciones,
    }).eq("id", selected.id);
    if (error) setMsg("Error: " + error.message);
    else { setMsg("Ticket " + selected.ticket + " EDITADO exitosamente"); await audit("editar_ticket", "Ticket " + selected.ticket + " editado: placa=" + editForm.vehiculo_placa + " pb=" + editForm.peso_bruto + " tara=" + editForm.tara); setModal(null); loadTickets(); }
    setLoading(false); setTimeout(() => setMsg(""), 4000);
  }

  const counts = { total: tickets.length, pendiente: tickets.filter(t=>t.estado==="pendiente").length, completo: tickets.filter(t=>t.estado==="completo").length, anulado: tickets.filter(t=>t.estado==="anulado").length, pesoTotal: tickets.reduce((s,t)=>s+(t.peso_neto||0),0) };

  const kpiData = [
    { label: "Total Registros", value: counts.total, color: "#e2e8f0" },
    { label: "Pendientes", value: counts.pendiente, color: "#facc15" },
    { label: "Aprobados", value: counts.completo, color: "#4ade80" },
    { label: "Rechazados", value: counts.anulado, color: "#f87171" },
    { label: "Peso Neto Total", value: counts.pesoTotal.toFixed(1) + " tn", color: "#22d3ee" },
  ];

  const filterOpts = [
    { key: "pendiente", label: "Pendientes" },
    { key: "completo", label: "Aprobados" },
    { key: "anulado", label: "Rechazados" },
    { key: "todos", label: "Todos" },
  ];

  function badgeStyle(estado: string) {
    const c = estado==="pendiente" ? "#facc15" : estado==="completo" ? "#4ade80" : "#f87171";
    return { padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, display: "inline-block", background: c+"22", color: c, border: "1px solid "+c+"44" } as React.CSSProperties;
  }

  function actBtn(color: string, bg: string): React.CSSProperties {
    return { padding: "4px 10px", background: bg, color, border: "1px solid "+color+"66", borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: "pointer", marginRight: 3 };
  }

  const thStyle: React.CSSProperties = { padding: "10px 12px", textAlign: "left", color: "#475569", fontWeight: 700, fontSize: 11, textTransform: "uppercase", background: "#0d1224", borderBottom: "1px solid #1e293b" };
  const tdStyle: React.CSSProperties = { padding: "10px 12px", borderBottom: "1px solid rgba(30,41,59,0.5)" };
  const overlayStyle: React.CSSProperties = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" };
  const modalStyle: React.CSSProperties = { background: "#0f172a", border: "1px solid #334155", borderRadius: 16, padding: 28, width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto" };
  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #334155", background: "#1e293b", color: "white", fontSize: 14, boxSizing: "border-box", outline: "none" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase" };

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto", fontFamily: "system-ui, sans-serif", color: "#e2e8f0" }}>
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "white" }}>Control de Pesaje y Balanza</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Validacion de registros de campo — Responsable: {user?.email || "..."} — Registros temporales de campo — Aprobar mueve a BD principal</div>
        </div>
        <button onClick={loadTickets} style={{ padding: "8px 20px", borderRadius: 8, background: "#0891b2", color: "white", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{loading ? "Cargando..." : "Actualizar"}</button>
      </div>

      {/* MSG */}
      {msg && <div style={{ padding: "10px 16px", borderRadius: 8, marginBottom: 16, background: msg.includes("Error") ? "rgba(248,113,113,0.12)" : "rgba(74,222,128,0.12)", color: msg.includes("Error") ? "#f87171" : "#4ade80", fontSize: 13, fontWeight: 600 }}>{msg}</div>}

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        {kpiData.map(k => (
          <div key={k.label} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>{k.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: k.color, marginTop: 4 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* TOOLBAR */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        {filterOpts.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding: "6px 16px", borderRadius: 6, border: filter===f.key ? "2px solid #0891b2" : "1px solid #334155", background: filter===f.key ? "rgba(8,145,178,0.15)" : "#0f172a", color: filter===f.key ? "#22d3ee" : "#94a3b8", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {f.label}
          </button>
        ))}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar placa, chofer, ticket..." style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "white", fontSize: 13, width: 220, outline: "none", marginLeft: "auto" }} />
      </div>

      {/* TABLE */}
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr>
            <th style={thStyle}>Ticket</th><th style={thStyle}>Placa</th><th style={thStyle}>Chofer</th><th style={thStyle}>Tipo</th>
            <th style={{...thStyle, textAlign: "right"}}>P.Bruto</th><th style={{...thStyle, textAlign: "right"}}>Tara</th><th style={{...thStyle, textAlign: "right"}}>P.Neto</th>
            <th style={thStyle}>Parcela</th><th style={thStyle}>Estado</th><th style={thStyle}>Origen</th><th style={thStyle}>Fecha</th>
            <th style={{...thStyle, textAlign: "center", minWidth: 230}}>Acciones</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={12} style={{ padding: 40, textAlign: "center", color: "#475569" }}>No hay registros para mostrar</td></tr>}
            {filtered.map(t => (
              <tr key={t.id}>
                <td style={{...tdStyle, fontWeight: 700}}><span onClick={() => openView(t)} style={{ cursor: "pointer", color: "#22d3ee", textDecoration: "underline" }}>{t.ticket}</span></td>
                <td style={{...tdStyle, fontFamily: "monospace"}}>{t.vehiculo_placa}</td>
                <td style={tdStyle}>{t.chofer || "-"}</td>
                <td style={tdStyle}><span style={{ textTransform: "uppercase", fontSize: 11, fontWeight: 600 }}>{t.tipo}</span></td>
                <td style={{...tdStyle, textAlign: "right"}}>{Number(t.peso_bruto || 0).toFixed(2)}</td>
                <td style={{...tdStyle, textAlign: "right"}}>{Number(t.tara || 0).toFixed(2)}</td>
                <td style={{...tdStyle, textAlign: "right", fontWeight: 700, color: "#22d3ee"}}>{Number(t.peso_neto || 0).toFixed(2)}</td>
                <td style={tdStyle}>{t.parcela || "-"}</td>
                <td style={tdStyle}><span style={badgeStyle(t.estado)}>{t.estado === "pendiente" ? "Pendiente" : t.estado === "completo" ? "Aprobado" : "Rechazado"}</span></td>
                <td style={tdStyle}>
                  {t.origen_registro === "campo"
                    ? <span style={{ padding: "1px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: "rgba(167,139,250,0.15)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.3)" }}>CAMPO</span>
                    : <span style={{ padding: "1px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: "rgba(148,163,184,0.1)", color: "#94a3b8", border: "1px solid rgba(148,163,184,0.2)" }}>ERP</span>}
                </td>
                <td style={{...tdStyle, fontSize: 11, color: "#64748b"}}>{new Date(t.created_at).toLocaleString()}</td>
                <td style={{...tdStyle, textAlign: "center", whiteSpace: "nowrap"}}>
                  {t.estado === "pendiente" && (
                    <>
                      <button onClick={() => handleApprove(t.id, t.ticket)} disabled={loading} style={actBtn("#4ade80", "#14532d")}>Aprobar</button>
                      <button onClick={() => handleReject(t.id, t.ticket)} disabled={loading} style={actBtn("#f87171", "#7f1d1d")}>Rechazar</button>
                    </>
                  )}
                  <button onClick={() => openEdit(t)} style={actBtn("#60a5fa", "#1e3a5f")}>Editar</button>
                  <button onClick={() => setConfirmDelete(t.id)} style={actBtn("#f87171", "#451a1a")}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FOOTER TRAZABILIDAD */}
      <div style={{ marginTop: 20, padding: 14, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12, color: "#475569" }}>
        <strong style={{ color: "#94a3b8" }}>Flujo:</strong> CAMPO (escaneo OCR) &#8594; Tabla Temporal (esta vista) &#8594; Aprobar &#8594; Base de Datos Principal (Zafra, Colonos, Contabilidad). Cada accion queda registrada en auditoria.
      </div>

      {/* MODAL EDITAR */}
      {modal === "edit" && selected && (
        <div style={overlayStyle} onClick={() => setModal(null)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "white" }}>Editar Ticket: {selected.ticket}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ marginBottom: 14 }}><label style={labelStyle}>Placa Vehiculo</label><input style={inputStyle} value={editForm.vehiculo_placa} onChange={e => setEditForm({...editForm, vehiculo_placa: e.target.value.toUpperCase()})} /></div>
              <div style={{ marginBottom: 14 }}><label style={labelStyle}>Chofer</label><input style={inputStyle} value={editForm.chofer} onChange={e => setEditForm({...editForm, chofer: e.target.value})} /></div>
              <div style={{ marginBottom: 14 }}><label style={labelStyle}>Peso Bruto (tn)</label><input style={inputStyle} type="number" step="0.01" value={editForm.peso_bruto} onChange={e => setEditForm({...editForm, peso_bruto: e.target.value})} /></div>
              <div style={{ marginBottom: 14 }}><label style={labelStyle}>Tara (tn)</label><input style={inputStyle} type="number" step="0.01" value={editForm.tara} onChange={e => setEditForm({...editForm, tara: e.target.value})} /></div>
              <div style={{ marginBottom: 14 }}><label style={labelStyle}>Peso Neto (calculado)</label><input style={{...inputStyle, color: "#22d3ee", fontWeight: 700}} readOnly value={((parseFloat(editForm.peso_bruto)||0) - (parseFloat(editForm.tara)||0)).toFixed(2)} /></div>
              <div style={{ marginBottom: 14 }}><label style={labelStyle}>Tipo</label><select style={inputStyle} value={editForm.tipo} onChange={e => setEditForm({...editForm, tipo: e.target.value})}><option value="entrada">Entrada</option><option value="salida">Salida</option></select></div>
              <div style={{ marginBottom: 14 }}><label style={labelStyle}>Bascula</label><input style={inputStyle} value={editForm.bascula} onChange={e => setEditForm({...editForm, bascula: e.target.value})} /></div>
              <div style={{ marginBottom: 14 }}><label style={labelStyle}>Parcela / Campo</label><input style={inputStyle} value={editForm.parcela} onChange={e => setEditForm({...editForm, parcela: e.target.value})} /></div>
              <div style={{ marginBottom: 14 }}><label style={labelStyle}>% Impurezas</label><input style={inputStyle} type="number" step="0.1" value={editForm.impurezas} onChange={e => setEditForm({...editForm, impurezas: e.target.value})} /></div>
            </div>
            <div style={{ marginBottom: 14 }}><label style={labelStyle}>Observaciones</label><textarea style={{...inputStyle, minHeight: 60, resize: "vertical"} as any} value={editForm.observaciones} onChange={e => setEditForm({...editForm, observaciones: e.target.value})} /></div>
            <button onClick={saveEdit} disabled={loading} style={{ width: "100%", padding: 12, background: "linear-gradient(135deg, #0891b2, #0e7490)", color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 8 }}>{loading ? "Guardando..." : "Guardar Cambios"}</button>
            <button onClick={() => setModal(null)} style={{ width: "100%", padding: 10, background: "transparent", color: "#94a3b8", border: "1px solid #334155", borderRadius: 10, fontSize: 14, cursor: "pointer", marginTop: 8 }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* MODAL VER DETALLE */}
      {modal === "view" && selected && (
        <div style={overlayStyle} onClick={() => setModal(null)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "white" }}>Detalle Ticket: {selected.ticket}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {([
                ["Placa", selected.vehiculo_placa], ["Chofer", selected.chofer || "-"], ["Tipo", selected.tipo],
                ["Peso Bruto", Number(selected.peso_bruto||0).toFixed(2) + " tn"], ["Tara", Number(selected.tara||0).toFixed(2) + " tn"], ["Peso Neto", Number(selected.peso_neto||0).toFixed(2) + " tn"],
                ["Bascula", selected.bascula || "-"], ["Parcela", selected.parcela || "-"],
                ["Impurezas", (selected.impurezas || 0) + "%"], ["Estado", selected.estado],
                ["Origen", selected.origen_registro === "campo" ? "CAMPO (escaneo)" : "ERP (manual)"],
                ["Fecha Registro", new Date(selected.created_at).toLocaleString()],
              ] as [string, string][]).map(([label, val]) => (
                <div key={label} style={{ padding: 10, background: "#1e293b", borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", marginBottom: 2, letterSpacing: 0.5 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: label === "Peso Neto" ? "#22d3ee" : label === "Estado" ? (selected.estado === "completo" ? "#4ade80" : selected.estado === "pendiente" ? "#facc15" : "#f87171") : "white" }}>{val}</div>
                </div>
              ))}
            </div>
            {selected.observaciones && (
              <div style={{ marginTop: 14, padding: 12, background: "#1e293b", borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Observaciones</div>
                <div style={{ fontSize: 13, color: "#e2e8f0" }}>{selected.observaciones}</div>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button onClick={() => { setModal(null); openEdit(selected); }} style={{ flex: 1, padding: 10, background: "#1e3a5f", color: "#60a5fa", border: "1px solid #3b82f666", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Editar</button>
              {selected.estado === "pendiente" && <button onClick={() => { handleApprove(selected.id, selected.ticket); setModal(null); }} style={{ flex: 1, padding: 10, background: "#14532d", color: "#4ade80", border: "1px solid #22c55e66", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Aprobar</button>}
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: 10, background: "transparent", color: "#94a3b8", border: "1px solid #334155", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMAR ELIMINACION */}
      {confirmDelete && (
        <div style={overlayStyle} onClick={() => setConfirmDelete(null)}>
          <div style={{ background: "#1c1917", border: "2px solid #dc2626", borderRadius: 12, padding: 28, textAlign: "center", maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>&#9888;&#65039;</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 8 }}>Confirmar Eliminacion</div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>Esta accion es permanente y quedara registrada en auditoria. El registro no podra recuperarse.</div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => { const t = tickets.find(x => x.id === confirmDelete); if (t) handleDelete(t.id, t.ticket); }} disabled={loading} style={{ padding: "10px 24px", background: "#dc2626", color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>{loading ? "Eliminando..." : "Si, Eliminar"}</button>
              <button onClick={() => setConfirmDelete(null)} style={{ padding: "10px 24px", background: "#334155", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
