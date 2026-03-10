"use client";
import { DocScanner } from "./doc-scanner";

export function RRHHScanner() {
  const fill = (data: any) => {
    const map: Record<string,string> = { empleado:"nombre", dni:"numero_documento", cargo:"cargo", basico:"salario" };
    Object.entries(map).forEach(([key, fieldId]) => {
      const el = document.getElementById(fieldId) as HTMLInputElement;
      if (el && data[key]) { el.value = String(data[key]); el.dispatchEvent(new Event("input",{bubbles:true})); }
    });
  };
  return <DocScanner tipo="boleta_pago" onResult={fill} allowedTypes={["boleta_pago","documento_general"]} />;
}
