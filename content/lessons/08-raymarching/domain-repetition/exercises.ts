import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "fold-formula-and-overstepping",
    kind: "concept",
    prompt: {
      vi: `Một lưới lặp domain có kích thước ô $c = 2$ (mỗi trục), đặt một sphere bán kính $r = 0.4$ tại tâm mỗi ô bằng công thức $q = \\mathrm{mod}(p + 0.5c,\\ c) - 0.5c$. Không chạy code, tính $q$ khi $p = (2.6,\\ 0,\\ 0)$ theo TỪNG trục, rồi tính $d(p) = \\|q\\| - r$.

Sau đó: nếu bán kính đổi thành $r = 1.1$ (đường kính $2.2$ vượt quá $c = 2$), giải thích CƠ CHẾ cụ thể khiến giá trị $d(p)$ mà công thức trên trả về không còn đáng tin — chỉ rõ điều kiện Lipschitz-1 bị vi phạm ở đâu, và một tia raymarch có thể xuyên qua bề mặt thật (overstepping) như thế nào từ đó.`,
      en: `A domain-repeated grid has cell size $c = 2$ (per axis), placing a sphere of radius $r = 0.4$ at the center of every cell via $q = \\mathrm{mod}(p + 0.5c,\\ c) - 0.5c$. Without running code, compute $q$ for $p = (2.6,\\ 0,\\ 0)$ on EACH axis, then compute $d(p) = \\|q\\| - r$.

Then: if the radius becomes $r = 1.1$ (diameter $2.2$ exceeds $c = 2$), explain the concrete MECHANISM that makes the $d(p)$ this formula returns unreliable — point to exactly where the Lipschitz-1 condition breaks, and how a raymarch ray can step through the real surface (overstepping) as a result.`,
    },
    hints: [
      {
        vi: "mod(2.6 + 1, 2) = mod(3.6, 2) = 1.6, rồi trừ 1 ra 0.6. Áp dụng tương tự cho trục y và z (ở đây bằng 0), bạn sẽ có q dạng gọn.",
        en: "mod(2.6 + 1, 2) = mod(3.6, 2) = 1.6, then subtract 1 to get 0.6. Apply the same to the y and z axes (both 0 here) and q comes out clean.",
      },
      {
        vi: "Công thức chỉ đúng khi $\\|q\\| < 0.5c$ là bán kính vật thể — nghĩa là vật thể phải nằm gọn trong nửa ô. So sánh $r = 1.1$ với $0.5c = 1.0$ để thấy điều kiện đó vỡ ở đâu.",
        en: "The formula only holds when the object's radius stays under $0.5c$ — the object must fit entirely inside half a cell. Compare $r = 1.1$ against $0.5c = 1.0$ to see exactly where that condition breaks.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng $q = (0.6, 0, 0)$ và $d(p) = 0.6 - 0.4 = 0.2$",
        en: "I correctly computed $q = (0.6, 0, 0)$ and $d(p) = 0.6 - 0.4 = 0.2$",
      },
      {
        vi: "Tôi chỉ ra được $r = 1.1 > 0.5c = 1.0$ là điều kiện cụ thể bị vi phạm",
        en: "I identified $r = 1.1 > 0.5c = 1.0$ as the specific condition being violated",
      },
      {
        vi: "Tôi giải thích được vì sao d(p) bị thổi phồng gần biên ô khiến bước march nhảy quá xa, xuyên qua bề mặt thật",
        en: "I explained why d(p) gets inflated near cell borders, causing a march step to jump too far and pass through the real surface",
      },
    ],
    solutionNote: {
      vi: `$q_x = \\mathrm{mod}(2.6 + 1.0, 2.0) - 1.0 = \\mathrm{mod}(3.6, 2.0) - 1.0 = 1.6 - 1.0 = 0.6$. $q_y = \\mathrm{mod}(0.0 + 1.0, 2.0) - 1.0 = \\mathrm{mod}(1.0, 2.0) - 1.0 = 1.0 - 1.0 = 0.0$. $q_z$ giống $q_y$, bằng $0.0$. $q = (0.6, 0.0, 0.0) \\Rightarrow d(p) = |q| - r = 0.6 - 0.4 = 0.2$.

Với $r = 1.1$: nửa ô là $0.5c = 1.0$, và bán kính quả cầu ($1.1$) đã vượt quá mức đó — quả cầu tràn sang ô lân cận trước cả khi ta truy vấn gần biên. Tại một điểm truy vấn gần cạnh ô, bản sao ở ô LÂN CẬN có thể thực sự gần hơn bản sao "gốc" mà công thức fold trả về — nhưng \`map()\` chỉ bao giờ đánh giá bản gốc, nên $d(p)$ trả về LỚN HƠN khoảng cách thật tới bề mặt gần nhất. Sphere tracing giả định $d(p)$ là một cận dưới an toàn (Lipschitz-1) của khoảng cách thật đó; một $d(p)$ bị thổi phồng phá vỡ đảm bảo đó, nên bước tính từ nó có thể nhảy thẳng qua bề mặt thật ngay tại đường nối giữa hai ô — tia bị overshoot, tạo ra lỗ hổng hoặc cạnh răng cưa đúng dọc theo đường lưới thay vì một bề mặt liền mạch, sạch sẽ.`,
      en: `$q_x = \\mathrm{mod}(2.6 + 1.0, 2.0) - 1.0 = \\mathrm{mod}(3.6, 2.0) - 1.0 = 1.6 - 1.0 = 0.6$. $q_y = \\mathrm{mod}(0.0 + 1.0, 2.0) - 1.0 = \\mathrm{mod}(1.0, 2.0) - 1.0 = 1.0 - 1.0 = 0.0$. $q_z$ matches $q_y$, also $0.0$. $q = (0.6, 0.0, 0.0) \\Rightarrow d(p) = |q| - r = 0.6 - 0.4 = 0.2$.

With $r = 1.1$: half the cell is $0.5c = 1.0$, and the sphere's radius ($1.1$) already exceeds it — the sphere overlaps into the neighboring cell before you even query anything near the border. At a query point close to a cell edge, the copy in the ADJACENT cell can be genuinely nearer than the "home" copy the fold formula returns — but \`map()\` only ever evaluates the home copy, so $d(p)$ comes back LARGER than the true nearest-surface distance. Sphere tracing's step size assumes $d(p)$ is a safe (Lipschitz-1) lower bound on that true distance; an inflated $d(p)$ breaks that guarantee, so a step computed from it can jump straight past the real surface at the seam between two cells — the ray overshoots, producing a hole or a jagged edge exactly along the grid line instead of a clean, continuous surface.`,
    },
  },
  {
    id: "repeated-spheres-with-cell-color",
    kind: "shader",
    prompt: {
      vi: `Trong playground (uTime, uResolution, uMouse, fragColor có sẵn), hoàn thiện một scene raymarch gồm các sphere lặp vô hạn theo cả ba trục. Điền hai TODO: (1) hàm \`repeatDomain\` fold toạ độ truy vấn bằng công thức $q = \\mathrm{mod}(p + 0.5c,\\ c) - 0.5c$ và ghi chỉ số ô (trước khi fold) vào \`cellId\`; (2) khi tia trúng bề mặt, tô màu bằng cách hash \`cellId\` (không phải \`q\`) để mỗi sphere lặp có một màu ổn định riêng.`,
      en: `In the playground (uTime, uResolution, uMouse, fragColor are all available), complete a raymarch scene made of spheres repeated infinitely on all three axes. Fill in two TODOs: (1) the \`repeatDomain\` function folds the query coordinate using $q = \\mathrm{mod}(p + 0.5c,\\ c) - 0.5c$ and writes the pre-fold cell index into \`cellId\`; (2) once a ray hits a surface, color it by hashing \`cellId\` (not \`q\`) so every repeated sphere gets its own stable color.`,
    },
    starterCode: `float hash31(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

// TODO 1: fold p on all 3 axes with q = mod(p + 0.5*c, c) - 0.5*c, and write
// the winning cell's integer id (BEFORE folding) into cellId.
vec3 repeatDomain(vec3 p, float c, out vec3 cellId) {
  cellId = vec3(0.0);
  return p;
}

float map(vec3 p, out vec3 cellId) {
  vec3 q = repeatDomain(p, 2.0, cellId);
  return sdSphere(q, 0.6);
}

void main() {
  vec2 uv = (gl_FragCoord.xy / uResolution - 0.5) * 2.0;

  vec3 ro = vec3(uMouse.x * 6.0 - 3.0, uMouse.y * 3.0, 6.0);
  vec3 rd = normalize(vec3(uv, -1.5));

  vec3 col = vec3(0.05, 0.06, 0.09);
  float t = 0.0;
  vec3 cellId = vec3(0.0);
  for (int i = 0; i < 80; i++) {
    vec3 pos = ro + rd * t;
    float d = map(pos, cellId);
    if (d < 0.001) {
      // TODO 2: color the hit by hashing cellId so each repeated sphere
      // gets a distinct, but fully deterministic, color.
      col = vec3(0.9, 0.5, 0.3);
      break;
    }
    t += d;
    if (t > 40.0) break;
  }

  fragColor = vec4(col, 1.0);
}`,
    solutionCode: `float hash31(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

vec3 repeatDomain(vec3 p, float c, out vec3 cellId) {
  cellId = floor(p / c + 0.5);
  return mod(p + 0.5 * c, c) - 0.5 * c;
}

float map(vec3 p, out vec3 cellId) {
  vec3 q = repeatDomain(p, 2.0, cellId);
  return sdSphere(q, 0.6);
}

void main() {
  vec2 uv = (gl_FragCoord.xy / uResolution - 0.5) * 2.0;

  vec3 ro = vec3(uMouse.x * 6.0 - 3.0, uMouse.y * 3.0, 6.0);
  vec3 rd = normalize(vec3(uv, -1.5));

  vec3 col = vec3(0.05, 0.06, 0.09);
  float t = 0.0;
  vec3 cellId = vec3(0.0);
  for (int i = 0; i < 80; i++) {
    vec3 pos = ro + rd * t;
    float d = map(pos, cellId);
    if (d < 0.001) {
      vec3 hue = vec3(
        hash31(cellId),
        hash31(cellId + 7.1),
        hash31(cellId + 23.4)
      );
      col = 0.35 + 0.5 * hue;
      break;
    }
    t += d;
    if (t > 40.0) break;
  }

  fragColor = vec4(col, 1.0);
}`,
    hints: [
      {
        vi: "Công thức fold giống hệt phần lý thuyết: `mod(p + 0.5*c, c) - 0.5*c`. `cellId` dùng `floor(p / c + 0.5)` — cùng phép dịch 0.5 để tâm hoá, nhưng KHÔNG mod lại — đó chính là chỉ số ô nguyên.",
        en: "The fold formula matches the theory exactly: `mod(p + 0.5*c, c) - 0.5*c`. `cellId` uses `floor(p / c + 0.5)` — the same 0.5 centering shift, but WITHOUT modding it back — that's the integer cell index.",
      },
      {
        vi: "Hash bằng `cellId` (hằng số trong suốt cả một sphere) chứ không phải `q` hay `pos` (đổi theo từng fragment) — nếu không màu sẽ loang lổ thay vì mỗi sphere một màu đồng nhất.",
        en: "Hash with `cellId` (constant across an entire sphere), not `q` or `pos` (which change per fragment) — otherwise the color comes out blotchy instead of one uniform color per sphere.",
      },
    ],
    checklist: [
      {
        vi: "Các sphere lặp lại đều khắp không gian, không có khoảng hở hay chồng lấn ở biên ô",
        en: "Spheres repeat evenly across space, with no gaps or overlap at the cell borders",
      },
      {
        vi: "Kéo chuột bay camera qua nhiều sphere khác nhau — mỗi quả có một màu ổn định, không đổi màu khi camera di chuyển",
        en: "Dragging the mouse flies the camera past many spheres — each one holds a stable color that doesn't shift as the camera moves",
      },
      {
        vi: "Không có lỗi biên dịch trong Playground; scene chạy mượt không giật hình",
        en: "No compile errors in the Playground; the scene runs smoothly with no stutter",
      },
    ],
  },
];
