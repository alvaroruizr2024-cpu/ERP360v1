'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useJornadaConductor, useChecklistPreoperativo, useNotificacionesConductor, useDocumentosConductor } from '@/hooks/useSprint15';
import { createClient } from '@/lib/supabase/client';
import type { ChecklistItem } from '@/types/sprint15';
import { Truck, ClipboardCheck, Bell, FileText, Play, Square, Check, X, MapPin, Wrench, ScanLine, Camera, Upload, Loader2, Brain } from 'lucide-react';

const supabase = createClient();

// ============ CHECKLIST TEMPLATE ============
const CHECKLIST_TEMPLATE: ChecklistItem[] = [
  {categoria:'Motor',item:'Nivel de aceite',obligatorio:true},{categoria:'Motor',item:'Nivel de refrigerante',obligatorio:true},
  {categoria:'Frenos',item:'Pedal de freno',obligatorio:true},{categoria:'Frenos',item:'Freno de estacionamiento',obligatorio:true},
  {categoria:'Llantas',item:'Presión visual',obligatorio:true},{categoria:'Llantas',item:'Banda de rodamiento',obligatorio:true},{categoria:'Llantas',item:'Tuercas ajustadas',obligatorio:true},
  {categoria:'Luces',item:'Faros delanteros',obligatorio:true},{categoria:'Luces',item:'Luces traseras',obligatorio:true},{categoria:'Luces',item:'Direccionales',obligatorio:true},
  {categoria:'Seguridad',item:'Extintor',obligatorio:true},{categoria:'Seguridad',item:'Botiquín',obligatorio:true},{categoria:'Seguridad',item:'Triángulos',obligatorio:true},{categoria:'Seguridad',item:'Cinturón',obligatorio:true},
  {categoria:'Cabina',item:'Espejos retrovisores',obligatorio:true},{categoria:'Cabina',item:'Limpiaparabrisas',obligatorio:false},{categoria:'Cabina',item:'Bocina',obligatorio:true},
  {categoria:'Documentos',item:'SOAT vigente',obligatorio:true},{categoria:'Documentos',item:'Revisión técnica',obligatorio:true},
];

// ============ TAB BAR ============
function TabBar({tab,setTab,noLeidas}:{tab:string;setTab:(t:string)=>void;noLeidas:number}) {
  const tabs=[{id:'escanear',icon:ScanLine,label:'Escanear'},{id:'jornada',icon:Truck,label:'Jornada'},{id:'checklist',icon:ClipboardCheck,label:'Check'},{id:'notificaciones',icon:Bell,label:'Alertas'},{id:'documentos',icon:FileText,label:'Docs'}];
  return (<div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 flex z-50">
    {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`flex-1 flex flex-col items-center py-2 relative ${tab===t.id?'text-emerald-400':'text-slate-500'}`}>
      <t.icon className="w-5 h-5"/><span className="text-[10px] mt-0.5 font-medium">{t.label}</span>
      {t.id==='notificaciones'&&noLeidas>0&&<span className="absolute top-1 right-1/4 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">{noLeidas}</span>}
    </button>)}
  </div>);
}

