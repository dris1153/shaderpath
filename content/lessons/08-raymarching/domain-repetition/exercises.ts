import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "fold-formula-and-overstepping",
    kind: "concept",
    prompt: {
      vi: `Một lưới lặp domain có kích thước ô $c = 2$ (mỗi trục), đặt một sphere bán kính $r = 0.4$ tại tâm mỗi ô bằng công thức $q = \\mathrm{mod}(p + 0.5c,\\ c) - 0.5c$. Không chạy code, tính $q$ khi $p = (2.6,\\ 0,\\ 0)$ theo TỪNG trục, rồi tính $d(p) = \\|q\\| - r$.

Sau đó: giữ nguyên $r = 0.4$ nhưng dời tâm sphere LỆCH khỏi tâm ô — sau khi fold, đánh giá \`sdSphere(q - vec3(0.7, 0.0, 0.0), 0.4)\`. Xét điểm truy vấn $p = (-0.95, 0, 0)$ sát mép trái ô: tính $d(p)$ mà công thức trả về, so với khoảng cách tới bản sao của ô BÊN TRÁI (tâm tại $(-1.3, 0, 0)$), rồi giải thích điều kiện Lipschitz-1 vỡ ở đâu và tia raymarch xuyên qua bề mặt thật (overstepping) như thế nào. (Ghi chú: sphere đặt ĐÚNG tâm thì to quá cỡ ô cũng không overstepping — đối xứng gương qua biên giữ trường 1-Lipschitz; bất đối xứng mới là thủ phạm.)`,
      en: `A domain-repeated grid has cell size $c = 2$ (per axis), placing a sphere of radius $r = 0.4$ at the center of every cell via $q = \\mathrm{mod}(p + 0.5c,\\ c) - 0.5c$. Without running code, compute $q$ for $p = (2.6,\\ 0,\\ 0)$ on EACH axis, then compute $d(p) = \\|q\\| - r$.

Then: keep $r = 0.4$ but move the sphere OFF the cell center — after folding, evaluate \`sdSphere(q - vec3(0.7, 0.0, 0.0), 0.4)\`. Take the query point $p = (-0.95, 0, 0)$, right by a cell's left border: compute the $d(p)$ the formula returns, compare it against the distance to the LEFT neighbor cell's copy (centered at $(-1.3, 0, 0)$), then explain exactly where the Lipschitz-1 condition breaks and how a raymarch ray steps through the real surface (overstepping). (Note: a sphere placed dead-center never oversteps even when it outgrows the cell — mirror symmetry across borders keeps the field 1-Lipschitz; asymmetry is the culprit.)`,
    },
    hints: [
      {
        vi: "mod(2.6 + 1, 2) = mod(3.6, 2) = 1.6, rồi trừ 1 ra 0.6. Áp dụng tương tự cho trục y và z (ở đây bằng 0), bạn sẽ có q dạng gọn.",
        en: "mod(2.6 + 1, 2) = mod(3.6, 2) = 1.6, then subtract 1 to get 0.6. Apply the same to the y and z axes (both 0 here) and q comes out clean.",
      },
      {
        vi: "Điểm sát mép TRÁI ô: bản sao \"chính chủ\" nằm lệch về bên phải (xa), còn bản sao của ô bên trái nằm ngay sát mép — nhưng công thức fold chỉ đánh giá bản chính chủ. Tính cả hai khoảng cách rồi so.",
        en: "A point hugging the cell's LEFT border: the \"home\" copy sits shifted to the right (far away), while the left neighbor's copy sits just past the border — yet the fold only evaluates the home copy. Compute both distances and compare.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng $q = (0.6, 0, 0)$ và $d(p) = 0.6 - 0.4 = 0.2$",
        en: "I correctly computed $q = (0.6, 0, 0)$ and $d(p) = 0.6 - 0.4 = 0.2$",
      },
      {
        vi: "Tôi tính được cả hai khoảng cách tại $p = (-0.95, 0, 0)$ và chỉ ra bản sao ô lân cận mới là bề mặt gần nhất, không phải bản sao mà fold đánh giá",
        en: "I computed both distances at $p = (-0.95, 0, 0)$ and showed the neighbor cell's copy is the true nearest surface, not the copy the fold evaluates",
      },
      {
        vi: "Tôi giải thích được vì sao d(p) bị thổi phồng gần biên ô khiến bước march nhảy quá xa, xuyên qua bề mặt thật",
        en: "I explained why d(p) gets inflated near cell borders, causing a march step to jump too far and pass through the real surface",
      },
    ],
    solutionNote: {
      vi: `$q_x = \\mathrm{mod}(2.6 + 1.0, 2.0) - 1.0 = \\mathrm{mod}(3.6, 2.0) - 1.0 = 1.6 - 1.0 = 0.6$. $q_y = \\mathrm{mod}(0.0 + 1.0, 2.0) - 1.0 = \\mathrm{mod}(1.0, 2.0) - 1.0 = 1.0 - 1.0 = 0.0$. $q_z$ giống $q_y$, bằng $0.0$. $q = (0.6, 0.0, 0.0) \\Rightarrow d(p) = |q| - r = 0.6 - 0.4 = 0.2$.

Với tâm lệch $(0.7, 0, 0)$, tại $p = (-0.95, 0, 0)$: fold cho $q = (-0.95, 0, 0)$, công thức trả $d(p) = |q - (0.7,0,0)| - 0.4 = 1.65 - 0.4 = 1.25$. Nhưng bản sao của ô bên trái có tâm tại $(-2 + 0.7, 0, 0) = (-1.3, 0, 0)$: khoảng cách thật là $|-0.95 - (-1.3)| - 0.4 = 0.35 - 0.4 = -0.05$ — điểm truy vấn đang nằm BÊN TRONG bản sao đó, trong khi $d(p)$ tuyên bố còn cách bề mặt những $1.25$ đơn vị! \`map()\` chỉ đánh giá bản "chính chủ", nên $d(p)$ LỚN HƠN khoảng cách thật. Sphere tracing giả định $d(p)$ là cận dưới an toàn (Lipschitz-1); một $d(p)$ thổi phồng phá vỡ đảm bảo đó — bước tính từ nó nhảy thẳng qua bề mặt thật ngay đường nối giữa hai ô, tạo lỗ hổng hoặc răng cưa dọc đường lưới. (Sphere đặt đúng tâm thì đối xứng gương qua biên giữ trường sau fold liên tục và 1-Lipschitz — to quá cỡ ô chỉ làm các bản sao dính/cắt nhau sai hình, không overstepping.)`,
      en: `$q_x = \\mathrm{mod}(2.6 + 1.0, 2.0) - 1.0 = \\mathrm{mod}(3.6, 2.0) - 1.0 = 1.6 - 1.0 = 0.6$. $q_y = \\mathrm{mod}(0.0 + 1.0, 2.0) - 1.0 = \\mathrm{mod}(1.0, 2.0) - 1.0 = 1.0 - 1.0 = 0.0$. $q_z$ matches $q_y$, also $0.0$. $q = (0.6, 0.0, 0.0) \\Rightarrow d(p) = |q| - r = 0.6 - 0.4 = 0.2$.

With the center offset to $(0.7, 0, 0)$, at $p = (-0.95, 0, 0)$: the fold gives $q = (-0.95, 0, 0)$, so the formula returns $d(p) = |q - (0.7,0,0)| - 0.4 = 1.65 - 0.4 = 1.25$. But the left neighbor cell's copy is centered at $(-2 + 0.7, 0, 0) = (-1.3, 0, 0)$: the true distance is $|-0.95 - (-1.3)| - 0.4 = 0.35 - 0.4 = -0.05$ — the query point is INSIDE that copy, while $d(p)$ claims the surface is a full $1.25$ units away! \`map()\` only ever evaluates the "home" copy, so $d(p)$ comes back LARGER than the true distance. Sphere tracing assumes $d(p)$ is a safe (Lipschitz-1) lower bound; an inflated $d(p)$ breaks that guarantee — a step computed from it jumps straight past the real surface at the seam between cells, producing holes or jagged edges along the grid lines. (A dead-centered sphere keeps mirror symmetry across borders, so the folded field stays continuous and 1-Lipschitz — outgrowing the cell merely merges/clips the copies into the wrong shape, no overstepping.)`,
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

  vec3 ro = vec3(uMouse.x * 6.0 - 3.0, uMouse.y * 3.0, 7.0);
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

  vec3 ro = vec3(uMouse.x * 6.0 - 3.0, uMouse.y * 3.0, 7.0);
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
