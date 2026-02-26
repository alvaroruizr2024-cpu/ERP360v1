"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearProducto(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("productos").insert({
    nombre: formData.get("nombre") as string,
    sku: formData.get("sku") as string,
    descripcion: (formData.get("descripcion") as string) || null,
    precio: parseFloat(formData.get("precio") as string),
    costo: parseFloat(formData.get("costo") as string) || 0,
    stock: parseInt(formData.get("stock") as string) || 0,
    stock_minimo: parseInt(formData.get("stock_minimo") as string) || 0,
    categoria: (formData.get("categoria") as string) || null,
    estado: (formData.get("estado") as "activo" | "inactivo") || "activo",
    user_id: user.id,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/inventario");
  revalidatePath("/dashboard");
  redirect("/dashboard/inventario");
}

export async function actualizarProducto(id: string, formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("productos")
    .update({
      nombre: formData.get("nombre") as string,
      sku: formData.get("sku") as string,
      descripcion: (formData.get("descripcion") as string) || null,
      precio: parseFloat(formData.get("precio") as string),
      costo: parseFloat(formData.get("costo") as string) || 0,
      stock: parseInt(formData.get("stock") as string) || 0,
      stock_minimo: parseInt(formData.get("stock_minimo") as string) || 0,
      categoria: (formData.get("categoria") as string) || null,
      estado: (formData.get("estado") as "activo" | "inactivo") || "activo",
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/inventario");
  revalidatePath("/dashboard");
  redirect("/dashboard/inventario");
}

export async function eliminarProducto(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("productos").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/inventario");
  revalidatePath("/dashboard");
  redirect("/dashboard/inventario");
}
