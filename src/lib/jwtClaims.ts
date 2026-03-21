/** Decode JWT payload (no verification — client already trusts this token). */
export function decodeJwtPayload(accessToken: string): Record<string, unknown> | null {
  try {
    const part = accessToken.split('.')[1];
    if (!part) return null;
    let base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const pad = (4 - (base64.length % 4)) % 4;
    base64 += '='.repeat(pad);
    const json = atob(base64);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function normRole(raw: unknown): 'coach' | 'member' | null {
  if (raw == null) return null;
  const r = String(raw).trim().toLowerCase();
  if (r === 'coach' || r === 'member') return r;
  return null;
}

/** Read role from access token claims (matches Supabase JWT shape). */
export function roleFromAccessToken(accessToken: string): 'coach' | 'member' | null {
  const payload = decodeJwtPayload(accessToken);
  if (!payload) return null;
  const um = payload.user_metadata as Record<string, unknown> | undefined;
  const am = payload.app_metadata as Record<string, unknown> | undefined;
  return (
    normRole(um?.role) ||
    normRole(um?.user_role) ||
    normRole(am?.role) ||
    normRole(am?.user_role)
  );
}
