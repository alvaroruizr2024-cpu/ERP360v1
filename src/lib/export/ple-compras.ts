/**
 * PLE Registro de Compras 8.1
 * Formato SUNAT Res. 112-2021/SUNAT
 */

interface CompraPLE {
  id: string;
  numero: number;
  fecha: string;
  proveedor_nombre?: string;
  proveedor_ruc?: string;
  subtotal: number;
  impuesto: number;
  total: number;
  estado: string;
}

export function generarPLECompras8(
  ruc: string,
  periodo: string,
  compras: CompraPLE[]
): string {
  const lines: string[] = [];

  compras.forEach((c, idx) => {
    const cuo = String(idx + 1).padStart(8, "0");
    const correlativo = `M${String(idx + 1).padStart(7, "0")}`;
    const fechaParts = c.fecha.split("-");
    const fechaFormat = `${fechaParts[2]}/${fechaParts[1]}/${fechaParts[0]}`;

    const tipoComprobante = "01";
    const serie = "F001";
    const numero = String(c.numero).padStart(8, "0");
    const tipoDoc = c.proveedor_ruc && c.proveedor_ruc.length === 11 ? "6" : "1";
    const numDoc = c.proveedor_ruc || "00000000000";
    const razonSocial = (c.proveedor_nombre || "PROVEEDOR VARIOS").substring(0, 100);

    const line = [
      `${periodo}00`,
      cuo,
      correlativo,
      fechaFormat,
      "",
      tipoComprobante,
      "",
      "",
      serie,
      "",
      numero,
      "",
      tipoDoc,
      numDoc,
      razonSocial,
      c.subtotal.toFixed(2),
      c.impuesto.toFixed(2),
      "0.00",
      "0.00",
      "0.00",
      "0.00",
      "0.00",
      "0.00",
      "0.00",
      c.total.toFixed(2),
      "PEN",
      "1.000",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "1",
      "",
    ].join("|");

    lines.push(line);
  });

  return lines.join("\n");
}

export function nombreArchivoPLE8(ruc: string, periodo: string): string {
  return `LE${ruc}${periodo}00080100001111.TXT`;
}
