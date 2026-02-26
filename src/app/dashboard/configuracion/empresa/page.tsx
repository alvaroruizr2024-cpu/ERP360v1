import { EmpresaForm } from "@/components/configuracion/empresa-form";

export default function EmpresaPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Datos de Empresa</h1>
        <p className="text-slate-400 mt-1">Configura la información de tu empresa</p>
      </div>

      <EmpresaForm />
    </div>
  );
}
