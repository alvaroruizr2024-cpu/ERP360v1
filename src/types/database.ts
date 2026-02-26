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
