"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type LineItem = {
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
};

export async function crearFactura(data: {
  cliente_id: string;
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

  const { data: factura, error: facturaError } = await supabase
    .from("facturas")
    .insert({
      cliente_id: data.cliente_id,
      subtotal,
      impuesto,
      total,
      notas: data.notas || null,
      user_id: user.id,
    })
    .select()
    .single();

  if (facturaError) throw new Error(facturaError.message);

  const detalles = data.items.map((item) => ({
    factura_id: factura.id,
    producto_id: item.producto_id,
    cantidad: item.cantidad,
    precio_unitario: item.precio_unitario,
    subtotal: item.cantidad * item.precio_unitario,
  }));

  const { error: detalleError } = await supabase
    .from("factura_detalle")
    .insert(detalles);

  if (detalleError) throw new Error(detalleError.message);

  // Decrement stock for each product
  for (const item of data.items) {
    const { data: producto } = await supabase
      .from("productos")
      .select("stock")
      .eq("id", item.producto_id)
      .single();

    if (producto) {
      await supabase
        .from("productos")
        .update({ stock: producto.stock - item.cantidad })
        .eq("id", item.producto_id);
    }
  }

  revalidatePath("/dashboard/ventas");
  revalidatePath("/dashboard/inventario");
  revalidatePath("/dashboard");
  redirect("/dashboard/ventas");
}
