export const VOICE_RATE = 48000;

// Providers deliver around -21 LUFS; the QC target is -16 +-2. The mp3 encode after this stage lands
// near -16.7, so a voice that is joined and re-encoded must pass through the same stage once.
export const VOICE_NORMALIZE = `loudnorm=I=-16:TP=-1.5:LRA=11:dual_mono=true,aresample=${VOICE_RATE}`;

// Speech needs only mono 128 kbps.
export const VOICE_MP3 = ["-c:a", "libmp3lame", "-b:a", "128k", "-ar", String(VOICE_RATE)];
