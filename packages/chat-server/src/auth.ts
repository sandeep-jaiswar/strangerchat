import { getToken } from "next-auth/jwt";

/** Returns the signed-in user's id from the NextAuth session cookie, or null. */
export async function authenticate(
  cookieHeader: string | null | undefined,
): Promise<string | null> {
  const cookies: Record<string, string> = {};
  for (const part of (cookieHeader ?? "").split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    const name = part.slice(0, index).trim();
    try {
      cookies[name] = decodeURIComponent(part.slice(index + 1).trim());
    } catch {
      // Ignore malformed cookies rather than failing the whole request.
    }
  }
  const token = await getToken({
    // getToken only reads `cookies` and `headers` off the request.
    req: { cookies, headers: {} } as unknown as Parameters<
      typeof getToken
    >[0]["req"],
  });
  return token?.sub ?? null;
}

/**
 * Browsers send cookies on cross-site WebSocket upgrades, so without this check any
 * site could open a chat socket as the visitor (cross-site WebSocket hijacking).
 */
export function isAllowedOrigin(
  origin: string | null | undefined,
  host: string | null | undefined,
): boolean {
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

const SESSION_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/** Session ids are random v4 UUIDs generated per browser tab. */
export function isValidSessionId(
  sid: string | null | undefined,
): sid is string {
  return typeof sid === "string" && SESSION_ID.test(sid);
}
