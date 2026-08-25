"use client";

/**
 * Shared by every data hook in the app.
 *
 * The abort matters as much as the parsing: these endpoints are serverless
 * functions talking to the same database the pages used to read directly, so a
 * hanging one would spin a skeleton forever — the old timeout symptom in a new
 * place. A non-200 is thrown rather than returned so callers can tell "could
 * not read" from "nothing recorded", which several screens render differently.
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    url: string,
  ) {
    super(`${url} responded ${status}`);
    this.name = "HttpError";
  }
}

/** 401 means "sign in", not "try again" — retrying it is pure noise. */
export function isAuthError(err: unknown): boolean {
  return err instanceof HttpError && err.status === 401;
}

export async function fetchJson<T>(url: string, timeoutMs = 8000): Promise<T> {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new HttpError(res.status, url);
  return (await res.json()) as T;
}
