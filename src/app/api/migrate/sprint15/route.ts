import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== "innovaq2026") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const dbPassword = process.env.SUPABASE_DB_PASSWORD || "";
  const ref = "uinoropxppiuqgzktqjr";
  const ep = encodeURIComponent(dbPassword);

  const attempts = [
    process.env.SUPABASE_DB_URL,
    `postgresql://postgres.${ref}:${ep}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${ref}:${ep}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
    `postgresql://postgres:${ep}@db.${ref}.supabase.co:5432/postgres`,
    `postgresql://postgres.${ref}:${ep}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${ref}:${ep}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${ref}:${ep}@${ref}.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${ref}:${ep}@${ref}.pooler.supabase.com:5432/postgres`,
    `postgresql://postgres.${ref}:${ep}@${ref}.supabase.com:6543/postgres`,
  ].filter(Boolean) as string[];

  const errors: string[] = [];
  let pool: Pool | null = null;

  for (const cs of attempts) {
    const masked = cs.replace(/:[^/:@]+@/, ":***@");
    try {
      const p = new Pool({ connectionString: cs, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000 });
      const client = await p.connect();
      await client.query("SELECT 1");
      client.release();
      pool = p;
      errors.push(`✅ ${masked} => CONNECTED`);
      break;
    } catch (e: any) {
      errors.push(`❌ ${masked} => ${e.message.split("\n")[0]}`);
    }
  }

  if (!pool) {
    return NextResponse.json({ error: "No DB connection", attempts: errors, hasPw: !!dbPassword, pwLen: dbPassword.length });
  }

  // Execute migration
  const client = await pool.connect();
  const results: string[] = [];
  const stmts = getMigrationStatements();

  for (let i = 0; i < stmts.length; i++) {
    try {
      await client.query(stmts[i]);
      results.push(`✅ [${i+1}] OK`);
    } catch (e: any) {
      if (e.message.includes("already exists")) {
        results.push(`⚠️ [${i+1}] Already exists`);
      } else {
        results.push(`❌ [${i+1}] ${e.message.split("\n")[0]}`);
      }
    }
  }
  client.release();

  // Verify
  const v = await pool.connect();
  const { rows } = await v.query(`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
    AND tablename IN ('planes_mantenimiento','componentes_vehiculo','control_llantas',
    'ordenes_trabajo_mto','cargas_combustible','inspecciones_llanta',
    'checklist_preoperativo','documentos_conductor','notificaciones_conductor',
    'jornada_conductor','alertas_mantenimiento') ORDER BY tablename
  `);
  v.release();
  await pool.end();

  return NextResponse.json({
    success: true,
    tables: rows.map((r: any) => r.tablename),
    total: rows.length,
    connection: errors,
    migration: results,
  });
}

