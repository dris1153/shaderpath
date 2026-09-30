// One interface for every TTS provider. `fetch` returns the raw response body
// (so fixtures can be recorded as-is) and `parse` turns it into audio + marks.
export type Mark = { text: string; start: number; end: number };

export type Speech = { audio: Buffer; marks: Mark[] };

export type SpeechRequest = { text: string; previousText?: string; nextText?: string };

export type TtsEngine = {
  // Everything that shapes the audio except the key; it is part of the cache key.
  id: Record<string, string | number>;
  fetch(req: SpeechRequest): Promise<string>;
  parse(raw: string): Speech;
};

export function requireKey(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set. Add it to the repo's .env.local.`);
  // A bad header value makes fetch throw with the value in its message, so reject it here, unechoed.
  if (!/^[\x21-\x7e]+$/.test(value)) throw new Error(`${name} has invalid characters (check .env.local).`);
  return value;
}

class HttpError extends Error {
  constructor(what: string, readonly status: number, detail: string) {
    super(`${what}: HTTP ${status} ${detail}`);
  }
}

const TRIES = 4;

// POST with retry and backoff on network errors, timeouts, 429 and 5xx.
// Error messages carry the provider's response text, never the request headers.
export async function post(what: string, url: string, headers: Record<string, string>, body: unknown) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(180_000),
      });
      if (!res.ok) throw new HttpError(what, res.status, (await res.text()).slice(0, 400));
      return await res.text();
    } catch (error) {
      const retryable =
        error instanceof HttpError
          ? error.status === 429 || error.status >= 500
          : (error instanceof TypeError && error.message === "fetch failed") || (error as Error).name === "TimeoutError";
      if (!retryable || attempt === TRIES) throw error;
      const wait = 2000 * 2 ** (attempt - 1);
      console.warn(`${(error as Error).message.slice(0, 120)} — retry ${attempt}/${TRIES - 1} in ${wait / 1000}s`);
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }
}

// Letters and digits only: providers drop punctuation and apostrophes from
// their marks, so both sides are compared in this form.
const norm = (text: string) => [...text.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "")];

// Times each script word from the provider's marks. Marks may be characters
// (ElevenLabs), words or whole phrases (Fish); a mark's time is shared across
// its characters evenly, so a phrase is split by character length.
export function alignWords(words: string[], marks: Mark[]): { start: number; end: number }[] {
  const chars: { c: string; start: number; end: number }[] = [];
  for (const mark of marks) {
    const cs = norm(mark.text);
    const step = (mark.end - mark.start) / (cs.length || 1);
    cs.forEach((c, k) => chars.push({ c, start: mark.start + step * k, end: mark.start + step * (k + 1) }));
  }
  const heard = chars.map((x) => x.c).join("");
  const said = words.flatMap(norm).join("");
  if (heard !== said) {
    let at = 0;
    while (at < heard.length && heard[at] === said[at]) at++;
    throw new Error(
      `tts: the engine's marks diverge from the script near "${said.slice(Math.max(0, at - 20), at + 20)}" ` +
        `(marks read "${heard.slice(Math.max(0, at - 20), at + 20)}"). Spell numbers and symbols out with [display](spoken).`,
    );
  }
  let i = 0;
  let cursor = chars[0]?.start ?? 0;
  return words.map((word) => {
    const n = norm(word).length;
    if (!n) return { start: cursor, end: cursor };
    const start = chars[i]!.start;
    const end = chars[i + n - 1]!.end;
    i += n;
    cursor = end;
    return { start, end };
  });
}
