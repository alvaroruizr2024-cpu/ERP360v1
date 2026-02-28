"use client";
import { useState } from "react";

type Estado = "pendiente" | "aprobado" | "rechazado";
type Tab = "inicio" | "operaciones" | "pesaje" | "validar";

const TICKET = {
      id: "TK-001", placa: "ABC-456", tipo: "ENTRADA" as const,
      bascula: "Bascula 1", parcela: "Parcela 03 - Este",
      pesoBruto: 52.4, tara: 14.8, pesoNeto: 37.6,
      chofer: "Carlos Mendoza R.", hora: "23:16",
};

export default function CampoPage() {
      const [tab, setTab] = useState<Tab>("inicio");
      const [estado, setEstado] = useState<Estado>("pendiente");
      const pending = estado === "pendiente" ? 1 : 0;

  return (
          <div className="min-h-screen bg-slate-950 text-white flex flex-col">
                <header className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                                  <span className="text-xl font-bold">Trans<span className="text-cyan-400">Cana</span>span></span>span>
                                  <span className="bg-cyan-600 text-white text-xs px-2 py-0.5 rounded font-semibold">CAMPO</span>span>
                        </div>div>
                        <div className="flex items-center gap-2">
                                  <span className="text-sm text-slate-400">TC-001</span>span>
                                  <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-sm font-bold">TC</div>div>
                        </div>div>
                </header>header>
          
                <main className="flex-1 overflow-y-auto pb-24 px-4 py-6">
                    {tab === "inicio" && <Inicio estado={estado} />}
                    {tab === "operaciones" && <Operaciones />}
                    {tab === "pesaje" && <Pesaje estado={estado} />}
                    {tab === "validar" && <Validar estado={estado} onApprove={() => setEstado("aprobado")} onReject={() => setEstado("rechazado")} />}
                </main>main>
          
                <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around py-2 z-50">
                    {([
              { k: "inicio" as Tab, i: "\u{1F3E0}", l: "Inicio" },
              { k: "operaciones" as Tab, i: "\u{1F4CB}", l: "Operaciones" },
              { k: "pesaje" as Tab, i: "\u2705", l: "Pesaje" },
              { k: "validar" as Tab, i: "\u2611\uFE0F", l: "Validar" },
                      ]).map((t) => (
                        <button key={t.k} onClick={() => setTab(t.k)}
                                        className={"flex flex-col items-center gap-1 px-4 py-1 rounded-lg relative " + (tab === t.k ? "text-cyan-400 bg-cyan-400/10" : "text-slate-500")}>
                                    <span className="text-xl">{t.i}</span>span>
                                    <span className="text-xs">{t.l}</span>span>
                            {t.k === "validar" && pending > 0 && (
                                                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{pending}</span>span>
                                    )}
                        </button>button>
                      ))}
                </nav>nav>
          </div>div>
        );
}