function getMigrationStatements(): string[] {
  return [
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='tipo_mantenimiento') THEN CREATE TYPE tipo_mantenimiento AS ENUM('preventivo','correctivo','predictivo','emergencia'); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='estado_orden_trabajo') THEN CREATE TYPE estado_orden_trabajo AS ENUM('programada','en_espera_repuestos','en_ejecucion','pausada','completada','cancelada','reprogramada'); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='prioridad_ot') THEN CREATE TYPE prioridad_ot AS ENUM('critica','alta','media','baja'); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='estado_componente') THEN CREATE TYPE estado_componente AS ENUM('operativo','desgastado','critico','fuera_servicio','reemplazado'); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='tipo_componente_flota') THEN CREATE TYPE tipo_componente_flota AS ENUM('llanta','motor','transmision','frenos','suspension','sistema_electrico','sistema_hidraulico','carroceria','sistema_combustible','refrigeracion','otro'); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='posicion_llanta') THEN CREATE TYPE posicion_llanta AS ENUM('DI','DD','TII','TID','TDI','TDD','R1I','R1D','R2I','R2D','R3I','R3D','R4I','R4D','R5I','R5D','R6I','R6D','repuesto'); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='estado_llanta') THEN CREATE TYPE estado_llanta AS ENUM('nueva','en_uso','reencauche_1','reencauche_2','reencauche_3','baja','en_reparacion','en_almacen'); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='tipo_combustible') THEN CREATE TYPE tipo_combustible AS ENUM('diesel_b5','diesel_b20','biodiesel','gnv','glp'); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='estado_checklist') THEN CREATE TYPE estado_checklist AS ENUM('pendiente','aprobado','rechazado','con_observaciones'); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='tipo_notificacion_conductor') THEN CREATE TYPE tipo_notificacion_conductor AS ENUM('orden_trabajo','checklist_pendiente','mantenimiento_programado','alerta_componente','ruta_asignada','mensaje_supervisor','documento_vencido','capacitacion'); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='estado_documento_conductor') THEN CREATE TYPE estado_documento_conductor AS ENUM('vigente','por_vencer','vencido','en_tramite'); END IF; END $$`,
    `CREATE TABLE IF NOT EXISTS planes_mantenimiento(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id UUID NOT NULL,codigo VARCHAR(20) NOT NULL,nombre VARCHAR(150) NOT NULL,descripcion TEXT,tipo tipo_mantenimiento DEFAULT'preventivo',tipo_vehiculo VARCHAR(50),frecuencia_km INTEGER,frecuencia_horas INTEGER,frecuencia_dias INTEGER,tolerancia_km INTEGER DEFAULT 500,tolerancia_horas INTEGER DEFAULT 50,tolerancia_dias INTEGER DEFAULT 7,costo_estimado DECIMAL(12,2) DEFAULT 0,tiempo_estimado_horas DECIMAL(5,2) DEFAULT 1,requiere_parada BOOLEAN DEFAULT TRUE,checklist_template JSONB DEFAULT'[]',repuestos_requeridos JSONB DEFAULT'[]',activo BOOLEAN DEFAULT TRUE,created_at TIMESTAMPTZ DEFAULT NOW(),updated_at TIMESTAMPTZ DEFAULT NOW())`,
    `CREATE TABLE IF NOT EXISTS componentes_vehiculo(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id UUID NOT NULL,vehiculo_id UUID NOT NULL,tipo tipo_componente_flota NOT NULL,codigo_parte VARCHAR(50),marca VARCHAR(100),modelo VARCHAR(100),numero_serie VARCHAR(100),estado estado_componente DEFAULT'operativo',fecha_instalacion DATE,fecha_ultimo_servicio DATE,km_instalacion INTEGER DEFAULT 0,horas_instalacion INTEGER DEFAULT 0,vida_util_km INTEGER,vida_util_horas INTEGER,km_actual INTEGER DEFAULT 0,horas_actual INTEGER DEFAULT 0,porcentaje_desgaste DECIMAL(5,2) DEFAULT 0,costo_adquisicion DECIMAL(12,2) DEFAULT 0,proveedor VARCHAR(150),garantia_hasta DATE,notas TEXT,metadata JSONB DEFAULT'{}',activo BOOLEAN DEFAULT TRUE,created_at TIMESTAMPTZ DEFAULT NOW(),updated_at TIMESTAMPTZ DEFAULT NOW())`,
    `CREATE TABLE IF NOT EXISTS control_llantas(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),componente_id UUID NOT NULL,tenant_id UUID NOT NULL,vehiculo_id UUID NOT NULL,dot VARCHAR(20),marca_llanta VARCHAR(50) NOT NULL,medida VARCHAR(20) NOT NULL,tipo_banda VARCHAR(50),posicion posicion_llanta,estado estado_llanta DEFAULT'nueva',profundidad_cocada_mm DECIMAL(4,1),profundidad_original_mm DECIMAL(4,1) DEFAULT 16.0,profundidad_minima_mm DECIMAL(4,1) DEFAULT 3.0,presion_recomendada_psi DECIMAL(5,1) DEFAULT 120,presion_actual_psi DECIMAL(5,1),temperatura_actual_c DECIMAL(5,1),numero_reencauches INTEGER DEFAULT 0,max_reencauches INTEGER DEFAULT 3,km_acumulados INTEGER DEFAULT 0,costo_original DECIMAL(10,2) DEFAULT 0,costo_reencauches_acum DECIMAL(10,2) DEFAULT 0,fecha_ultima_inspeccion DATE,proximo_reencauche_km INTEGER,historial_rotaciones JSONB DEFAULT'[]',created_at TIMESTAMPTZ DEFAULT NOW(),updated_at TIMESTAMPTZ DEFAULT NOW())`,
    `CREATE TABLE IF NOT EXISTS ordenes_trabajo_mto(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id UUID NOT NULL,numero_ot VARCHAR(20) NOT NULL,vehiculo_id UUID NOT NULL,plan_id UUID,tipo tipo_mantenimiento NOT NULL,prioridad prioridad_ot DEFAULT'media',estado estado_orden_trabajo DEFAULT'programada',descripcion TEXT NOT NULL,diagnostico TEXT,solucion_aplicada TEXT,fecha_programada DATE NOT NULL,fecha_inicio TIMESTAMPTZ,fecha_fin TIMESTAMPTZ,km_vehiculo INTEGER,horas_motor INTEGER,tecnico_responsable UUID,supervisor_id UUID,taller_externo VARCHAR(150),es_taller_externo BOOLEAN DEFAULT FALSE,componentes_afectados UUID[] DEFAULT'{}',repuestos_utilizados JSONB DEFAULT'[]',mano_obra_horas DECIMAL(6,2) DEFAULT 0,costo_repuestos DECIMAL(12,2) DEFAULT 0,costo_mano_obra DECIMAL(12,2) DEFAULT 0,costo_taller_externo DECIMAL(12,2) DEFAULT 0,checklist_completado JSONB DEFAULT'[]',fotos_antes TEXT[] DEFAULT'{}',fotos_despues TEXT[] DEFAULT'{}',observaciones TEXT,aprobado_por UUID,fecha_aprobacion TIMESTAMPTZ,created_by UUID,created_at TIMESTAMPTZ DEFAULT NOW(),updated_at TIMESTAMPTZ DEFAULT NOW())`,
    `CREATE TABLE IF NOT EXISTS cargas_combustible(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id UUID NOT NULL,vehiculo_id UUID NOT NULL,conductor_id UUID,fecha_carga TIMESTAMPTZ DEFAULT NOW(),tipo_combustible tipo_combustible DEFAULT'diesel_b5',estacion_servicio VARCHAR(150),km_odometro INTEGER NOT NULL,galones DECIMAL(8,2) NOT NULL,precio_galon DECIMAL(8,2) NOT NULL,km_recorridos INTEGER,rendimiento_km_galon DECIMAL(8,2),comprobante_numero VARCHAR(30),comprobante_tipo VARCHAR(20) DEFAULT'factura',foto_odometro TEXT,foto_comprobante TEXT,latitud DECIMAL(10,7),longitud DECIMAL(10,7),validado BOOLEAN DEFAULT FALSE,validado_por UUID,observaciones TEXT,created_at TIMESTAMPTZ DEFAULT NOW())`,
    `CREATE TABLE IF NOT EXISTS inspecciones_llanta(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),llanta_id UUID NOT NULL,tenant_id UUID NOT NULL,vehiculo_id UUID NOT NULL,inspector_id UUID,fecha_inspeccion TIMESTAMPTZ DEFAULT NOW(),profundidad_cocada_mm DECIMAL(4,1),presion_psi DECIMAL(5,1),temperatura_c DECIMAL(5,1),desgaste_irregular BOOLEAN DEFAULT FALSE,tipo_desgaste VARCHAR(50),danos_visibles TEXT,requiere_rotacion BOOLEAN DEFAULT FALSE,requiere_reencauche BOOLEAN DEFAULT FALSE,requiere_baja BOOLEAN DEFAULT FALSE,fotos TEXT[] DEFAULT'{}',observaciones TEXT,created_at TIMESTAMPTZ DEFAULT NOW())`,
    `CREATE TABLE IF NOT EXISTS checklist_preoperativo(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id UUID NOT NULL,vehiculo_id UUID NOT NULL,conductor_id UUID NOT NULL,fecha TIMESTAMPTZ DEFAULT NOW(),turno VARCHAR(20),km_odometro INTEGER,estado estado_checklist DEFAULT'pendiente',items JSONB NOT NULL DEFAULT'[]',items_ok INTEGER DEFAULT 0,items_total INTEGER DEFAULT 0,items_fallidos INTEGER DEFAULT 0,porcentaje_cumplimiento DECIMAL(5,2) DEFAULT 0,firma_conductor TEXT,foto_vehiculo TEXT,observaciones_generales TEXT,revisado_por UUID,fecha_revision TIMESTAMPTZ,observaciones_supervisor TEXT,latitud DECIMAL(10,7),longitud DECIMAL(10,7),created_at TIMESTAMPTZ DEFAULT NOW())`,
    `CREATE TABLE IF NOT EXISTS documentos_conductor(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id UUID NOT NULL,conductor_id UUID NOT NULL,tipo_documento VARCHAR(50) NOT NULL,numero_documento VARCHAR(50),fecha_emision DATE,fecha_vencimiento DATE,estado estado_documento_conductor DEFAULT'vigente',archivo_url TEXT,entidad_emisora VARCHAR(150),categoria VARCHAR(20),alertas_enviadas INTEGER DEFAULT 0,notas TEXT,created_at TIMESTAMPTZ DEFAULT NOW(),updated_at TIMESTAMPTZ DEFAULT NOW())`,
    `CREATE TABLE IF NOT EXISTS notificaciones_conductor(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id UUID NOT NULL,conductor_id UUID NOT NULL,tipo tipo_notificacion_conductor NOT NULL,titulo VARCHAR(200) NOT NULL,mensaje TEXT NOT NULL,datos_extra JSONB DEFAULT'{}',leida BOOLEAN DEFAULT FALSE,fecha_lectura TIMESTAMPTZ,prioridad prioridad_ot DEFAULT'media',accion_url VARCHAR(500),created_at TIMESTAMPTZ DEFAULT NOW())`,
    `CREATE TABLE IF NOT EXISTS jornada_conductor(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id UUID NOT NULL,conductor_id UUID NOT NULL,vehiculo_id UUID,fecha DATE NOT NULL DEFAULT CURRENT_DATE,hora_inicio TIMESTAMPTZ,hora_fin TIMESTAMPTZ,km_inicio INTEGER,km_fin INTEGER,viajes_completados INTEGER DEFAULT 0,toneladas_transportadas DECIMAL(10,2) DEFAULT 0,horas_efectivas DECIMAL(5,2),horas_espera DECIMAL(5,2) DEFAULT 0,incidentes INTEGER DEFAULT 0,checklist_id UUID,calificacion_jornada DECIMAL(3,1),observaciones TEXT,latitud_inicio DECIMAL(10,7),longitud_inicio DECIMAL(10,7),latitud_fin DECIMAL(10,7),longitud_fin DECIMAL(10,7),created_at TIMESTAMPTZ DEFAULT NOW(),updated_at TIMESTAMPTZ DEFAULT NOW())`,
    `CREATE TABLE IF NOT EXISTS alertas_mantenimiento(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id UUID NOT NULL,vehiculo_id UUID NOT NULL,componente_id UUID,plan_id UUID,tipo_alerta VARCHAR(50) NOT NULL,severidad prioridad_ot DEFAULT'media',titulo VARCHAR(200) NOT NULL,descripcion TEXT,valor_actual DECIMAL(12,2),valor_limite DECIMAL(12,2),porcentaje_alcanzado DECIMAL(5,2),resuelta BOOLEAN DEFAULT FALSE,resuelta_por UUID,fecha_resolucion TIMESTAMPTZ,ot_generada UUID,auto_generada BOOLEAN DEFAULT TRUE,created_at TIMESTAMPTZ DEFAULT NOW())`,
    `CREATE INDEX IF NOT EXISTS idx_planes_mto_tenant ON planes_mantenimiento(tenant_id) WHERE activo`,
    `CREATE INDEX IF NOT EXISTS idx_componentes_vehiculo ON componentes_vehiculo(vehiculo_id,tipo)`,
    `CREATE INDEX IF NOT EXISTS idx_llantas_vehiculo ON control_llantas(vehiculo_id,posicion)`,
    `CREATE INDEX IF NOT EXISTS idx_ot_vehiculo ON ordenes_trabajo_mto(vehiculo_id,estado)`,
    `CREATE INDEX IF NOT EXISTS idx_ot_fecha ON ordenes_trabajo_mto(tenant_id,fecha_programada)`,
    `CREATE INDEX IF NOT EXISTS idx_combustible_vehiculo ON cargas_combustible(vehiculo_id,fecha_carga DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_checklist_conductor ON checklist_preoperativo(conductor_id,fecha DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_docs_conductor ON documentos_conductor(conductor_id,tipo_documento)`,
    `CREATE INDEX IF NOT EXISTS idx_notif_conductor ON notificaciones_conductor(conductor_id,leida,created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_jornada_conductor ON jornada_conductor(conductor_id,fecha DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_alertas_mto ON alertas_mantenimiento(vehiculo_id,resuelta)`,
    `ALTER TABLE planes_mantenimiento ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE componentes_vehiculo ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE control_llantas ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE ordenes_trabajo_mto ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE cargas_combustible ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE inspecciones_llanta ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE checklist_preoperativo ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE documentos_conductor ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE notificaciones_conductor ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE jornada_conductor ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE alertas_mantenimiento ENABLE ROW LEVEL SECURITY`,
    `INSERT INTO storage.buckets(id,name,public) VALUES('fotos-mantenimiento','fotos-mantenimiento',false) ON CONFLICT(id) DO NOTHING`,
    `INSERT INTO storage.buckets(id,name,public) VALUES('fotos-checklist','fotos-checklist',false) ON CONFLICT(id) DO NOTHING`,
    `INSERT INTO storage.buckets(id,name,public) VALUES('docs-conductor','docs-conductor',false) ON CONFLICT(id) DO NOTHING`,
    `INSERT INTO storage.buckets(id,name,public) VALUES('fotos-combustible','fotos-combustible',false) ON CONFLICT(id) DO NOTHING`,
  ];
}
