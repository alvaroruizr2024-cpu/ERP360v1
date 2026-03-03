import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

const SYSTEM_PROMPT = `Eres un sistema OCR especializado en leer documentos de pesaje, transporte y logistica.
Tu trabajo es extraer con maxima precision TODOS los datos visibles de cualquier tipo de ticket, boleta, guia o comprobante de pesaje.
Debes adaptarte al formato del documento — puede ser de cualquier industria: azucar, mineria, agroindustria, transporte, construccion, etc.
NUNCA inventes datos. Solo reporta lo que ves. Si algo no es legible, deja el campo vacio.`;

const USER_PROMPT = `Analiza esta imagen de un documento de pesaje/balanza/transporte.
Extrae TODOS los datos visibles con maxima precision. Adaptate al formato del documento.

REGLAS ESTRICTAS:
1. Extrae EXACTAMENTE lo que ves en la imagen, caracter por caracter
2. NO inventes, NO asumas, NO completes datos que no puedes leer
3. Si un dato esta cortado, borroso o no existe, usa "" (cadena vacia)
4. Los pesos deben ser SOLO el numero tal como aparece (ej: "18.3", "45.72")
5. Las placas deben incluir todos los caracteres visibles incluyendo separadores
6. Preserva mayusculas/minusculas tal como aparecen en el documento

Responde UNICAMENTE con un JSON valido (sin markdown, sin backticks, sin texto extra) con esta estructura:

{
  "tipoDocumento": "tipo de documento detectado (ticket balanza, guia remision, boleta pesaje, etc.)",
  "empresa": "nombre de la empresa emisora si aparece",
  "ticket": "numero de ticket, boleta, guia o folio",
  "placa": "placa(s) del vehiculo - incluir todas si hay tracto y carreta",
  "chofer": "nombre completo del chofer/conductor",
  "transportista": "empresa de transporte si aparece",
  "producto": "tipo de producto o material transportado",
  "origen": "lugar de origen/procedencia/campo/parcela",
  "destino": "lugar de destino",
  "pesoBruto": "peso bruto (solo numero, en la unidad que aparece)",
  "tara": "tara o peso vehiculo vacio (solo numero)",
  "pesoNeto": "peso neto (solo numero)",
  "unidadPeso": "unidad de peso detectada (TM, kg, tn, lb, etc.)",
  "fecha": "fecha principal del documento",
  "hora": "hora principal del documento",
  "fechaPesoBruto": "fecha del peso bruto si es diferente",
  "horaPesoBruto": "hora del peso bruto si aparece",
  "fechaTara": "fecha de la tara si es diferente",
  "horaTara": "hora de la tara si aparece",
  "bascula": "nombre, numero o ubicacion de la bascula",
  "parcela": "parcela, campo, lote o zona de origen",
  "variedad": "variedad del producto si aplica",
  "impurezas": "porcentaje de impurezas o trash (solo numero)",
  "guiaRemision": "numero de guia de remision si aparece",
  "nroViaje": "numero de viaje si aparece",
  "turno": "turno si aparece (diurno, nocturno, etc.)",
  "observaciones": "TODOS los demas datos relevantes visibles que no encajen en los campos anteriores, separados por punto y coma",
  "datosAdicionales": "cualquier texto, codigo, sello o marca visible adicional",
  "confianza": "porcentaje de confianza general de la lectura (0-100)",
  "camposNoLegibles": "lista de campos que no se pudieron leer y la razon (cortado, borroso, etc.)"
}`;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY no configurada en el servidor" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: "No se recibio imagen" }, { status: 400 });
    }

    const base64Match = image.match(/^data:([a-zA-Z0-9\/\+\-\.]+);base64,(.+)$/);
    if (!base64Match) {
      return NextResponse.json({ error: "Formato de imagen invalido" }, { status: 400 });
    }

    const mediaType = base64Match[1] as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
    const base64Data = base64Match[2];

    if (base64Data.length > 14_000_000) {
      return NextResponse.json(
        { error: "Imagen demasiado grande. Maximo 10MB." },
        { status: 400 }
      );
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: "text",
              text: USER_PROMPT,
            },
          ],
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      return NextResponse.json({ error: "No se obtuvo respuesta de la IA" }, { status: 500 });
    }

    let resultText = textContent.text.trim();
    resultText = resultText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "");

    let parsed;
    try {
      parsed = JSON.parse(resultText);
    } catch {
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          return NextResponse.json(
            { error: "No se pudo procesar la respuesta de IA", raw: resultText.substring(0, 500) },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Respuesta de IA no contiene JSON valido", raw: resultText.substring(0, 500) },
          { status: 500 }
        );
      }
    }

    const normalized = {
      ...parsed,
      placa: parsed.placa || "",
      chofer: parsed.chofer || "",
      pesoBruto: parsed.pesoBruto || "",
      tara: parsed.tara || "",
      pesoNeto: parsed.pesoNeto || "",
      bascula: parsed.bascula || "",
      parcela: parsed.parcela || parsed.origen || "",
      impurezas: parsed.impurezas || "",
      confianza: parsed.confianza || "0",
    };

    return NextResponse.json({
      success: true,
      data: normalized,
      usage: {
        inputTokens: response.usage?.input_tokens,
        outputTokens: response.usage?.output_tokens,
      },
    });
  } catch (error: any) {
    console.error("OCR Error:", error?.message || error);

    if (error?.status === 401) {
      return NextResponse.json({ error: "API Key de Anthropic invalida o expirada" }, { status: 500 });
    }
    if (error?.status === 429) {
      return NextResponse.json({ error: "Limite de API excedido. Intente en unos momentos." }, { status: 429 });
    }

    return NextResponse.json(
      { error: "Error procesando imagen: " + (error?.message || "Error desconocido") },
      { status: 500 }
    );
  }
}
