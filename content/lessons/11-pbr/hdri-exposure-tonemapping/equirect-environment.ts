import * as THREE from "three";

// No binary HDRI assets in the repo (spec): every preset here is a
// generated equirect DataTexture instead of a loaded .hdr file.
export type SkyKind = "sun" | "overcast" | "studio";

const WIDTH = 512;
const HEIGHT = 256;

// Real solar disk subtends ~0.5deg (32 arcmin) across the sky. At 512x256
// texels that's under one texel wide -- invisible at demo resolution. We
// exaggerate to a 5deg radius purely for legibility; the RATIO below (not
// the angular size) is what the lesson's exposure/tonemapping math cares
// about. See theory.*.mdx for the real angular size + real dynamic-range
// citations.
const SUN_ANGULAR_RADIUS = degToRad(5);
const SUN_ELEVATION = degToRad(32);
const SUN_AZIMUTH = degToRad(-50);

// Sky peaks around 1.1; sun core sits at 55 -- roughly the 50x ratio the
// lesson is built around (theory: real HDRIs push this to 1e5-1e6x, cited).
const SKY_ZENITH = 0.32;
const SKY_HORIZON = 1.1;
const SUN_RADIANCE = 55;
const GROUND_SUN = 0.045;

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Inverse of three's equirectUv() (common.glsl.js: u = atan2(z,x)/2pi + 0.5,
// v = asin(y)/pi + 0.5) -- generating texels with this exact mapping is what
// makes the DataTexture line up correctly once three samples it as an
// EquirectangularReflectionMapping source.
function texelDirection(u: number, v: number): [x: number, y: number, z: number] {
  const y = Math.sin((v - 0.5) * Math.PI);
  const theta = (u - 0.5) * Math.PI * 2;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  return [r * Math.cos(theta), y, r * Math.sin(theta)];
}

