import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY no configurada en el servidor" }, { status: 500 });
    }

    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: "No se recibio imagen" }, { status: 400 });
    }

    // Extraer el base64 puro (sin el prefijo data:image/...)
    const base64Match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (!base64Match) {
      return NextResponse.json({ error: "Formato de imagen invalido" }, { status: 400 });
    }

    const mediaType = base64Match[1] as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
    const base64Data = base64Match[2];

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
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
              text: `Analiza esta imagen de un ticket de pesaje / balanza de caña de azucar. 
Extrae EXACTAMENTE los datos que aparecen en el ticket. No inventes datos.
Si un campo no es legible o no existe en el ticket, usa "" (cadena vacia).

Responde UNICAMENTE con un JSON valido (sin markdown, sin backticks, sin texto adicional) con esta estructura exacta:

{
  "ticket": "numero del ticket tal como aparece",
  "placa": "placa del vehiculo tal como aparece",
  "chofer": "nombre del chofer/conductor tal como aparece",
  "pesoBruto": "peso bruto en toneladas (solo el numero)",
  "tara": "tara/peso del vehiculo vacio (solo el numero)",
  "pesoNeto": "peso neto (solo el numero)",
  "fecha": "fecha del ticket si aparece",
  "hora": "hora del ticket si aparece",
  "bascula": "nombre o numero de bascula si aparece",
  "parcela": "parcela o campo de origen si aparece",
  "variedad": "variedad de caña si aparece",
  "impurezas": "porcentaje de impurezas si aparece (solo el numero)",
  "observaciones": "cualquier otro dato relevante visible en el ticket",
  "confianza": "porcentaje estimado de confianza en la lectura (0-100)"
}

IMPORTANTE: Extrae los datos EXACTOS que ves en la imagen. Si la imagen es borrosa o ilegible, indica baja confianza. No inventes ni asumas datos.`
            },
          ],
        },
      ],
    });

    // Extraer el texto de la respuesta
    const textContent = response.content.find(c => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      return NextResponse.json({ error: "No se obtuvo respuesta de la IA" }, { status: 500 });
    }

    // Parsear JSON - limpiar posibles backticks
    let resultText = textContent.text.trim();
    resultText = resultText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "");

    let parsed;
    try {
      parsed = JSON.parse(resultText);
    } catch {
      // Si falla el parse, intentar extraer el JSON del texto
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json({ 
          error: "No se pudo procesar la respuesta", 
          raw: resultText.substring(0, 500) 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("OCR Error:", error);
    
    if (error?.status === 401) {
      return NextResponse.json({ error: "API Key de Anthropic invalida" }, { status: 500 });
    }
    if (error?.status === 429) {
      return NextResponse.json({ error: "Limite de API excedido. Intente en unos momentos." }, { status: 429 });
    }

    return NextResponse.json({ 
      error: "Error procesando imagen: " + (error?.message || "Error desconocido") 
    }, { status: 500 });
  }
}
