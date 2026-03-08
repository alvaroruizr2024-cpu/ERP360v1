// ============================================================================
// TRANSCAÑA ERP - Sprint 15: Dashboard Mantenimiento de Flota
// Page: /mantenimiento-flota
// ============================================================================

'use client';

import React, { useState, useMemo } from 'react';
import {
  useKPIFlota, useFlotaResumen, useOrdenesTrabajoMto,
  useAlertasMantenimiento, useControlLlantas, useCombustible,
  usePlanesMantenimiento,
} from '@/hooks/useSprint15';
import type { FiltrosOT, OrdenTrabajoForm, PrioridadOT, EstadoOrdenTrabajo } from '@/types/sprint15';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Wrench, Fuel, CircleAlert, Truck, CircleCheck, Clock,
  TrendingUp, TrendingDown, BarChart3, Plus, Play, CheckCircle2,
  AlertTriangle, Shield, Gauge, Timer,
} from 'lucide-react';

// --- Color helpers ---
const prioridadColor: Record<PrioridadOT, string> = {
  critica: 'bg-red-100 text-red-800 border-red-300',
  alta: 'bg-orange-100 text-orange-800 border-orange-300',
  media: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  baja: 'bg-green-100 text-green-800 border-green-300',
};

const estadoOTColor: Record<string, string> = {
  programada: 'bg-blue-100 text-blue-800',
  en_espera_repuestos: 'bg-amber-100 text-amber-800',
  en_ejecucion: 'bg-purple-100 text-purple-800',
  completada: 'bg-green-100 text-green-800',
  cancelada: 'bg-gray-100 text-gray-800',
};