// ============ ESCANEAR TAB (from /campo) ============
function EscanearTab() {
  const [msg, setMsg] = useState('');
  const [capturedImage, setCapturedImage] = useState<string|null>(null);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiData, setAiData] = useState<any>(null);
  const [form, setForm] = useState({
    vehiculo_placa:'', chofer:'', tipo:'entrada', peso_bruto:'', tara:'',
    bascula:'Bascula 1 - Ingenio Laredo', observaciones:'', parcela:'', impurezas:'0',
    ruta:'', numero_ticket:'', fecha_pesaje:'', hora_pesaje:'', transportista:'',
    variedad:'', guia_remision:'', nro_viaje:'', turno:'diurno', producto:'caña de azucar',
    origen:'', destino:'', unidad_peso:'TM',
    fecha_peso_bruto:'', hora_peso_bruto:'', fecha_tara:'', hora_tara:'',
  });
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [conductores, setConductores] = useState<any[]>([]);
  const [rutas, setRutas] = useState<any[]>([]);
  const nativeCaptureRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pesoNeto = (parseFloat(form.peso_bruto)||0) - (parseFloat(form.tara)||0);

  useEffect(()=>{
    supabase.from('vehiculos').select('placa, marca, modelo, tipo').order('placa').then(({data})=>setVehiculos(data||[]));
    supabase.from('conductores').select('nombre, dni, telefono').eq('estado','activo').order('nombre').then(({data})=>setConductores(data||[]));
    supabase.from('rutas_transporte').select('codigo, nombre, origen, destino, distancia_km').eq('tipo','cana').eq('estado','activa').order('codigo').then(({data})=>setRutas(data||[]));
  },[]);

  const loadTickets = useCallback(async()=>{
    const {data} = await supabase.from('registros_pesaje_temporal').select('*').order('created_at',{ascending:false}).limit(20);
    setTickets(data||[]);
  },[]);
  useEffect(()=>{loadTickets();},[loadTickets]);

  function matchPlaca(aiPlaca:string) {
    if(!aiPlaca) return '';
    const clean = aiPlaca.replace(/[\s\-\.]/g,'').toUpperCase();
    const found = vehiculos.find(v => v.placa.replace(/[\s\-]/g,'').toUpperCase() === clean);
    return found?.placa || '';
  }
  function matchChofer(aiChofer:string) {
    if(!aiChofer) return '';
    const parts = aiChofer.toLowerCase().split(/[\s,]+/).filter((p:string)=>p.length>3);
    // Try exact substring match on any name part
    for (const part of parts) {
      const m = conductores.find(c => c.nombre.toLowerCase().includes(part));
      if (m) return m.nombre;
    }
    return '';
  }
  function matchRuta(origen:string, destino:string) {
    if(!origen && !destino) return '';
    const o = (origen||'').toLowerCase(); const d = (destino||'').toLowerCase();
    const m = rutas.find(r =>
      (o && (r.origen.toLowerCase().includes(o) || o.includes(r.origen.toLowerCase().split('(')[0].trim()))) ||
      (d && (r.destino.toLowerCase().includes(d) || d.includes(r.destino.toLowerCase().split('(')[0].trim())))
    );
    return m ? m.codigo+' '+m.nombre : '';
  }

  function handleCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { const d = ev.target?.result as string; setCapturedImage(d); processImageAI(d); };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  async function processImageAI(imageData: string) {
    setAiProcessing(true); setAiData(null); setMsg('');
    try {
      const res = await fetch('/api/ocr-ticket', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({image:imageData}) });
      const json = await res.json();
      if (!res.ok||json.error) { setMsg('⚠️ '+(json.error||'Error procesando')); setAiProcessing(false); return; }
      const d = json.data;
      setAiData(d);

      const placaMatch = matchPlaca(d.placa||'');
      const choferMatch = matchChofer(d.chofer||'');
      const rutaMatch = matchRuta(d.origen||'', d.destino||'');

      setForm(f=>({...f,
        vehiculo_placa: placaMatch || f.vehiculo_placa,
        chofer: choferMatch || f.chofer,
        ruta: rutaMatch || f.ruta,
        numero_ticket: d.ticket || '',
        fecha_pesaje: d.fecha || '',
        hora_pesaje: d.hora || '',
        peso_bruto: d.pesoBruto || '',
        tara: d.tara || '',
        bascula: d.bascula || f.bascula,
        parcela: d.parcela || d.origen || '',
        impurezas: d.impurezas || '0',
        transportista: d.transportista || d.empresa || '',
        variedad: d.variedad || '',
        guia_remision: d.guiaRemision || '',
        nro_viaje: d.nroViaje || '',
        turno: d.turno || f.turno,
        producto: d.producto || 'caña de azucar',
        origen: d.origen || '',
        destino: d.destino || '',
        unidad_peso: d.unidadPeso || 'TM',
        fecha_peso_bruto: d.fechaPesoBruto || '',
        hora_peso_bruto: d.horaPesoBruto || '',
        fecha_tara: d.fechaTara || '',
        hora_tara: d.horaTara || '',
        observaciones: d.observaciones || '',
      }));
      setShowForm(true);

      const matches: string[] = [];
      if(placaMatch) matches.push('Vehículo: '+placaMatch);
      if(choferMatch) matches.push('Conductor: '+choferMatch);
      if(rutaMatch) matches.push('Ruta identificada');
      const extracted: string[] = [];
      if(d.ticket) extracted.push('Ticket: '+d.ticket);
      if(d.fecha) extracted.push('Fecha: '+d.fecha);
      if(d.pesoBruto) extracted.push('Bruto: '+d.pesoBruto);
      if(d.tara) extracted.push('Tara: '+d.tara);

      setMsg('✅ Confianza: '+(d.confianza||'?')+'%' +
        (matches.length?' | '+matches.join(', '):'') +
        (extracted.length?' | '+extracted.join(', '):'') +
        ' — Verifique todos los campos');
    } catch(err:any) { setMsg('⚠️ Error: '+(err.message||'Sin conexión')); }
    finally { setAiProcessing(false); }
  }

  async function submitTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!form.vehiculo_placa) { setMsg('⚠️ Seleccione un vehículo'); return; }
    if (!form.chofer) { setMsg('⚠️ Seleccione un conductor'); return; }
    if (!form.peso_bruto || !form.tara) { setMsg('⚠️ Ingrese peso bruto y tara'); return; }
    setLoading(true); setMsg('');
    const pesoB=parseFloat(form.peso_bruto)||0, taraV=parseFloat(form.tara)||0, neto=pesoB-taraV;
    const ahora = new Date();
    const ticket = form.numero_ticket || 'TK-'+ahora.toISOString().slice(2,10).replace(/-/g,'')+'-'+String(ahora.getTime()).slice(-4);
    const {data:{user}} = await supabase.auth.getUser();

    const obs = [
      form.observaciones,
      form.ruta ? 'Ruta: '+form.ruta : '',
      form.transportista ? 'Transportista: '+form.transportista : '',
      form.variedad ? 'Variedad: '+form.variedad : '',
      form.guia_remision ? 'GR: '+form.guia_remision : '',
      form.nro_viaje ? 'Viaje #'+form.nro_viaje : '',
      form.producto !== 'caña de azucar' ? 'Producto: '+form.producto : '',
      form.fecha_peso_bruto ? 'Fecha Bruto: '+form.fecha_peso_bruto+' '+form.hora_peso_bruto : '',
      form.fecha_tara ? 'Fecha Tara: '+form.fecha_tara+' '+form.hora_tara : '',
    ].filter(Boolean).join(' | ');

    const record: any = {
      ticket,
      vehiculo_placa: form.vehiculo_placa,
      chofer: form.chofer,
      tipo: form.tipo,
      peso_bruto: pesoB,
      tara: taraV,
      peso_neto: neto,
      bascula: form.bascula,
      observaciones: obs,
      estado: 'pendiente',
      origen_registro: 'conductor_pwa',
      parcela: form.parcela,
      impurezas: parseFloat(form.impurezas)||0,
    };
    if(user?.id) record.user_id = user.id;
    const {error} = await supabase.from('registros_pesaje_temporal').insert(record);
    if(error) setMsg('Error: '+error.message);
    else {
      setMsg('✅ Ticket '+ticket+' registrado ('+form.vehiculo_placa+' / '+form.chofer+' / Neto: '+neto.toFixed(2)+' '+form.unidad_peso+')');
      setForm({vehiculo_placa:'',chofer:'',tipo:'entrada',peso_bruto:'',tara:'',bascula:'Bascula 1 - Ingenio Laredo',observaciones:'',parcela:'',impurezas:'0',ruta:'',numero_ticket:'',fecha_pesaje:'',hora_pesaje:'',transportista:'',variedad:'',guia_remision:'',nro_viaje:'',turno:'diurno',producto:'caña de azucar',origen:'',destino:'',unidad_peso:'TM',fecha_peso_bruto:'',hora_peso_bruto:'',fecha_tara:'',hora_tara:''});
      setCapturedImage(null); setAiData(null); setShowForm(false); loadTickets();
    }
    setLoading(false);
  }

  const F = ({label,field,placeholder,type,half,third}:{label:string;field:string;placeholder?:string;type?:string;half?:boolean;third?:boolean}) => (
    <div className={half?'col-span-1':third?'col-span-1':''}>
      <label className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wide">{label}</label>
      <input type={type||'text'} step={type==='number'?'0.01':undefined} value={(form as any)[field]} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))} placeholder={placeholder} className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-2.5 py-2 text-sm"/>
    </div>
  );

  return (<div className="space-y-4">
    {msg&&<div className={`p-3 rounded-xl text-sm ${msg.includes('Error')||msg.includes('⚠')?'bg-red-900/30 border border-red-700 text-red-400':'bg-green-900/30 border border-green-700 text-green-400'}`}>{msg}</div>}

    {!capturedImage && !showForm && (
      <div className="bg-slate-800 border border-purple-700/30 rounded-xl p-6 text-center">
        <Brain className="w-12 h-12 text-purple-400 mx-auto mb-3"/>
        <h3 className="text-lg font-bold text-white mb-1">Escanear Ticket de Báscula</h3>
        <p className="text-xs text-slate-400 mb-1">Toma foto del ticket — la IA extrae TODOS los datos</p>
        <p className="text-xs text-emerald-400 mb-5">{vehiculos.length} vehículos • {conductores.length} conductores • {rutas.length} rutas</p>
        <input ref={nativeCaptureRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCapture}/>
        <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleCapture}/>
        <div className="flex flex-col gap-3">
          <button onClick={()=>nativeCaptureRef.current?.click()} className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-purple-900/30"><Camera className="w-6 h-6"/> Tomar Foto del Ticket</button>
          <button onClick={()=>fileInputRef.current?.click()} className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2"><Upload className="w-4 h-4"/> Importar Imagen</button>
          <button onClick={()=>setShowForm(true)} className="text-slate-500 text-xs underline">Registro manual sin foto</button>
        </div>
      </div>
    )}

    {aiProcessing && (
      <div className="bg-purple-900/20 border border-purple-700/30 rounded-xl p-6 text-center">
        <div className="relative inline-block mb-3"><Brain className="w-10 h-10 text-purple-400 animate-pulse"/><Loader2 className="w-5 h-5 text-purple-300 animate-spin absolute -top-1 -right-1"/></div>
        <p className="text-purple-300 font-semibold">Analizando ticket con IA...</p>
        <p className="text-xs text-slate-500 mt-1">Extrayendo todos los campos del documento</p>
      </div>
    )}

    {capturedImage && !aiProcessing && (
      <div className="relative rounded-xl overflow-hidden border border-slate-700">
        <img src={capturedImage} alt="Ticket" className="w-full max-h-48 object-contain bg-black"/>
        <button onClick={()=>{setCapturedImage(null);setAiData(null);setShowForm(false);}} className="absolute top-2 right-2 bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center">✕</button>
      </div>
    )}

    {showForm && (
      <form onSubmit={submitTicket} className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          {aiData?<><Check className="w-4 h-4 text-green-400"/>Datos extraídos del ticket — Verifique todos los campos</>:<>Registro Manual de Pesaje</>}
        </h3>

        {/* SECCIÓN 1: Identificación del ticket */}
        <div className="bg-slate-900/50 rounded-lg p-3 space-y-2">
          <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Identificación del Ticket</p>
          <div className="grid grid-cols-3 gap-2">
            <F label="Nro. Ticket / Boleta" field="numero_ticket" placeholder="TK-001"/>
            <F label="Fecha Pesaje" field="fecha_pesaje" placeholder="01/03/2026"/>
            <F label="Hora" field="hora_pesaje" placeholder="14:30"/>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <F label="Transportista / Empresa" field="transportista" placeholder="Grupo Galarreta"/>
            <F label="Guía de Remisión" field="guia_remision" placeholder="T001-00456"/>
          </div>
        </div>

        {/* SECCIÓN 2: Vehículo y Conductor (selectores reales) */}
        <div className="bg-slate-900/50 rounded-lg p-3 space-y-2">
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Vehículo y Conductor</p>
          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5 uppercase">Vehículo *</label>
            <select value={form.vehiculo_placa} onChange={e=>setForm(f=>({...f,vehiculo_placa:e.target.value}))} required className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-2.5 py-2 text-sm">
              <option value="">— Seleccionar vehículo —</option>
              {vehiculos.map(v=><option key={v.placa} value={v.placa}>{v.placa} — {v.marca} {v.modelo}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5 uppercase">Conductor *</label>
            <select value={form.chofer} onChange={e=>setForm(f=>({...f,chofer:e.target.value}))} required className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-2.5 py-2 text-sm">
              <option value="">— Seleccionar conductor —</option>
              {conductores.map(c=><option key={c.dni} value={c.nombre}>{c.nombre} (DNI: {c.dni})</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5 uppercase">Ruta</label>
            <select value={form.ruta} onChange={e=>setForm(f=>({...f,ruta:e.target.value}))} className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-2.5 py-2 text-sm">
              <option value="">— Seleccionar ruta —</option>
              {rutas.map(r=><option key={r.codigo} value={r.codigo+' '+r.nombre}>{r.codigo} | {r.origen} → {r.destino} ({r.distancia_km} km)</option>)}
            </select>
          </div>
        </div>

        {/* SECCIÓN 3: Pesaje */}
        <div className="bg-slate-900/50 rounded-lg p-3 space-y-2">
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Datos de Pesaje</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5 uppercase">Tipo</label>
              <select value={form.tipo} onChange={e=>setForm(f=>({...f,tipo:e.target.value}))} className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-2.5 py-2 text-sm">
                <option value="entrada">Entrada (Peso Bruto)</option><option value="salida">Salida (Tara)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5 uppercase">Báscula</label>
              <select value={form.bascula} onChange={e=>setForm(f=>({...f,bascula:e.target.value}))} className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-2.5 py-2 text-sm">
                <option>Bascula 1 - Ingenio Laredo</option><option>Bascula 2 - Ingenio Laredo</option><option>Bascula 3 - Casa Grande</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5 uppercase">Peso Bruto ({form.unidad_peso}) *</label>
              <input type="number" step="0.01" value={form.peso_bruto} onChange={e=>setForm(f=>({...f,peso_bruto:e.target.value}))} required placeholder="38.50" className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-2.5 py-2 text-sm"/>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5 uppercase">Tara ({form.unidad_peso}) *</label>
              <input type="number" step="0.01" value={form.tara} onChange={e=>setForm(f=>({...f,tara:e.target.value}))} required placeholder="16.20" className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-2.5 py-2 text-sm"/>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5 uppercase">Peso Neto ({form.unidad_peso})</label>
              <div className={`w-full rounded-lg px-2.5 py-2 text-sm font-bold text-center ${pesoNeto>0?'bg-emerald-900/30 border border-emerald-700 text-emerald-400':'bg-slate-700 border border-slate-600 text-slate-500'}`}>{pesoNeto>0?pesoNeto.toFixed(2):'--.--'}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <F label="Fecha/Hora Peso Bruto" field="fecha_peso_bruto" placeholder="01/03/2026 08:30"/>
            <F label="Fecha/Hora Tara" field="fecha_tara" placeholder="01/03/2026 09:15"/>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <F label="Unidad Peso" field="unidad_peso" placeholder="TM"/>
            <F label="Nro. Viaje" field="nro_viaje" placeholder="1"/>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5 uppercase">Turno</label>
              <select value={form.turno} onChange={e=>setForm(f=>({...f,turno:e.target.value}))} className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-2.5 py-2 text-sm">
                <option value="diurno">Diurno</option><option value="nocturno">Nocturno</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECCIÓN 4: Producto y Campo */}
        <div className="bg-slate-900/50 rounded-lg p-3 space-y-2">
          <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Producto y Campo</p>
          <div className="grid grid-cols-2 gap-2">
            <F label="Producto" field="producto" placeholder="Caña de azúcar"/>
            <F label="Variedad" field="variedad" placeholder="H32-8560"/>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <F label="Parcela / Frente" field="parcela" placeholder="Frente Norte"/>
            <F label="Impurezas %" field="impurezas" type="number" placeholder="3.5"/>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <F label="Origen" field="origen" placeholder="Campo La Cuesta"/>
            <F label="Destino" field="destino" placeholder="Ingenio Laredo"/>
          </div>
        </div>

        {/* SECCIÓN 5: Observaciones */}
        <div>
          <label className="text-[10px] text-slate-400 block mb-0.5 uppercase">Observaciones / Datos Adicionales</label>
          <textarea value={form.observaciones} onChange={e=>setForm(f=>({...f,observaciones:e.target.value}))} rows={2} className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-2.5 py-2 text-sm resize-none" placeholder="Caña 2do corte, buen estado, sin hojas"/>
        </div>

        <button type="submit" disabled={loading} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-base">
          {loading?<Loader2 className="w-5 h-5 animate-spin"/>:<ScanLine className="w-5 h-5"/>}
          {loading?'Registrando...':'Registrar Ticket de Pesaje'}
        </button>
      </form>
    )}

    {/* Tickets recientes */}
    <div className="bg-slate-800 border border-slate-700 rounded-xl">
      <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Tickets Recientes</h3>
        <span className="text-xs text-slate-400">{tickets.length}</span>
      </div>
      {tickets.slice(0,5).map(t=>(
        <div key={t.id} className="px-4 py-3 border-b border-slate-700/50 last:border-0">
          <div className="flex items-center justify-between">
            <div><span className="text-sm font-mono font-bold text-white">{t.ticket}</span><span className="text-xs text-slate-400 ml-2">{t.vehiculo_placa}</span></div>
            <span className={`px-2 py-0.5 rounded text-xs ${t.estado==='aprobado'?'bg-green-900/50 text-green-400':t.estado==='rechazado'?'bg-red-900/50 text-red-400':'bg-yellow-900/50 text-yellow-400'}`}>{t.estado}</span>
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{t.chofer}</div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
            <span>Bruto: {Number(t.peso_bruto||0).toFixed(2)}</span>
            <span>Tara: {Number(t.tara||0).toFixed(2)}</span>
            <span className="text-emerald-400 font-semibold">Neto: {Number(t.peso_neto||0).toFixed(2)} TM</span>
          </div>
        </div>
      ))}
      {tickets.length===0&&<div className="p-6 text-center text-slate-500 text-sm">Sin tickets</div>}
    </div>
  </div>);
}

// ============ JORNADA TAB ============
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
          <div className="bg-slate-700 rounded-lg p-3"><p className="text-slate-400 text-xs">Viajes</p><p className="font-semibold text-white text-xl">{jornada.viajes_completados}</p></div>
        </div>
        <input placeholder="KM Odómetro final" type="number" value={kmFin} onChange={e=>setKmFin(e.target.value)} className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"/>
        <button onClick={()=>kmFin&&finalizarJornada(parseInt(kmFin))} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"><Square className="w-5 h-5"/>Finalizar Jornada</button>
      </div>:<div className="text-center py-4"><Check className="w-12 h-12 text-green-400 mx-auto mb-2"/><p className="font-semibold text-white">Jornada Completada</p></div>}
    </div>
    <div className="bg-slate-800 border border-slate-700 rounded-xl">
      <div className="px-4 py-3 border-b border-slate-700"><h3 className="text-sm font-semibold text-white">Últimas Jornadas</h3></div>
      {historial.slice(0,5).map(j=><div key={j.id} className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 last:border-0">
        <div><p className="text-sm font-medium text-white">{new Date(j.fecha).toLocaleDateString('es-PE',{weekday:'short',day:'numeric',month:'short'})}</p><p className="text-xs text-slate-400">{j.km_recorridos?.toLocaleString()} km • {j.viajes_completados} viajes</p></div>
        <p className="text-sm font-semibold text-white">{j.toneladas_transportadas} tn</p>
      </div>)}
    </div>
  </div>);
}

