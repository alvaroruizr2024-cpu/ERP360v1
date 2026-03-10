import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const PROMPTS: Record<string, string> = {
  factura_compra: `Extrae los datos de esta FACTURA DE COMPRA peruana. Responde SOLO JSON valido sin markdown:
{"serie":"","numero":"","fecha_emision":"YYYY-MM-DD","ruc_proveedor":"","razon_social":"","direccion":"","subtotal":0,"igv":0,"total":0,"moneda":"PEN","items":[{"descripcion":"","cantidad":0,"unidad":"UND","precio_unitario":0,"subtotal":0}],"detraccion_porcentaje":0,"forma_pago":"contado","observaciones":""}`,
  factura_venta: `Extrae los datos de esta FACTURA DE VENTA. Responde SOLO JSON valido sin markdown:
{"serie":"","numero":"","fecha_emision":"YYYY-MM-DD","ruc_cliente":"","razon_social":"","subtotal":0,"igv":0,"total":0,"moneda":"PEN","items":[{"descripcion":"","cantidad":0,"unidad":"UND","precio_unitario":0,"subtotal":0}]}`,
  guia_recepcion: `Extrae datos de esta GUIA DE REMISION/NOTA INGRESO. Responde SOLO JSON sin markdown:
{"numero_guia":"","fecha":"YYYY-MM-DD","ruc_proveedor":"","razon_social":"","punto_partida":"","punto_llegada":"","transportista":"","placa":"","items":[{"descripcion":"","cantidad":0,"unidad":"UND","peso_kg":0}],"observaciones":""}`,
  ticket_pesaje: `Extrae datos de este TICKET DE BASCULA de cana de azucar. Responde SOLO JSON sin markdown:
{"numero_ticket":"","fecha":"YYYY-MM-DD","hora":"HH:MM","placa":"","chofer":"","tipo":"entrada","peso_bruto":0,"tara":0,"peso_neto":0,"bascula":"","parcela":"","variedad":""}`,
  nota_credito: `Extrae datos de esta NOTA DE CREDITO. Responde SOLO JSON sin markdown:
{"serie":"","numero":"","fecha_emision":"YYYY-MM-DD","ruc":"","razon_social":"","motivo":"","ref_serie":"","ref_numero":"","subtotal":0,"igv":0,"total":0}`,
  recibo_honorarios: `Extrae datos de este RECIBO POR HONORARIOS. Responde SOLO JSON sin markdown:
{"serie":"","numero":"","fecha_emision":"YYYY-MM-DD","ruc_emisor":"","nombre_emisor":"","servicio":"","monto_bruto":0,"retencion_ir":0,"monto_neto":0}`,
  vale_combustible: `Extrae datos de este VALE/FACTURA DE COMBUSTIBLE. Responde SOLO JSON sin markdown:
{"numero":"","fecha":"YYYY-MM-DD","estacion":"","placa":"","conductor":"","tipo_combustible":"diesel_b5","galones":0,"precio_galon":0,"total":0,"km_odometro":0}`,
  orden_compra: `Extrae datos de esta ORDEN DE COMPRA. Responde SOLO JSON sin markdown:
{"numero":"","fecha":"YYYY-MM-DD","proveedor":"","ruc":"","condicion_pago":"","items":[{"descripcion":"","cantidad":0,"unidad":"UND","precio_unitario":0}],"subtotal":0,"igv":0,"total":0}`,
  boleta_pago: `Extrae datos de esta BOLETA DE PAGO. Responde SOLO JSON sin markdown:
{"periodo":"","empleado":"","dni":"","cargo":"","basico":0,"asignacion_familiar":0,"horas_extra":0,"descuento_afp":0,"renta_5ta":0,"neto":0}`,
  liquidacion: `Extrae datos de esta LIQUIDACION DE TRANSPORTE. Responde SOLO JSON sin markdown:
{"numero":"","periodo":"","transportista":"","ruc":"","placa":"","total_viajes":0,"total_toneladas":0,"tarifa_tonelada":0,"subtotal":0,"descuentos":0,"total":0}`,
  cotizacion: `Extrae datos de esta COTIZACION. Responde SOLO JSON sin markdown:
{"numero":"","fecha":"YYYY-MM-DD","proveedor":"","ruc":"","validez_dias":0,"items":[{"descripcion":"","cantidad":0,"unidad":"UND","precio_unitario":0}],"subtotal":0,"igv":0,"total":0}`,
  documento_general: `Analiza este documento y extrae toda la informacion. Responde SOLO JSON sin markdown:
{"tipo_documento":"","numero":"","fecha":"","emisor":"","ruc":"","concepto":"","monto":0,"moneda":"PEN","datos_adicionales":{}}`,
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const tipoDoc = (formData.get("tipo") as string) || "documento_general";
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 500 });
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mediaType = file.type || "image/jpeg";
    const prompt = PROMPTS[tipoDoc] || PROMPTS.documento_general;
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000,
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
          { type: "text", text: prompt }
        ]}]
      }),
    });
    if (!response.ok) { const err = await response.text(); return NextResponse.json({ error: `API ${response.status}`, detail: err.substring(0,200) }, { status: 500 }); }
    const result = await response.json();
    const text = result.content?.[0]?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "No se pudo extraer datos", raw: text.substring(0,300) }, { status: 422 });
    const extracted = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ success: true, tipo: tipoDoc, data: extracted });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
