import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// In-memory rate limiter for API routes (Edge Runtime compatible)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const API_RATE_LIMIT = 100;
const API_WINDOW_MS = 60_000;
let lastCleanup = Date.now();

function checkRateLimit(ip: string): { limited: boolean; remaining: number } {
  const now = Date.now();
  // Periodic cleanup every 5 minutes
  if (now - lastCleanup > 300_000) {
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetTime) rateLimitMap.delete(key);
    }
    lastCleanup = now;
  }

  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + API_WINDOW_MS });
    return { limited: false, remaining: API_RATE_LIMIT - 1 };
  }
  entry.count++;
  if (entry.count > API_RATE_LIMIT) {
    return { limited: true, remaining: 0 };
  }
  return { limited: false, remaining: API_RATE_LIMIT - entry.count };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting for API routes
  if (pathname.startsWith("/api")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "anonymous";

    const { limited, remaining } = checkRateLimit(ip);

    if (limited) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Limit": String(API_RATE_LIMIT),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(API_RATE_LIMIT));
    response.headers.set("X-RateLimit-Remaining", String(remaining));
    return response;
  }

  // Supabase session handling for non-API routes
  const response = await updateSession(request);

  // Check if user is authenticated by looking for Supabase auth cookies
  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard") && !hasAuthCookie) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from auth pages
  if ((pathname === "/login" || pathname === "/registro") && hasAuthCookie) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
