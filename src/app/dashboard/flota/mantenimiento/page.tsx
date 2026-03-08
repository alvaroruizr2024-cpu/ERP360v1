'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  useKPIFlota, useFlotaResumen, useOrdenesTrabajoMto,
  useAlertasMantenimiento, useControlLlantas, useCombustible,
} from '@/hooks/useSprint15';
import type { FiltrosOT } from '@/types/sprint15';
import { Wrench, Fuel, Truck, Clock, BarChart3, Play, CheckCircle2, AlertTriangle, Gauge, ArrowLeft, CircleDot } from 'lucide-react';

const prioridadColor: Record<string,string> = { critica:'bg-red-900/50 text-red-400', alta:'bg-orange-900/50 text-orange-400', media:'bg-yellow-900/50 text-yellow-400', baja:'bg-green-900/50 text-green-400' };
const estadoOTColor: Record<string,string> = { programada:'bg-blue-900/50 text-blue-400', en_espera_repuestos:'bg-amber-900/50 text-amber-400', en_ejecucion:'bg-purple-900/50 text-purple-400', completada:'bg-green-900/50 text-green-400', cancelada:'bg-slate-700 text-slate-300' };

function KPICard({titulo,valor,icono:Icon,color,suffix}:{titulo:string;valor:number|string;icono:any;color:string;suffix?:string}) {
  return (<div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{titulo}</p><p className="text-2xl font-bold text-white mt-1">{typeof valor==='number'?valor.toLocaleString('es-PE'):valor}{suffix&&<span className="text-sm font-normal text-slate-400 ml-1">{suffix}</span>}</p></div><div className={`p-3 rounded-xl ${color}`}><Icon className="w-5 h-5 text-white"/></div></div></div>);
}

