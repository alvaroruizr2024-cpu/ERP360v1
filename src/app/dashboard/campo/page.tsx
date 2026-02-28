"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type Ticket = {
  id: string; ticket: string; vehiculo_placa: string; chofer: string;
  tipo: string; peso_bruto: number; tara: number; peso_neto: number;
  bascula: string; estado: string; created_at: string; observaciones: string;
  porcentaje_impurezas: number; peso_neto_ajustado: number;
};

export default function DashboardCampoPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState("pendiente");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("registros_pesaje").select("*").order("created_at", { ascending: false });
    if (filter !== "todos") query = query.eq("estado", filter);
    const { data } = await query.limit(100);
    if (data) setTickets(data as Ticket[]);
    setLoading(false);
  }, [filter]);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  async function handleAction(ticketId: string, accion: "aprobar" | "rechazar") {
    setLoading(true);
    const nuevoEstado = accion === "aprobar" ? "completo" : "anulado";
    const { error } = await supabase
      .from("registros_pesaje")
      .update({ estado: nuevoEstado })
      .eq("id", ticketId);

    if (error) {
      setMsg("Error: " + error.message);
    } else {
      setMsg("Ticket " + (accion === "aprobar" ? "aprobado" : "rechazado") + " exitosamente");
      if (user) {
        await supabase.from("auditoria").insert({
          user_id: user.id,
          accion: accion === "aprobar" ? "aprobar_ticket" : "rechazar_ticket",
          modulo: "campo_validacion",
          detalle: "Ticket " + ticketId + " " + nuevoEstado + " por lider",
        });
      }
      loadTickets();
    }
    setLoading(false);
    setTimeout(() => setMsg(""), 3000);
  }

  const counts = {
    pendiente: tickets.filter(t => t.estado === "pendiente").length,
    completo: tickets.filter(t => t.estado === "completo").length,
    anulado: tickets.filter(t => t.estado === "anulado").length,
  };

  const estadoColor = (e: string) => e === "pendiente" ? "#facc15" : e === "completo" ? "#4ade80" : "#f87171";
  const estadoBg = (e: string) => e === "pendiente" ? "rgba(250,204,21,0.15)" : e === "completo" ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)";

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 4 }}>Validacion de Tickets - Campo</h1>
        <p style={{ fontSize: 14, color: "#94a3b8" }}>Panel de aprobacion para lider de proceso | {user?.email || "..."}</p>
      </div>

      {msg && <div style={{ padding: "10px 16px", borderRadius: 8, marginBottom: 16, background: msg.includes("Error") ? "rgba(248,113,113,0.15)" : "rgba(74,222,128,0.15)", color: msg.includes("Error") ? "#f87171" : "#4ade80", fontSize: 13 }}>{msg}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        <div style={{ background: "#141b2d", border: "1px solid #1e293b", borderRadius: 8, padding: 16, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "#94a3b8" }}>Pendientes</p>
          <p style={{ fontSize: 28, fontWeight: "bold", color: "#facc15" }}>{counts.pendiente}</p>
        </div>
        <div style={{ background: "#141b2d", border: "1px solid #1e293b", borderRadius: 8, padding: 16, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "#94a3b8" }}>Aprobados</p>
          <p style={{ fontSize: 28, fontWeight: "bold", color: "#4ade80" }}>{counts.completo}</p>
        </div>
        <div style={{ background: "#141b2d", border: "1px solid #1e293b", borderRadius: 8, padding: 16, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "#94a3b8" }}>Rechazados</p>
          <p style={{ fontSize: 28, fontWeight: "bold", color: "#f87171" }}>{counts.anulado}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["pendiente", "completo", "anulado", "todos"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 16px", borderRadius: 6, border: filter === f ? "2px solid #0891b2" : "1px solid #334155", background: filter === f ? "rgba(8,145,178,0.2)" : "#141b2d", color: filter === f ? "#22d3ee" : "#94a3b8", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {f === "todos" ? "Todos" : f === "pendiente" ? "Pendientes" : f === "completo" ? "Aprobados" : "Rechazados"}
          </button>
        ))}
        <button onClick={loadTickets} style={{ marginLeft: "auto", padding: "6px 16px", borderRadius: 6, border: "1px solid #334155", background: "#141b2d", color: "#94a3b8", fontSize: 13, cursor: "pointer" }}>
          {loading ? "Cargando..." : "Actualizar"}
        </button>
      </div>

      <div style={{ background: "#141b2d", border: "1px solid #1e293b", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#0d1224" }}>
              <th style={{ padding: "10px 12px", textAlign: "left", color: "#64748b", fontWeight: 600 }}>Ticket</th>
              <th style={{ padding: "10px 12px", textAlign: "left", color: "#64748b", fontWeight: 600 }}>Placa</th>
              <th style={{ padding: "10px 12px", textAlign: "left", color: "#64748b", fontWeight: 600 }}>Tipo</th>
              <th style={{ padding: "10px 12px", textAlign: "right", color: "#64748b", fontWeight: 600 }}>P.Bruto</th>
              <th style={{ padding: "10px 12px", textAlign: "right", color: "#64748b", fontWeight: 600 }}>Tara</th>
              <th style={{ padding: "10px 12px", textAlign: "right", color: "#64748b", fontWeight: 600 }}>P.Neto</th>
              <th style={{ padding: "10px 12px", textAlign: "center", color: "#64748b", fontWeight: 600 }}>Estado</th>
              <th style={{ padding: "10px 12px", textAlign: "left", color: "#64748b", fontWeight: 600 }}>Fecha</th>
              <th style={{ padding: "10px 12px", textAlign: "center", color: "#64748b", fontWeight: 600 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 && (
              <tr><td colSpan={9} style={{ padding: 32, textAlign: "center", color: "#475569" }}>No hay tickets para mostrar</td></tr>
            )}
            {tickets.map(t => (
              <tr key={t.id} style={{ borderTop: "1px solid #1e293b" }}>
                <td style={{ padding: "10px 12px", fontWeight: 600 }}>{t.ticket}</td>
                <td style={{ padding: "10px 12px" }}>{t.vehiculo_placa}</td>
                <td style={{ padding: "10px 12px", textTransform: "uppercase" }}>{t.tipo}</td>
                <td style={{ padding: "10px 12px", textAlign: "right" }}>{t.peso_bruto}</td>
                <td style={{ padding: "10px 12px", textAlign: "right" }}>{t.tara}</td>
                <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600, color: "#22d3ee" }}>{t.peso_neto}</td>
                <td style={{ padding: "10px 12px", textAlign: "center" }}>
                  <span style={{ padding: "2px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600, background: estadoBg(t.estado), color: estadoColor(t.estado) }}>{t.estado}</span>
                </td>
                <td style={{ padding: "10px 12px", fontSize: 11, color: "#94a3b8" }}>{new Date(t.created_at).toLocaleString()}</td>
                <td style={{ padding: "10px 12px", textAlign: "center" }}>
                  {t.estado === "pendiente" && (
                    <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                      <button onClick={() => handleAction(t.id, "aprobar")} disabled={loading} style={{ padding: "4px 12px", background: "#166534", color: "#4ade80", border: "1px solid #22c55e", borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Aprobar</button>
                      <button onClick={() => handleAction(t.id, "rechazar")} disabled={loading} style={{ padding: "4px 12px", background: "#7f1d1d", color: "#f87171", border: "1px solid #ef4444", borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Rechazar</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 24, padding: 16, background: "#141b2d", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12, color: "#64748b" }}>
        <strong style={{ color: "#94a3b8" }}>Trazabilidad:</strong> Todas las acciones de aprobacion/rechazo quedan registradas en el log de auditoria con usuario, fecha y hora.
      </div>
    </div>
  );
}
