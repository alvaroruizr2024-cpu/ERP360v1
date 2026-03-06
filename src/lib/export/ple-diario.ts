/**
 * PLE Libro Diario 5.1
 * Formato SUNAT
 */

interface AsientoPLE {
  id: string;
  numero: number;
  fecha: string;
  descripcion: string;
  detalles: { cuenta_codigo: string; cuenta_nombre: string; debe: number; haber: number }[];
}

export function generarPLEDiario5(
  ruc: string,
  periodo: string,
  asientos: AsientoPLE[]
): string {
  const lines: string[] = [];

  asientos.forEach((a, ai) => {
    const cuo = String(ai + 1).padStart(8, "0");
    const fechaParts = a.fecha.split("-");
    const fechaFormat = `${fechaParts[2]}/${fechaParts[1]}/${fechaParts[0]}`;

    a.detalles.forEach((d, di) => {
      const correlativo = `M${String(di + 1).padStart(7, "0")}`;
      const line = [
        `${periodo}00`,
        cuo,
        correlativo,
        d.cuenta_codigo,
        "",
        "",
        "PEN",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        fechaFormat,
        "",
        a.descripcion.substring(0, 200),
        "",
        d.debe.toFixed(2),
        d.haber.toFixed(2),
        "",
        "1",
      ].join("|");
      lines.push(line);
    });
  });

  return lines.join("\n");
}

export function nombreArchivoPLE5(ruc: string, periodo: string): string {
  return `LE${ruc}${periodo}00050100001111.TXT`;
}