function angularDistance(a: [number, number, number], b: [number, number, number]): number {
  const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  return Math.acos(THREE.MathUtils.clamp(dot, -1, 1));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

// u/v for a given azimuth/elevation, inverting the same equirectUv() this
// module targets: u = azimuth/2pi + 0.5, v = elevation/pi + 0.5 (elevation
// already equals asin(y) for a unit direction, no extra trig needed).
function anglesToUv(azimuthRad: number, elevationRad: number): [u: number, v: number] {
  return [0.5 + azimuthRad / (Math.PI * 2), 0.5 + elevationRad / Math.PI];
}

// Outdoor sun: a small, extremely bright disk (hard key light) against a
// much dimmer blue sky gradient -- the "photograph a landscape at noon" case.
function buildSun(): Float32Array {
  const data = new Float32Array(WIDTH * HEIGHT * 4);
  const sunDir = texelDirection(...anglesToUv(SUN_AZIMUTH, SUN_ELEVATION));

  let i = 0;
  for (let py = 0; py < HEIGHT; py++) {
    const v = (py + 0.5) / HEIGHT;
    for (let px = 0; px < WIDTH; px++) {
      const u = (px + 0.5) / WIDTH;
      const dir = texelDirection(u, v);
      const toSun = angularDistance(dir, sunDir);

      let r: number, g: number, b: number;
      if (toSun < SUN_ANGULAR_RADIUS) {
        // Soft-edged disk (2px feather) instead of a binary cutoff, so PMREM's
        // GGX prefilter has something to resample without ringing.
        const edge = smoothstep(SUN_ANGULAR_RADIUS, SUN_ANGULAR_RADIUS * 0.85, toSun);
        const s = SUN_RADIANCE * edge + SKY_HORIZON * (1 - edge);
        r = s;
        g = s * 0.94;
        b = s * 0.82;
      } else if (dir[1] > 0) {
        const t = Math.pow(dir[1], 0.55);
        const sky = THREE.MathUtils.lerp(SKY_HORIZON, SKY_ZENITH, t);
        r = sky * 0.5;
        g = sky * 0.72;
        b = sky;
      } else {
        r = g = b = GROUND_SUN;
      }
      data[i++] = r;
      data[i++] = g;
      data[i++] = b;
      data[i++] = 1;
    }
  }
  return data;
}

// Overcast: a giant softbox -- nearly flat, no directional hotspot, low
// dynamic range top-to-bottom.
function buildOvercast(): Float32Array {
  const data = new Float32Array(WIDTH * HEIGHT * 4);
  let i = 0;
  for (let py = 0; py < HEIGHT; py++) {
    const v = (py + 0.5) / HEIGHT;
    // Radiance only depends on elevation (y), which is a function of v alone
    // in this mapping -- no need to resolve a per-column direction.
    const y = Math.sin((v - 0.5) * Math.PI);
    const s =
      y > 0
        ? THREE.MathUtils.lerp(0.9, 1.55, Math.pow(y, 0.7))
        : THREE.MathUtils.lerp(0.9, 0.35, Math.pow(-y, 0.6));
    for (let px = 0; px < WIDTH; px++) {
      data[i++] = s * 0.97;
      data[i++] = s;
      data[i++] = s * 1.03;
      data[i++] = 1;
    }
  }
  return data;
}

// Studio: neutral backdrop plus two soft rectangular "softbox" patches at
// classic key/fill angles -- controlled, bounded highlights instead of a
// single blown-out point.
function buildStudio(): Float32Array {
  const data = new Float32Array(WIDTH * HEIGHT * 4);
  const key = texelDirection(...anglesToUv(degToRad(55), degToRad(28)));
  const fill = texelDirection(...anglesToUv(degToRad(-70), degToRad(12)));
  const BACKDROP = 0.4;
  const KEY_PEAK = 6.0;
  const FILL_PEAK = 2.4;
  const KEY_RADIUS = degToRad(16);
  const FILL_RADIUS = degToRad(20);

  let i = 0;
  for (let py = 0; py < HEIGHT; py++) {
    const v = (py + 0.5) / HEIGHT;
    for (let px = 0; px < WIDTH; px++) {
      const u = (px + 0.5) / WIDTH;
      const dir = texelDirection(u, v);
      const toKey = angularDistance(dir, key);
      const toFill = angularDistance(dir, fill);

      const keyGlow = (1 - smoothstep(KEY_RADIUS * 0.3, KEY_RADIUS, toKey)) * KEY_PEAK;
      const fillGlow = (1 - smoothstep(FILL_RADIUS * 0.3, FILL_RADIUS, toFill)) * FILL_PEAK;
      const floor = dir[1] < 0 ? BACKDROP * 0.5 : BACKDROP;

      const s = Math.max(floor, keyGlow, fillGlow, floor + keyGlow * 0.15 + fillGlow * 0.15);
      data[i++] = s;
      data[i++] = s;
      data[i++] = s * 1.02;
      data[i++] = 1;
    }
  }
  return data;
}

const BUILDERS: Record<SkyKind, () => Float32Array> = {
  sun: buildSun,
  overcast: buildOvercast,
  studio: buildStudio,
};

/**
 * Builds a linear-radiance equirect DataTexture for one preset. Caller owns
 * the result (dispose it, or feed it straight into PMREMGenerator and
 * dispose it right after -- the PMREM output is self-contained).
 */
export function createSkyTexture(kind: SkyKind): THREE.DataTexture {
  const data = BUILDERS[kind]();
  const texture = new THREE.DataTexture(
    data,
    WIDTH,
    HEIGHT,
    THREE.RGBAFormat,
    THREE.FloatType,
    THREE.EquirectangularReflectionMapping,
    THREE.ClampToEdgeWrapping,
    THREE.ClampToEdgeWrapping,
    THREE.LinearFilter,
    THREE.LinearFilter,
  );
  // Radiance, not display color -- must NOT be sRGB-decoded like a photo
  // texture (same reasoning HDRLoader uses for real .hdr files).
  texture.colorSpace = THREE.LinearSRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