// ============ CHECKLIST TAB ============
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
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all" style={{width:`${porcentaje}%`}}/></div>
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

// ============ NOTIFICACIONES TAB ============
function NotificacionesTab() {
  const {notificaciones,noLeidas,marcarLeida,marcarTodasLeidas}=useNotificacionesConductor();
  return (<div className="space-y-2">
    {noLeidas>0&&<button onClick={marcarTodasLeidas} className="w-full py-2 text-sm text-slate-400 hover:text-white">Marcar todas como leídas ({noLeidas})</button>}
    {notificaciones.map(n=><div key={n.id} onClick={()=>!n.leida&&marcarLeida(n.id)} className={`bg-slate-800 border rounded-xl p-3 cursor-pointer ${!n.leida?'border-blue-700 bg-blue-900/10':'border-slate-700'}`}>
      <div className="flex items-start gap-3"><div className={`p-2 rounded-full ${n.prioridad==='critica'?'bg-red-900/50':'bg-blue-900/50'}`}><Bell className="w-4 h-4 text-white"/></div>
      <div className="flex-1"><p className="text-sm font-medium text-white">{n.titulo}</p><p className="text-xs text-slate-400 mt-0.5">{n.mensaje}</p></div>
      {!n.leida&&<div className="w-2 h-2 bg-blue-500 rounded-full mt-2"/>}</div>
    </div>)}
    {notificaciones.length===0&&<div className="text-center py-12 text-slate-500"><Bell className="w-10 h-10 mx-auto mb-2 opacity-30"/><p>Sin notificaciones</p></div>}
  </div>);
}

