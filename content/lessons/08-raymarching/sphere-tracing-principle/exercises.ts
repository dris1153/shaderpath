import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "hand-trace-a-straight-ray",
    kind: "concept",
    prompt: {
      vi: `Một cảnh chỉ có một mặt cầu bán kính $r = 1$ tại gốc toạ độ: $f(p) = \\|p\\| - 1$. Một tia bắn từ $ro = (0, 0, 4)$ theo hướng đã chuẩn hoá $rd = (0, 0, -1)$, nhắm thẳng vào tâm. Không chạy code, tính tay $t_1$ và $p_1$ theo công thức $t_{i+1} = t_i + f(p_i)$ với $p_i = ro + t_i \\cdot rd$, $t_0 = 0$.

Vòng lặp có dừng ngay ở bước 1 với $\\epsilon = 0.01$ không? Sau đó giải thích ngắn gọn: nếu $rd$ bị lệch đi một góc nhỏ để gần như lướt qua rìa mặt cầu thay vì nhắm thẳng vào tâm, số bước cần để hội tụ thay đổi thế nào — và vì sao.`,
      en: `A scene has a single sphere of radius $r = 1$ at the origin: $f(p) = \\|p\\| - 1$. A ray fires from $ro = (0, 0, 4)$ with normalized direction $rd = (0, 0, -1)$, aimed straight at the center. Without running code, hand-compute $t_1$ and $p_1$ using $t_{i+1} = t_i + f(p_i)$ with $p_i = ro + t_i \\cdot rd$, $t_0 = 0$.

Does the loop stop right at step 1 with $\\epsilon = 0.01$? Then explain briefly: if $rd$ were tilted slightly so the ray nearly grazes the sphere's edge instead of aiming at the center, how would the step count to converge change — and why.`,
    },
    hints: [
      {
        vi: "$p_0 = ro$, nên $f(p_0) = \\|ro\\| - 1$ — tính giá trị này trước, nó chính là $t_1$ (vì $t_0 = 0$).",
        en: "$p_0 = ro$, so $f(p_0) = \\|ro\\| - 1$ — compute this first, it IS $t_1$ (since $t_0 = 0$).",
      },
      {
        vi: "Sau khi có $t_1$, tính lại $p_1 = ro + t_1 \\cdot rd$ rồi $f(p_1)$ — nếu kết quả đã dưới $\\epsilon$, vòng lặp dừng ngay ở bước này, không cần bước 2.",
        en: "Once you have $t_1$, recompute $p_1 = ro + t_1 \\cdot rd$ then $f(p_1)$ — if that's already under $\\epsilon$, the loop stops right here, no step 2 needed.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng $t_1 = 3$ (vì $f(ro) = 4 - 1 = 3$)",
        en: "I correctly computed $t_1 = 3$ (since $f(ro) = 4 - 1 = 3$)",
      },
      {
        vi: "Tôi tính đúng $p_1 = (0, 0, 1)$ và $f(p_1) = 0 < \\epsilon$, nên vòng lặp DỪNG ngay ở bước 1",
        en: "I correctly computed $p_1 = (0, 0, 1)$ and $f(p_1) = 0 < \\epsilon$, so the loop STOPS right at step 1",
      },
      {
        vi: "Tôi giải thích được vì sao một tia lệch gần rìa silhouette cần nhiều bước hơn hẳn, dù ro cách tâm y hệt",
        en: "I can explain why a ray tilted near the silhouette needs far more steps, even from the same distance to the center",
      },
    ],
    solutionCode: `// t0 = 0, p0 = ro = (0,0,4)
// f(p0) = |(0,0,4)| - 1 = 4 - 1 = 3  ->  t1 = t0 + 3 = 3
// p1 = ro + t1*rd = (0,0,4) + 3*(0,0,-1) = (0,0,1)
// f(p1) = |(0,0,1)| - 1 = 1 - 1 = 0 < epsilon (0.01)  ->  HIT ngay ở bước 1
//
// rd nhắm thẳng vào tâm nên quãng đường còn lại tới bề mặt CHÍNH XÁC bằng
// f(ro) -- trường hợp lý tưởng, hội tụ trong đúng 1 bước.
//
// Một tia lệch gần rìa silhouette không có may mắn đó: bề mặt gần nhất nằm
// LỆCH SANG BÊN so với hướng tia, nên f(p) tuy vẫn nhỏ (có bề mặt ở gần)
// nhưng mỗi bước t += f(p) chỉ đẩy t tiến một chút DỌC THEO TIA, trong khi
// điểm chạm thật còn cách rất xa theo đúng hướng đó -- cần hàng chục bước
// nhỏ dần mới hội tụ, thay vì 1 bước duy nhất.`,
  },
  {
    id: "1d-sphere-tracing-step-visualizer",
    kind: "shader",
    prompt: {
      vi: `Trong playground (uTime, uResolution, uMouse, fragColor có sẵn), dựng một trục số 1D nằm ngang: pixel tại cột \`x\` biểu diễn giá trị \`t = uv.x * 4.0\`. Cảnh 1D chỉ có một "điểm" tại \`target = 2.0\` với hàm khoảng cách \`d = abs(t - target) - 0.15\` (y hệt \`sdSphere\`, chỉ bớt một chiều). Chạy vòng lặp sphere tracing từ \`t = 0.0\`, tối đa 8 bước, và với MỖI bước \`i\`, nếu \`abs(x - t) < 0.02\` thì tô sáng pixel đó theo màu chuyển dần từ xanh (bước đầu) sang đỏ (bước cuối) — kết quả phải là một chuỗi chấm sáng dọc trục, dính sát nhau hơn khi \`t\` tiến gần \`target\`.`,
      en: `In the playground (uTime, uResolution, uMouse, fragColor are all available), build a horizontal 1D number line: the pixel at column \`x\` represents the value \`t = uv.x * 4.0\`. The 1D scene has a single "point" at \`target = 2.0\` with distance function \`d = abs(t - target) - 0.15\` (exactly \`sdSphere\`, minus one dimension). Run the sphere tracing loop from \`t = 0.0\`, up to 8 steps, and on EACH step \`i\`, if \`abs(x - t) < 0.02\`, light up that pixel with a color fading from blue (early steps) to red (late steps) — the result should be a row of dots along the axis, bunching closer together as \`t\` approaches \`target\`.`,
    },
    starterCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float x = uv.x * 4.0; // trục hoành biểu diễn t trong [0, 4]

  float t = 0.0;
  float target = 2.0;
  vec3 color = vec3(0.08, 0.08, 0.12);

  for (int i = 0; i < 8; i++) {
    // TODO 1: f(t) = khoảng cách 1D tới target, bán kính an toàn 0.15
    float d = 0.0;

    // TODO 2: nếu pixel này (x) đủ gần vị trí t hiện tại (abs(x - t) < 0.02),
    // tô sáng nó bằng mix(màu xanh, màu đỏ, float(i) / 8.0)

    if (d < 0.01) break; // hit: dừng vòng lặp, không march thêm
    t += d; // TODO 3: bước tới theo đúng công thức sphere tracing
  }

  fragColor = vec4(color, 1.0);
}`,
    solutionCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float x = uv.x * 4.0; // trục hoành biểu diễn t trong [0, 4]

  float t = 0.0;
  float target = 2.0;
  vec3 color = vec3(0.08, 0.08, 0.12);

  for (int i = 0; i < 8; i++) {
    float d = abs(t - target) - 0.15;

    if (abs(x - t) < 0.02) {
      color = mix(vec3(0.3, 0.6, 1.0), vec3(1.0, 0.3, 0.2), float(i) / 8.0);
    }

    if (d < 0.01) break;
    t += d;
  }

  fragColor = vec4(color, 1.0);
}`,
    hints: [
      {
        vi: "`d = abs(t - target) - 0.15` chính là hàm khoảng cách 1D — y hệt `sdSphere`, chỉ bớt một chiều không gian.",
        en: "`d = abs(t - target) - 0.15` is exactly the 1D distance function — `sdSphere` with one dimension removed.",
      },
      {
        vi: "So sánh bằng `abs(x - t)` chứ không phải `x - t`, vì pixel có thể nằm ở bên nào của `t` cũng cần được tô nếu đủ gần — đây là phép test khoảng cách, không phải test dấu.",
        en: "Compare with `abs(x - t)`, not `x - t` — a pixel on either side of `t` should light up if close enough; this is a distance test, not a sign test.",
      },
    ],
    checklist: [
      {
        vi: "Các chấm sáng xuất hiện dọc trục ngang, dính sát nhau hơn khi tiến gần t = 2",
        en: "Bright dots appear along the horizontal axis, bunching closer together as they approach t = 2",
      },
      {
        vi: "Đổi `target` (ví dụ 3.0) làm cụm chấm dịch chuyển đúng theo vị trí mới",
        en: "Changing `target` (e.g. to 3.0) shifts the dot cluster to the new position correctly",
      },
      {
        vi: "Vòng lặp dừng đúng lúc d < 0.01 — không có chấm nào vẽ thêm sau vị trí hit",
        en: "The loop stops exactly when d < 0.01 — no dot is drawn past the hit position",
      },
    ],
  },
];
