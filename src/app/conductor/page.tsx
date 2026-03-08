'use client';
import React, { useState } from 'react';
import { useJornadaConductor, useChecklistPreoperativo, useNotificacionesConductor, useDocumentosConductor } from '@/hooks/useSprint15';
import type { ChecklistItem } from '@/types/sprint15';
import { Truck, ClipboardCheck, Bell, FileText, Play, Square, Check, X, MapPin, Wrench } from 'lucide-react';

const CHECKLIST_TEMPLATE: ChecklistItem[] = [
  {categoria:'Motor',item:'Nivel de aceite',obligatorio:true},{categoria:'Motor',item:'Nivel de refrigerante',obligatorio:true},
  {categoria:'Frenos',item:'Pedal de freno',obligatorio:true},{categoria:'Frenos',item:'Freno de estacionamiento',obligatorio:true},
  {categoria:'Llantas',item:'Presión visual',obligatorio:true},{categoria:'Llantas',item:'Banda de rodamiento',obligatorio:true},{categoria:'Llantas',item:'Tuercas ajustadas',obligatorio:true},
  {categoria:'Luces',item:'Faros delanteros',obligatorio:true},{categoria:'Luces',item:'Luces traseras',obligatorio:true},{categoria:'Luces',item:'Direccionales',obligatorio:true},
  {categoria:'Seguridad',item:'Extintor',obligatorio:true},{categoria:'Seguridad',item:'Botiquín',obligatorio:true},{categoria:'Seguridad',item:'Triángulos',obligatorio:true},{categoria:'Seguridad',item:'Cinturón',obligatorio:true},
  {categoria:'Cabina',item:'Espejos retrovisores',obligatorio:true},{categoria:'Cabina',item:'Limpiaparabrisas',obligatorio:false},{categoria:'Cabina',item:'Bocina',obligatorio:true},
  {categoria:'Documentos',item:'SOAT vigente',obligatorio:true},{categoria:'Documentos',item:'Revisión técnica',obligatorio:true},
];

function TabBar({tab,setTab,noLeidas}:{tab:string;setTab:(t:string)=>void;noLeidas:number}) {
  const tabs=[{id:'jornada',icon:Truck,label:'Jornada'},{id:'checklist',icon:ClipboardCheck,label:'Checklist'},{id:'notificaciones',icon:Bell,label:'Alertas'},{id:'documentos',icon:FileText,label:'Docs'}];
  return (<div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 flex z-50">
    {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`flex-1 flex flex-col items-center py-2 relative ${tab===t.id?'text-emerald-400':'text-slate-500'}`}>
      <t.icon className="w-5 h-5"/><span className="text-[10px] mt-0.5 font-medium">{t.label}</span>
      {t.id==='notificaciones'&&noLeidas>0&&<span className="absolute top-1 right-1/4 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">{noLeidas}</span>}
    </button>)}
  </div>);
}

