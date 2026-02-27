export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      productos: {
        Row: {
          id: string;
          nombre: string;
          sku: string;
          descripcion: string | null;
          precio: number;
          costo: number;
          stock: number;
          stock_minimo: number;
          categoria: string | null;
          estado: "activo" | "inactivo";
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          sku: string;
          descripcion?: string | null;
          precio: number;
          costo?: number;
          stock?: number;
          stock_minimo?: number;
          categoria?: string | null;
          estado?: "activo" | "inactivo";
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          sku?: string;
          descripcion?: string | null;
          precio?: number;
          costo?: number;
          stock?: number;
          stock_minimo?: number;
          categoria?: string | null;
          estado?: "activo" | "inactivo";
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      clientes: {
        Row: {
          id: string;
          nombre: string;
          email: string | null;
          telefono: string | null;
          direccion: string | null;
          rfc: string | null;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          email?: string | null;
          telefono?: string | null;
          direccion?: string | null;
          rfc?: string | null;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          email?: string | null;
          telefono?: string | null;
          direccion?: string | null;
          rfc?: string | null;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      facturas: {
        Row: {
          id: string;
          numero: number;
          cliente_id: string | null;
          fecha: string;
          subtotal: number;
          impuesto: number;
          total: number;
          estado: "pendiente" | "pagada" | "cancelada";
          notas: string | null;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          numero?: number;
          cliente_id?: string | null;
          fecha?: string;
          subtotal?: number;
          impuesto?: number;
          total?: number;
          estado?: "pendiente" | "pagada" | "cancelada";
          notas?: string | null;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          numero?: number;
          cliente_id?: string | null;
          fecha?: string;
          subtotal?: number;
          impuesto?: number;
          total?: number;
          estado?: "pendiente" | "pagada" | "cancelada";
          notas?: string | null;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "facturas_cliente_id_fkey";
            columns: ["cliente_id"];
            referencedRelation: "clientes";
            referencedColumns: ["id"];
          },
        ];
      };
      factura_detalle: {
        Row: {
          id: string;
          factura_id: string;
          producto_id: string;
          cantidad: number;
          precio_unitario: number;
          subtotal: number;
        };
        Insert: {
          id?: string;
          factura_id: string;
          producto_id: string;
          cantidad: number;
          precio_unitario: number;
          subtotal: number;
        };
        Update: {
          id?: string;
          factura_id?: string;
          producto_id?: string;
          cantidad?: number;
          precio_unitario?: number;
          subtotal?: number;
        };
        Relationships: [
          {
            foreignKeyName: "factura_detalle_factura_id_fkey";
            columns: ["factura_id"];
            referencedRelation: "facturas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "factura_detalle_producto_id_fkey";
            columns: ["producto_id"];
            referencedRelation: "productos";
            referencedColumns: ["id"];
          },
        ];
      };
      proveedores: {
        Row: {
          id: string;
          nombre: string;
          contacto: string | null;
          email: string | null;
          telefono: string | null;
          direccion: string | null;
          rfc: string | null;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          contacto?: string | null;
          email?: string | null;
          telefono?: string | null;
          direccion?: string | null;
          rfc?: string | null;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          contacto?: string | null;
          email?: string | null;
          telefono?: string | null;
          direccion?: string | null;
          rfc?: string | null;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      ordenes_compra: {
        Row: {
          id: string;
          numero: number;
          proveedor_id: string | null;
          fecha: string;
          subtotal: number;
          impuesto: number;
          total: number;
          estado: "pendiente" | "recibida" | "cancelada";
          notas: string | null;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          numero?: number;
          proveedor_id?: string | null;
          fecha?: string;
          subtotal?: number;
          impuesto?: number;
          total?: number;
          estado?: "pendiente" | "recibida" | "cancelada";
          notas?: string | null;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          numero?: number;
          proveedor_id?: string | null;
          fecha?: string;
          subtotal?: number;
          impuesto?: number;
          total?: number;
          estado?: "pendiente" | "recibida" | "cancelada";
          notas?: string | null;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      orden_compra_detalle: {
        Row: {
          id: string;
          orden_id: string;
          producto_id: string;
          cantidad: number;
          precio_unitario: number;
          subtotal: number;
        };
        Insert: {
          id?: string;
          orden_id: string;
          producto_id: string;
          cantidad: number;
          precio_unitario: number;
          subtotal: number;
        };
        Update: {
          id?: string;
          orden_id?: string;
          producto_id?: string;
          cantidad?: number;
          precio_unitario?: number;
          subtotal?: number;
        };
        Relationships: [];
      };
      cuentas_contables: {
        Row: {
          id: string;
          codigo: string;
          nombre: string;
          tipo: "activo" | "pasivo" | "capital" | "ingreso" | "gasto";
          saldo: number;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          codigo: string;
          nombre: string;
          tipo: "activo" | "pasivo" | "capital" | "ingreso" | "gasto";
          saldo?: number;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          codigo?: string;
          nombre?: string;
          tipo?: "activo" | "pasivo" | "capital" | "ingreso" | "gasto";
          saldo?: number;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      asientos_contables: {
        Row: {
          id: string;
          numero: number;
          fecha: string;
          descripcion: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          numero?: number;
          fecha?: string;
          descripcion: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          numero?: number;
          fecha?: string;
          descripcion?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      asiento_detalle: {
        Row: {
          id: string;
          asiento_id: string;
          cuenta_id: string;
          debe: number;
          haber: number;
        };
        Insert: {
          id?: string;
          asiento_id: string;
          cuenta_id: string;
          debe?: number;
          haber?: number;
        };
        Update: {
          id?: string;
          asiento_id?: string;
          cuenta_id?: string;
          debe?: number;
          haber?: number;
        };
        Relationships: [];
      };
      departamentos: {
        Row: {
          id: string;
          nombre: string;
          descripcion: string | null;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          descripcion?: string | null;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          descripcion?: string | null;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      empleados: {
        Row: {
          id: string;
          nombre: string;
          email: string | null;
          telefono: string | null;
          cargo: string | null;
          departamento_id: string | null;
          fecha_ingreso: string;
          salario: number | null;
          estado: "activo" | "inactivo";
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          email?: string | null;
          telefono?: string | null;
          cargo?: string | null;
          departamento_id?: string | null;
          fecha_ingreso?: string;
          salario?: number | null;
          estado?: "activo" | "inactivo";
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          email?: string | null;
          telefono?: string | null;
          cargo?: string | null;
          departamento_id?: string | null;
          fecha_ingreso?: string;
          salario?: number | null;
          estado?: "activo" | "inactivo";
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      // ===== TransCaña Tables =====
      parcelas: {
        Row: { id: string; codigo: string; nombre: string; ubicacion: string | null; hectareas: number; variedad_cana: string | null; fecha_siembra: string | null; estado: "activa" | "en_corte" | "cosechada" | "en_reposo"; user_id: string; created_at: string; };
        Insert: { id?: string; codigo: string; nombre: string; ubicacion?: string | null; hectareas: number; variedad_cana?: string | null; fecha_siembra?: string | null; estado?: "activa" | "en_corte" | "cosechada" | "en_reposo"; user_id: string; created_at?: string; };
        Update: { id?: string; codigo?: string; nombre?: string; ubicacion?: string | null; hectareas?: number; variedad_cana?: string | null; fecha_siembra?: string | null; estado?: "activa" | "en_corte" | "cosechada" | "en_reposo"; user_id?: string; created_at?: string; };
        Relationships: [];
      };
      operaciones_campo: {
        Row: { id: string; numero: number; tipo: "corte" | "alce" | "transporte"; parcela_id: string | null; fecha: string; turno: "diurno" | "nocturno" | null; cuadrilla: string | null; hectareas_trabajadas: number; toneladas: number; vehiculo_id: string | null; chofer: string | null; origen: string | null; destino: string | null; observaciones: string | null; estado: "programada" | "en_proceso" | "completada" | "cancelada"; user_id: string; created_at: string; };
        Insert: { id?: string; numero?: number; tipo: "corte" | "alce" | "transporte"; parcela_id?: string | null; fecha?: string; turno?: "diurno" | "nocturno" | null; cuadrilla?: string | null; hectareas_trabajadas?: number; toneladas?: number; vehiculo_id?: string | null; chofer?: string | null; origen?: string | null; destino?: string | null; observaciones?: string | null; estado?: "programada" | "en_proceso" | "completada" | "cancelada"; user_id: string; created_at?: string; };
        Update: { id?: string; numero?: number; tipo?: "corte" | "alce" | "transporte"; parcela_id?: string | null; fecha?: string; turno?: "diurno" | "nocturno" | null; cuadrilla?: string | null; hectareas_trabajadas?: number; toneladas?: number; vehiculo_id?: string | null; chofer?: string | null; origen?: string | null; destino?: string | null; observaciones?: string | null; estado?: "programada" | "en_proceso" | "completada" | "cancelada"; user_id?: string; created_at?: string; };
        Relationships: [];
      };
      registros_pesaje: {
        Row: { id: string; numero: number; ticket: string | null; vehiculo_placa: string; chofer: string | null; parcela_id: string | null; tipo: "entrada" | "salida"; peso_bruto: number; tara: number; peso_neto: number; porcentaje_impurezas: number; peso_neto_ajustado: number; bascula: string | null; fecha_hora: string; observaciones: string | null; estado: "pendiente" | "completo" | "anulado"; user_id: string; created_at: string; };
        Insert: { id?: string; numero?: number; ticket?: string | null; vehiculo_placa: string; chofer?: string | null; parcela_id?: string | null; tipo: "entrada" | "salida"; peso_bruto?: number; tara?: number; peso_neto?: number; porcentaje_impurezas?: number; peso_neto_ajustado?: number; bascula?: string | null; fecha_hora?: string; observaciones?: string | null; estado?: "pendiente" | "completo" | "anulado"; user_id: string; created_at?: string; };
        Update: { id?: string; numero?: number; ticket?: string | null; vehiculo_placa?: string; chofer?: string | null; parcela_id?: string | null; tipo?: "entrada" | "salida"; peso_bruto?: number; tara?: number; peso_neto?: number; porcentaje_impurezas?: number; peso_neto_ajustado?: number; bascula?: string | null; fecha_hora?: string; observaciones?: string | null; estado?: "pendiente" | "completo" | "anulado"; user_id?: string; created_at?: string; };
        Relationships: [];
      };
      vehiculos: {
        Row: { id: string; placa: string; tipo: "camion" | "tractor" | "alzadora" | "cosechadora" | "vehiculo_liviano" | "otro"; marca: string | null; modelo: string | null; anio: number | null; capacidad_toneladas: number | null; kilometraje: number; estado: "disponible" | "en_operacion" | "en_mantenimiento" | "fuera_servicio"; chofer_asignado: string | null; user_id: string; created_at: string; };
        Insert: { id?: string; placa: string; tipo: "camion" | "tractor" | "alzadora" | "cosechadora" | "vehiculo_liviano" | "otro"; marca?: string | null; modelo?: string | null; anio?: number | null; capacidad_toneladas?: number | null; kilometraje?: number; estado?: "disponible" | "en_operacion" | "en_mantenimiento" | "fuera_servicio"; chofer_asignado?: string | null; user_id: string; created_at?: string; };
        Update: { id?: string; placa?: string; tipo?: "camion" | "tractor" | "alzadora" | "cosechadora" | "vehiculo_liviano" | "otro"; marca?: string | null; modelo?: string | null; anio?: number | null; capacidad_toneladas?: number | null; kilometraje?: number; estado?: "disponible" | "en_operacion" | "en_mantenimiento" | "fuera_servicio"; chofer_asignado?: string | null; user_id?: string; created_at?: string; };
        Relationships: [];
      };
      mantenimientos: {
        Row: { id: string; vehiculo_id: string; tipo: "preventivo" | "correctivo" | "emergencia"; descripcion: string; fecha: string; costo: number; kilometraje: number | null; taller: string | null; estado: "programado" | "en_proceso" | "completado"; user_id: string; created_at: string; };
        Insert: { id?: string; vehiculo_id: string; tipo: "preventivo" | "correctivo" | "emergencia"; descripcion: string; fecha?: string; costo?: number; kilometraje?: number | null; taller?: string | null; estado?: "programado" | "en_proceso" | "completado"; user_id: string; created_at?: string; };
        Update: { id?: string; vehiculo_id?: string; tipo?: "preventivo" | "correctivo" | "emergencia"; descripcion?: string; fecha?: string; costo?: number; kilometraje?: number | null; taller?: string | null; estado?: "programado" | "en_proceso" | "completado"; user_id?: string; created_at?: string; };
        Relationships: [];
      };
      despachos_combustible: {
        Row: { id: string; numero: number; vehiculo_id: string | null; vehiculo_placa: string; tipo_combustible: "diesel" | "gasolina_90" | "gasolina_95" | "glp"; galones: number; precio_galon: number; total: number; kilometraje: number | null; operador: string | null; estacion: string | null; fecha: string; user_id: string; created_at: string; };
        Insert: { id?: string; numero?: number; vehiculo_id?: string | null; vehiculo_placa: string; tipo_combustible: "diesel" | "gasolina_90" | "gasolina_95" | "glp"; galones: number; precio_galon: number; total: number; kilometraje?: number | null; operador?: string | null; estacion?: string | null; fecha?: string; user_id: string; created_at?: string; };
        Update: { id?: string; numero?: number; vehiculo_id?: string | null; vehiculo_placa?: string; tipo_combustible?: "diesel" | "gasolina_90" | "gasolina_95" | "glp"; galones?: number; precio_galon?: number; total?: number; kilometraje?: number | null; operador?: string | null; estacion?: string | null; fecha?: string; user_id?: string; created_at?: string; };
        Relationships: [];
      };
      centros_costo: {
        Row: { id: string; codigo: string; nombre: string; tipo: "operativo" | "administrativo" | "logistico" | null; presupuesto: number; user_id: string; created_at: string; };
        Insert: { id?: string; codigo: string; nombre: string; tipo?: "operativo" | "administrativo" | "logistico" | null; presupuesto?: number; user_id: string; created_at?: string; };
        Update: { id?: string; codigo?: string; nombre?: string; tipo?: "operativo" | "administrativo" | "logistico" | null; presupuesto?: number; user_id?: string; created_at?: string; };
        Relationships: [];
      };
      registros_costo: {
        Row: { id: string; centro_costo_id: string | null; parcela_id: string | null; concepto: string; categoria: "mano_obra" | "combustible" | "mantenimiento" | "insumos" | "transporte" | "otros" | null; monto: number; fecha: string; referencia: string | null; user_id: string; created_at: string; };
        Insert: { id?: string; centro_costo_id?: string | null; parcela_id?: string | null; concepto: string; categoria?: "mano_obra" | "combustible" | "mantenimiento" | "insumos" | "transporte" | "otros" | null; monto: number; fecha?: string; referencia?: string | null; user_id: string; created_at?: string; };
        Update: { id?: string; centro_costo_id?: string | null; parcela_id?: string | null; concepto?: string; categoria?: "mano_obra" | "combustible" | "mantenimiento" | "insumos" | "transporte" | "otros" | null; monto?: number; fecha?: string; referencia?: string | null; user_id?: string; created_at?: string; };
        Relationships: [];
      };
      roles: {
        Row: { id: string; nombre: string; descripcion: string | null; permisos: Json; created_at: string; };
        Insert: { id?: string; nombre: string; descripcion?: string | null; permisos?: Json; created_at?: string; };
        Update: { id?: string; nombre?: string; descripcion?: string | null; permisos?: Json; created_at?: string; };
        Relationships: [];
      };
      auditoria: {
        Row: { id: string; user_id: string | null; accion: string; modulo: string; detalle: string | null; ip: string | null; created_at: string; };
        Insert: { id?: string; user_id?: string | null; accion: string; modulo: string; detalle?: string | null; ip?: string | null; created_at?: string; };
        Update: { id?: string; user_id?: string | null; accion?: string; modulo?: string; detalle?: string | null; ip?: string | null; created_at?: string; };
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          nombre: string;
          empresa: string | null;
          email: string | null;
          telefono: string | null;
          origen: string | null;
          etapa: "nuevo" | "contactado" | "propuesta" | "negociacion" | "ganado" | "perdido";
          valor_estimado: number;
          notas: string | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          empresa?: string | null;
          email?: string | null;
          telefono?: string | null;
          origen?: string | null;
          etapa?: "nuevo" | "contactado" | "propuesta" | "negociacion" | "ganado" | "perdido";
          valor_estimado?: number;
          notas?: string | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          empresa?: string | null;
          email?: string | null;
          telefono?: string | null;
          origen?: string | null;
          etapa?: "nuevo" | "contactado" | "propuesta" | "negociacion" | "ganado" | "perdido";
          valor_estimado?: number;
          notas?: string | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      // ===== Sprints 8-14: Advanced Modules =====
      zafras: {
        Row: { id: string; codigo: string; nombre: string; fecha_inicio: string; fecha_fin: string | null; meta_toneladas: number; meta_hectareas: number; toneladas_procesadas: number; hectareas_cosechadas: number; rendimiento_promedio: number; estado: "planificada" | "activa" | "pausada" | "completada" | "cancelada"; notas: string | null; user_id: string; created_at: string; updated_at: string; };
        Insert: { id?: string; codigo: string; nombre: string; fecha_inicio: string; fecha_fin?: string | null; meta_toneladas?: number; meta_hectareas?: number; estado?: "planificada" | "activa" | "pausada" | "completada" | "cancelada"; notas?: string | null; user_id: string; };
        Update: { nombre?: string; fecha_inicio?: string; fecha_fin?: string | null; meta_toneladas?: number; meta_hectareas?: number; toneladas_procesadas?: number; hectareas_cosechadas?: number; rendimiento_promedio?: number; estado?: "planificada" | "activa" | "pausada" | "completada" | "cancelada"; notas?: string | null; updated_at?: string; };
        Relationships: [];
      };
      metas_zafra: {
        Row: { id: string; zafra_id: string; parcela_id: string | null; semana: number; meta_toneladas: number; toneladas_real: number; meta_hectareas: number; hectareas_real: number; cumplimiento_porcentaje: number; observaciones: string | null; user_id: string; created_at: string; };
        Insert: { id?: string; zafra_id: string; parcela_id?: string | null; semana: number; meta_toneladas?: number; toneladas_real?: number; meta_hectareas?: number; hectareas_real?: number; cumplimiento_porcentaje?: number; observaciones?: string | null; user_id: string; };
        Update: { meta_toneladas?: number; toneladas_real?: number; meta_hectareas?: number; hectareas_real?: number; cumplimiento_porcentaje?: number; observaciones?: string | null; };
        Relationships: [];
      };
      rutas_transporte: {
        Row: { id: string; codigo: string; nombre: string; origen: string; destino: string; distancia_km: number; tiempo_estimado_min: number; tipo: "cana" | "insumos" | "producto_terminado" | "personal"; estado: "activa" | "inactiva" | "en_revision"; puntos_gps: Json; user_id: string; created_at: string; };
        Insert: { id?: string; codigo: string; nombre: string; origen: string; destino: string; distancia_km?: number; tiempo_estimado_min?: number; tipo?: "cana" | "insumos" | "producto_terminado" | "personal"; estado?: "activa" | "inactiva" | "en_revision"; user_id: string; };
        Update: { nombre?: string; origen?: string; destino?: string; distancia_km?: number; tiempo_estimado_min?: number; tipo?: "cana" | "insumos" | "producto_terminado" | "personal"; estado?: "activa" | "inactiva" | "en_revision"; };
        Relationships: [];
      };
      viajes: {
        Row: { id: string; numero: number; ruta_id: string | null; vehiculo_id: string | null; chofer: string | null; fecha_salida: string; fecha_llegada: string | null; toneladas_transportadas: number; kilometraje_inicio: number; kilometraje_fin: number; combustible_consumido: number; parcela_origen_id: string | null; destino_ingenio: string | null; ticket_pesaje: string | null; costo_flete: number; estado: "programado" | "en_transito" | "entregado" | "cancelado"; incidencias: string | null; gps_tracking: Json; user_id: string; created_at: string; };
        Insert: { id?: string; ruta_id?: string | null; vehiculo_id?: string | null; chofer?: string | null; toneladas_transportadas?: number; kilometraje_inicio?: number; parcela_origen_id?: string | null; destino_ingenio?: string | null; ticket_pesaje?: string | null; costo_flete?: number; estado?: "programado" | "en_transito" | "entregado" | "cancelado"; user_id: string; };
        Update: { fecha_llegada?: string; kilometraje_fin?: number; combustible_consumido?: number; incidencias?: string | null; estado?: "programado" | "en_transito" | "entregado" | "cancelado"; };
        Relationships: [];
      };
      muestras_laboratorio: {
        Row: { id: string; numero: number; codigo_muestra: string; tipo_muestra: "cana" | "jugo" | "melaza" | "azucar" | "bagazo" | "agua"; parcela_id: string | null; ticket_pesaje: string | null; fecha_muestreo: string; punto_muestreo: string | null; responsable: string | null; temperatura: number | null; estado: "pendiente" | "en_analisis" | "completado" | "rechazado"; observaciones: string | null; user_id: string; created_at: string; };
        Insert: { id?: string; codigo_muestra: string; tipo_muestra: "cana" | "jugo" | "melaza" | "azucar" | "bagazo" | "agua"; parcela_id?: string | null; ticket_pesaje?: string | null; punto_muestreo?: string | null; responsable?: string | null; temperatura?: number | null; estado?: "pendiente" | "en_analisis" | "completado" | "rechazado"; observaciones?: string | null; user_id: string; };
        Update: { estado?: "pendiente" | "en_analisis" | "completado" | "rechazado"; observaciones?: string | null; };
        Relationships: [];
      };
      analisis_calidad: {
        Row: { id: string; muestra_id: string; brix: number; pol: number; pureza: number; fibra: number; humedad: number; cenizas: number; ph: number | null; color_icumsa: number | null; sacarosa: number; azucares_reductores: number; rendimiento_estimado: number; calificacion: "A" | "B" | "C" | "D" | "rechazado"; analista: string | null; equipo_utilizado: string | null; fecha_analisis: string; notas: string | null; user_id: string; created_at: string; };
        Insert: { id?: string; muestra_id: string; brix?: number; pol?: number; pureza?: number; fibra?: number; humedad?: number; cenizas?: number; ph?: number | null; color_icumsa?: number | null; sacarosa?: number; azucares_reductores?: number; rendimiento_estimado?: number; calificacion?: "A" | "B" | "C" | "D" | "rechazado"; analista?: string | null; notas?: string | null; user_id: string; };
        Update: { brix?: number; pol?: number; pureza?: number; fibra?: number; calificacion?: "A" | "B" | "C" | "D" | "rechazado"; };
        Relationships: [];
      };
      periodos_nomina: {
        Row: { id: string; codigo: string; nombre: string; tipo: "quincenal" | "mensual" | "semanal" | "liquidacion"; fecha_inicio: string; fecha_fin: string; fecha_pago: string | null; total_bruto: number; total_deducciones: number; total_neto: number; estado: "borrador" | "calculado" | "aprobado" | "pagado" | "anulado"; aprobado_por: string | null; notas: string | null; user_id: string; created_at: string; };
        Insert: { id?: string; codigo: string; nombre: string; tipo: "quincenal" | "mensual" | "semanal" | "liquidacion"; fecha_inicio: string; fecha_fin: string; fecha_pago?: string | null; estado?: "borrador" | "calculado" | "aprobado" | "pagado" | "anulado"; notas?: string | null; user_id: string; };
        Update: { total_bruto?: number; total_deducciones?: number; total_neto?: number; estado?: "borrador" | "calculado" | "aprobado" | "pagado" | "anulado"; aprobado_por?: string | null; };
        Relationships: [];
      };
      nomina_detalle: {
        Row: { id: string; periodo_id: string; empleado_id: string; salario_base: number; horas_extra: number; monto_horas_extra: number; bonificaciones: number; comisiones: number; total_ingresos: number; deduccion_igss: number; deduccion_isr: number; otras_deducciones: number; anticipos: number; total_deducciones: number; salario_neto: number; dias_trabajados: number; faltas: number; estado: "pendiente" | "calculado" | "aprobado" | "pagado"; user_id: string; created_at: string; };
        Insert: { id?: string; periodo_id: string; empleado_id: string; salario_base?: number; estado?: "pendiente" | "calculado" | "aprobado" | "pagado"; user_id: string; };
        Update: { salario_base?: number; horas_extra?: number; monto_horas_extra?: number; bonificaciones?: number; total_ingresos?: number; deduccion_igss?: number; deduccion_isr?: number; total_deducciones?: number; salario_neto?: number; estado?: "pendiente" | "calculado" | "aprobado" | "pagado"; };
        Relationships: [];
      };
      colonos: {
        Row: { id: string; codigo: string; nombre: string; dpi: string | null; nit: string | null; telefono: string | null; email: string | null; direccion: string | null; parcelas_asignadas: Json; tipo_contrato: "individual" | "cooperativa" | "asociacion" | "arrendamiento"; precio_tonelada: number; cuenta_bancaria: string | null; banco: string | null; estado: "activo" | "inactivo" | "suspendido"; user_id: string; created_at: string; };
        Insert: { id?: string; codigo: string; nombre: string; dpi?: string | null; nit?: string | null; telefono?: string | null; email?: string | null; direccion?: string | null; tipo_contrato?: "individual" | "cooperativa" | "asociacion" | "arrendamiento"; precio_tonelada?: number; cuenta_bancaria?: string | null; banco?: string | null; user_id: string; };
        Update: { nombre?: string; telefono?: string | null; email?: string | null; tipo_contrato?: "individual" | "cooperativa" | "asociacion" | "arrendamiento"; precio_tonelada?: number; estado?: "activo" | "inactivo" | "suspendido"; };
        Relationships: [];
      };
      entregas_colono: {
        Row: { id: string; numero: number; colono_id: string; parcela_id: string | null; zafra_id: string | null; fecha_entrega: string; toneladas_brutas: number; porcentaje_impurezas: number; toneladas_netas: number; precio_tonelada: number; monto_bruto: number; deducciones: number; concepto_deducciones: string | null; monto_neto: number; ticket_pesaje: string | null; calificacion_calidad: "A" | "B" | "C" | "D"; estado: "pendiente" | "verificado" | "liquidado" | "pagado" | "rechazado"; user_id: string; created_at: string; };
        Insert: { id?: string; colono_id: string; parcela_id?: string | null; zafra_id?: string | null; toneladas_brutas?: number; porcentaje_impurezas?: number; toneladas_netas?: number; precio_tonelada?: number; monto_bruto?: number; deducciones?: number; monto_neto?: number; ticket_pesaje?: string | null; calificacion_calidad?: "A" | "B" | "C" | "D"; user_id: string; };
        Update: { estado?: "pendiente" | "verificado" | "liquidado" | "pagado" | "rechazado"; };
        Relationships: [];
      };
      kpi_snapshots: {
        Row: { id: string; fecha: string; modulo: string; indicador: string; valor: number; valor_anterior: number | null; variacion_porcentaje: number | null; meta: number | null; unidad: string | null; user_id: string; created_at: string; };
        Insert: { id?: string; fecha?: string; modulo: string; indicador: string; valor: number; valor_anterior?: number | null; meta?: number | null; unidad?: string | null; user_id: string; };
        Update: { valor?: number; valor_anterior?: number | null; variacion_porcentaje?: number | null; };
        Relationships: [];
      };
      alertas_sistema: {
        Row: { id: string; tipo: "critica" | "advertencia" | "info" | "exito"; modulo: string; titulo: string; mensaje: string; datos: Json; leida: boolean; user_id: string; created_at: string; };
        Insert: { id?: string; tipo: "critica" | "advertencia" | "info" | "exito"; modulo: string; titulo: string; mensaje: string; datos?: Json; user_id: string; };
        Update: { leida?: boolean; };
        Relationships: [];
      };
      equipos_industriales: {
        Row: { id: string; codigo: string; nombre: string; tipo: "molino" | "caldera" | "centrifuga" | "evaporador" | "cristalizador" | "filtro" | "bomba" | "motor" | "transportador" | "otro"; area: "patio" | "molinos" | "calderas" | "clarificacion" | "evaporacion" | "cristalizacion" | "centrifugado" | "secado" | "empaque" | "laboratorio" | null; marca: string | null; modelo: string | null; numero_serie: string | null; fecha_instalacion: string | null; potencia: string | null; capacidad: string | null; horas_operacion: number; estado: "operativo" | "en_mantenimiento" | "fuera_servicio" | "en_reserva" | "dado_baja"; criticidad: "critica" | "alta" | "media" | "baja"; ultimo_mantenimiento: string | null; proximo_mantenimiento: string | null; user_id: string; created_at: string; };
        Insert: { id?: string; codigo: string; nombre: string; tipo: "molino" | "caldera" | "centrifuga" | "evaporador" | "cristalizador" | "filtro" | "bomba" | "motor" | "transportador" | "otro"; area?: string | null; marca?: string | null; modelo?: string | null; criticidad?: "critica" | "alta" | "media" | "baja"; user_id: string; };
        Update: { nombre?: string; estado?: "operativo" | "en_mantenimiento" | "fuera_servicio" | "en_reserva" | "dado_baja"; horas_operacion?: number; ultimo_mantenimiento?: string | null; proximo_mantenimiento?: string | null; };
        Relationships: [];
      };
      ordenes_trabajo: {
        Row: { id: string; numero: number; equipo_id: string; tipo: "preventivo" | "correctivo" | "predictivo" | "emergencia" | "mejora"; prioridad: "critica" | "alta" | "media" | "baja"; titulo: string; descripcion: string | null; solicitante: string | null; tecnico_asignado: string | null; fecha_solicitud: string; fecha_programada: string | null; fecha_inicio: string | null; fecha_fin: string | null; horas_trabajo: number; costo_mano_obra: number; costo_repuestos: number; costo_total: number; causa_raiz: string | null; solucion: string | null; estado: "abierta" | "asignada" | "en_progreso" | "en_espera" | "completada" | "cerrada" | "cancelada"; user_id: string; created_at: string; };
        Insert: { id?: string; equipo_id: string; tipo: "preventivo" | "correctivo" | "predictivo" | "emergencia" | "mejora"; prioridad?: "critica" | "alta" | "media" | "baja"; titulo: string; descripcion?: string | null; solicitante?: string | null; tecnico_asignado?: string | null; user_id: string; };
        Update: { estado?: "abierta" | "asignada" | "en_progreso" | "en_espera" | "completada" | "cerrada" | "cancelada"; horas_trabajo?: number; costo_mano_obra?: number; costo_repuestos?: number; costo_total?: number; causa_raiz?: string | null; solucion?: string | null; fecha_fin?: string; };
        Relationships: [];
      };
      repuestos: {
        Row: { id: string; codigo: string; nombre: string; descripcion: string | null; categoria: "mecanico" | "electrico" | "hidraulico" | "neumatico" | "instrumentacion" | "general" | null; unidad_medida: string; stock_actual: number; stock_minimo: number; precio_unitario: number; proveedor: string | null; ubicacion_almacen: string | null; equipo_compatible: Json; estado: "disponible" | "agotado" | "descontinuado"; user_id: string; created_at: string; };
        Insert: { id?: string; codigo: string; nombre: string; descripcion?: string | null; categoria?: string | null; stock_actual?: number; stock_minimo?: number; precio_unitario?: number; proveedor?: string | null; ubicacion_almacen?: string | null; user_id: string; };
        Update: { nombre?: string; stock_actual?: number; stock_minimo?: number; precio_unitario?: number; estado?: "disponible" | "agotado" | "descontinuado"; };
        Relationships: [];
      };
      consumo_repuestos: {
        Row: { id: string; orden_trabajo_id: string; repuesto_id: string; cantidad: number; precio_unitario: number; total: number; user_id: string; created_at: string; };
        Insert: { id?: string; orden_trabajo_id: string; repuesto_id: string; cantidad: number; precio_unitario: number; total: number; user_id: string; };
        Update: { cantidad?: number; precio_unitario?: number; total?: number; };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Producto = Database["public"]["Tables"]["productos"]["Row"];
export type ProductoInsert = Database["public"]["Tables"]["productos"]["Insert"];
export type ProductoUpdate = Database["public"]["Tables"]["productos"]["Update"];

export type Cliente = Database["public"]["Tables"]["clientes"]["Row"];
export type ClienteInsert = Database["public"]["Tables"]["clientes"]["Insert"];

export type Factura = Database["public"]["Tables"]["facturas"]["Row"];
export type FacturaInsert = Database["public"]["Tables"]["facturas"]["Insert"];

export type FacturaDetalle = Database["public"]["Tables"]["factura_detalle"]["Row"];
export type FacturaDetalleInsert = Database["public"]["Tables"]["factura_detalle"]["Insert"];

export type Proveedor = Database["public"]["Tables"]["proveedores"]["Row"];
export type OrdenCompra = Database["public"]["Tables"]["ordenes_compra"]["Row"];
export type OrdenCompraDetalle = Database["public"]["Tables"]["orden_compra_detalle"]["Row"];

export type CuentaContable = Database["public"]["Tables"]["cuentas_contables"]["Row"];
export type AsientoContable = Database["public"]["Tables"]["asientos_contables"]["Row"];
export type AsientoDetalle = Database["public"]["Tables"]["asiento_detalle"]["Row"];

export type Departamento = Database["public"]["Tables"]["departamentos"]["Row"];
export type Empleado = Database["public"]["Tables"]["empleados"]["Row"];

export type Lead = Database["public"]["Tables"]["leads"]["Row"];

// Sprints 8-14 types
export type Zafra = Database["public"]["Tables"]["zafras"]["Row"];
export type MetaZafra = Database["public"]["Tables"]["metas_zafra"]["Row"];
export type RutaTransporte = Database["public"]["Tables"]["rutas_transporte"]["Row"];
export type Viaje = Database["public"]["Tables"]["viajes"]["Row"];
export type MuestraLaboratorio = Database["public"]["Tables"]["muestras_laboratorio"]["Row"];
export type AnalisisCalidad = Database["public"]["Tables"]["analisis_calidad"]["Row"];
export type PeriodoNomina = Database["public"]["Tables"]["periodos_nomina"]["Row"];
export type NominaDetalle = Database["public"]["Tables"]["nomina_detalle"]["Row"];
export type Colono = Database["public"]["Tables"]["colonos"]["Row"];
export type EntregaColono = Database["public"]["Tables"]["entregas_colono"]["Row"];
export type KpiSnapshot = Database["public"]["Tables"]["kpi_snapshots"]["Row"];
export type AlertaSistema = Database["public"]["Tables"]["alertas_sistema"]["Row"];
export type EquipoIndustrial = Database["public"]["Tables"]["equipos_industriales"]["Row"];
export type OrdenTrabajo = Database["public"]["Tables"]["ordenes_trabajo"]["Row"];
export type Repuesto = Database["public"]["Tables"]["repuestos"]["Row"];
export type ConsumoRepuesto = Database["public"]["Tables"]["consumo_repuestos"]["Row"];
