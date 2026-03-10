"use client";
import { DocScanner } from "./doc-scanner";

export function PesajeScanner() {
  const fill = (data: any) => {
    const map: Record<string,string> = { placa:"placa", chofer:"chofer", peso_bruto:"peso_bruto", tara:"tara", peso_neto:"peso_neto", bascula:"bascula", parcela:"parcela" };
    Object.entries(map).forEach(([key, fieldId]) => {
      const el = document.getElementById(fieldId) as HTMLInputElement;
      if (el && data[key]) { el.value = String(data[key]); el.dispatchEvent(new Event("input",{bubbles:true})); }
    });
  };
  return <DocScanner tipo="ticket_pesaje" onResult={fill} />;
}