function Inicio({ estado }: { estado: Estado }) {
      return (
              <div className="space-y-6">
                    <div className="text-center space-y-2">
                            <h1 className="text-2xl font-bold">TransCana Campo</h1>h1>
                            <p className="text-slate-400 text-sm">Portal de Trabajadores - Bascula / Pesaje</p>p>
                            <div className="flex justify-center gap-3">
                                      <span className="bg-green-900/50 text-green-400 text-xs px-3 py-1 rounded-full">ERP Sincronizado</span>span>
                                      <span className="bg-blue-900/50 text-blue-400 text-xs px-3 py-1 rounded-full">En linea</span>span>
                            </div>div>
                    </div>div>
                    <div className="bg-cyan-900/20 border border-cyan-800/30 rounded-lg px-4 py-2 text-center text-sm text-cyan-300">
                            Conectado al modulo de Pesaje del ERP TransCana
                    </div>div>
                    <div className="grid grid-cols-2 gap-3">
                            <Card label="TICKETS HOY" value="1" sub="Escaneados" color="text-blue-400" />
                            <Card label="PENDIENTES" value={estado === "pendiente" ? "1" : "0"} sub="Por validar" color="text-yellow-400" />
                            <Card label="VALIDADOS" value={estado === "aprobado" ? "1" : "0"} sub="Aprobados" color="text-green-400" />
                            <Card label="OPERACIONES" value="1" sub="Registradas" color="text-purple-400" />
                    </div>div>
                    <h2 className="text-sm font-bold tracking-wider text-slate-400">ACCESO RAPIDO</h2>h2>
                    <div className="grid grid-cols-2 gap-3">
                            <QCard title="Escanear Ticket" sub="Captura fotografica" />
                            <QCard title="Operaciones" sub="Registro de campo" />
                            <QCard title="Validaciones" sub="Estado de tickets" />
                            <QCard title="ERP Principal" sub="Ir a TransCana ERP" />
                    </div>div>
                    <h2 className="text-sm font-bold tracking-wider text-slate-400">ACTIVIDAD RECIENTE</h2>h2>
                    <div className="bg-slate-900 rounded-lg p-3 flex justify-between items-center">
                            <div>
                                      <p className="font-semibold">{TICKET.id} - {TICKET.placa}</p>p>
                                      <p className="text-xs text-slate-400">Neto: {TICKET.pesoNeto} tn - {TICKET.hora}</p>p>
                            </div>div>
                            <span className={"text-xs px-2 py-1 rounded font-semibold " + (estado === "aprobado" ? "bg-green-900/50 text-green-400" : estado === "rechazado" ? "bg-red-900/50 text-red-400" : "bg-yellow-900/50 text-yellow-400")}>
                                {estado.toUpperCase()}
                            </span>span>
                    </div>div>
                    <div className="bg-slate-900 rounded-lg p-3 flex justify-between items-center">
                            <div>
                                      <p className="font-semibold">OP-001 - Corte de Cana</p>p>
                                      <p className="text-xs text-slate-400">Parcela 03 - Este - 23:03</p>p>
                            </div>div>
                            <span className="text-xs px-2 py-1 rounded font-semibold bg-purple-900/50 text-purple-400">DIURNO</span>span>
                    </div>div>
              </div>div>
            );
}

function Operaciones() {
      return (
              <div className="space-y-4">
                    <h1 className="text-xl font-bold">Operaciones de Campo</h1>h1>
                    <p className="text-slate-400 text-sm">Registro de actividades diarias</p>p>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between">
                                      <span className="font-bold">OP-001 - Corte de Cana</span>span>
                                      <span className="text-xs px-2 py-1 rounded bg-purple-900/50 text-purple-400">DIURNO</span>span>
                            </div>div>
                            <p className="text-sm text-slate-400">Parcela 03 - Este - 23:03</p>p>
                    </div>div>
              </div>div>
            );
}

