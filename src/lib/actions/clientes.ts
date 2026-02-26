"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearCliente(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("clientes").insert({
    nombre: formData.get("nombre") as string,
    email: (formData.get("email") as string) || null,
    telefono: (formData.get("telefono") as string) || null,
    direccion: (formData.get("direccion") as string) || null,
    rfc: (formData.get("rfc") as string) || null,
    user_id: user.id,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/ventas");
  revalidatePath("/dashboard/ventas/clientes");
  revalidatePath("/dashboard");
}

export async function eliminarCliente(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("clientes").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/ventas");
  redirect("/dashboard/ventas/clientes");
}
