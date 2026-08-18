import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-sdf-sculpture",
    kind: "build",
    prompt: {
      vi: `Dựng một hình điêu khắc kiểu quân cờ (pawn) cách điệu, hoàn toàn bằng SDF trong một fragment shader raymarch.

Yêu cầu: đế \`sdTorus\`, thân \`sdCapsule\`, đầu \`sdSphere\` — hàn cả ba lại bằng \`opSmoothUnion\` thành một khối liền, chọn \`k\` riêng cho từng mối nối. Thêm một torus mỏng làm cổ áo, hàn nhẹ vào thân bằng smin với \`k\` nhỏ hơn hẳn. Khoét một mặt phẳng vào một bên bằng \`opSubtract\` với một box — thao tác này làm **sau cùng**, sau khi mọi \`opSmoothUnion\` đã xong. Toàn khối tự xoay chậm quanh trục dọc bằng cách nhân ma trận xoay vào \`p.xz\` ngay đầu \`map()\`, trước khi gọi \`scene(p)\` — không xoay camera. Tô màu hai tông theo độ cao \`p.y\` của điểm chạm, nhân với hệ số Lambert \`max(dot(n, lightDir), 0)\` từ \`calcNormal\` đã cho sẵn.

Starter code đã có vòng lặp raymarch, \`calcNormal\`, tất cả primitive và phép toán cần dùng, cùng camera. Việc của bạn chỉ là lắp ráp hàm \`scene(p)\`.`,
      en: `Build a stylized chess-pawn-like figure entirely from SDFs in a raymarch fragment shader.

Requirements: a \`sdTorus\` base, \`sdCapsule\` body, \`sdSphere\` head — weld all three with \`opSmoothUnion\` into one continuous mass, choosing a separate \`k\` per joint. Add a thin torus as a collar, blended into the body with a smaller \`k\`. Carve a flat face into one side with \`opSubtract\` against a box — this happens **last**, after every \`opSmoothUnion\` is done. The whole piece slowly self-rotates around its vertical axis by multiplying a rotation matrix into \`p.xz\` at the top of \`map()\`, before calling \`scene(p)\` — not by rotating the camera. Color it with two height-based tones keyed on the hit point's \`p.y\`, multiplied by a Lambert term \`max(dot(n, lightDir), 0)\` from the already-provided \`calcNormal\`.

The starter code already has the raymarch loop, \`calcNormal\`, every primitive and operator you need, and the camera. Your job is only to assemble the \`scene(p)\` function.`,
    },
    starterCode: `float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
  vec3 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float opSmoothUnion(float d1, float d2, float k) {
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

float opSubtract(float d1, float d2) { return max(d1, -d2); }

mat2 rot2(float a) {
  float s = sin(a), c = cos(a);
  return mat2(c, -s, s, c);
}

// TODO: assemble the sculpture here. Pieces (positions/sizes already tuned
// to overlap correctly — just weld and carve them):
//   base   = sdTorus(p - vec3(0.0, -0.95, 0.0), vec2(0.5, 0.16))
//   body   = sdCapsule(p, vec3(0.0, -0.85, 0.0), vec3(0.0, 0.55, 0.0), 0.38)
//   head   = sdSphere(p - vec3(0.0, 0.95, 0.0), 0.42)
//   collar = sdTorus(p - vec3(0.0, 0.35, 0.0), vec2(0.4, 0.06))
//   cutBox = sdBox(p - vec3(0.55, 0.1, 0.0), vec3(0.35, 0.9, 0.9))
// 1) opSmoothUnion base+body, then +head, then +collar (pick a k per joint —
//    bigger masses want a bigger k, the collar wants a small one).
// 2) opSubtract cutBox from the welded result LAST.
float scene(vec3 p) {
  return sdSphere(p, 0.6); // placeholder — replace with the real composition
}

float map(vec3 p) {
  p.xz *= rot2(uTime * 0.3); // rotate the query point, not the camera
  return scene(p);
}

vec3 calcNormal(vec3 p) {
  vec2 e = vec2(0.0015, 0.0);
  return normalize(vec3(
    map(p + e.xyy) - map(p - e.xyy),
    map(p + e.yxy) - map(p - e.yxy),
    map(p + e.yyx) - map(p - e.yyx)
  ));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;

  vec3 ro = vec3(0.0, 0.1, 3.6);
  vec3 ta = vec3(0.0, 0.0, 0.0);
  vec3 ww = normalize(ta - ro);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = cross(uu, ww);
  vec3 rd = normalize(uv.x * uu + uv.y * vv + 1.8 * ww);

  vec3 col = vec3(0.05, 0.06, 0.09);
  float t = 0.0;
  for (int i = 0; i < 100; i++) {
    vec3 p = ro + rd * t;
    float d = map(p);
    if (d < 0.0006) {
      vec3 n = calcNormal(p);
      vec3 lightDir = normalize(vec3(0.5, 0.8, 0.35));
      float diff = max(dot(n, lightDir), 0.0);

      vec3 low = vec3(0.35, 0.22, 0.5);
      vec3 high = vec3(0.95, 0.75, 0.35);
      vec3 base = mix(low, high, clamp(p.y * 0.6 + 0.5, 0.0, 1.0));

      col = base * (0.25 + diff * 0.8);
      break;
    }
    t += d;
    if (t > 10.0) break;
  }

  fragColor = vec4(col, 1.0);
}`,
    solutionCode: `float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
  vec3 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float opSmoothUnion(float d1, float d2, float k) {
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

float opSubtract(float d1, float d2) { return max(d1, -d2); }

mat2 rot2(float a) {
  float s = sin(a), c = cos(a);
  return mat2(c, -s, s, c);
}

float scene(vec3 p) {
  float base = sdTorus(p - vec3(0.0, -0.95, 0.0), vec2(0.5, 0.16));
  float body = sdCapsule(p, vec3(0.0, -0.85, 0.0), vec3(0.0, 0.55, 0.0), 0.38);
  float head = sdSphere(p - vec3(0.0, 0.95, 0.0), 0.42);
  float collar = sdTorus(p - vec3(0.0, 0.35, 0.0), vec2(0.4, 0.06));

  float d = opSmoothUnion(base, body, 0.28);
  d = opSmoothUnion(d, head, 0.22);
  d = opSmoothUnion(d, collar, 0.1);

  float cutBox = sdBox(p - vec3(0.55, 0.1, 0.0), vec3(0.35, 0.9, 0.9));
  d = opSubtract(d, cutBox);

  return d;
}

float map(vec3 p) {
  p.xz *= rot2(uTime * 0.3);
  return scene(p);
}

vec3 calcNormal(vec3 p) {
  vec2 e = vec2(0.0015, 0.0);
  return normalize(vec3(
    map(p + e.xyy) - map(p - e.xyy),
    map(p + e.yxy) - map(p - e.yxy),
    map(p + e.yyx) - map(p - e.yyx)
  ));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;

  vec3 ro = vec3(0.0, 0.1, 3.6);
  vec3 ta = vec3(0.0, 0.0, 0.0);
  vec3 ww = normalize(ta - ro);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = cross(uu, ww);
  vec3 rd = normalize(uv.x * uu + uv.y * vv + 1.8 * ww);

  vec3 col = vec3(0.05, 0.06, 0.09);
  float t = 0.0;
  for (int i = 0; i < 100; i++) {
    vec3 p = ro + rd * t;
    float d = map(p);
    if (d < 0.0006) {
      vec3 n = calcNormal(p);
      vec3 lightDir = normalize(vec3(0.5, 0.8, 0.35));
      float diff = max(dot(n, lightDir), 0.0);

      vec3 low = vec3(0.35, 0.22, 0.5);
      vec3 high = vec3(0.95, 0.75, 0.35);
      vec3 base = mix(low, high, clamp(p.y * 0.6 + 0.5, 0.0, 1.0));

      col = base * (0.25 + diff * 0.8);
      break;
    }
    t += d;
    if (t > 10.0) break;
  }

  fragColor = vec4(col, 1.0);
}`,
    referenceImage: "/figures/08-raymarching/checkpoint-sdf-sculpture.png",
    hints: [
      {
        vi: "Dựng từ dưới lên và thử từng mối nối một: hàn `base` với `body` trước, xem hình đã liền chưa (tạm thời `return opSmoothUnion(base, body, 0.28);`), rồi mới thêm `head`, rồi `collar` — dễ tìm lỗi hơn hẳn so với ghép cả bốn khối cùng lúc rồi đoán mối nào sai.",
        en: "Build bottom-up and test one joint at a time: weld `base` with `body` first and check it reads as one piece (temporarily `return opSmoothUnion(base, body, 0.28);`), then add `head`, then `collar` — much easier to debug than combining all four at once and guessing which joint is wrong.",
      },
      {
        vi: "`opSubtract` phải là bước cuối cùng, áp lên kết quả đã hàn xong hết — khoét trước rồi mới hàn sẽ khiến số hạng bù của `opSmoothUnion` lấp lại một phần vết khoét, như ví dụ cây nấm trong bài lý thuyết.",
        en: "`opSubtract` must be the very last step, applied to the fully-welded result — carving before welding lets `opSmoothUnion`'s correction term partially fill the cut back in, exactly like the mushroom example in the theory.",
      },
      {
        vi: "Xoay `p.xz` bằng `rot2(uTime * 0.3)` ngay dòng đầu `map()`, trước khi gọi `scene(p)` — xoay điểm truy vấn áp dụng cho toàn bộ khối composite trong một dòng, không cần đụng vào camera hay xoay từng primitive riêng lẻ.",
        en: "Rotate `p.xz` with `rot2(uTime * 0.3)` on the very first line of `map()`, before calling `scene(p)` — rotating the query point applies to the entire composite shape in one line, no need to touch the camera or rotate each primitive separately.",
      },
    ],
    checklist: [
      {
        vi: "Silhouette đọc như một khối liền mạch từ mọi góc xoay, không phải bốn primitive rời chạm nhau",
        en: "The silhouette reads as one continuous mass from every rotation angle, not four separate primitives just touching",
      },
      {
        vi: "Các mối nối (đế-thân, thân-đầu, cổ áo) mềm như đất sét, không có góc gấp nhọn ở đường nối",
        en: "The joints (base-body, body-head, collar) look soft like clay, no sharp crease at any seam",
      },
      {
        vi: "Mặt bị khoét phẳng và sạch, không có mảnh vụn hay cạnh gãy khúc còn sót lại",
        en: "The carved face is flat and clean, no leftover fragments or jagged edges",
      },
      {
        vi: "Vòng xoay chạy mượt liên tục, không giật hay nhảy khung hình",
        en: "The rotation runs smoothly and continuously, no stutter or frame jump",
      },
      {
        vi: "Không có lỗ hổng hay khoảng tối bất thường lộ ra ở viền silhouette",
        en: "No holes or unexpected dark gaps show up along the silhouette edges",
      },
      {
        vi: "Màu hai tông theo độ cao chuyển tiếp mượt từ đế lên đầu, không có ranh giới màu cứng",
        en: "The two-tone height coloring transitions smoothly from base to head, no hard color boundary",
      },
    ],
  },
];
