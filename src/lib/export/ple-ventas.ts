/**
 * PLE Registro de Ventas 14.1
 * Formato SUNAT Res. 112-2021/SUNAT
 * LE|RUC|YYYYMM00|140100|00|1|1|1.TXT
 */

interface FacturaPLE {
  id: string;
  numero: number;
  fecha: string;
  cliente_nombre?: string;
  cliente_ruc?: string;
  subtotal: number;
  impuesto: number;
  total: number;
  estado: string;
}

export function generarPLEVentas14(
  ruc: string,
  periodo: string, // YYYYMM
  facturas: FacturaPLE[]
): string {
  const lines: string[] = [];

  facturas.forEach((f, idx) => {
    const cuo = String(idx + 1).padStart(8, "0");
    const correlativo = `M${String(idx + 1).padStart(7, "0")}`;
    const fechaEmision = f.fecha.replace(/-/g, "/").split("/").reverse().join("/"); // DD/MM/YYYY
    const fechaParts = f.fecha.split("-");
    const fechaFormat = `${fechaParts[2]}/${fechaParts[1]}/${fechaParts[0]}`;

    // Tipo comprobante: 01=Factura, 03=Boleta, 07=NC, 08=ND
    const tipoComprobante = "01";
    const serie = "E001";
    const numero = String(f.numero).padStart(8, "0");

    // Tipo doc cliente: 6=RUC, 1=DNI
    const tipoDoc = f.cliente_ruc && f.cliente_ruc.length === 11 ? "6" : "1";
    const numDoc = f.cliente_ruc || "00000000000";
    const razonSocial = (f.cliente_nombre || "CLIENTE VARIOS").substring(0, 100);

    // Montos
    const baseImponible = f.subtotal.toFixed(2);
    const igv = f.impuesto.toFixed(2);
    const total = f.total.toFixed(2);

    // Campos PLE 14.1 separados por |
    const line = [
      `${periodo}00`,         // 1. Periodo
      cuo,                     // 2. CUO
      correlativo,             // 3. Correlativo
      fechaFormat,             // 4. Fecha emision
      "",                      // 5. Fecha vencimiento
      tipoComprobante,         // 6. Tipo comprobante (Tabla 10)
      serie,                   // 7. Serie
      "",                      // 8. Año emision DAM
      numero,                  // 9. Numero
      "",                      // 10. Numero final (consolidado)
      tipoDoc,                 // 11. Tipo doc identidad (Tabla 2)
      numDoc,                  // 12. Numero doc
      razonSocial,             // 13. Razon social
      "",                      // 14. Valor facturado exportacion
      baseImponible,           // 15. Base imponible gravada
      "0.00",                  // 16. Descuento base imponible
      igv,                     // 17. IGV
      "0.00",                  // 18. Descuento IGV
      "0.00",                  // 19. Monto exonerado
      "0.00",                  // 20. Monto inafecto
      "0.00",                  // 21. ISC
      "0.00",                  // 22. Base imponible arroz
      "0.00",                  // 23. Impuesto arroz
      "0.00",                  // 24. ICBPER
      "0.00",                  // 25. Otros tributos
      total,                   // 26. Total comprobante
      "PEN",                   // 27. Codigo moneda (Tabla 4)
      "1.000",                 // 28. Tipo cambio
      "",                      // 29. Fecha emision modificado
      "",                      // 30. Tipo comprobante modificado
      "",                      // 31. Serie modificado
      "",                      // 32. Codigo DUA modificado
      "",                      // 33. Numero modificado
      "",                      // 34. Identificador contrato
      "",                      // 35. Error tipo 1
      "",                      // 36. Indicador pago
      "1",                     // 37. Estado (1=vigente, 2=anulado, 9=validar)
      "",                      // 38. Campos libres
    ].join("|");

    lines.push(line);
  });

  return lines.join("\n");
}

export function nombreArchivoPLE14(ruc: string, periodo: string): string {
  return `LE${ruc}${periodo}00140100001111.TXT`;
}
