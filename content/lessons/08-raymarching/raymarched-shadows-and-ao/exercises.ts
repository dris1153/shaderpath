import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "soft-shadow-ratio-by-hand",
    kind: "concept",
    prompt: {
      vi: `Một shadow ray march qua ba bước, ghi lại được $(t, h)$: $(1, 0.1)$, $(2, 0.3)$, $(3, 0.05)$ (đơn vị thế giới). Dùng công thức nửa-tối đơn giản $\\text{res} = \\min(k \\cdot h / t)$ với $k = 8$, không chạy code, tính tỉ số tại cả ba bước rồi cho biết giá trị bóng cuối cùng (sau khi lấy min) là bao nhiêu.

Sau đó, không tính lại từ đầu: giá trị bóng sẽ là bao nhiêu nếu $k = 16$? Và nếu bước thứ ba thay vì $h=0.05$ lại đọc được $h = 0.0005$ (dưới ngưỡng chạm $0.0008$ trong code), giá trị bóng cuối cùng là bao nhiêu — có phụ thuộc vào $k$ không? Giải thích cơ chế.`,
      en: `A shadow ray marches three steps, recording $(t, h)$: $(1, 0.1)$, $(2, 0.3)$, $(3, 0.05)$ (world units). Using the naive penumbra formula $\\text{res} = \\min(k \\cdot h / t)$ with $k = 8$, without running code, compute the ratio at all three steps and state the final shadow value (after taking the min).

Then, without recomputing from scratch: what would the shadow value be at $k = 16$? And if the third step instead read $h = 0.0005$ (below the $0.0008$ hit threshold in the code) instead of $h=0.05$, what's the final shadow value — does it depend on $k$? Explain the mechanism.`,
    },
    hints: [
      {
        vi: "$\\min(k \\cdot h_i/t_i) = k \\cdot \\min(h_i/t_i)$ vì $k$ là hằng số dương nhân chung cho mọi số hạng — chỉ cần tìm tỉ số $h/t$ nhỏ nhất một lần, nhân $k$ vào sau, không cần tính lại cả ba số hạng.",
        en: "$\\min(k \\cdot h_i/t_i) = k \\cdot \\min(h_i/t_i)$ since $k$ is a shared positive constant factor across every term — find the smallest $h/t$ ratio once, multiply by $k$ afterward, no need to redo all three terms.",
      },
      {
        vi: "Nhánh `if (h < 0.0008) return 0.0;` chạy và thoát hàm TRƯỚC khi công thức tỉ lệ k*h/t có cơ hội tính toán ở bước đó — k không xuất hiện trong nhánh này.",
        en: "The `if (h < 0.0008) return 0.0;` branch runs and exits the function BEFORE the k*h/t ratio formula ever gets a chance to compute at that step — k never appears in that branch.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng ba tỉ số (0.8, 1.2, 0.1333) và chọn giá trị nhỏ nhất 0.1333 làm bóng cuối cùng tại k=8",
        en: "I correctly computed all three ratios (0.8, 1.2, 0.1333) and picked the smallest, 0.1333, as the final shadow value at k=8",
      },
      {
        vi: "Tôi suy ra đúng 0.2667 cho k=16 bằng lập luận tỉ lệ thuận, không tính lại từ đầu",
        en: "I correctly derived 0.2667 for k=16 using the proportionality argument, without recomputing from scratch",
      },
      {
        vi: "Tôi giải thích đúng: h=0.0005 kích hoạt early-return 0.0, kết quả KHÔNG phụ thuộc k vì nhánh đó nằm trước phép tính tỉ lệ",
        en: "I correctly explained that h=0.0005 triggers the early-return 0.0, independent of k, because that branch sits before the ratio calculation",
      },
    ],
    solutionCode: `// k = 8:
// buoc 1: 8*0.1/1 = 0.8
// buoc 2: 8*0.3/2 = 1.2
// buoc 3: 8*0.05/3 = 0.4/3 ~ 0.1333
// res = min(0.8, 1.2, 0.1333) = 0.1333  (da nam trong [0,1], khong can clamp them)
//
// k = 16: moi ti so nhan doi (k la he so nhan chung) -> min moi = 2 * 0.1333 ~ 0.2667
// (khong can tinh lai ca ba so hang, chi nhan doi gia tri min cu)
//
// h = 0.0005 tai buoc 3: nho hon nguong 0.0008 -> nhanh
//   "if (h < 0.0008) return 0.0;" thoat ham NGAY, tra ve 0.0
// -> bong = 0.0, KHONG phu thuoc k vi nhanh early-return nam truoc
//    moi phep tinh k*d/(t-y) trong code.`,
  },
  {
    id: "ao-ambient-only-playground",
    kind: "shader",
    prompt: {
      vi: `Trong playground (uTime, uResolution, uMouse, fragColor có sẵn), hoàn thiện shader raymarch một hình cầu trên mặt phẳng: cài đặt \`calcAO\` (5-tap chuẩn, lấy mẫu dọc normal), rồi kết hợp màu sao cho AO CHỈ nhân vào phần ambient, KHÔNG nhân vào phần diffuse (đúng nguyên tắc \`color = ambient*AO + diffuse\` trong bài lý thuyết).`,
      en: `In the playground (uTime, uResolution, uMouse, fragColor are all available), complete a shader that raymarches a sphere on a ground plane: implement \`calcAO\` (the standard 5-tap technique, sampling along the normal), then combine colors so AO multiplies ONLY the ambient term, NOT the diffuse term (per the \`color = ambient*AO + diffuse\` rule from the theory lesson).`,
    },
    starterCode: `float sdPlane(vec3 p) { return p.y; }
float sdSphere(vec3 p, float r) { return length(p) - r; }

float map(vec3 p) {
  return min(sdPlane(p), sdSphere(p - vec3(0.0, 0.6, 0.0), 0.6));
}

vec3 calcNormal(vec3 p) {
  const float eps = 0.0006;
  const vec2 k = vec2(1.0, -1.0);
  return normalize(
    k.xyy * map(p + k.xyy * eps) +
    k.yyx * map(p + k.yyx * eps) +
    k.yxy * map(p + k.yxy * eps) +
    k.xxx * map(p + k.xxx * eps)
  );
}

float raymarch(vec3 ro, vec3 rd) {
  float t = 0.0;
  for (int i = 0; i < 80; i++) {
    float d = map(ro + rd * t);
    if (d < 0.0008) return t;
    t += d;
    if (t > 20.0) break;
  }
  return -1.0;
}

float calcAO(vec3 p, vec3 n) {
  // TODO: 5-tap AO - voi i tu 0 den 4:
  //   h = 0.01 + 0.12 * float(i) / 4.0
  //   occ += (h - map(p + n * h)) * sca
  //   sca *= 0.95
  // tra ve clamp(1.0 - 2.5 * occ, 0.0, 1.0)
  return 1.0;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  vec3 ro = vec3(1.6, 1.0, 1.6);
  vec3 ta = vec3(0.0, 0.4, 0.0);
  vec3 ww = normalize(ta - ro);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = cross(uu, ww);
  vec3 rd = normalize(uv.x * uu + uv.y * vv + 1.6 * ww);

  vec3 color = vec3(0.08, 0.09, 0.12);
  float t = raymarch(ro, rd);
  if (t > 0.0) {
    vec3 p = ro + rd * t;
    vec3 n = calcNormal(p);
    vec3 lightDir = normalize(vec3(0.5, 0.7, 0.4));
    float diff = max(dot(n, lightDir), 0.0);
    float ao = calcAO(p, n);
    vec3 albedo = vec3(0.85, 0.45, 0.25);

    // TODO: color = ambient*ao + diffuse -- AO nhan vao DUNG mot minh phan ambient
    color = albedo * diff;
  }

  fragColor = vec4(color, 1.0);
}`,
    solutionCode: `float sdPlane(vec3 p) { return p.y; }
float sdSphere(vec3 p, float r) { return length(p) - r; }

float map(vec3 p) {
  return min(sdPlane(p), sdSphere(p - vec3(0.0, 0.6, 0.0), 0.6));
}

vec3 calcNormal(vec3 p) {
  const float eps = 0.0006;
  const vec2 k = vec2(1.0, -1.0);
  return normalize(
    k.xyy * map(p + k.xyy * eps) +
    k.yyx * map(p + k.yyx * eps) +
    k.yxy * map(p + k.yxy * eps) +
    k.xxx * map(p + k.xxx * eps)
  );
}

float raymarch(vec3 ro, vec3 rd) {
  float t = 0.0;
  for (int i = 0; i < 80; i++) {
    float d = map(ro + rd * t);
    if (d < 0.0008) return t;
    t += d;
    if (t > 20.0) break;
  }
  return -1.0;
}

float calcAO(vec3 p, vec3 n) {
  float occ = 0.0;
  float sca = 1.0;
  for (int i = 0; i < 5; i++) {
    float h = 0.01 + 0.12 * float(i) / 4.0;
    float d = map(p + n * h);
    occ += (h - d) * sca;
    sca *= 0.95;
  }
  return clamp(1.0 - 2.5 * occ, 0.0, 1.0);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  vec3 ro = vec3(1.6, 1.0, 1.6);
  vec3 ta = vec3(0.0, 0.4, 0.0);
  vec3 ww = normalize(ta - ro);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = cross(uu, ww);
  vec3 rd = normalize(uv.x * uu + uv.y * vv + 1.6 * ww);

  vec3 color = vec3(0.08, 0.09, 0.12);
  float t = raymarch(ro, rd);
  if (t > 0.0) {
    vec3 p = ro + rd * t;
    vec3 n = calcNormal(p);
    vec3 lightDir = normalize(vec3(0.5, 0.7, 0.4));
    float diff = max(dot(n, lightDir), 0.0);
    float ao = calcAO(p, n);
    vec3 albedo = vec3(0.85, 0.45, 0.25);

    vec3 ambient = albedo * 0.3;
    vec3 diffuse = albedo * diff;
    color = ambient * ao + diffuse;
  }

  fragColor = vec4(color, 1.0);
}`,
    hints: [
      {
        vi: "occ += (h - d) * sca; sca *= 0.95; — h là khoảng cách kỳ vọng nếu không có gì che, d là khoảng cách thật đọc từ map(); hiệu dương nghĩa là có hình học khác che gần đó.",
        en: "occ += (h - d) * sca; sca *= 0.95; — h is the expected distance if nothing were in the way, d is the real distance read from map(); a positive difference means nearby geometry is occluding.",
      },
      {
        vi: "Chỉ nhân ao vào phần ambient (albedo * 0.3) — diffuse giữ nguyên không nhân ao, đúng lỗi #3 trong phần Lỗi hay gặp của bài lý thuyết.",
        en: "Only multiply ao into the ambient term (albedo * 0.3) — leave diffuse unmultiplied by ao, matching mistake #3 in the theory lesson's Common Mistakes.",
      },
    ],
    checklist: [
      {
        vi: "Góc nơi hình cầu chạm mặt phẳng tối hơn rõ rệt so với phần cầu lộ thiên phía trên",
        en: "The contact area where the sphere meets the ground plane is visibly darker than the sphere's exposed upper half",
      },
      {
        vi: "Tạm thời cho calcAO trả về hằng 1.0 để tắt AO — vùng tiếp xúc sáng lên rõ rệt so với khi AO bật",
        en: "Temporarily hardcoding calcAO to return 1.0 (AO off) visibly brightens the contact area compared to AO on",
      },
      {
        vi: "Phần diffuse không đổi khi bật/tắt AO — chỉ phần ambient bị ảnh hưởng bởi ao",
        en: "The diffuse term stays unchanged whether AO is on or off — only the ambient term is affected by ao",
      },
    ],
  },
];