function JornadaTab() {
  const {jornada,historial,iniciarJornada,finalizarJornada}=useJornadaConductor();
  const [kmInicio,setKmInicio]=useState('');const [kmFin,setKmFin]=useState('');const [vehiculoId,setVehiculoId]=useState('');
  return (<div className="space-y-4">
    <div className={`bg-slate-800 border rounded-xl p-4 ${jornada?.hora_inicio&&!jornada?.hora_fin?'border-emerald-600':'border-slate-700'}`}>
      {!jornada?.hora_inicio?<div className="space-y-3">
        <h3 className="font-semibold text-lg text-white">Iniciar Jornada</h3>
        <input placeholder="ID Vehículo" value={vehiculoId} onChange={e=>setVehiculoId(e.target.value)} className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"/>
        <input placeholder="KM Odómetro" type="number" value={kmInicio} onChange={e=>setKmInicio(e.target.value)} className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"/>
        <button onClick={()=>vehiculoId&&kmInicio&&iniciarJornada(vehiculoId,parseInt(kmInicio))} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"><Play className="w-5 h-5"/>Iniciar Jornada</button>
      </div>:!jornada?.hora_fin?<div className="space-y-3">
        <div className="flex items-center justify-between"><h3 className="font-semibold text-lg text-emerald-400">Jornada en Curso</h3><span className="px-2 py-0.5 bg-emerald-600 text-white text-xs rounded animate-pulse">ACTIVA</span></div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-700 rounded-lg p-3"><p className="text-slate-400 text-xs">Inicio</p><p className="font-semibold text-white">{new Date(jornada.hora_inicio!).toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'})}</p></div>
          <div className="bg-slate-700 rounded-lg p-3"><p className="text-slate-400 text-xs">KM Inicio</p><p className="font-semibold text-white">{jornada.km_inicio?.toLocaleString()}</p></div>
          <div className="bg-slate-700 rounded-lg p-3"><p className="text-slate-400 text-xs">Viajes</p><p className="font-semibold text-white text-xl">{jornada.viajes_completados}</p></div>
          <div className="bg-slate-700 rounded-lg p-3"><p className="text-slate-400 text-xs">Toneladas</p><p className="font-semibold text-white text-xl">{jornada.toneladas_transportadas}</p></div>
        </div>
        <input placeholder="KM Odómetro final" type="number" value={kmFin} onChange={e=>setKmFin(e.target.value)} className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"/>
        <button onClick={()=>kmFin&&finalizarJornada(parseInt(kmFin))} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"><Square className="w-5 h-5"/>Finalizar Jornada</button>
      </div>:<div className="text-center py-4"><Check className="w-12 h-12 text-green-400 mx-auto mb-2"/><p className="font-semibold text-white">Jornada Completada</p><p className="text-sm text-slate-400">{jornada.km_recorridos?.toLocaleString()} km — {jornada.viajes_completados} viajes</p></div>}
    </div>
    <div className="bg-slate-800 border border-slate-700 rounded-xl">
      <div className="px-4 py-3 border-b border-slate-700"><h3 className="text-base font-semibold text-white">Últimas Jornadas</h3></div>
      {historial.slice(0,7).map(j=><div key={j.id} className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 last:border-0">
        <div><p className="text-sm font-medium text-white">{new Date(j.fecha).toLocaleDateString('es-PE',{weekday:'short',day:'numeric',month:'short'})}</p><p className="text-xs text-slate-400">{j.km_recorridos?.toLocaleString()} km • {j.viajes_completados} viajes</p></div>
        <div className="text-right"><p className="text-sm font-semibold text-white">{j.toneladas_transportadas} tn</p></div>
      </div>)}
    </div>
  </div>);
}

function ChecklistTab() {
  const {enviarChecklist}=useChecklistPreoperativo();
  const [items,setItems]=useState<ChecklistItem[]>(CHECKLIST_TEMPLATE.map(t=>({...t,ok:undefined,observacion:''})));
  const [kmOdometro,setKmOdometro]=useState('');const [turno,setTurno]=useState('mañana');const [enviando,setEnviando]=useState(false);
  const toggleItem=(idx:number,value:boolean)=>{setItems(prev=>{const next=[...prev];next[idx]={...next[idx],ok:value};return next;});};
  const completados=items.filter(i=>i.ok!==undefined).length;const porcentaje=Math.round((completados/items.length)*100);
  const categorias=[...new Set(items.map(i=>i.categoria))];
  const handleEnviar=async()=>{setEnviando(true);try{await enviarChecklist({vehiculo_id:'',turno,km_odometro:parseInt(kmOdometro)||0,items,observaciones_generales:''});alert('Checklist enviado');}catch(e:any){alert('Error: '+e.message);}finally{setEnviando(false);}};

  return (<div className="space-y-4">
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-white">Progreso</span><span className="text-sm text-slate-400">{completados}/{items.length}</span></div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{width:`${porcentaje}%`}}/></div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <input placeholder="KM Odómetro" type="number" value={kmOdometro} onChange={e=>setKmOdometro(e.target.value)} className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"/>
        <select value={turno} onChange={e=>setTurno(e.target.value)} className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"><option value="mañana">Mañana</option><option value="tarde">Tarde</option><option value="noche">Noche</option></select>
      </div>
    </div>
    {categorias.map(cat=><div key={cat} className="bg-slate-800 border border-slate-700 rounded-xl">
      <div className="px-4 py-2 border-b border-slate-700"><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{cat}</h3></div>
      {items.map((item,idx)=>({item,idx})).filter(({item})=>item.categoria===cat).map(({item,idx})=><div key={idx} className={`flex items-center justify-between px-4 py-3 border-b border-slate-700/50 last:border-0 ${item.ok===true?'bg-green-900/10':item.ok===false?'bg-red-900/10':''}`}>
        <p className="text-sm text-white flex-1">{item.item}{item.obligatorio&&<span className="text-red-400 ml-1">*</span>}</p>
        <div className="flex gap-2">
          <button onClick={()=>toggleItem(idx,true)} className={`w-10 h-10 rounded-full flex items-center justify-center ${item.ok===true?'bg-green-600 text-white':'bg-slate-700 text-slate-500'}`}><Check className="w-5 h-5"/></button>
          <button onClick={()=>toggleItem(idx,false)} className={`w-10 h-10 rounded-full flex items-center justify-center ${item.ok===false?'bg-red-600 text-white':'bg-slate-700 text-slate-500'}`}><X className="w-5 h-5"/></button>
        </div>
      </div>)}
    </div>)}
    <button onClick={handleEnviar} disabled={enviando} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-medium flex items-center justify-center gap-2"><ClipboardCheck className="w-5 h-5"/>{enviando?'Enviando...':'Enviar Checklist'}</button>
  </div>);
}

