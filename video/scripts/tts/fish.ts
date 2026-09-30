import { post, requireKey, type Mark, type Speech, type TtsEngine } from "./engine";

// "Sarah" (narration) from the public library. The voice is picked for real at the pilot's voice checkpoint.
const DEFAULT_VOICE = "933563129e564b19a115bedd57b7406a";
const DEFAULT_MODEL = "s2.1-pro";

type Segment = { text: string; start: number; end: number };
type Event = {
  audio_base64?: string;
  chunk_seq?: number;
  chunk_audio_offset_sec?: number;
  alignment?: { segments: Segment[] } | null;
};

export function fish(voice = DEFAULT_VOICE, model = DEFAULT_MODEL): TtsEngine {
  return {
    id: { engine: "fish", voice, model, format: "mp3", bitrate: 128 },
    // Fish has no previous/next text; the whole scene is one request, so it
    // already conditions on its own earlier chunks.
    fetch: ({ text }) =>
      post(
        "fish",
        "https://api.fish.audio/v1/tts/stream/with-timestamp",
        { Authorization: `Bearer ${requireKey("FISH_AUDIO_API_KEY")}`, model },
        { text, reference_id: voice, format: "mp3", mp3_bitrate: 128, latency: "normal" },
      ),
    parse: parseFish,
  };
}

// An SSE stream of JSON events. Audio chunks are concatenated in arrival
// order. `alignment` is a cumulative snapshot per chunk_seq (replace, never
// append), with times relative to that chunk's `chunk_audio_offset_sec`.
export function parseFish(raw: string): Speech {
  const audio: Buffer[] = [];
  const chunks = new Map<number, { offset: number; segments: Segment[] }>();
  for (const block of raw.replace(/\r\n?/g, "\n").split("\n\n")) {
    const data = block
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).replace(/^ /, ""))
      .join("\n");
    if (!data) continue;
    const event = JSON.parse(data) as Event;
    if (event.audio_base64 === undefined) throw new Error(`fish: unexpected event ${data.slice(0, 200)}`);
    audio.push(Buffer.from(event.audio_base64, "base64"));
    if (event.alignment) {
      chunks.set(event.chunk_seq ?? 0, { offset: event.chunk_audio_offset_sec ?? 0, segments: event.alignment.segments });
    }
  }
  if (!chunks.size) throw new Error("fish: the stream has no alignment");
  const marks: Mark[] = [...chunks.entries()]
    .sort(([a], [b]) => a - b)
    .flatMap(([, { offset, segments }]) =>
      segments.map((s) => ({ text: s.text, start: offset + s.start, end: offset + s.end })),
    );
  return { audio: Buffer.concat(audio), marks };
}
