"use client";

import { useState, useEffect } from "react";
import { Metadata } from "next";

// Types
interface Ticket {
    id: string;
    placa: string;
    tipo: "ENTRADA" | "SALIDA";
    bascula: string;
    parcela: string;
    pesoBruto: number;
    tara: number;
    pesoNeto: number;
    chofer: string;
    fecha: string;
    hora: string;
    estado: "pendiente" | "aprobado" | "rechazado";
}

interface Operacion {
    id: string;
    tipo: string;
    parcela: string;
    turno: string;
    hora: string;
}

type Tab = "inicio" | "operaciones" | "pesaje" | "validar";

export default function CampoPage() {
    const [activeTab, setActiveTab] = useState<Tab>("inicio");
    const [tickets, setTickets] = useState<Ticket[]>([
      {
              id: "TK-001",
              placa: "ABC-456",
              tipo: "ENTRADA",
              bascula: "Báscula 1",
              parcela: "Parcela 03 - Este",
              pesoBruto: 52.4,
              tara: 14.8,
              pesoNeto: 37.6,
              chofer: "Carlos Mendoza R.",
              fecha: new Date().toLocaleDateString("es-PE"),
              hora: "23:16",
              estado: "pendiente",
      },
        ]);
    const [operaciones] = useState<Operacion[]>([
      {
              id: "OP-001",
              tipo: "Corte de Caña",
              parcela: "Parcela 03 - Este",
              turno: "DIURNO",
              hora: "23:03",
      },
        ]);

  const pendingCount = tickets.filter((t) => t.estado === "pendiente").length;

  const handleApprove = (ticketId: string) => {
        setTickets((prev) =>
                prev.map((t) => (t.id === ticketId ? { ...t, estado: "aprobado" as const } : t))
                       );
  };

  const handleReject = (ticketId: string) => {
        setTickets((prev) =>
                prev.map((t) => (t.id === ticketId ? { ...t, estado: "rechazado" as const } : t))
                       );
  };

  return (
        <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col">
          {/* Header */}
              <header className="flex items-center justify-between px-4 py-3 bg-[#0d1224] border-b border-gray-800">
                      <div className="flex items-center gap-2">
                                <span className="text-xl font-bold">
                                            Trans<span className="text-cyan-400">Caña</span>span>
                                </span>span>
                                <span className="bg-cyan-600 text-white text-xs px-2 py-0.5 rounded font-semibold">
                                            CAMPO
                                </span>span>
                      </div>div>
                      <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400">TC-001</span>span>
                                <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-sm font-bold">
                                            TC
                                </div>div>
                                <button className="text-sm text-gray-400 hover:text-white border border-gray-600 px-2 py-1 rounded">
                                            Salir
                                </button>button>
                      </div>div>
              </header>header>
        
          {/* Content */}
              <main className="flex-1 overflow-y-auto pb-24 px-4">
                {activeTab === "inicio" && <InicioTab tickets={tickets} operaciones={operaciones} />}
                {activeTab === "operaciones" && <OperacionesTab operaciones={operaciones} />}
                {activeTab === "pesaje" && <PesajeTab tickets={tickets} />}
                {activeTab === "validar" && (
                    <ValidarTab tickets={tickets} onApprove={handleApprove} onReject={handleReject} />
                  )}
              </main>main>
        
          {/* Bottom Navigation */}
              <nav className="fixed bottom-0 left-0 right-0 bg-[#0d1224] border-t border-gray-800 flex justify-around py-2 z-50">
                {[
          { key: "inicio" as Tab, icon: "🏠", label: "Inicio" },
          { key: "operaciones" as Tab, icon: "📋", label: "Operaciones" },
          { key: "pesaje" as Tab, icon: "✅", label: "Pesaje" },
          { key: "validar" as Tab, icon: "☑️", label: "Validar" },
                  ].map((tab) => (
                              <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`flex flex-col items-center gap-1 px-4 py-1 rounded-lg transition-colors relative ${
                                                            activeTab === tab.key
                                                              ? "text-cyan-400 bg-cyan-400/10"
                                                              : "text-gray-500 hover:text-gray-300"
                                            }`}
                                          >
                                          <span className="text-xl">{tab.icon}</span>span>
                                          <span className="text-xs">{tab.label}</span>span>
                                {tab.key === "validar" && pendingCount > 0 && (
                                                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                                            {pendingCount}
                                                          </span>span>
                                          )}
                              </button>button>
                            ))}
              </nav>nav>
        </div>div>
      );
}

