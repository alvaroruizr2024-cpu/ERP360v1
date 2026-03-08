// ============================================================================
// TRANSCAÑA ERP - Sprint 15: PWA Conductor Mejorada
// Page: /conductor (Mobile-first)
// ============================================================================

'use client';

import React, { useState, useRef } from 'react';
import {
  useJornadaConductor, useChecklistPreoperativo,
  useNotificacionesConductor, useDocumentosConductor,
} from '@/hooks/useSprint15';
import type { ChecklistItem } from '@/types/sprint15';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Truck, ClipboardCheck, Bell, FileText, Play, Square,
  Check, X, Camera, MapPin, ChevronRight, AlertTriangle,
  Clock, Route, Weight, Fuel,
} from 'lucide-react';

// --- Checklist Template por defecto ---
const CHECKLIST_TEMPLATE: ChecklistItem[] = [
  { categoria: 'Motor', item: 'Nivel de aceite', obligatorio: true },
  { categoria: 'Motor', item: 'Nivel de refrigerante', obligatorio: true },
  { categoria: 'Motor', item: 'Correas y mangueras', obligatorio: false },
  { categoria: 'Frenos', item: 'Pedal de freno (firmeza)', obligatorio: true },
  { categoria: 'Frenos', item: 'Freno de estacionamiento', obligatorio: true },
  { categoria: 'Llantas', item: 'Presión visual de llantas', obligatorio: true },
  { categoria: 'Llantas', item: 'Estado de la banda de rodamiento', obligatorio: true },
  { categoria: 'Llantas', item: 'Tuercas de ruedas ajustadas', obligatorio: true },
  { categoria: 'Luces', item: 'Faros delanteros', obligatorio: true },
  { categoria: 'Luces', item: 'Luces traseras y freno', obligatorio: true },
  { categoria: 'Luces', item: 'Direccionales', obligatorio: true },
  { categoria: 'Seguridad', item: 'Extintor (carga vigente)', obligatorio: true },
  { categoria: 'Seguridad', item: 'Botiquín de primeros auxilios', obligatorio: true },
  { categoria: 'Seguridad', item: 'Triángulos de seguridad', obligatorio: true },
  { categoria: 'Seguridad', item: 'Cinturón de seguridad', obligatorio: true },
  { categoria: 'Cabina', item: 'Espejos retrovisores', obligatorio: true },
  { categoria: 'Cabina', item: 'Limpiaparabrisas', obligatorio: false },
  { categoria: 'Cabina', item: 'Bocina', obligatorio: true },
  { categoria: 'Documentos', item: 'SOAT vigente', obligatorio: true },
  { categoria: 'Documentos', item: 'Revisión técnica vigente', obligatorio: true },
];

