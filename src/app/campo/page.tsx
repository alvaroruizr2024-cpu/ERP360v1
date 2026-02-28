"use client";

export default function CampoPage() {
  return (
    <div style={{minHeight: "100vh", background: "#0a0e1a", color: "white", fontFamily: "system-ui, sans-serif"}}>
      <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#0d1224", borderBottom: "1px solid #1e293b"}}>
        <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
          <span style={{fontSize: "20px", fontWeight: "bold"}}>Trans<span style={{color: "#22d3ee"}}>Cana</span></span>
          <span style={{background: "#0891b2", color: "white", fontSize: "12px", padding: "2px 8px", borderRadius: "4px", fontWeight: 600}}>CAMPO</span>
        </div>
        <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
          <span style={{fontSize: "14px", color: "#94a3b8"}}>TC-001</span>
          <div style={{width: 32, height: 32, background: "#0891b2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "bold"}}>TC</div>
        </div>
      </div>
      <div style={{padding: "24px 16px"}}>
        <div style={{textAlign: "center", marginBottom: 24}}>
          <h1 style={{fontSize: 24, fontWeight: "bold", marginBottom: 8}}>TransCana Campo</h1>
          <p style={{color: "#94a3b8", fontSize: 14}}>Portal de Trabajadores - Bascula / Pesaje</p>
          <div style={{display: "flex", justifyContent: "center", gap: 12, marginTop: 8}}>
            <span style={{background: "rgba(20,83,45,0.5)", color: "#4ade80", fontSize: 12, padding: "4px 12px", borderRadius: 9999}}>ERP Sincronizado</span>
            <span style={{background: "rgba(30,58,138,0.5)", color: "#60a5fa", fontSize: 12, padding: "4px 12px", borderRadius: 9999}}>En linea</span>
          </div>
        </div>
        <div style={{background: "rgba(8,145,178,0.1)", border: "1px solid rgba(8,145,178,0.3)", borderRadius: 8, padding: "8px 16px", textAlign: "center", fontSize: 14, color: "#67e8f9", marginBottom: 24}}>
          Conectado al modulo de Pesaje del ERP TransCana
        </div>
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24}}>
          <Box label="TICKETS HOY" val="1" sub="Escaneados" c="#60a5fa" />
          <Box label="PENDIENTES" val="1" sub="Por validar" c="#facc15" />
          <Box label="VALIDADOS" val="0" sub="Aprobados" c="#4ade80" />
          <Box label="OPERACIONES" val="1" sub="Registradas" c="#c084fc" />
        </div>
        <h2 style={{fontSize: 12, fontWeight: "bold", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: 12}}>ACTIVIDAD RECIENTE</h2>
        <div style={{background: "#141b2d", borderRadius: 8, padding: 12, marginBottom: 8}}>
          <p style={{fontWeight: 600, margin: 0}}>TK-001 - ABC-456</p>
          <p style={{fontSize: 12, color: "#94a3b8", margin: "4px 0 0"}}>ENTRADA - Neto: 37.6 tn - 23:16</p>
        </div>
        <div style={{background: "#141b2d", borderRadius: 8, padding: 12}}>
          <p style={{fontWeight: 600, margin: 0}}>OP-001 - Corte de Cana</p>
          <p style={{fontSize: 12, color: "#94a3b8", margin: "4px 0 0"}}>Parcela 03 - Este - 23:03</p>
        </div>
      </div>
    </div>
  );
}

function Box({label, val, sub, c}: {label: string; val: string; sub: string; c: string}) {
  return (
    <div style={{background: "#141b2d", border: "1px solid #1e293b", borderRadius: 8, padding: 16}}>
      <p style={{fontSize: 12, color: "#64748b", margin: 0}}>{label}</p>
      <p style={{fontSize: 30, fontWeight: "bold", color: c, margin: "4px 0"}}>{val}</p>
      <p style={{fontSize: 12, color: "#64748b", margin: 0}}>{sub}</p>
    </div>
  );
}