/* ============ INICIO TAB ============ */
function InicioTab({ tickets, operaciones }: { tickets: Ticket[]; operaciones: Operacion[] }) {
    const today = new Date();
    const dateStr = today.toLocaleDateString("es-PE", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
    });
  
    return (
          <div className="py-6 space-y-6">
                <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold">TransCaña Campo</h1>h1>
                        <p className="text-gray-400 text-sm capitalize">{dateStr} • Báscula / Pesaje</p>p>
                        <div className="flex justify-center gap-3">
                                  <span className="bg-green-900/50 text-green-400 text-xs px-3 py-1 rounded-full">● ERP Sincronizado</span>span>
                                  <span className="bg-blue-900/50 text-blue-400 text-xs px-3 py-1 rounded-full">📡 En línea</span>span>
                        </div>div>
                </div>div>
          
                <div className="bg-cyan-900/20 border border-cyan-800/30 rounded-lg px-4 py-2 text-center text-sm text-cyan-300">
                        ● Conectado al módulo de Pesaje del ERP TransCaña
                </div>div>
          
                <div className="grid grid-cols-2 gap-3">
                        <StatCard label="TICKETS HOY" value={String(tickets.length)} sub="Escaneados" />
                        <StatCard label="PENDIENTES" value={String(tickets.filter((t) => t.estado === "pendiente").length)} sub="Por validar" color="yellow" />
                        <StatCard label="VALIDADOS" value={String(tickets.filter((t) => t.estado === "aprobado").length)} sub="Aprobados" color="green" />
                        <StatCard label="OPERACIONES" value={String(operaciones.length)} sub="Registradas" color="purple" />
                </div>div>
          
                <h2 className="text-sm font-bold tracking-wider text-gray-400">ACCESO RÁPIDO</h2>h2>
                <div className="grid grid-cols-2 gap-3">
                        <QuickCard icon="📷" title="Escanear Ticket" sub="Captura fotográfica" />
                        <QuickCard icon="🚜" title="Operaciones" sub="Registro de campo" />
                        <QuickCard icon="📋" title="Validaciones" sub="Estado de tickets" />
                        <QuickCard icon="🔗" title="ERP Principal" sub="Ir a TransCaña ERP" />
                </div>div>
          
                <h2 className="text-sm font-bold tracking-wider text-gray-400">ACTIVIDAD RECIENTE</h2>h2>
            {tickets.map((t) => (
                    <div key={t.id} className="bg-[#141b2d] rounded-lg p-3 flex justify-between items-center">
                              <div>
                                          <p className="font-semibold">📦 {t.id} • {t.placa}</p>p>
                                          <p className="text-xs text-gray-400">Neto: {t.pesoNeto} tn • {t.hora}</p>p>
                              </div>div>
                              <span className={`text-xs px-2 py-1 rounded font-semibold ${
                                  t.estado === "aprobado" ? "bg-green-900/50 text-green-400" :
                                  t.estado === "rechazado" ? "bg-red-900/50 text-red-400" :
                                  "bg-yellow-900/50 text-yellow-400"
                    }`}>
                                {t.estado.toUpperCase()}
                              </span>span>
                    </div>div>
                  ))}
            {operaciones.map((op) => (
                    <div key={op.id} className="bg-[#141b2d] rounded-lg p-3 flex justify-between items-center">
                              <div>
                                          <p className="font-semibold">🚜 {op.id} • {op.tipo}</p>p>
                                          <p className="text-xs text-gray-400">{op.parcela} • {op.hora}</p>p>
                              </div>div>
                              <span className="text-xs px-2 py-1 rounded font-semibold bg-purple-900/50 text-purple-400">{op.turno}</span>span>
                    </div>div>
                  ))}
          </div>div>
        );
}

