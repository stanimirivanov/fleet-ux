/** Minimal operator evidence; permissions remain authoritative on the server. */
export interface OperatorSession {
  readonly actorId: string;
  readonly expiresAtMs: number;
}

export interface SessionReadOptions {
  readonly signal?: AbortSignal;
}

export interface OperatorSessionService {
  inspect(options?: SessionReadOptions): Promise<OperatorSession>;
  signOut(options?: SessionReadOptions): Promise<void>;
}

/** Validates an internal return path; never accepts an external redirect. */
export function operatorReturnPath(value: string | null): string | null {
  if (
    !value?.startsWith('/') ||
    value.startsWith('//') ||
    /[\\\p{Cc}]/u.test(value)
  )
    return null;
  try {
    const url = new URL(value, 'https://fleet.invalid');
    if (url.origin !== 'https://fleet.invalid') return null;
    if (!/^\/assets(?:\/|$)/u.test(url.pathname)) return null;
    if (url.searchParams.has('preview')) return null;
    return url.pathname + url.search;
  } catch {
    return null;
  }
}
