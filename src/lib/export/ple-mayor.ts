/**
 * PLE Libro Mayor 6.1
 * Agrupado por cuenta contable
 */

interface MovimientoMayor {
  cuenta_codigo: string;
  cuenta_nombre: string;
  fecha: string;
  descripcion: string;
  debe: number;
  haber: number;
  cuo: string;
}

export function generarPLEMayor6(
  ruc: string,
  periodo: string,
  movimientos: MovimientoMayor[]
): string {
  const lines: string[] = [];

  // Group by account
  const grouped: Record<string, MovimientoMayor[]> = {};
  movimientos.forEach(m => {
    if (!grouped[m.cuenta_codigo]) grouped[m.cuenta_codigo] = [];
    grouped[m.cuenta_codigo].push(m);
  });

  let globalCorr = 0;
  Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).forEach(([cuenta, movs]) => {
    movs.forEach((m) => {
      globalCorr++;
      const correlativo = `M${String(globalCorr).padStart(7, "0")}`;
      const fechaParts = m.fecha.split("-");
      const fechaFormat = `${fechaParts[2]}/${fechaParts[1]}/${fechaParts[0]}`;

      const line = [
        `${periodo}00`,
        m.cuo,
        correlativo,
        cuenta,
        "",
        "",
        "PEN",
        m.debe.toFixed(2),
        m.haber.toFixed(2),
        fechaFormat,
        m.descripcion.substring(0, 200),
        "1",
      ].join("|");
      lines.push(line);
    });
  });

  return lines.join("\n");
}

export function nombreArchivoPLE6(ruc: string, periodo: string): string {
  return `LE${ruc}${periodo}00060100001111.TXT`;
}