/* ============ OPERACIONES TAB ============ */
function OperacionesTab({ operaciones }: { operaciones: Operacion[] }) {
    return (
          <div className="py-6 space-y-4">
                <h1 className="text-xl font-bold">🚜 Operaciones de Campo</h1>h1>
                <p className="text-gray-400 text-sm">Registro de actividades diarias</p>p>
            {operaciones.map((op) => (
                    <div key={op.id} className="bg-[#141b2d] border border-gray-800 rounded-lg p-4 space-y-2">
                              <div className="flex justify-between">
                                          <span className="font-bold">{op.id} • {op.tipo}</span>span>
                                          <span className="text-xs px-2 py-1 rounded bg-purple-900/50 text-purple-400">{op.turno}</span>span>
                              </div>div>
                              <p className="text-sm text-gray-400">{op.parcela} • {op.hora}</p>p>
                    </div>div>
                  ))}
          </div>div>
        );
}

/* ============ PESAJE TAB ============ */
function PesajeTab({ tickets }: { tickets: Ticket[] }) {
    return (
          <div className="py-6 space-y-4">
                <h1 className="text-xl font-bold">📷 Escaneo de Tickets</h1>h1>
                <p className="text-gray-400 text-sm">Captura fotográfica de tickets de balanza</p>p>
          
                <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg px-4 py-2 text-sm text-yellow-300">
                        ● Los tickets serán validados por el responsable de área en el ERP
                </div>div>
          
                <div className="bg-[#141b2d] border-2 border-dashed border-gray-700 rounded-xl p-8 text-center space-y-3">
                        <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto flex items-center justify-center text-2xl">📷</div>div>
                        <p className="font-semibold">Escanear Ticket de Balanza</p>p>
                        <p className="text-sm text-gray-400">Toca para abrir la cámara y fotografiar el ticket</p>p>
                        <p className="text-xs text-gray-500">Formatos: JPG, PNG • Máx: 10MB</p>p>
                </div>div>
          
                <h2 className="text-sm font-bold tracking-wider text-gray-400">TICKETS RECIENTES</h2>h2>
            {tickets.map((t) => (
                    <div key={t.id} className="bg-[#141b2d] border border-gray-800 rounded-lg p-4 space-y-2">
                              <div className="flex justify-between items-center">
                                          <span className="font-bold">{t.id} • {t.placa}</span>span>
                                          <span className={`text-xs px-2 py-1 rounded font-semibold ${
                                    t.estado === "aprobado" ? "bg-green-900/50 text-green-400" :
                                    t.estado === "rechazado" ? "bg-red-900/50 text-red-400" :
                                    "bg-yellow-900/50 text-yellow-400"
                    }`}>
                                                        ⏳ {t.estado === "pendiente" ? "Pendiente" : t.estado === "aprobado" ? "Aprobado" : "Rechazado"}
                                          </span>span>
                              </div>div>
                              <p className="text-sm text-gray-400">{t.tipo} • Neto: {t.pesoNeto} tn • {t.hora}</p>p>
                              <div className="flex gap-2">
                                          <span className="text-xs border border-green-700 text-green-400 px-2 py-0.5 rounded-full">{t.bascula}</span>span>
                                          <span className="text-xs border border-blue-700 text-blue-400 px-2 py-0.5 rounded-full">{t.chofer}</span>span>
                                          <span className="text-xs border border-purple-700 text-purple-400 px-2 py-0.5 rounded-full">{t.parcela}</span>span>
                              </div>div>
                    </div>div>
                  ))}
          </div>div>
        );
}

