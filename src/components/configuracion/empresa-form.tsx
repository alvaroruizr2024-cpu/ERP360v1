"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Save, Building2 } from "lucide-react";

interface EmpresaData {
  nombre: string;
  rfc: string;
  direccion: string;
  telefono: string;
  email: string;
  sitio_web: string;
}

const STORAGE_KEY = "erp360_empresa";

export function EmpresaForm() {
  const [data, setData] = useState<EmpresaData>({
    nombre: "INNOVAQ Solutions",
    rfc: "",
    direccion: "",
    telefono: "",
    email: "",
    sitio_web: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    toast.success("Datos de empresa guardados");
  }

  function update(field: keyof EmpresaData, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  const fields: { key: keyof EmpresaData; label: string; type?: string }[] = [
    { key: "nombre", label: "Nombre de la Empresa" },
    { key: "rfc", label: "RFC" },
    { key: "direccion", label: "Dirección" },
    { key: "telefono", label: "Teléfono", type: "tel" },
    { key: "email", label: "Correo electrónico", type: "email" },
    { key: "sitio_web", label: "Sitio web", type: "url" },
  ];

  return (
    <form onSubmit={handleSave} className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Building2 className="w-6 h-6 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Información General</h3>
      </div>

      {fields.map((f) => (
        <div key={f.key}>
          <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
          <input
            type={f.type || "text"}
            value={data[f.key]}
            onChange={(e) => update(f.key, e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      ))}

      <button
        type="submit"
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors"
      >
        <Save className="w-4 h-4" />
        Guardar Cambios
      </button>
    </form>
  );
}
