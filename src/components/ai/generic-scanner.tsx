"use client";
import { DocScanner } from "./doc-scanner";

type Props = { tipo?: string; allowedTypes?: string[]; onScan?: (data: any) => void };

export function GenericScanner({ tipo = "documento_general", allowedTypes, onScan }: Props) {
  return <DocScanner tipo={tipo as any} onResult={(data) => {
    // Try to fill any matching form fields
    Object.entries(data).forEach(([key, value]) => {
      const el = document.getElementById(key) as HTMLInputElement;
      if (el && value) { el.value = String(value); el.dispatchEvent(new Event("input",{bubbles:true})); }
    });
    onScan?.(data);
  }} allowedTypes={allowedTypes as any} />;
}
