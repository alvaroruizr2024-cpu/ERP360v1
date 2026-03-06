import { NextResponse } from "next/server";

// Cache TC for 1 hour
let cachedTC: { compra: number; venta: number; fecha: string; source: string } | null = null;
let lastFetch = 0;
const CACHE_TTL = 3600000; // 1 hour

async function fetchTCSunat(): Promise<{ compra: number; venta: number; fecha: string; source: string }> {
  const now = Date.now();
  if (cachedTC && now - lastFetch < CACHE_TTL) return cachedTC;

  // Try apis.net.pe first (free, reliable)
  try {
    const res = await fetch("https://api.apis.net.pe/v1/tipo-cambio-sunat", {
      headers: { "Accept": "application/json" },
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      cachedTC = {
        compra: Number(data.compra) || 3.72,
        venta: Number(data.venta) || 3.75,
        fecha: data.fecha || new Date().toISOString().split("T")[0],
        source: "SUNAT via apis.net.pe",
      };
      lastFetch = now;
      return cachedTC;
    }
  } catch (e) { /* fallback */ }

  // Fallback: SBS RSS or hardcoded recent rate
  try {
    const res = await fetch("https://api.apis.net.pe/v1/tipo-cambio-sunat?fecha=" + new Date().toISOString().split("T")[0]);
    if (res.ok) {
      const data = await res.json();
      cachedTC = { compra: Number(data.compra), venta: Number(data.venta), fecha: data.fecha, source: "SUNAT fallback" };
      lastFetch = now;
      return cachedTC;
    }
  } catch (e) { /* final fallback */ }

  // Final fallback with approximate rate
  cachedTC = { compra: 3.72, venta: 3.75, fecha: new Date().toISOString().split("T")[0], source: "fallback (offline)" };
  lastFetch = now;
  return cachedTC;
}

export async function GET() {
  try {
    const tc = await fetchTCSunat();
    return NextResponse.json(tc, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800" },
    });
  } catch (error) {
    return NextResponse.json(
      { compra: 3.72, venta: 3.75, fecha: new Date().toISOString().split("T")[0], source: "error fallback" },
      { status: 200 }
    );
  }
}