// ============ DOCUMENTOS TAB ============
function DocumentosTab() {
  const {documentos}=useDocumentosConductor();
  const ec:Record<string,string>={vigente:'bg-green-900/50 text-green-400',por_vencer:'bg-yellow-900/50 text-yellow-400',vencido:'bg-red-900/50 text-red-400'};
  return (<div className="space-y-3">
    {documentos.map(d=><div key={d.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-white capitalize">{d.tipo_documento.replace(/_/g,' ')}</p>{d.fecha_vencimiento&&<p className="text-xs text-slate-500 mt-1">Vence: {new Date(d.fecha_vencimiento).toLocaleDateString('es-PE')}</p>}</div>
      <span className={`px-2 py-0.5 rounded text-xs ${ec[d.estado]||'bg-slate-700 text-slate-300'}`}>{d.estado.replace(/_/g,' ')}</span></div>
    </div>)}
    {documentos.length===0&&<div className="text-center py-12 text-slate-500"><FileText className="w-10 h-10 mx-auto mb-2 opacity-30"/><p>Sin documentos</p></div>}
  </div>);
}

// ============ MAIN PAGE ============
export default function ConductorPWAPage() {
  const [tab,setTab]=useState('escanear');
  const {noLeidas}=useNotificacionesConductor();
  return (<div className="min-h-screen bg-slate-900 pb-16">
    <div className="bg-emerald-700 text-white px-4 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between"><div><h1 className="text-lg font-bold">TransCaña</h1><p className="text-xs opacity-80">Portal del Conductor</p></div><div className="flex items-center gap-2"><MapPin className="w-4 h-4 opacity-60"/><span className="text-xs opacity-60">GPS</span></div></div>
    </div>
    <div className="p-4">
      {tab==='escanear'&&<EscanearTab/>}
      {tab==='jornada'&&<JornadaTab/>}
      {tab==='checklist'&&<ChecklistTab/>}
      {tab==='notificaciones'&&<NotificacionesTab/>}
      {tab==='documentos'&&<DocumentosTab/>}
    </div>
    <TabBar tab={tab} setTab={setTab} noLeidas={noLeidas}/>
  </div>);
}
