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
export async function fetchJson<T>(url: string, timeoutMs = 8000): Promise<T> {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`${url} responded ${res.status}`);
  return (await res.json()) as T;
}
