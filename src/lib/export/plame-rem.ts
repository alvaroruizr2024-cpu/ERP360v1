/**
 * PLAME - Archivo .rem (Remuneraciones)
 * Para importacion en PDT PLAME SUNAT
 */

interface EmpleadoPLAME {
  tipo_doc: string;      // 1=DNI, 4=CE
  numero_doc: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombres: string;
  dias_trabajados: number;
  horas_trabajadas: number;
  sueldo_basico: number;
  asignacion_familiar: number;
  horas_extras_25: number;
  horas_extras_35: number;
  monto_he25: number;
  monto_he35: number;
  gratificacion: number;
  bonif_extraordinaria: number;
  total_ingresos: number;
  onp: number;          // 13% si aplica
  afp_fondo: number;
  afp_seguro: number;
  afp_comision: number;
  renta_5ta: number;
  total_descuentos: number;
  essalud: number;      // 9% patronal
  sctr: number;
  neto: number;
  situacion: string;    // 1=activo, 2=baja, 3=subsidio
  tipo_trabajador: string; // 01=empleado, 02=obrero
  regimen_pensionario: string; // 1=ONP, 2=AFP
  nombre_afp?: string;
}

export function generarPLAMERem(periodo: string, empleados: EmpleadoPLAME[]): string {
  const lines: string[] = [];

  empleados.forEach(e => {
    // Formato PLAME .rem: campos separados por |
    const line = [
      e.tipo_doc,
      e.numero_doc,
      e.apellido_paterno,
      e.apellido_materno,
      e.nombres,
      e.dias_trabajados.toString(),
      e.horas_trabajadas.toString(),
      e.situacion,
      e.tipo_trabajador,
      e.regimen_pensionario,
      e.sueldo_basico.toFixed(2),
      e.asignacion_familiar.toFixed(2),
      e.monto_he25.toFixed(2),
      e.monto_he35.toFixed(2),
      e.gratificacion.toFixed(2),
      e.bonif_extraordinaria.toFixed(2),
      "0.00", // vacaciones truncas
      e.total_ingresos.toFixed(2),
      e.onp.toFixed(2),
      e.afp_fondo.toFixed(2),
      e.afp_seguro.toFixed(2),
      e.afp_comision.toFixed(2),
      e.renta_5ta.toFixed(2),
      "0.00", // descuento judicial
      e.total_descuentos.toFixed(2),
      e.essalud.toFixed(2),
      e.sctr.toFixed(2),
      e.neto.toFixed(2),
    ].join("|");
    lines.push(line);
  });

  return lines.join("\n");
}

export function generarPLAMEJor(periodo: string, empleados: EmpleadoPLAME[]): string {
  return empleados.map(e => [
    e.tipo_doc,
    e.numero_doc,
    "1", // jornada completa
    e.horas_trabajadas.toString(),
    "0", // convenio colectivo
  ].join("|")).join("\n");
}

export function generarPLAMESnl(periodo: string): string {
  // Sin subsidios por defecto
  return "";
}
