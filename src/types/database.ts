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
