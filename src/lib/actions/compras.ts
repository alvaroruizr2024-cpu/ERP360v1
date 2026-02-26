"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearProveedor(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("proveedores").insert({
    nombre: formData.get("nombre") as string,
    contacto: (formData.get("contacto") as string) || null,
    email: (formData.get("email") as string) || null,
    telefono: (formData.get("telefono") as string) || null,
    direccion: (formData.get("direccion") as string) || null,
    rfc: (formData.get("rfc") as string) || null,
    user_id: user.id,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/compras");
}

type LineItem = {
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
};

export async function crearOrdenCompra(data: {
  proveedor_id: string;
  notas: string;
  items: LineItem[];
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const subtotal = data.items.reduce(
    (sum, item) => sum + item.cantidad * item.precio_unitario,
    0
  );
  const impuesto = subtotal * 0.16;
  const total = subtotal + impuesto;

  const { data: orden, error: ordenError } = await supabase
    .from("ordenes_compra")
    .insert({
      proveedor_id: data.proveedor_id,
      subtotal,
      impuesto,
      total,
      notas: data.notas || null,
      user_id: user.id,
    })
    .select()
    .single();

  if (ordenError) throw new Error(ordenError.message);

  const detalles = data.items.map((item) => ({
    orden_id: orden.id,
    producto_id: item.producto_id,
    cantidad: item.cantidad,
    precio_unitario: item.precio_unitario,
    subtotal: item.cantidad * item.precio_unitario,
  }));

  const { error: detalleError } = await supabase
    .from("orden_compra_detalle")
    .insert(detalles);

  if (detalleError) throw new Error(detalleError.message);

  revalidatePath("/dashboard/compras");
  revalidatePath("/dashboard");
  redirect("/dashboard/compras");
}

export async function recibirOrden(id: string) {
  const supabase = createClient();

  const { data: detalles } = await supabase
    .from("orden_compra_detalle")
    .select("producto_id, cantidad")
    .eq("orden_id", id);

  if (detalles) {
    for (const d of detalles) {
      const { data: producto } = await supabase
        .from("productos")
        .select("stock")
        .eq("id", d.producto_id)
        .single();

      if (producto) {
        await supabase
          .from("productos")
          .update({ stock: producto.stock + d.cantidad })
          .eq("id", d.producto_id);
      }
    }
  }

  const { error } = await supabase
    .from("ordenes_compra")
    .update({ estado: "recibida" })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/compras");
  revalidatePath("/dashboard/inventario");
  revalidatePath("/dashboard");
}