function NotificacionesTab() {
  const {notificaciones,noLeidas,marcarLeida,marcarTodasLeidas}=useNotificacionesConductor();
  return (<div className="space-y-2">
    {noLeidas>0&&<button onClick={marcarTodasLeidas} className="w-full py-2 text-sm text-slate-400 hover:text-white">Marcar todas como leídas ({noLeidas})</button>}
    {notificaciones.map(n=><div key={n.id} onClick={()=>!n.leida&&marcarLeida(n.id)} className={`bg-slate-800 border rounded-xl p-3 cursor-pointer ${!n.leida?'border-blue-700 bg-blue-900/10':'border-slate-700'}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${n.prioridad==='critica'?'bg-red-900/50':n.prioridad==='alta'?'bg-orange-900/50':'bg-blue-900/50'}`}>
          {n.tipo==='documento_vencido'?<FileText className="w-4 h-4 text-white"/>:n.tipo==='mantenimiento_programado'?<Wrench className="w-4 h-4 text-white"/>:<Bell className="w-4 h-4 text-white"/>}
        </div>
        <div className="flex-1"><p className="text-sm font-medium text-white">{n.titulo}</p><p className="text-xs text-slate-400 mt-0.5">{n.mensaje}</p><p className="text-[10px] text-slate-500 mt-1">{new Date(n.created_at).toLocaleString('es-PE')}</p></div>
        {!n.leida&&<div className="w-2 h-2 bg-blue-500 rounded-full mt-2"/>}
      </div>
    </div>)}
    {notificaciones.length===0&&<div className="text-center py-12 text-slate-500"><Bell className="w-10 h-10 mx-auto mb-2 opacity-30"/><p>Sin notificaciones</p></div>}
  </div>);
}

function DocumentosTab() {
  const {documentos}=useDocumentosConductor();
  const ec:Record<string,string>={vigente:'bg-green-900/50 text-green-400',por_vencer:'bg-yellow-900/50 text-yellow-400',vencido:'bg-red-900/50 text-red-400',en_tramite:'bg-blue-900/50 text-blue-400'};
  return (<div className="space-y-3">
    {documentos.map(d=><div key={d.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div><p className="text-sm font-medium text-white capitalize">{d.tipo_documento.replace(/_/g,' ')}</p>{d.numero_documento&&<p className="text-xs text-slate-400 font-mono">{d.numero_documento}</p>}{d.fecha_vencimiento&&<p className="text-xs text-slate-500 mt-1">Vence: {new Date(d.fecha_vencimiento).toLocaleDateString('es-PE')}</p>}</div>
        <span className={`px-2 py-0.5 rounded text-xs ${ec[d.estado]||'bg-slate-700 text-slate-300'}`}>{d.estado.replace(/_/g,' ')}</span>
      </div>
    </div>)}
    {documentos.length===0&&<div className="text-center py-12 text-slate-500"><FileText className="w-10 h-10 mx-auto mb-2 opacity-30"/><p>Sin documentos</p></div>}
  </div>);
}

export default function ConductorPWAPage() {
  const [tab,setTab]=useState('jornada');
  const {noLeidas}=useNotificacionesConductor();
  return (<div className="min-h-screen bg-slate-900 pb-16">
    <div className="bg-emerald-700 text-white px-4 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between"><div><h1 className="text-lg font-bold">TransCaña</h1><p className="text-xs opacity-80">Portal del Conductor</p></div><div className="flex items-center gap-2"><MapPin className="w-4 h-4 opacity-60"/><span className="text-xs opacity-60">GPS</span></div></div>
    </div>
    <div className="p-4">
      {tab==='jornada'&&<JornadaTab/>}
      {tab==='checklist'&&<ChecklistTab/>}
      {tab==='notificaciones'&&<NotificacionesTab/>}
      {tab==='documentos'&&<DocumentosTab/>}
    </div>
    <TabBar tab={tab} setTab={setTab} noLeidas={noLeidas}/>
  </div>);
}
