"use client";
import { DocScanner } from "./doc-scanner";

export function FuelScanner({ onScan }: { onScan?: (data: any) => void }) {
  const fill = (data: any) => {
    // Auto-fill form fields by ID
    const map: Record<string,string> = { placa:"vehiculo_placa", galones:"galones", precio_galon:"precio_galon", km_odometro:"km_odometro", estacion:"estacion", conductor:"conductor" };
    Object.entries(map).forEach(([key, fieldId]) => {
      const el = document.getElementById(fieldId) as HTMLInputElement;
      if (el && data[key]) { el.value = String(data[key]); el.dispatchEvent(new Event("input",{bubbles:true})); }
    });
    onScan?.(data);
  };
  return <DocScanner tipo="vale_combustible" onResult={fill} allowedTypes={["vale_combustible","factura_compra"]} />;
}
