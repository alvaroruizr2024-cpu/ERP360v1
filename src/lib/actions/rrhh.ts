"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearDepartamento(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("departamentos").insert({
    nombre: formData.get("nombre") as string,
    descripcion: (formData.get("descripcion") as string) || null,
    user_id: user.id,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/rrhh");
}

export async function crearEmpleado(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("empleados").insert({
    nombre: formData.get("nombre") as string,
    email: (formData.get("email") as string) || null,
    telefono: (formData.get("telefono") as string) || null,
    cargo: (formData.get("cargo") as string) || null,
    departamento_id: (formData.get("departamento_id") as string) || null,
    fecha_ingreso: (formData.get("fecha_ingreso") as string) || undefined,
    salario: formData.get("salario")
      ? parseFloat(formData.get("salario") as string)
      : null,
    estado: (formData.get("estado") as "activo" | "inactivo") || "activo",
    user_id: user.id,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/rrhh");
  revalidatePath("/dashboard");
  redirect("/dashboard/rrhh");
}

export async function actualizarEmpleado(id: string, formData: FormData) {
  const supabase = createClient();

  const { error } = await supabase
    .from("empleados")
    .update({
      nombre: formData.get("nombre") as string,
      email: (formData.get("email") as string) || null,
      telefono: (formData.get("telefono") as string) || null,
      cargo: (formData.get("cargo") as string) || null,
      departamento_id: (formData.get("departamento_id") as string) || null,
      salario: formData.get("salario")
        ? parseFloat(formData.get("salario") as string)
        : null,
      estado: (formData.get("estado") as "activo" | "inactivo") || "activo",
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/rrhh");
  redirect("/dashboard/rrhh");
}
