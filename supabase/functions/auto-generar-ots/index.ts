// ============================================================================
// TRANSCAÑA ERP - Sprint 15: Edge Function
// auto-generar-ots - Generación automática de OTs preventivas
// Deploy: supabase functions deploy auto-generar-ots
// CRON: Ejecutar diariamente a las 06:00 AM PET
// ============================================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Obtener todos los tenants activos
    const { data: tenants, error: tErr } = await supabase
      .from('tenants')
      .select('id, nombre')
      .eq('activo', true);

    if (tErr) throw tErr;

    const resultados: any[] = [];

    for (const tenant of tenants || []) {
      // 1. Generar OTs preventivas automáticas
      const { data: otsGeneradas, error: otErr } = await supabase
        .rpc('fn_generar_ots_preventivas', { p_tenant_id: tenant.id });

      if (otErr) {
        console.error(`Error OTs para ${tenant.nombre}:`, otErr);
        continue;
      }

      // 2. Verificar documentos por vencer (30 días)
      const { data: docsPorVencer } = await supabase
        .from('documentos_conductor')
        .select('id, conductor_id, tipo_documento, fecha_vencimiento')
        .eq('tenant_id', tenant.id)
        .lte('fecha_vencimiento', new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0])
        .gte('fecha_vencimiento', new Date().toISOString().split('T')[0])
        .neq('estado', 'vencido');

      // Generar notificaciones de documentos por vencer
      for (const doc of docsPorVencer || []) {
        const diasRestantes = Math.ceil(
          (new Date(doc.fecha_vencimiento).getTime() - Date.now()) / 86400000
        );

        await supabase.from('notificaciones_conductor').insert({
          tenant_id: tenant.id,
          conductor_id: doc.conductor_id,
          tipo: 'documento_vencido',
          titulo: `Documento por vencer: ${doc.tipo_documento}`,
          mensaje: `Tu ${doc.tipo_documento} vence en ${diasRestantes} días (${doc.fecha_vencimiento}). Renuévalo a la brevedad.`,
          prioridad: diasRestantes <= 7 ? 'alta' : 'media',
          datos_extra: { documento_id: doc.id, dias_restantes: diasRestantes },
        });
      }

      // 3. Verificar llantas críticas
      const { data: llantasCriticas } = await supabase
        .from('control_llantas')
        .select('id, vehiculo_id, posicion, profundidad_cocada_mm, profundidad_minima_mm')
        .eq('tenant_id', tenant.id)
        .eq('estado', 'en_uso');

      for (const llanta of llantasCriticas || []) {
        if (llanta.profundidad_cocada_mm <= llanta.profundidad_minima_mm + 1) {
          // Verificar si ya existe alerta activa
          const { data: existeAlerta } = await supabase
            .from('alertas_mantenimiento')
            .select('id')
            .eq('componente_id', llanta.id)
            .eq('resuelta', false)
            .limit(1);

          if (!existeAlerta?.length) {
            const esCritica = llanta.profundidad_cocada_mm <= llanta.profundidad_minima_mm;
            await supabase.from('alertas_mantenimiento').insert({
              tenant_id: tenant.id,
              vehiculo_id: llanta.vehiculo_id,
              componente_id: llanta.id,
              tipo_alerta: 'desgaste_critico',
              severidad: esCritica ? 'critica' : 'alta',
              titulo: `Llanta ${llanta.posicion}: ${esCritica ? 'BAJA INMEDIATA' : 'Desgaste crítico'}`,
              descripcion: `Profundidad: ${llanta.profundidad_cocada_mm}mm (mín: ${llanta.profundidad_minima_mm}mm)`,
              valor_actual: llanta.profundidad_cocada_mm,
              valor_limite: llanta.profundidad_minima_mm,
              porcentaje_alcanzado: ((llanta.profundidad_minima_mm / llanta.profundidad_cocada_mm) * 100),
            });
          }
        }
      }

      resultados.push({
        tenant: tenant.nombre,
        ots_generadas: otsGeneradas?.length || 0,
        docs_alertados: docsPorVencer?.length || 0,
        llantas_alertadas: llantasCriticas?.filter(
          (l: any) => l.profundidad_cocada_mm <= l.profundidad_minima_mm + 1
        ).length || 0,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      resultados,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error en auto-generar-ots:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
