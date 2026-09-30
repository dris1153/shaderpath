import { post, requireKey, type Speech, type TtsEngine } from "./engine";

// Premade "Jessica" (playful, bright, warm), picked for the course at the pilot's voice checkpoint.
const DEFAULT_VOICE = "cgSgspJ2msm6clMCkdW9";
const DEFAULT_MODEL = "eleven_multilingual_v2";
const OUTPUT = "mp3_44100_128";
// Best-effort determinism on ElevenLabs' side; the cache is what makes re-runs stable.
const SEED = 7;

type Alignment = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};

export function elevenlabs(voice = DEFAULT_VOICE, model = DEFAULT_MODEL): TtsEngine {
  return {
    id: { engine: "elevenlabs", voice, model, output: OUTPUT, seed: SEED },
    fetch: ({ text, previousText, nextText }) =>
      post(
        "elevenlabs",
        `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}/with-timestamps?output_format=${OUTPUT}`,
        { "xi-api-key": requireKey("ELEVENLABS_API_KEY") },
        { text, model_id: model, seed: SEED, previous_text: previousText, next_text: nextText },
      ),
    parse: parseElevenlabs,
  };
}

// `alignment` follows the text as sent, one entry per character, so it lines
// up with the script exactly (`normalized_alignment` follows the rewritten text).
export function parseElevenlabs(raw: string): Speech {
  const json = JSON.parse(raw) as { audio_base64: string; alignment: Alignment | null };
  const a = json.alignment;
  if (!a) throw new Error("elevenlabs: the response has no alignment");
  return {
    audio: Buffer.from(json.audio_base64, "base64"),
    marks: a.characters.map((text, i) => ({
      text,
      start: a.character_start_times_seconds[i]!,
      end: a.character_end_times_seconds[i]!,
    })),
  };
}
