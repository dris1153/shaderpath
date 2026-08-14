import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "tsl-stripe-value",
    kind: "concept",
    prompt: {
      vi: `Công thức dải màu của bài này là $t = \\sin(u \\cdot f + \\tau) \\cdot 0.5 + 0.5$, sau đó $\\text{color} = \\text{mix}(c_1, c_2, t)$. Không chạy code, hãy tính $t$ tại $u = 0.25$, $f = 6$, $\\tau = 1.0$ (giây, truyền thẳng vào \`sin\` như trong \`TSL_SOURCE\` của demo).

Sau đó trả lời: nếu đúng node graph này chạy trên hai trình duyệt — một biên dịch ra WGSL (có WebGPU), một biên dịch ra GLSL (WebGPURenderer tự fallback) — giá trị $t$ và màu hiển thị tại đúng $u$, $f$, $\\tau$ này có khác nhau giữa hai trình duyệt không, và vì sao?`,
      en: `This lesson's color-band formula is $t = \\sin(u \\cdot f + \\tau) \\cdot 0.5 + 0.5$, then $\\text{color} = \\text{mix}(c_1, c_2, t)$. Without running any code, compute $t$ at $u = 0.25$, $f = 6$, $\\tau = 1.0$ (seconds, fed straight into \`sin\` exactly like the demo's \`TSL_SOURCE\`).

Then answer: if this exact node graph runs on two browsers — one compiling to WGSL (has WebGPU), one compiling to GLSL (WebGPURenderer auto-fallback) — does $t$, and the displayed color, differ between the two browsers at this same $u$, $f$, $\\tau$, and why?`,
    },
    hints: [
      {
        vi: "Thay số trực tiếp vào sin: đối số là $u \\cdot f + \\tau = 0.25 \\times 6 + 1.0 = 2.5$ (radian) — tính tay trước, dùng máy tính chỉ để kiểm lại.",
        en: "Substitute directly into sin: the argument is $u \\cdot f + \\tau = 0.25 \\times 6 + 1.0 = 2.5$ (radians) — work it out by hand first, use a calculator only to double-check.",
      },
      {
        vi: "TSL biên dịch MỘT node graph ra hai đích khác nhau, không phải hai thuật toán khác nhau — sin, mul, add trong WGSL và GLSL đều tuân theo cùng chuẩn số học IEEE 754 cho các phép toán này.",
        en: "TSL compiles ONE node graph to two different targets, not two different algorithms — sin, mul and add follow the same IEEE 754 arithmetic in both WGSL and GLSL.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng đối số của sin là 2.5 radian rồi suy ra t ≈ 0.80",
        en: "I correctly computed sin's argument as 2.5 radians and derived t ≈ 0.80",
      },
      {
        vi: "Tôi giải thích được t không đổi giữa hai backend vì cùng một node graph, chỉ khác ngôn ngữ đích được sinh ra",
        en: "I can explain that t stays the same across backends because it's the same node graph, only the generated target language differs",
      },
      {
        vi: "Tôi nêu được đây chính là ý nghĩa portability của TSL, không phải hai hiệu ứng trông giống nhau một cách tình cờ",
        en: "I can state that this IS what TSL's portability means, not two effects that merely happen to look alike",
      },
    ],
    solutionNote: {
      vi: `Đối số của sin là $0.25 \\times 6 + 1.0 = 2.5$ radian, nên $t = \\sin(2.5) \\times 0.5 + 0.5 \\approx 0.5985 \\times 0.5 + 0.5 \\approx 0.7993$ — màu nghiêng hẳn về \`colorB\` (0xf59e0b, hổ phách).

$t$ không đổi giữa WGSL và GLSL: TSL biên dịch CÙNG một node graph ra hai ngôn ngữ đích, và \`sin\`/\`mul\`/\`add\` đều là số học IEEE 754 chuẩn ở cả hai. Đổi đầu vào thì $t$ đổi; đổi riêng backend thì không bao giờ đổi kết quả toán học.`,
      en: `The argument to sin is $0.25 \\times 6 + 1.0 = 2.5$ radians, so $t = \\sin(2.5) \\times 0.5 + 0.5 \\approx 0.5985 \\times 0.5 + 0.5 \\approx 0.7993$ — the colour leans heavily toward \`colorB\` (0xf59e0b, amber).

$t$ does not change between WGSL and GLSL: TSL compiles the SAME node graph to two target languages, and \`sin\`/\`mul\`/\`add\` are standard IEEE 754 arithmetic in both. A different input changes $t$; a different backend alone never changes the maths.`,
    },
  },
  {
    id: "tsl-vertex-wave",
    kind: "code",
    prompt: {
      vi: `Mở rộng material của demo: thêm \`positionNode\` để đỉnh mesh dao động lên xuống theo sóng sin dọc trục X, dùng \`positionLocal\`, một \`uniform\` biên độ \`uAmp\` và một \`uniform\` tần số \`uWaveFreq\`, cộng dồn độ lệch vào trục Y.

Dùng đúng cú pháp method-chaining của TSL (\`.add\`, \`.mul\`) như \`colorNode\` trong bài — không viết chuỗi GLSL thủ công, không dùng toán tử \`*\`/\`+\` của JavaScript trên các node.`,
      en: `Extend the demo's material: add a \`positionNode\` so the mesh's vertices oscillate up and down along a sine wave over X, using \`positionLocal\`, an amplitude \`uniform\` \`uAmp\` and a frequency \`uniform\` \`uWaveFreq\`, adding the offset onto Y.

Use TSL's method-chaining syntax (\`.add\`, \`.mul\`) exactly like this lesson's \`colorNode\` — no hand-written GLSL strings, no JavaScript \`*\`/\`+\` operators on the nodes themselves.`,
    },
    starterCode: `import { uniform, positionLocal, sin, time } from "three/tsl";
import { MeshBasicNodeMaterial } from "three/webgpu";

function buildWaveMaterial() {
  const uAmp = uniform(0.15);
  const uWaveFreq = uniform(4);
  const material = new MeshBasicNodeMaterial();

  // TODO: assign material.positionNode = positionLocal plus a vec3
  // offset along Y = sin(positionLocal.x * uWaveFreq + time) * uAmp

  return material;
}`,
    solutionCode: `import { uniform, positionLocal, sin, time, vec3 } from "three/tsl";
import { MeshBasicNodeMaterial } from "three/webgpu";

function buildWaveMaterial() {
  const uAmp = uniform(0.15);
  const uWaveFreq = uniform(4);
  const material = new MeshBasicNodeMaterial();

  material.positionNode = positionLocal.add(
    vec3(0, sin(positionLocal.x.mul(uWaveFreq).add(time)).mul(uAmp), 0),
  );

  return material;
}`,
    hints: [
      {
        vi: "positionLocal là node vec3 — độ lệch cộng thêm cũng phải là vec3 (bọc trong vec3(0, dY, 0)), không thể add thẳng một node float vào một node vec3.",
        en: "positionLocal is a vec3 node — the offset you add must also be a vec3 (wrap it as vec3(0, dY, 0)); you can't add a float node straight onto a vec3 node.",
      },
      {
        vi: "Chaining giống hệt colorNode trong bài: positionLocal.x lấy ra node float qua swizzle, rồi .mul() và .add() nối tiếp như gọi hàm, không phải toán tử * hay + của JavaScript.",
        en: "Chaining works exactly like this lesson's colorNode: positionLocal.x pulls out a float node via swizzle, then .mul() and .add() chain like function calls, not JavaScript's * or + operators.",
      },
    ],
    checklist: [
      {
        vi: "material.positionNode được gán bằng positionLocal cộng thêm một vec3 lệch theo trục Y",
        en: "material.positionNode is assigned positionLocal plus a vec3 offset along Y",
      },
      {
        vi: "Độ lệch Y dùng đúng sin(positionLocal.x nhân uWaveFreq cộng time) nhân uAmp, không hard-code số",
        en: "The Y offset correctly uses sin(positionLocal.x times uWaveFreq plus time) times uAmp, no hard-coded numbers",
      },
      {
        vi: "uAmp và uWaveFreq là uniform() có thể mutate .value sau này, không phải hằng số JavaScript thường",
        en: "uAmp and uWaveFreq are uniform() nodes whose .value can be mutated later, not plain JavaScript constants",
      },
    ],
  },
];