// --- Tab Navigation ---
function TabBar({ tab, setTab, noLeidas }: { tab: string; setTab: (t: string) => void; noLeidas: number }) {
  const tabs = [
    { id: 'jornada', icon: Truck, label: 'Jornada' },
    { id: 'checklist', icon: ClipboardCheck, label: 'Checklist' },
    { id: 'notificaciones', icon: Bell, label: 'Alertas' },
    { id: 'documentos', icon: FileText, label: 'Docs' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex z-50">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          className={`flex-1 flex flex-col items-center py-2 px-1 relative transition-colors ${
            tab === t.id ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <t.icon className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">{t.label}</span>
          {t.id === 'notificaciones' && noLeidas > 0 && (
            <span className="absolute top-1 right-1/4 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
              {noLeidas}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// --- Jornada Tab ---
function JornadaTab() {
  const { jornada, historial, iniciarJornada, finalizarJornada } = useJornadaConductor();
  const [kmInicio, setKmInicio] = useState('');
  const [kmFin, setKmFin] = useState('');
  const [vehiculoId, setVehiculoId] = useState('');

  const handleIniciar = async () => {
    if (!vehiculoId || !kmInicio) return;
    await iniciarJornada(vehiculoId, parseInt(kmInicio));
  };

  const handleFinalizar = async () => {
    if (!kmFin) return;
    await finalizarJornada(parseInt(kmFin));
  };

  return (
    <div className="space-y-4">
      {/* Estado actual */}
      <Card className={jornada?.hora_inicio && !jornada?.hora_fin
        ? 'border-green-500 bg-green-50' : 'border-gray-200'
      }>
        <CardContent className="p-4">
          {!jornada?.hora_inicio ? (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Iniciar Jornada</h3>
              <Input
                placeholder="ID Vehículo"
                value={vehiculoId}
                onChange={(e) => setVehiculoId(e.target.value)}
              />
              <Input
                placeholder="KM Odómetro inicial"
                type="number"
                value={kmInicio}
                onChange={(e) => setKmInicio(e.target.value)}
              />
              <Button className="w-full" size="lg" onClick={handleIniciar}>
                <Play className="w-5 h-5 mr-2" /> Iniciar Jornada
              </Button>
            </div>
          ) : !jornada?.hora_fin ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-green-800">Jornada en Curso</h3>
                <Badge className="bg-green-600 text-white animate-pulse">ACTIVA</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">Inicio</p>
                  <p className="font-semibold">
                    {new Date(jornada.hora_inicio!).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">KM Inicio</p>
                  <p className="font-semibold">{jornada.km_inicio?.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">Viajes</p>
                  <p className="font-semibold text-xl">{jornada.viajes_completados}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">Toneladas</p>
                  <p className="font-semibold text-xl">{jornada.toneladas_transportadas}</p>
                </div>
              </div>
              <Input
                placeholder="KM Odómetro final"
                type="number"
                value={kmFin}
                onChange={(e) => setKmFin(e.target.value)}
              />
              <Button variant="destructive" className="w-full" size="lg" onClick={handleFinalizar}>
                <Square className="w-5 h-5 mr-2" /> Finalizar Jornada
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <Check className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <p className="font-semibold">Jornada Completada</p>
              <p className="text-sm text-muted-foreground">
                {jornada.km_recorridos?.toLocaleString()} km — {jornada.viajes_completados} viajes
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historial */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Últimas Jornadas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {historial.slice(0, 7).map((j) => (
            <div key={j.id} className="flex items-center justify-between px-4 py-3 border-b last:border-0">
              <div>
                <p className="text-sm font-medium">{new Date(j.fecha).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                <p className="text-xs text-muted-foreground">
                  {j.km_recorridos?.toLocaleString()} km • {j.viajes_completados} viajes
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{j.toneladas_transportadas} tn</p>
                {j.calificacion_jornada && (
                  <p className="text-xs text-muted-foreground">★ {j.calificacion_jornada}</p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// --- Checklist Tab ---
function ChecklistTab() {
  const { enviarChecklist } = useChecklistPreoperativo();
  const [items, setItems] = useState<ChecklistItem[]>(
    CHECKLIST_TEMPLATE.map(t => ({ ...t, ok: undefined, observacion: '' }))
  );
  const [kmOdometro, setKmOdometro] = useState('');
  const [turno, setTurno] = useState('mañana');
  const [observaciones, setObservaciones] = useState('');
  const [enviando, setEnviando] = useState(false);

  const toggleItem = (idx: number, value: boolean) => {
    setItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], ok: value };
      return next;
    });
  };

  const handleEnviar = async () => {
    const sinResponder = items.filter(i => i.obligatorio && i.ok === undefined);
    if (sinResponder.length > 0) {
      alert(`Faltan ${sinResponder.length} items obligatorios por responder`);
      return;
    }
    setEnviando(true);
    try {
      await enviarChecklist({
        vehiculo_id: '', // Obtener del contexto
        turno,
        km_odometro: parseInt(kmOdometro) || 0,
        items,
        observaciones_generales: observaciones,
      });
      alert('Checklist enviado correctamente');
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setEnviando(false);
    }
  };

  const categorias = [...new Set(items.map(i => i.categoria))];
  const completados = items.filter(i => i.ok !== undefined).length;
  const porcentaje = Math.round((completados / items.length) * 100);

  return (
    <div className="space-y-4">
      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progreso</span>
            <span className="text-sm text-muted-foreground">{completados}/{items.length}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Input placeholder="KM Odómetro" type="number" value={kmOdometro}
              onChange={(e) => setKmOdometro(e.target.value)} />
            <select
              className="border rounded-md px-3 py-2 text-sm"
              value={turno} onChange={(e) => setTurno(e.target.value)}
            >
              <option value="mañana">Turno Mañana</option>
              <option value="tarde">Turno Tarde</option>
              <option value="noche">Turno Noche</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Items por categoría */}
      {categorias.map((cat) => (
        <Card key={cat}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {cat}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {items
              .map((item, idx) => ({ item, idx }))
              .filter(({ item }) => item.categoria === cat)
              .map(({ item, idx }) => (
                <div key={idx} className={`flex items-center justify-between px-4 py-3 border-b last:border-0 ${
                  item.ok === true ? 'bg-green-50' : item.ok === false ? 'bg-red-50' : ''
                }`}>
                  <div className="flex-1">
                    <p className="text-sm">
                      {item.item}
                      {item.obligatorio && <span className="text-red-500 ml-1">*</span>}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleItem(idx, true)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        item.ok === true ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleItem(idx, false)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        item.ok === false ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      ))}

      <Textarea
        placeholder="Observaciones generales..."
        value={observaciones}
        onChange={(e) => setObservaciones(e.target.value)}
      />

      <Button className="w-full" size="lg" onClick={handleEnviar} disabled={enviando}>
        <ClipboardCheck className="w-5 h-5 mr-2" />
        {enviando ? 'Enviando...' : 'Enviar Checklist'}
      </Button>
    </div>
  );
}

// --- Notificaciones Tab ---
function NotificacionesTab() {
  const { notificaciones, noLeidas, marcarLeida, marcarTodasLeidas } = useNotificacionesConductor();

  return (
    <div className="space-y-2">
      {noLeidas > 0 && (
        <Button variant="ghost" size="sm" className="w-full mb-2" onClick={marcarTodasLeidas}>
          Marcar todas como leídas ({noLeidas})
        </Button>
      )}
      {notificaciones.map((n) => (
        <Card
          key={n.id}
          className={`cursor-pointer transition-colors ${!n.leida ? 'bg-blue-50 border-blue-200' : ''}`}
          onClick={() => !n.leida && marcarLeida(n.id)}
        >
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${
                n.prioridad === 'critica' ? 'bg-red-100' :
                n.prioridad === 'alta' ? 'bg-orange-100' : 'bg-blue-100'
              }`}>
                {n.tipo === 'documento_vencido' ? <FileText className="w-4 h-4" /> :
                 n.tipo === 'mantenimiento_programado' ? <Wrench className="w-4 h-4" /> :
                 <Bell className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{n.titulo}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.mensaje}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(n.created_at).toLocaleString('es-PE')}
                </p>
              </div>
              {!n.leida && <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />}
            </div>
          </CardContent>
        </Card>
      ))}
      {notificaciones.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>Sin notificaciones</p>
        </div>
      )}
    </div>
  );
}

// --- Documentos Tab ---
function DocumentosTab() {
  const { documentos } = useDocumentosConductor();

  const estadoColor: Record<string, string> = {
    vigente: 'bg-green-100 text-green-800',
    por_vencer: 'bg-yellow-100 text-yellow-800',
    vencido: 'bg-red-100 text-red-800',
    en_tramite: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="space-y-3">
      {documentos.map((d) => (
        <Card key={d.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium capitalize">{d.tipo_documento.replace(/_/g, ' ')}</p>
                {d.numero_documento && (
                  <p className="text-xs text-muted-foreground font-mono">{d.numero_documento}</p>
                )}
                {d.fecha_vencimiento && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Vence: {new Date(d.fecha_vencimiento).toLocaleDateString('es-PE')}
                  </p>
                )}
              </div>
              <Badge className={estadoColor[d.estado] || ''}>
                {d.estado.replace(/_/g, ' ')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
      {documentos.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>Sin documentos registrados</p>
        </div>
      )}
    </div>
  );
}

// --- MAIN PWA PAGE ---
export default function ConductorPWAPage() {
  const [tab, setTab] = useState('jornada');
  const { noLeidas } = useNotificacionesConductor();

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">TransCaña</h1>
            <p className="text-xs opacity-80">Portal del Conductor</p>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 opacity-60" />
            <span className="text-xs opacity-60">GPS Activo</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {tab === 'jornada' && <JornadaTab />}
        {tab === 'checklist' && <ChecklistTab />}
        {tab === 'notificaciones' && <NotificacionesTab />}
        {tab === 'documentos' && <DocumentosTab />}
      </div>

      {/* Bottom Tab Bar */}
      <TabBar tab={tab} setTab={setTab} noLeidas={noLeidas} />
    </div>
  );
}