function Pesaje({ estado }: { estado: Estado }) {
      return (
              <div className="space-y-4">
                    <h1 className="text-xl font-bold">Escaneo de Tickets</h1>h1>
                    <p className="text-slate-400 text-sm">Captura fotografica de tickets de balanza</p>p>
                    <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg px-4 py-2 text-sm text-yellow-300">
                            Los tickets seran validados por el responsable de area en el ERP
                    </div>div>
                    <div className="bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl p-8 text-center space-y-3">
                            <div className="w-16 h-16 bg-slate-700 rounded-full mx-auto flex items-center justify-center text-2xl">C</div>div>
                            <p className="font-semibold">Escanear Ticket de Balanza</p>p>
                            <p className="text-sm text-slate-400">Toca para abrir la camara y fotografiar el ticket</p>p>
                            <p className="text-xs text-slate-500">Formatos: JPG, PNG - Max: 10MB</p>p>
                    </div>div>
                    <h2 className="text-sm font-bold tracking-wider text-slate-400">TICKETS RECIENTES</h2>h2>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between items-center">
                                      <span className="font-bold">{TICKET.id} - {TICKET.placa}</span>span>
                                      <span className={"text-xs px-2 py-1 rounded font-semibold " + (estado === "pendiente" ? "bg-yellow-900/50 text-yellow-400" : estado === "aprobado" ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400")}>
                                          {estado === "pendiente" ? "Pendiente" : estado === "aprobado" ? "Aprobado" : "Rechazado"}
                                      </span>span>
                            </div>div>
                            <p className="text-sm text-slate-400">{TICKET.tipo} - Neto: {TICKET.pesoNeto} tn - {TICKET.hora}</p>p>
                            <div className="flex gap-2">
                                      <span className="text-xs border border-green-700 text-green-400 px-2 py-0.5 rounded-full">{TICKET.bascula}</span>span>
                                      <span className="text-xs border border-blue-700 text-blue-400 px-2 py-0.5 rounded-full">{TICKET.chofer}</span>span>
                                      <span className="text-xs border border-purple-700 text-purple-400 px-2 py-0.5 rounded-full">{TICKET.parcela}</span>span>
                            </div>div>
                    </div>div>
              </div>div>
            );
}

function Validar({ estado, onApprove, onReject }: { estado: Estado; onApprove: () => void; onReject: () => void }) {
      return (
              <div className="space-y-4">
                    <h1 className="text-xl font-bold">Estado de Validaciones</h1>h1>
                    <p className="text-slate-400 text-sm">Seguimiento de tickets enviados al ERP principal</p>p>
                    <div className="bg-green-900/20 border border-green-700/30 rounded-lg px-4 py-2 text-sm text-green-300">
                            Validacion por transaccion conectada al ERP TransCana
                    </div>div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                      <div>
                                                  <p className="font-bold">{TICKET.id} - {TICKET.placa}</p>p>
                                                  <p className="text-xs text-slate-500">{TICKET.hora} - Por: TC-001</p>p>
                                      </div>div>
                                      <span className={"text-xs px-2 py-1 rounded font-semibold " + (estado === "aprobado" ? "bg-green-900/50 text-green-400" : estado === "rechazado" ? "bg-red-900/50 text-red-400" : "bg-yellow-900/50 text-yellow-400")}>
                                          {estado === "pendiente" ? "Pendiente Validacion" : estado === "aprobado" ? "Aprobado" : "Rechazado"}
                                      </span>span>
                            </div>div>
                            <div className="bg-amber-50 text-slate-800 rounded-lg p-4 space-y-2 border-2 border-dashed border-slate-400">
                                      <div className="flex justify-between text-sm"><span className="text-slate-500">Tipo:</span>span><span className="font-bold">{TICKET.tipo}</span>span></div>div>
                                      <div className="flex justify-between text-sm"><span className="text-slate-500">Bascula:</span>span><span className="font-bold">{TICKET.bascula}</span>span></div>div>
                                      <div className="flex justify-between text-sm"><span className="text-slate-500">Parcela:</span>span><span className="font-bold">{TICKET.parcela}</span>span></div>div>
                            </div>div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div>Tipo: <strong>{TICKET.tipo}</strong>strong></div>div>
                                      <div>Bascula: <strong>{TICKET.bascula}</strong>strong></div>div>
                                      <div>P. Bruto: <strong>{TICKET.pesoBruto} tn</strong>strong></div>div>
                                      <div>Tara: <strong>{TICKET.tara} tn</strong>strong></div>div>
                                      <div>P. Neto: <strong className="text-green-400">{TICKET.pesoNeto} tn</strong>strong></div>div>
                                      <div>Chofer: <strong>{TICKET.chofer}</strong>strong></div>div>
                            </div>div>
                        {estado === "pendiente" && (
                            <div className="flex gap-3">
                                        <button onClick={onApprove} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold">Aprobar en ERP</button>button>
                                        <button onClick={onReject} className="flex-1 border border-red-600 text-red-400 hover:bg-red-600/10 py-2.5 rounded-lg font-semibold">Rechazar</button>button>
                            </div>div>
                            )}
                    </div>div>
              </div>div>
            );
}

function Card({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
      return (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                    <p className="text-xs text-slate-500 tracking-wider">{label}</p>p>
                    <p className={"text-3xl font-bold " + color}>{value}</p>p>
                    <p className="text-xs text-slate-500">{sub}</p>p>
              </div>div>
            );
}

function QCard({ title, sub }: { title: string; sub: string }) {
      return (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center space-y-2 hover:border-cyan-800 cursor-pointer">
                    <p className="font-semibold text-sm">{title}</p>p>
                    <p className="text-xs text-slate-500">{sub}</p>p>
              </div>div>
            );
}</div>