// --- KPI Card ---
function KPICard({ titulo, valor, icono: Icon, color, trend, suffix }: {
  titulo: string; valor: number | string; icono: any; color: string;
  trend?: number; suffix?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{titulo}</p>
            <p className="text-2xl font-bold mt-1">
              {typeof valor === 'number' ? valor.toLocaleString('es-PE') : valor}
              {suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{suffix}</span>}
            </p>
            {trend !== undefined && (
              <div className={`flex items-center text-xs mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {Math.abs(trend)}% vs mes anterior
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Flota Table ---
function FlotaTable({ flota }: { flota: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-3 font-medium">Placa</th>
            <th className="text-left p-3 font-medium">Tipo</th>
            <th className="text-center p-3 font-medium">KM Actual</th>
            <th className="text-center p-3 font-medium">OTs Pend.</th>
            <th className="text-center p-3 font-medium">Llantas Crít.</th>
            <th className="text-center p-3 font-medium">Rend. 30d</th>
            <th className="text-center p-3 font-medium">Alertas</th>
            <th className="text-center p-3 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody>
          {flota.map((v) => (
            <tr key={v.id} className="border-b hover:bg-muted/30 transition-colors">
              <td className="p-3 font-mono font-semibold">{v.placa}</td>
              <td className="p-3 capitalize">{v.tipo_vehiculo}</td>
              <td className="p-3 text-center">{v.km_actual?.toLocaleString()}</td>
              <td className="p-3 text-center">
                {v.ots_pendientes > 0 ? (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700">{v.ots_pendientes}</Badge>
                ) : <span className="text-green-600">0</span>}
              </td>
              <td className="p-3 text-center">
                {v.llantas_criticas > 0 ? (
                  <Badge variant="destructive">{v.llantas_criticas}</Badge>
                ) : <span className="text-green-600">0</span>}
              </td>
              <td className="p-3 text-center">
                {v.rendimiento_30d ? `${v.rendimiento_30d} km/gl` : '—'}
              </td>
              <td className="p-3 text-center">
                {v.alertas_activas > 0 ? (
                  <Badge variant="outline" className="bg-red-50 text-red-700">{v.alertas_activas}</Badge>
                ) : <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto" />}
              </td>
              <td className="p-3 text-center">
                <Badge className={v.estado === 'operativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {v.estado}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- OTs Table ---
function OTsTable({ ordenes, onCambiarEstado }: {
  ordenes: any[]; onCambiarEstado: (id: string, estado: string) => void;
}) {
  return (
    <div className="space-y-3">
      {ordenes.map((ot) => (
        <Card key={ot.id} className={`border-l-4 ${
          ot.prioridad === 'critica' ? 'border-l-red-500' :
          ot.prioridad === 'alta' ? 'border-l-orange-500' :
          ot.prioridad === 'media' ? 'border-l-yellow-500' : 'border-l-green-500'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-sm">{ot.numero_ot}</span>
                  <Badge className={estadoOTColor[ot.estado] || ''}>{ot.estado.replace(/_/g, ' ')}</Badge>
                  <Badge variant="outline" className={prioridadColor[ot.prioridad as PrioridadOT]}>
                    {ot.prioridad}
                  </Badge>
                  <Badge variant="outline">{ot.tipo}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{ot.descripcion}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3 h-3" /> {ot.vehiculo?.placa || '—'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(ot.fecha_programada).toLocaleDateString('es-PE')}
                  </span>
                  {ot.costo_total > 0 && (
                    <span>S/ {ot.costo_total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                {ot.estado === 'programada' && (
                  <Button size="sm" variant="outline" onClick={() => onCambiarEstado(ot.id, 'en_ejecucion')}>
                    <Play className="w-3 h-3 mr-1" /> Iniciar
                  </Button>
                )}
                {ot.estado === 'en_ejecucion' && (
                  <Button size="sm" variant="default" onClick={() => onCambiarEstado(ot.id, 'completada')}>
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Completar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {ordenes.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No hay órdenes de trabajo con los filtros seleccionados</p>
        </div>
      )}
    </div>
  );
}

// --- Alertas Panel ---
function AlertasPanel({ alertas, onResolver }: { alertas: any[]; onResolver: (id: string) => void }) {
  if (!alertas.length) return (
    <div className="text-center py-8 text-muted-foreground">
      <Shield className="w-10 h-10 mx-auto mb-2 opacity-30" />
      <p>Sin alertas activas</p>
    </div>
  );

  return (
    <div className="space-y-2">
      {alertas.map((a) => (
        <div key={a.id} className={`flex items-center justify-between p-3 rounded-lg border ${
          a.severidad === 'critica' ? 'bg-red-50 border-red-200' :
          a.severidad === 'alta' ? 'bg-orange-50 border-orange-200' :
          'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-5 h-5 ${
              a.severidad === 'critica' ? 'text-red-600' : 'text-orange-600'
            }`} />
            <div>
              <p className="text-sm font-medium">{a.titulo}</p>
              <p className="text-xs text-muted-foreground">
                {a.vehiculo?.placa} — {a.descripcion}
              </p>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={() => onResolver(a.id)}>
            Resolver
          </Button>
        </div>
      ))}
    </div>
  );
}

// --- MAIN PAGE ---
export default function MantenimientoFlotaPage() {
  const [tab, setTab] = useState('dashboard');
  const [filtrosOT, setFiltrosOT] = useState<FiltrosOT>({});

  const { kpis, loading: kpiLoading } = useKPIFlota();
  const { flota, loading: flotaLoading } = useFlotaResumen();
  const { ordenes, loading: otLoading, actualizarEstado, generarOTsPreventivas } = useOrdenesTrabajoMto(filtrosOT);
  const { alertas, resolverAlerta } = useAlertasMantenimiento();
  const { proyecciones } = useControlLlantas();
  const { cargas } = useCombustible();

  const [generando, setGenerando] = useState(false);

  const handleGenerarOTs = async () => {
    setGenerando(true);
    try {
      const result = await generarOTsPreventivas();
      alert(`Se generaron ${result?.length || 0} OTs preventivas`);
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wrench className="w-6 h-6 text-primary" />
              Mantenimiento de Flota (TPM)
            </h1>
            <p className="text-sm text-muted-foreground">
              TransCaña ERP — Sprint 15 | Grupo Galarreta
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleGenerarOTs} disabled={generando}>
              {generando ? <Timer className="w-4 h-4 mr-2 animate-spin" /> : <Gauge className="w-4 h-4 mr-2" />}
              Generar OTs Preventivas
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="ordenes">Órdenes de Trabajo</TabsTrigger>
            <TabsTrigger value="flota">Flota</TabsTrigger>
            <TabsTrigger value="llantas">Llantas</TabsTrigger>
            <TabsTrigger value="combustible">Combustible</TabsTrigger>
            <TabsTrigger value="alertas">
              Alertas {alertas.length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">{alertas.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* TAB: Dashboard */}
          <TabsContent value="dashboard">
            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              <KPICard titulo="Vehículos Operativos" valor={kpis?.vehiculos_operativos || 0}
                icono={Truck} color="bg-green-600" suffix={`/ ${kpis?.total_vehiculos || 0}`} />
              <KPICard titulo="En Taller" valor={kpis?.vehiculos_en_taller || 0}
                icono={Wrench} color="bg-orange-600" />
              <KPICard titulo="OTs Pendientes" valor={kpis?.ot_pendientes || 0}
                icono={Clock} color="bg-blue-600" />
              <KPICard titulo="Costo Mto. 30d" valor={`S/ ${(kpis?.costo_mto_periodo || 0).toLocaleString('es-PE')}`}
                icono={BarChart3} color="bg-purple-600" />
              <KPICard titulo="Rend. Promedio" valor={kpis?.rendimiento_promedio_kmgl || 0}
                icono={Fuel} color="bg-teal-600" suffix="km/gl" />
              <KPICard titulo="Llantas Críticas" valor={kpis?.llantas_criticas || 0}
                icono={CircleAlert} color="bg-red-600" />
            </div>

            {/* Alertas + Flota */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Resumen de Flota</CardTitle>
                </CardHeader>
                <CardContent>
                  <FlotaTable flota={flota} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Alertas Activas
                    <Badge variant="destructive">{alertas.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AlertasPanel alertas={alertas.slice(0, 8)} onResolver={resolverAlerta} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB: Órdenes de Trabajo */}
          <TabsContent value="ordenes">
            <div className="flex items-center gap-3 mb-4">
              <Select onValueChange={(v) => setFiltrosOT(f => ({ ...f, estado: v as any }))}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="programada">Programadas</SelectItem>
                  <SelectItem value="en_ejecucion">En Ejecución</SelectItem>
                  <SelectItem value="en_espera_repuestos">Espera Repuestos</SelectItem>
                  <SelectItem value="completada">Completadas</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={(v) => setFiltrosOT(f => ({ ...f, prioridad: v as any }))}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Prioridad" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critica">Crítica</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <OTsTable ordenes={ordenes} onCambiarEstado={actualizarEstado} />
          </TabsContent>

          {/* TAB: Flota */}
          <TabsContent value="flota">
            <Card>
              <CardHeader>
                <CardTitle>Estado de la Flota</CardTitle>
                <CardDescription>Vista consolidada de todos los vehículos</CardDescription>
              </CardHeader>
              <CardContent>
                <FlotaTable flota={flota} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Llantas */}
          <TabsContent value="llantas">
            <Card>
              <CardHeader>
                <CardTitle>Proyección de Vida Útil de Llantas</CardTitle>
                <CardDescription>Análisis predictivo de reemplazo y reencauche</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3">Vehículo</th>
                        <th className="text-center p-3">Posición</th>
                        <th className="text-left p-3">Marca</th>
                        <th className="text-center p-3">Prof. Actual</th>
                        <th className="text-center p-3">Prof. Mín.</th>
                        <th className="text-center p-3">KM Restantes</th>
                        <th className="text-center p-3">Días Rest.</th>
                        <th className="text-center p-3">S//km</th>
                        <th className="text-center p-3">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proyecciones.map((p) => (
                        <tr key={p.llanta_id} className="border-b hover:bg-muted/30">
                          <td className="p-3 font-mono">{p.vehiculo_placa}</td>
                          <td className="p-3 text-center font-mono">{p.posicion}</td>
                          <td className="p-3">{p.marca}</td>
                          <td className="p-3 text-center">{p.profundidad_actual} mm</td>
                          <td className="p-3 text-center">{p.profundidad_minima} mm</td>
                          <td className="p-3 text-center">{p.km_restantes_estimados.toLocaleString()}</td>
                          <td className="p-3 text-center">{p.dias_restantes_estimados}</td>
                          <td className="p-3 text-center">{p.costo_km?.toFixed(4)}</td>
                          <td className="p-3 text-center">
                            <Badge className={
                              p.accion_recomendada === 'BAJA INMEDIATA' ? 'bg-red-600 text-white' :
                              p.accion_recomendada === 'PROGRAMAR REENCAUCHE' ? 'bg-orange-500 text-white' :
                              p.accion_recomendada === 'MONITOREAR' ? 'bg-yellow-500 text-white' :
                              'bg-green-500 text-white'
                            }>{p.accion_recomendada}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Combustible */}
          <TabsContent value="combustible">
            <Card>
              <CardHeader>
                <CardTitle>Control de Combustible</CardTitle>
                <CardDescription>Registro de cargas y análisis de rendimiento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3">Fecha</th>
                        <th className="text-left p-3">Vehículo</th>
                        <th className="text-center p-3">KM</th>
                        <th className="text-center p-3">Galones</th>
                        <th className="text-center p-3">S//gl</th>
                        <th className="text-center p-3">Total</th>
                        <th className="text-center p-3">Rend.</th>
                        <th className="text-center p-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cargas.map((c) => (
                        <tr key={c.id} className="border-b hover:bg-muted/30">
                          <td className="p-3">{new Date(c.fecha_carga).toLocaleDateString('es-PE')}</td>
                          <td className="p-3 font-mono">{c.vehiculo?.placa}</td>
                          <td className="p-3 text-center">{c.km_odometro.toLocaleString()}</td>
                          <td className="p-3 text-center">{c.galones}</td>
                          <td className="p-3 text-center">S/ {c.precio_galon.toFixed(2)}</td>
                          <td className="p-3 text-center font-semibold">S/ {c.monto_total.toFixed(2)}</td>
                          <td className="p-3 text-center">
                            {c.rendimiento_km_galon ? (
                              <span className={c.rendimiento_km_galon < 3 ? 'text-red-600' : 'text-green-600'}>
                                {c.rendimiento_km_galon} km/gl
                              </span>
                            ) : '—'}
                          </td>
                          <td className="p-3 text-center">
                            {c.validado ? (
                              <Badge className="bg-green-100 text-green-800">Validado</Badge>
                            ) : (
                              <Badge variant="outline">Pendiente</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Alertas */}
          <TabsContent value="alertas">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Centro de Alertas de Mantenimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AlertasPanel alertas={alertas} onResolver={resolverAlerta} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
