import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "scroll-vs-slice-trajectory",
    kind: "concept",
    prompt: {
      vi: `Chế độ scroll lấy mẫu $\\text{noise}_2(p + t \\cdot \\mathbf{d})$ với $\\mathbf{d}$ là hướng cố định; chế độ slice lấy mẫu $\\text{noise}_3(p_x, p_y, t)$. Không chạy demo, hãy giải thích: tại một điểm pixel $p$ cố định, khi $t$ tăng dần, quỹ đạo toạ độ đưa vào hàm noise của scroll là một đường gì trong không gian sample (2D), còn của slice là một đường gì trong không gian sample (3D)?

Từ hai quỹ đạo đó, suy ra vì sao một "đốm" (blob) noise cụ thể dưới scroll không bao giờ đổi hình dạng, còn dưới slice thì có thể mọc lên, co lại, hoặc tách làm đôi.`,
      en: `Scroll mode samples $\\text{noise}_2(p + t \\cdot \\mathbf{d})$ with a fixed direction $\\mathbf{d}$; slice mode samples $\\text{noise}_3(p_x, p_y, t)$. Without running the demo, explain: at a fixed pixel $p$, as $t$ increases, what shape is the trajectory of coordinates fed into the noise function for scroll (in its 2D sample space), and what shape is it for slice (in its 3D sample space)?

From those two trajectories, explain why a specific noise "blob" never changes shape under scroll, but can grow, shrink, or split in two under slice.`,
    },
    hints: [
      {
        vi: "Với scroll, $p$ cố định nên toạ độ sample là $p + t\\mathbf{d}$ — đó là một đường thẳng trong mặt phẳng 2D, hướng $\\mathbf{d}$, không bao giờ đổi hướng.",
        en: "For scroll, $p$ is fixed so the sample coordinate is $p + t\\mathbf{d}$ — that is a straight line in the 2D plane, direction $\\mathbf{d}$, which never changes direction.",
      },
      {
        vi: "Với slice, hai thành phần đầu của toạ độ 3D không đổi ($p_x, p_y$ cố định), chỉ có $t$ (thành phần thứ ba) tăng — đó là một đường thẳng SONG SONG VỚI TRỤC THỨ BA, xuyên thẳng qua khối noise 3D theo chiều sâu.",
        en: "For slice, the first two components of the 3D coordinate never change ($p_x, p_y$ fixed), only $t$ (the third component) increases — that is a straight line PARALLEL TO THE THIRD AXIS, piercing straight through the 3D noise volume in depth.",
      },
    ],
    checklist: [
      {
        vi: "Tôi mô tả đúng quỹ đạo scroll là đường thẳng nằm NGANG trong chính mặt phẳng noise 2D (cùng mặt phẳng luôn được vẽ ra màn hình)",
        en: "I correctly describe the scroll trajectory as a straight line lying WITHIN the same 2D noise plane that gets drawn on screen",
      },
      {
        vi: "Tôi mô tả đúng quỹ đạo slice là đường thẳng đi theo trục $t$, XUYÊN QUA các lát cắt khác nhau của khối 3D — không nằm trong mặt phẳng nào được vẽ ra cả",
        en: "I correctly describe the slice trajectory as a line running along the $t$ axis, CUTTING THROUGH different slabs of the 3D volume — not confined to any single plane that gets drawn",
      },
      {
        vi: "Tôi giải thích được: scroll dịch chuyển TOÀN BỘ trường noise cứng nhắc (mọi pixel cộng cùng một vector) nên hình dạng tương đối giữa các đốm không đổi; slice cho MỖI $t$ một hàm noise 2D khác hẳn (khác lát cắt) nên hình dạng đốm không có lý do gì để giữ nguyên",
        en: "I explain that scroll rigidly translates the ENTIRE noise field (every pixel adds the same vector) so relative shapes between blobs stay fixed; slice gives a DIFFERENT 2D noise function per $t$ (a different slab), so there is no reason for a blob's shape to stay the same",
      },
    ],
    solutionNote: {
      vi: `Scroll: quỹ đạo trong không gian sample 2D là một đường thẳng hướng $\\mathbf{d}$, đi qua chính điểm $(p_x, p_y)$ mà ta luôn nhìn vào. Vì cả trường bị cộng cùng một vector $t\\mathbf{d}$ tại mọi pixel, khoảng cách và hướng tương đối giữa hai đốm bất kỳ được bảo toàn tuyệt đối, nên chúng trượt như một khối cứng — không đốm nào đổi hình dạng.

Slice: quỹ đạo trong không gian sample 3D là một đường thẳng song song trục thứ ba ($t$), đi qua đúng một điểm $(p_x, p_y)$ cố định. Mỗi $t$ khác nhau tương ứng một hàm noise 2D hoàn toàn khác (một lát cắt khác của khối 3D) — không có phép "trượt cứng" nào liên kết hai lát cắt liền kề, nên các đốm được tự do lớn lên, teo lại, hoặc tách đôi khi $t$ trôi qua.`,
      en: `Scroll: the trajectory in 2D sample space is a straight line in direction $\\mathbf{d}$, passing through the very point $(p_x, p_y)$ we're always looking at. Since the entire field gets the same vector $t\\mathbf{d}$ added at every pixel, the relative distance and direction between any two blobs is preserved exactly, so they slide like a rigid body — no blob ever changes shape.

Slice: the trajectory in 3D sample space is a straight line parallel to the third axis ($t$), passing through one fixed point $(p_x, p_y)$. Each different $t$ corresponds to a completely different 2D noise function (a different slab of the 3D volume) — there's no "rigid slide" linking adjacent slabs, so blobs are free to grow, shrink, or split as $t$ drifts.`,
    },
  },
  {
    id: "perfect-loop-playground",
    kind: "shader",
    prompt: {
      vi: `Trong playground (uTime, uResolution, uMouse, fragColor có sẵn), viết một fragment shader tạo vòng lặp **hoàn hảo** bằng cách sample noise 4D trên một đường tròn: hai chiều đầu là toạ độ màn hình $p$, hai chiều sau là $(R\\cos\\omega t,\\ R\\sin\\omega t)$ với $\\omega = 2\\pi / T$, $T$ là chu kỳ loop tự chọn (khoảng 4-8 giây). Không cần cài \`noise4\` từ đầu — hàm hash/noise 2D, 3D, 4D đã có sẵn trong starter code, chỉ cần hoàn thiện phần lấy mẫu theo đường tròn.`,
      en: `In the playground (uTime, uResolution, uMouse, fragColor are all available), write a fragment shader that produces a **perfect loop** by sampling 4D noise on a circle: the first two dimensions are the screen coordinate $p$, the last two are $(R\\cos\\omega t,\\ R\\sin\\omega t)$ with $\\omega = 2\\pi / T$, $T$ a loop period you choose (roughly 4-8 seconds). You don't need to write \`noise4\` from scratch — the hash/noise 2D/3D/4D helpers are already in the starter code; just finish the circular sampling.`,
    },
    starterCode: `float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float hash(vec4 p) { return fract(sin(dot(p, vec4(12.9898, 78.233, 37.719, 19.213))) * 43758.5453); }

float noise4(vec4 p) {
  vec4 i = floor(p);
  vec4 f = fract(p);
  vec4 u = f * f * (3.0 - 2.0 * f);
  float c0000 = hash(i + vec4(0.0,0.0,0.0,0.0));
  float c1000 = hash(i + vec4(1.0,0.0,0.0,0.0));
  float c0100 = hash(i + vec4(0.0,1.0,0.0,0.0));
  float c1100 = hash(i + vec4(1.0,1.0,0.0,0.0));
  float c0010 = hash(i + vec4(0.0,0.0,1.0,0.0));
  float c1010 = hash(i + vec4(1.0,0.0,1.0,0.0));
  float c0110 = hash(i + vec4(0.0,1.0,1.0,0.0));
  float c1110 = hash(i + vec4(1.0,1.0,1.0,0.0));
  float c0001 = hash(i + vec4(0.0,0.0,0.0,1.0));
  float c1001 = hash(i + vec4(1.0,0.0,0.0,1.0));
  float c0101 = hash(i + vec4(0.0,1.0,0.0,1.0));
  float c1101 = hash(i + vec4(1.0,1.0,0.0,1.0));
  float c0011 = hash(i + vec4(0.0,0.0,1.0,1.0));
  float c1011 = hash(i + vec4(1.0,0.0,1.0,1.0));
  float c0111 = hash(i + vec4(0.0,1.0,1.0,1.0));
  float c1111 = hash(i + vec4(1.0,1.0,1.0,1.0));
  float x00_0 = mix(c0000, c1000, u.x); float x10_0 = mix(c0100, c1100, u.x);
  float x01_0 = mix(c0010, c1010, u.x); float x11_0 = mix(c0110, c1110, u.x);
  float y0_0 = mix(x00_0, x10_0, u.y); float y1_0 = mix(x01_0, x11_0, u.y);
  float z0 = mix(y0_0, y1_0, u.z);
  float x00_1 = mix(c0001, c1001, u.x); float x10_1 = mix(c0101, c1101, u.x);
  float x01_1 = mix(c0011, c1011, u.x); float x11_1 = mix(c0111, c1111, u.x);
  float y0_1 = mix(x00_1, x10_1, u.y); float y1_1 = mix(x01_1, x11_1, u.y);
  float z1 = mix(y0_1, y1_1, u.z);
  return mix(z0, z1, u.w);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = (uv - 0.5) * 4.0;

  // TODO 1: pick a loop period T (seconds) and turn it into angular speed
  float T = 6.0;
  float omega = 0.0;

  // TODO 2: sample noise4 on a circle of radius R in the extra 2 dims —
  // at t = 0 and t = T the extra dims must land on the exact same point
  float n = 0.0;

  vec3 color = mix(vec3(0.05, 0.08, 0.14), vec3(0.95, 0.7, 0.3), n);
  fragColor = vec4(color, 1.0);
}`,
    solutionCode: `float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float hash(vec4 p) { return fract(sin(dot(p, vec4(12.9898, 78.233, 37.719, 19.213))) * 43758.5453); }

float noise4(vec4 p) {
  vec4 i = floor(p);
  vec4 f = fract(p);
  vec4 u = f * f * (3.0 - 2.0 * f);
  float c0000 = hash(i + vec4(0.0,0.0,0.0,0.0));
  float c1000 = hash(i + vec4(1.0,0.0,0.0,0.0));
  float c0100 = hash(i + vec4(0.0,1.0,0.0,0.0));
  float c1100 = hash(i + vec4(1.0,1.0,0.0,0.0));
  float c0010 = hash(i + vec4(0.0,0.0,1.0,0.0));
  float c1010 = hash(i + vec4(1.0,0.0,1.0,0.0));
  float c0110 = hash(i + vec4(0.0,1.0,1.0,0.0));
  float c1110 = hash(i + vec4(1.0,1.0,1.0,0.0));
  float c0001 = hash(i + vec4(0.0,0.0,0.0,1.0));
  float c1001 = hash(i + vec4(1.0,0.0,0.0,1.0));
  float c0101 = hash(i + vec4(0.0,1.0,0.0,1.0));
  float c1101 = hash(i + vec4(1.0,1.0,0.0,1.0));
  float c0011 = hash(i + vec4(0.0,0.0,1.0,1.0));
  float c1011 = hash(i + vec4(1.0,0.0,1.0,1.0));
  float c0111 = hash(i + vec4(0.0,1.0,1.0,1.0));
  float c1111 = hash(i + vec4(1.0,1.0,1.0,1.0));
  float x00_0 = mix(c0000, c1000, u.x); float x10_0 = mix(c0100, c1100, u.x);
  float x01_0 = mix(c0010, c1010, u.x); float x11_0 = mix(c0110, c1110, u.x);
  float y0_0 = mix(x00_0, x10_0, u.y); float y1_0 = mix(x01_0, x11_0, u.y);
  float z0 = mix(y0_0, y1_0, u.z);
  float x00_1 = mix(c0001, c1001, u.x); float x10_1 = mix(c0101, c1101, u.x);
  float x01_1 = mix(c0011, c1011, u.x); float x11_1 = mix(c0111, c1111, u.x);
  float y0_1 = mix(x00_1, x10_1, u.y); float y1_1 = mix(x01_1, x11_1, u.y);
  float z1 = mix(y0_1, y1_1, u.z);
  return mix(z0, z1, u.w);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = (uv - 0.5) * 4.0;

  // A 6-second loop: after T seconds, omega * T = 2*pi exactly, so cos/sin
  // return to their t=0 values and the extra 2 dims retrace the same point.
  float T = 6.0;
  float omega = 6.28318530718 / T;

  float R = 1.0;
  vec2 circle = R * vec2(cos(omega * uTime), sin(omega * uTime));
  float n = noise4(vec4(p, circle));

  vec3 color = mix(vec3(0.05, 0.08, 0.14), vec3(0.95, 0.7, 0.3), n);
  fragColor = vec4(color, 1.0);
}`,
    hints: [
      {
        vi: "omega = 2*PI / T (radian trên giây). Sau đúng T giây, omega*t tăng thêm chính xác $2\\pi$, nên cos/sin quay lại đúng giá trị ban đầu — đó là lý do vòng lặp khép kín.",
        en: "omega = 2*PI / T (radians per second). After exactly T seconds, omega*t increases by exactly $2\\pi$, so cos/sin return to their starting values — that is why the loop closes seamlessly.",
      },
      {
        vi: "Bán kính R quyết định noise4 di chuyển bao xa trong 2 chiều phụ mỗi vòng — R quá nhỏ thì gần như không đổi (loop tĩnh), R quá lớn thì mỗi frame nhảy sang vùng noise không liên quan (rung giật). Thử R = 1.0 trước.",
        en: "Radius R controls how far noise4 travels in the extra 2 dims each loop — too small and it barely changes (a static-looking loop), too large and each frame jumps into unrelated noise territory (visible jitter). Try R = 1.0 first.",
      },
    ],
    checklist: [
      {
        vi: "Hoạ tiết biến đổi mượt theo thời gian, không đứng yên",
        en: "The pattern evolves smoothly over time, not frozen",
      },
      {
        vi: "Sau đúng T giây (chỉnh uTime hoặc chờ), khung hình trông giống hệt khung hình tại t=0 — vòng lặp không có bước nhảy",
        en: "After exactly T seconds (scrub uTime or wait), the frame looks identical to the t=0 frame — no jump at the seam",
      },
      {
        vi: "Bán kính R đủ lớn để thấy rõ chuyển động qua cả vòng lặp, nhưng không lớn tới mức hoạ tiết rung giật/nhiễu hạt giữa các frame liền kề",
        en: "Radius R is large enough that motion is clearly visible across the loop, but not so large that the pattern jitters/looks grainy between adjacent frames",
      },
    ],
  },
];
