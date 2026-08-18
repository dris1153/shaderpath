import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-raymarched-vista",
    kind: "build",
    prompt: {
      vi: `Dựng một **vista địa hình raymarch hoàn chỉnh** trong GLSL Playground: heightfield từ FBM, epsilon co giãn theo khoảng cách, mặt trời thấp với bóng mềm trên các sườn núi, tô màu theo độ cao + độ dốc (tuyết trên vùng cao-phẳng, đá trên vùng dốc), sương mù hàm mũ ấm dần về phía mặt trời, bầu trời rẻ tiền có sun glow, march bị chặn khoảng (bầu trời tự bỏ qua sớm phía trên độ cao tối đa của địa hình), camera bay chậm.

Thư viện \`raymarchTerrain\`, \`terrainNormal\`, \`terrainShadow\`, \`terrainHeight\` đã đầy đủ trong starter — việc của bạn là LẮP RÁP chúng đúng thứ tự trong \`main()\` theo 6 TODO.`,
      en: `Build a **complete raymarched terrain vista** in the GLSL Playground: an FBM heightfield, distance-scaled epsilon, a low sun with soft shadows across ridges, height+slope coloring (snow on flat highlands, rock on steep slopes), exponential height fog that warms toward the sun, a cheap sky with sun glow, a bounded march interval (the sky early-outs above the terrain's max height), and a slow camera flight.

The \`raymarchTerrain\`, \`terrainNormal\`, \`terrainShadow\`, \`terrainHeight\` library is complete in the starter — your job is to WIRE them together in the right order inside \`main()\`, across 6 TODOs.`,
    },
    starterCode: `// ---- library: hash, noise, fbm, terrain height/normal/shadow — all working ----

float hash(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 34.45);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    sum += amp * noise(p);
    p *= 2.02;
    amp *= 0.5;
  }
  return sum;
}

const float MAX_HEIGHT = 3.2;
const vec3 SUN_DIR = normalize(vec3(0.6, 0.22, 0.4)); // low sun -> long shadows

float terrainHeight(vec2 p) {
  return fbm(p * 0.18) * MAX_HEIGHT - 0.6;
}

// Quilez terrain-marching pattern: fixed-ish growing steps (NOT sphere
// tracing — a heightfield has no true SDF), then binary-search refine once
// the ray crosses from above to below the surface. Returns -1.0 on a miss.
float raymarchTerrain(vec3 ro, vec3 rd, float tMax) {
  float t = 0.1;
  float prevT = t;
  for (int i = 0; i < 90; i++) {
    if (t > tMax) return -1.0;
    vec3 p = ro + rd * t;
    float diff = p.y - terrainHeight(p.xz);
    if (diff < 0.0) {
      float lo = prevT;
      float hi = t;
      for (int j = 0; j < 10; j++) {
        float mid = 0.5 * (lo + hi);
        vec3 pm = ro + rd * mid;
        float dm = pm.y - terrainHeight(pm.xz);
        if (dm < 0.0) { hi = mid; } else { lo = mid; }
      }
      return 0.5 * (lo + hi);
    }
    prevT = t;
    t += max(0.05, t * 0.03) * clamp(diff, 0.3, 4.0);
  }
  return -1.0;
}

vec3 terrainNormal(vec2 p) {
  vec2 e = vec2(0.05, 0.0);
  float hL = terrainHeight(p - e.xy);
  float hR = terrainHeight(p + e.xy);
  float hD = terrainHeight(p - e.yx);
  float hU = terrainHeight(p + e.yx);
  return normalize(vec3(hL - hR, 2.0 * e.x, hD - hU));
}

// Penumbra-ratio soft shadow (the raymarched-shadows-and-ao lesson), adapted for a
// heightfield: k*h/t where h is the ray's clearance above the terrain.
float terrainShadow(vec3 ro, vec3 rd, float tMax) {
  float shadow = 1.0;
  float t = 0.1;
  for (int i = 0; i < 24; i++) {
    if (t > tMax) break;
    vec3 p = ro + rd * t;
    float diff = p.y - terrainHeight(p.xz);
    shadow = min(shadow, 16.0 * diff / t);
    if (shadow < 0.02) return 0.0;
    t += clamp(diff, 0.05, 0.5);
  }
  return clamp(shadow, 0.0, 1.0);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;

  // Slow camera flight over the terrain.
  vec3 ro = vec3(uTime * 0.6, 4.0, uTime * 0.35); // above MAX_HEIGHT: TODO 1 matters
  vec3 target = ro + vec3(1.0, -0.35, 0.6);
  vec3 fwd = normalize(target - ro);
  vec3 right = normalize(cross(fwd, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, fwd);
  vec3 rd = normalize(uv.x * right + uv.y * up + 1.4 * fwd);

  vec3 skyColor = vec3(0.55, 0.7, 0.92) - rd.y * 0.35;
  float sunAmount = max(dot(rd, SUN_DIR), 0.0);
  skyColor += vec3(1.0, 0.75, 0.45) * pow(sunAmount, 12.0) * 0.8;

  vec3 color = skyColor;

  // TODO 1: bounded march interval — if the camera already sits above
  // MAX_HEIGHT and the ray points level or upward (rd.y >= 0.0), it can
  // never reach the terrain. Skip straight past the block below in that case.
  bool canHitTerrain = true;

  if (canHitTerrain) {
    // TODO 2: march with raymarchTerrain(ro, rd, 60.0).
    float t = -1.0;

    if (t > 0.0) {
      vec3 p = ro + rd * t;

      // TODO 3: normal via terrainNormal(p.xz).
      vec3 n = vec3(0.0, 1.0, 0.0);

      // TODO 4: soft shadow via terrainShadow(p + n * 0.05, SUN_DIR, 8.0)
      // (offset along n avoids immediately re-hitting the surface itself).
      float shadow = 1.0;

      float diff = max(dot(n, SUN_DIR), 0.0);
      float slope = 1.0 - n.y; // 0 = flat, 1 = vertical

      // TODO 5: height+slope coloring. Blend grass -> rock by slope, then
      // rock -> snow using smoothstep on (p.y and slope together): snow
      // only where it's both high AND fairly flat, rock wherever it's steep.
      vec3 grass = vec3(0.3, 0.5, 0.25);
      vec3 rock = vec3(0.42, 0.38, 0.34);
      vec3 snow = vec3(0.96, 0.97, 1.0);
      vec3 base = grass;

      vec3 lit = base * (0.2 + 0.8 * diff * shadow);

      // TODO 6: exponential height fog — denser the lower p.y is relative to
      // ro.y and the farther t is, warming toward the sun near the horizon.
      float fog = 0.0;
      vec3 fogColor = mix(skyColor, vec3(1.0, 0.8, 0.6), sunAmount * 0.6);
      color = mix(lit, fogColor, fog);
    }
  }

  fragColor = vec4(color, 1.0);
}`,
    solutionCode: `float hash(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 34.45);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    sum += amp * noise(p);
    p *= 2.02;
    amp *= 0.5;
  }
  return sum;
}

const float MAX_HEIGHT = 3.2;
const vec3 SUN_DIR = normalize(vec3(0.6, 0.22, 0.4));

float terrainHeight(vec2 p) {
  return fbm(p * 0.18) * MAX_HEIGHT - 0.6;
}

float raymarchTerrain(vec3 ro, vec3 rd, float tMax) {
  float t = 0.1;
  float prevT = t;
  for (int i = 0; i < 90; i++) {
    if (t > tMax) return -1.0;
    vec3 p = ro + rd * t;
    float diff = p.y - terrainHeight(p.xz);
    if (diff < 0.0) {
      float lo = prevT;
      float hi = t;
      for (int j = 0; j < 10; j++) {
        float mid = 0.5 * (lo + hi);
        vec3 pm = ro + rd * mid;
        float dm = pm.y - terrainHeight(pm.xz);
        if (dm < 0.0) { hi = mid; } else { lo = mid; }
      }
      return 0.5 * (lo + hi);
    }
    prevT = t;
    t += max(0.05, t * 0.03) * clamp(diff, 0.3, 4.0);
  }
  return -1.0;
}

vec3 terrainNormal(vec2 p) {
  vec2 e = vec2(0.05, 0.0);
  float hL = terrainHeight(p - e.xy);
  float hR = terrainHeight(p + e.xy);
  float hD = terrainHeight(p - e.yx);
  float hU = terrainHeight(p + e.yx);
  return normalize(vec3(hL - hR, 2.0 * e.x, hD - hU));
}

float terrainShadow(vec3 ro, vec3 rd, float tMax) {
  float shadow = 1.0;
  float t = 0.1;
  for (int i = 0; i < 24; i++) {
    if (t > tMax) break;
    vec3 p = ro + rd * t;
    float diff = p.y - terrainHeight(p.xz);
    shadow = min(shadow, 16.0 * diff / t);
    if (shadow < 0.02) return 0.0;
    t += clamp(diff, 0.05, 0.5);
  }
  return clamp(shadow, 0.0, 1.0);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;

  vec3 ro = vec3(uTime * 0.6, 4.0, uTime * 0.35); // above MAX_HEIGHT: TODO 1 matters
  vec3 target = ro + vec3(1.0, -0.35, 0.6);
  vec3 fwd = normalize(target - ro);
  vec3 right = normalize(cross(fwd, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, fwd);
  vec3 rd = normalize(uv.x * right + uv.y * up + 1.4 * fwd);

  vec3 skyColor = vec3(0.55, 0.7, 0.92) - rd.y * 0.35;
  float sunAmount = max(dot(rd, SUN_DIR), 0.0);
  skyColor += vec3(1.0, 0.75, 0.45) * pow(sunAmount, 12.0) * 0.8;

  vec3 color = skyColor;

  bool canHitTerrain = !(ro.y > MAX_HEIGHT && rd.y >= 0.0);

  if (canHitTerrain) {
    float t = raymarchTerrain(ro, rd, 60.0);

    if (t > 0.0) {
      vec3 p = ro + rd * t;
      vec3 n = terrainNormal(p.xz);
      float shadow = terrainShadow(p + n * 0.05, SUN_DIR, 8.0);

      float diff = max(dot(n, SUN_DIR), 0.0);
      float slope = 1.0 - n.y;

      vec3 grass = vec3(0.3, 0.5, 0.25);
      vec3 rock = vec3(0.42, 0.38, 0.34);
      vec3 snow = vec3(0.96, 0.97, 1.0);

      vec3 base = mix(grass, rock, smoothstep(0.15, 0.45, slope));
      float snowMask = smoothstep(1.5, 2.1, p.y) * (1.0 - smoothstep(0.25, 0.55, slope));
      base = mix(base, snow, snowMask);

      vec3 lit = base * (0.2 + 0.8 * diff * shadow);

      float fog = 1.0 - exp(-t * 0.045);
      vec3 fogColor = mix(skyColor, vec3(1.0, 0.8, 0.6), sunAmount * 0.6);
      color = mix(lit, fogColor, fog);
    }
  }

  fragColor = vec4(color, 1.0);
}`,
    referenceImage: "/figures/08-raymarching/checkpoint-raymarched-vista.png",
    hints: [
      {
        vi: "TODO 1 chỉ là một điều kiện boolean trước khối march, không đổi gì bên trong: \`canHitTerrain = !(ro.y > MAX_HEIGHT && rd.y >= 0.0)\` — camera đã ở trên độ cao tối đa VÀ tia không hướng xuống thì chắc chắn trượt.",
        en: "TODO 1 is just a boolean condition before the march block, nothing inside changes: \`canHitTerrain = !(ro.y > MAX_HEIGHT && rd.y >= 0.0)\` — camera already above max height AND the ray not pointing downward guarantees a miss.",
      },
      {
        vi: "raymarchTerrain KHÔNG phải sphere tracing — không có SDF thật cho heightfield, nên nó bước theo kiểu tăng dần rồi nhị phân tinh chỉnh (kỹ thuật terrain marching của Quilez), khác hẳn vòng lặp d(p) các bài trước. Đừng cố áp lại logic sphere tracing vào đây.",
        en: "raymarchTerrain is NOT sphere tracing — a heightfield has no real SDF, so it grows its steps then bisection-refines (Quilez's terrain-marching technique), unlike the d(p) loop from earlier lessons. Don't try to force sphere-tracing logic back in here.",
      },
      {
        vi: "TODO 5 cần HAI mix() nối tiếp: trước tiên grass→rock theo slope, rồi kết quả đó →snow theo một mask RIÊNG kết hợp cả p.y cao VÀ slope thấp (nhân hai smoothstep lại) — không phải ba nhánh if/else.",
        en: "TODO 5 needs TWO chained mix() calls: first grass→rock by slope, then that result →snow using a SEPARATE mask combining both high p.y AND low slope (multiply two smoothsteps together) — not three if/else branches.",
      },
    ],
    checklist: [
      {
        vi: "Sườn núi quay lưng lại mặt trời đổ bóng đúng, đậm và có hướng rõ ràng vì mặt trời thấp (SUN_DIR gần mặt phẳng ngang)",
        en: "Ridges facing away from the sun cast correct, strongly directional shadows because the sun sits low (SUN_DIR near the horizontal plane)",
      },
      {
        vi: "Sương mù hàm mũ thực sự bán được cảm giác chiều sâu — địa hình xa mờ dần vào màu ấm gần mặt trời, không phải một lớp mù đều toàn cảnh",
        en: "The exponential fog genuinely sells scale — distant terrain fades into a warm tone near the sun, not a flat uniform haze over everything",
      },
      {
        vi: "Tuyết chỉ xuất hiện ở vùng vừa cao vừa tương đối phẳng; sườn dốc dù cao vẫn hiện đá, không bị tuyết phủ sai chỗ",
        en: "Snow only appears where it's both high AND relatively flat; a steep slope stays rocky even at high elevation, snow never bleeds onto the wrong terrain",
      },
      {
        vi: "Không có lỗ thủng ở đường viền núi (silhouette) — nếu thấy khoảng trống lởm chởm giữa địa hình và bầu trời, bước march đang tăng quá nhanh, giảm hệ số nhân trong \`t +=\`",
        en: "No holes along the mountain silhouette — if you see jagged gaps between terrain and sky, the march step is growing too fast; reduce the multiplier in \`t +=\`",
      },
      {
        vi: "Bầu trời phía trên đường chân trời bỏ qua march hoàn toàn nhờ TODO 1 — không có vệt lag hay khựng hình khi camera bay hướng lên",
        en: "Sky above the horizon skips marching entirely thanks to TODO 1 — no stutter or frame hitch when the camera flies with its nose pointed up",
      },
      {
        vi: "Camera bay chậm và mượt suốt toàn cảnh, khung hình giữ ổn định không giật cục dù địa hình liên tục march lại mỗi frame",
        en: "The camera flies slowly and smoothly across the whole scene, frame rate stays stable with no stutter even though the terrain re-marches every frame",
      },
    ],
  },
];