export default function MantenimientoFlotaPage() {
  const [tab,setTab]=useState<string>('dashboard');
  const [filtrosOT,setFiltrosOT]=useState<FiltrosOT>({});
  const {kpis}=useKPIFlota();
  const {flota}=useFlotaResumen();
  const {ordenes,actualizarEstado,generarOTsPreventivas}=useOrdenesTrabajoMto(filtrosOT);
  const {alertas,resolverAlerta}=useAlertasMantenimiento();
  const {proyecciones}=useControlLlantas();
  const {cargas}=useCombustible();
  const [generando,setGenerando]=useState(false);

  const handleGenerarOTs=async()=>{setGenerando(true);try{const r=await generarOTsPreventivas();alert(`Se generaron ${r?.length||0} OTs preventivas`);}catch(e:any){alert('Error: '+e.message);}finally{setGenerando(false);}};

  const tabs=[{id:'dashboard',label:'Dashboard'},{id:'ordenes',label:'Órdenes de Trabajo'},{id:'llantas',label:'Llantas'},{id:'combustible',label:'Combustible'},{id:'alertas',label:`Alertas (${alertas.length})`}];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/flota" className="text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5"/></Link>
          <div><h1 className="text-2xl font-bold text-white flex items-center gap-2"><Wrench className="w-6 h-6 text-emerald-400"/>Mantenimiento TPM</h1><p className="text-sm text-slate-400">Sprint 15 | Grupo Galarreta</p></div>
        </div>
        <button onClick={handleGenerarOTs} disabled={generando} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium flex items-center gap-2"><Gauge className="w-4 h-4"/>{generando?'Generando...':'Generar OTs Preventivas'}</button>
      </div>

      <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
        {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab===t.id?'bg-slate-700 text-white':'text-slate-400 hover:text-white'}`}>{t.label}</button>)}
      </div>

      {tab==='dashboard'&&<>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KPICard titulo="Operativos" valor={kpis?.vehiculos_operativos||0} icono={Truck} color="bg-green-600" suffix={`/ ${kpis?.total_vehiculos||0}`}/>
          <KPICard titulo="En Taller" valor={kpis?.vehiculos_en_taller||0} icono={Wrench} color="bg-orange-600"/>
          <KPICard titulo="OTs Pendientes" valor={kpis?.ot_pendientes||0} icono={Clock} color="bg-blue-600"/>
          <KPICard titulo="Costo Mto 30d" valor={`S/${(kpis?.costo_mto_periodo||0).toLocaleString('es-PE')}`} icono={BarChart3} color="bg-purple-600"/>
          <KPICard titulo="Rend. Prom." valor={kpis?.rendimiento_promedio_kmgl||0} icono={Fuel} color="bg-teal-600" suffix="km/gl"/>
          <KPICard titulo="Llantas Crít." valor={kpis?.llantas_criticas||0} icono={CircleDot} color="bg-red-600"/>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700"><h2 className="text-lg font-semibold text-white">Resumen de Flota</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm"><thead><tr className="border-b border-slate-700 bg-slate-800">
              <th className="text-left p-3 text-slate-400 font-medium">Placa</th><th className="text-left p-3 text-slate-400">Tipo</th><th className="text-center p-3 text-slate-400">KM</th><th className="text-center p-3 text-slate-400">OTs</th><th className="text-center p-3 text-slate-400">Llantas</th><th className="text-center p-3 text-slate-400">Rend.</th><th className="text-center p-3 text-slate-400">Estado</th>
            </tr></thead><tbody>
              {flota.map(v=><tr key={v.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="p-3 font-mono font-semibold text-white">{v.placa}</td><td className="p-3 text-slate-300 capitalize">{v.tipo_vehiculo}</td><td className="p-3 text-center text-slate-300">{v.km_actual?.toLocaleString()}</td>
                <td className="p-3 text-center">{v.ots_pendientes>0?<span className="px-2 py-0.5 rounded bg-amber-900/50 text-amber-400 text-xs">{v.ots_pendientes}</span>:<span className="text-green-400">0</span>}</td>
                <td className="p-3 text-center">{v.llantas_criticas>0?<span className="px-2 py-0.5 rounded bg-red-900/50 text-red-400 text-xs">{v.llantas_criticas}</span>:<span className="text-green-400">0</span>}</td>
                <td className="p-3 text-center text-slate-300">{v.rendimiento_30d?`${v.rendimiento_30d} km/gl`:'—'}</td>
                <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded text-xs ${v.estado==='operativo'?'bg-green-900/50 text-green-400':'bg-slate-700 text-slate-300'}`}>{v.estado}</span></td>
              </tr>)}
            </tbody></table>
            {flota.length===0&&<div className="text-center py-12 text-slate-500"><Truck className="w-12 h-12 mx-auto mb-3 opacity-30"/><p>Sin vehículos registrados</p></div>}
          </div>
        </div>
      </>}

      {tab==='ordenes'&&<div className="space-y-3">
        <div className="flex gap-3 mb-4">
          <select onChange={e=>setFiltrosOT(f=>({...f,estado:e.target.value as any||undefined}))} className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm"><option value="">Todos los estados</option><option value="programada">Programadas</option><option value="en_ejecucion">En Ejecución</option><option value="completada">Completadas</option></select>
          <select onChange={e=>setFiltrosOT(f=>({...f,prioridad:e.target.value as any||undefined}))} className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm"><option value="">Todas las prioridades</option><option value="critica">Crítica</option><option value="alta">Alta</option><option value="media">Media</option></select>
        </div>
        {ordenes.map(ot=><div key={ot.id} className={`bg-slate-800/50 border rounded-xl p-4 ${ot.prioridad==='critica'?'border-l-4 border-l-red-500 border-slate-700':ot.prioridad==='alta'?'border-l-4 border-l-orange-500 border-slate-700':'border-slate-700'}`}>
          <div className="flex items-start justify-between"><div>
            <div className="flex items-center gap-2 mb-1"><span className="font-mono font-bold text-sm text-white">{ot.numero_ot}</span><span className={`px-2 py-0.5 rounded text-xs ${estadoOTColor[ot.estado]||''}`}>{ot.estado.replace(/_/g,' ')}</span><span className={`px-2 py-0.5 rounded text-xs ${prioridadColor[ot.prioridad]||''}`}>{ot.prioridad}</span></div>
            <p className="text-sm text-slate-300">{ot.descripcion}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500"><span className="flex items-center gap-1"><Truck className="w-3 h-3"/>{ot.vehiculo?.placa||'—'}</span><span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{new Date(ot.fecha_programada).toLocaleDateString('es-PE')}</span></div>
          </div>
          <div className="flex gap-2">
            {ot.estado==='programada'&&<button onClick={()=>actualizarEstado(ot.id,'en_ejecucion')} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs flex items-center gap-1"><Play className="w-3 h-3"/>Iniciar</button>}
            {ot.estado==='en_ejecucion'&&<button onClick={()=>actualizarEstado(ot.id,'completada')} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/>Completar</button>}
          </div></div>
        </div>)}
        {ordenes.length===0&&<div className="text-center py-12 text-slate-500"><Wrench className="w-12 h-12 mx-auto mb-3 opacity-30"/><p>No hay órdenes de trabajo</p></div>}
      </div>}

      {tab==='llantas'&&<div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden"><div className="px-4 py-3 border-b border-slate-700"><h2 className="text-lg font-semibold text-white">Proyección de Vida Útil</h2></div>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-700 bg-slate-800"><th className="text-left p-3 text-slate-400">Vehículo</th><th className="text-center p-3 text-slate-400">Pos</th><th className="text-left p-3 text-slate-400">Marca</th><th className="text-center p-3 text-slate-400">Prof</th><th className="text-center p-3 text-slate-400">KM Rest</th><th className="text-center p-3 text-slate-400">Días</th><th className="text-center p-3 text-slate-400">Acción</th></tr></thead><tbody>
          {proyecciones.map(p=><tr key={p.llanta_id} className="border-b border-slate-700/50 hover:bg-slate-700/30"><td className="p-3 font-mono text-white">{p.vehiculo_placa}</td><td className="p-3 text-center font-mono text-slate-300">{p.posicion}</td><td className="p-3 text-slate-300">{p.marca}</td><td className="p-3 text-center text-slate-300">{p.profundidad_actual}mm</td><td className="p-3 text-center text-slate-300">{p.km_restantes_estimados?.toLocaleString()}</td><td className="p-3 text-center text-slate-300">{p.dias_restantes_estimados}</td>
            <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded text-xs font-bold ${p.accion_recomendada==='BAJA INMEDIATA'?'bg-red-600 text-white':p.accion_recomendada==='PROGRAMAR REENCAUCHE'?'bg-orange-600 text-white':p.accion_recomendada==='MONITOREAR'?'bg-yellow-600 text-white':'bg-green-600 text-white'}`}>{p.accion_recomendada}</span></td></tr>)}
        </tbody></table></div></div>}

      {tab==='combustible'&&<div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden"><div className="px-4 py-3 border-b border-slate-700"><h2 className="text-lg font-semibold text-white">Control de Combustible</h2></div>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-700 bg-slate-800"><th className="text-left p-3 text-slate-400">Fecha</th><th className="text-left p-3 text-slate-400">Vehículo</th><th className="text-center p-3 text-slate-400">KM</th><th className="text-center p-3 text-slate-400">Gl</th><th className="text-center p-3 text-slate-400">Total</th><th className="text-center p-3 text-slate-400">Rend</th></tr></thead><tbody>
          {cargas.map(c=><tr key={c.id} className="border-b border-slate-700/50 hover:bg-slate-700/30"><td className="p-3 text-slate-300">{new Date(c.fecha_carga).toLocaleDateString('es-PE')}</td><td className="p-3 font-mono text-white">{c.vehiculo?.placa}</td><td className="p-3 text-center text-slate-300">{c.km_odometro?.toLocaleString()}</td><td className="p-3 text-center text-slate-300">{c.galones}</td><td className="p-3 text-center font-semibold text-white">S/{c.monto_total?.toFixed(2)}</td>
            <td className="p-3 text-center">{c.rendimiento_km_galon?<span className={c.rendimiento_km_galon<3?'text-red-400':'text-green-400'}>{c.rendimiento_km_galon} km/gl</span>:'—'}</td></tr>)}
        </tbody></table></div></div>}

      {tab==='alertas'&&<div className="space-y-2">
        {alertas.map(a=><div key={a.id} className={`flex items-center justify-between p-4 rounded-xl border ${a.severidad==='critica'?'bg-red-900/20 border-red-800':a.severidad==='alta'?'bg-orange-900/20 border-orange-800':'bg-yellow-900/20 border-yellow-800'}`}>
          <div className="flex items-center gap-3"><AlertTriangle className={`w-5 h-5 ${a.severidad==='critica'?'text-red-400':'text-orange-400'}`}/><div><p className="text-sm font-medium text-white">{a.titulo}</p><p className="text-xs text-slate-400">{a.vehiculo?.placa} — {a.descripcion}</p></div></div>
          <button onClick={()=>resolverAlerta(a.id)} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs">Resolver</button>
        </div>)}
        {alertas.length===0&&<div className="text-center py-12 text-slate-500"><CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30"/><p>Sin alertas activas</p></div>}
      </div>}
    </div>
  );
}
