const tokenStore = new Map<string, { token: string; expires: number }>();

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export function generateToken(sessionId: string): string {
  const token = crypto.randomUUID();
  tokenStore.set(sessionId, {
    token,
    expires: Date.now() + TOKEN_EXPIRY_MS,
  });
  return token;
}

export function validateToken(sessionId: string, token: string): boolean {
  const stored = tokenStore.get(sessionId);
  if (!stored) return false;

  if (Date.now() > stored.expires) {
    tokenStore.delete(sessionId);
    return false;
  }

  const isValid = stored.token === token;

  if (isValid) {
    tokenStore.delete(sessionId);
  }

  return isValid;
}

export function cleanExpiredTokens(): void {
  const now = Date.now();
  for (const [key, value] of tokenStore.entries()) {
    if (now > value.expires) {
      tokenStore.delete(key);
    }
  }
}