/* ============ VALIDAR TAB ============ */
function ValidarTab({
    tickets,
    onApprove,
    onReject,
}: {
    tickets: Ticket[];
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}) {
    const [filter, setFilter] = useState<"todos" | "pendiente" | "aprobado" | "rechazado">("todos");
    const filtered = filter === "todos" ? tickets : tickets.filter((t) => t.estado === filter);
  
    return (
          <div className="py-6 space-y-4">
                <h1 className="text-xl font-bold">📋 Estado de Validaciones</h1>h1>
                <p className="text-gray-400 text-sm">Seguimiento de tickets enviados al ERP principal</p>p>
          
                <div className="bg-green-900/20 border border-green-700/30 rounded-lg px-4 py-2 text-sm text-green-300">
                        ● Validación por transacción conectada al ERP TransCaña
                </div>div>
          
                <div className="flex gap-2 flex-wrap">
                  {(["todos", "pendiente", "aprobado", "rechazado"] as const).map((f) => (
                      <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                                    filter === f ? "bg-cyan-600 text-white" : "bg-[#141b2d] text-gray-400 hover:text-white"
                                    }`}
                                  >
                        {f === "todos" ? "Todos" : f === "pendiente" ? "⏳ Pendientes" : f === "aprobado" ? "✅ Aprobados" : "❌ Rechazados"}
                      </button>button>
                    ))}
                </div>div>
          
            {filtered.map((t) => (
                    <div key={t.id} className="bg-[#141b2d] border border-gray-800 rounded-xl p-4 space-y-3">
                              <div className="flex justify-between items-center">
                                          <div>
                                                        <p className="font-bold">{t.id} • {t.placa}</p>p>
                                                        <p className="text-xs text-gray-500">{t.fecha} {t.hora} • Por: TC-001</p>p>
                                          </div>div>
                                          <span className={`text-xs px-2 py-1 rounded font-semibold ${
                                    t.estado === "aprobado" ? "bg-green-900/50 text-green-400" :
                                    t.estado === "rechazado" ? "bg-red-900/50 text-red-400" :
                                    "bg-yellow-900/50 text-yellow-400"
                    }`}>
                                                        ⏳ Pendiente Validación
                                          </span>span>
                              </div>div>
                    
                      {/* Ticket visual */}
                              <div className="bg-[#f5f0e8] text-gray-800 rounded-lg p-4 space-y-2 border-2 border-dashed border-gray-400">
                                          <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Tipo:</span>span>
                                                        <span className="font-bold">{t.tipo}</span>span>
                                          </div>div>
                                          <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Báscula:</span>span>
                                                        <span className="font-bold">{t.bascula}</span>span>
                                          </div>div>
                                          <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Parcela:</span>span>
                                                        <span className="font-bold">{t.parcela}</span>span>
                                          </div>div>
                              </div>div>
                    
                      {/* Data */}
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                          <div>Tipo: <strong>{t.tipo}</strong>strong></div>div>
                                          <div>Báscula: <strong>{t.bascula}</strong>strong></div>div>
                                          <div>P. Bruto: <strong>{t.pesoBruto} tn</strong>strong></div>div>
                                          <div>Tara: <strong>{t.tara} tn</strong>strong></div>div>
                                          <div>P. Neto: <strong className="text-green-400">{t.pesoNeto} tn</strong>strong></div>div>
                                          <div>Chofer: <strong>{t.chofer}</strong>strong></div>div>
                              </div>div>
                    
                      {t.estado === "pendiente" && (
                                  <div className="flex gap-3">
                                                <button
                                                                  onClick={() => onApprove(t.id)}
                                                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold transition-colors"
                                                                >
                                                                ✅ Aprobar en ERP
                                                </button>button>
                                                <button
                                                                  onClick={() => onReject(t.id)}
                                                                  className="flex-1 border border-red-600 text-red-400 hover:bg-red-600/10 py-2.5 rounded-lg font-semibold transition-colors"
                                                                >
                                                                ❌ Rechazar
                                                </button>button>
                                  </div>div>
                              )}
                    </div>div>
                  ))}
          </div>div>
        );
}

/* ============ UTILITY COMPONENTS ============ */
function StatCard({ label, value, sub, color = "blue" }: { label: string; value: string; sub: string; color?: string }) {
    const colorMap: Record<string, string> = {
          blue: "text-blue-400",
          yellow: "text-yellow-400",
          green: "text-green-400",
          purple: "text-purple-400",
    };
    return (
          <div className="bg-[#141b2d] border border-gray-800 rounded-lg p-4">
                <p className="text-xs text-gray-500 tracking-wider">{label}</p>p>
                <p className={`text-3xl font-bold ${colorMap[color] || "text-blue-400"}`}>{value}</p>p>
                <p className="text-xs text-gray-500">{sub}</p>p>
          </div>div>
        );
}

function QuickCard({ icon, title, sub }: { icon: string; title: string; sub: string }) {
    return (
          <div className="bg-[#141b2d] border border-gray-800 rounded-lg p-4 text-center space-y-2 hover:border-cyan-800 transition-colors cursor-pointer">
                <span className="text-3xl">{icon}</span>span>
                <p className="font-semibold text-sm">{title}</p>p>
                <p className="text-xs text-gray-500">{sub}</p>p>
          </div>div>
        );
}</div>
