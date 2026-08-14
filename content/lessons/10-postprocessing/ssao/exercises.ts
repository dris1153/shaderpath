import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "ssao-bias-acne",
    kind: "concept",
    prompt: {
      vi: `Một mặt sàn phẳng hoàn toàn (không góc lõm nào thật) đang bị SSAO tô một lớp xám mờ đều khắp bề mặt, dù lẽ ra phải sáng \`1.0\` (không occlusion) ở mọi điểm. Bạn nghi ngay \`minDistance\` đang đặt \`0\`.

Giải thích cơ chế chính xác: vì sao một mặt phẳng lý tưởng, không hình học nào khác gần đó, vẫn tự tính ra occlusion dương khi thiếu bias — liên hệ trực tiếp với hiện tượng shadow acne ở shadow mapping (Track 3) bằng đúng một câu.`,
      en: `A perfectly flat floor (no real concave corners) is getting coated in a uniform gray AO wash by SSAO, even though every point should read \`1.0\` (no occlusion). You immediately suspect \`minDistance\` is set to \`0\`.

Explain the precise mechanism: why does an ideal flat plane, with no other geometry nearby, still compute positive occlusion when the bias is missing — and connect it in exactly one sentence to shadow acne on shadow maps (Track 3).`,
    },
    hints: [
      {
        vi: "Kernel samples nằm RẤT gần điểm gốc (kernelRadius nhân với vector nhỏ). Khi chiếu lại một sample gần như trùng điểm gốc về screen-space, depth thật đọc được có thể lệch cực nhỏ so với depth kỳ vọng — chỉ vì sai số làm tròn của float, không phải hình học thật.",
        en: "Kernel samples land VERY close to the origin point (kernelRadius times a small vector). When a near-coincident sample projects back to screen space, the real depth read there can differ from the expected depth by a tiny amount — purely float rounding error, not real geometry.",
      },
      {
        vi: "Điều kiện tính occlusion là `delta > minDistance && delta < maxDistance`. Với minDistance = 0, BẤT KỲ delta dương nào (kể cả 0.0000001 do làm tròn) cũng đủ đếm là bị che.",
        en: "The occlusion condition is `delta > minDistance && delta < maxDistance`. With minDistance = 0, ANY positive delta at all (even 0.0000001 from rounding) is enough to count as occluded.",
      },
    ],
    checklist: [
      {
        vi: "Giải thích được sai số float khiến sample gần điểm gốc đọc nhầm depth, không phải hình học thật gây occlusion",
        en: "Explained that float rounding error makes near-origin samples misread depth, not real geometry causing occlusion",
      },
      {
        vi: "Nêu đúng điều kiện `delta > minDistance` là nơi bug xảy ra khi minDistance = 0",
        en: "Correctly identified `delta > minDistance` as the exact condition that breaks when minDistance = 0",
      },
      {
        vi: "Liên hệ được với shadow acne: cùng bệnh (tự so sánh với chính điểm gốc, không phải mặt phẳng lý tưởng), khác chỗ xảy ra (kernel sample thay vì shadow ray)",
        en: "Connected it to shadow acne: same disease (comparing against the origin point itself, which isn't an ideal plane), different location (kernel sample instead of shadow ray)",
      },
    ],
  },
  {
    id: "implement-occlusion-ratio",
    kind: "code",
    prompt: {
      vi: `Cài đặt bằng TypeScript đúng vòng lặp mà \`SSAOShader\` chạy trên GPU cho mỗi pixel, chỉ khác là chạy trên CPU với một mảng mẫu cho sẵn thay vì lấy mẫu texture thật. Với mỗi mẫu, so sánh \`sampleDepth\` (kỳ vọng, dựng từ vị trí kernel) với \`realDepth\` (đọc được tại UV chiếu lại) — cộng occlusion nếu \`sampleDepth - realDepth\` nằm trong \`(minDistance, maxDistance)\`. Trả về \`1 - occlusion/N\` — đúng công thức AO cuối trong \`SSAOShader\`.`,
      en: `Implement in TypeScript the exact loop \`SSAOShader\` runs on the GPU per pixel, just running on the CPU over a pre-built sample array instead of real texture lookups. For each sample, compare \`sampleDepth\` (expected, from the kernel position) against \`realDepth\` (read back at the reprojected UV) — add to occlusion if \`sampleDepth - realDepth\` falls inside \`(minDistance, maxDistance)\`. Return \`1 - occlusion/N\` — the exact final AO formula in \`SSAOShader\`.`,
    },
    starterCode: `interface DepthSample {
  sampleDepth: number; // expected depth of the kernel sample point
  realDepth: number;   // depth actually stored at that projected UV
}

function computeAO(
  samples: DepthSample[],
  minDistance: number,
  maxDistance: number,
): number {
  // TODO: for each sample, delta = sampleDepth - realDepth
  // occluded if minDistance < delta < maxDistance
  // return 1 - (occluded count / samples.length)
  return 1;
}`,
    solutionCode: `interface DepthSample {
  sampleDepth: number;
  realDepth: number;
}

function computeAO(
  samples: DepthSample[],
  minDistance: number,
  maxDistance: number,
): number {
  let occlusion = 0;
  for (const { sampleDepth, realDepth } of samples) {
    const delta = sampleDepth - realDepth;
    if (delta > minDistance && delta < maxDistance) {
      occlusion += 1;
    }
  }
  return 1 - occlusion / samples.length;
}`,
    hints: [
      {
        vi: "delta dương nghĩa là điểm mẫu kỳ vọng NẰM SAU bề mặt thật đọc được — tức có vật gì đó chắn giữa camera và điểm mẫu, nên mới tính là che.",
        en: "A positive delta means the expected sample point sits BEHIND the surface actually stored — something blocks the view between camera and sample, so it counts as occluded.",
      },
      {
        vi: "Đừng quên điều kiện < maxDistance — thiếu nó, một occluder ở rất xa (delta rất lớn) vẫn bị tính, sai đúng như đọc trong lý thuyết về maxDistance.",
        en: "Don't drop the < maxDistance condition — without it, a very distant occluder (huge delta) still counts, exactly the bug the theory section describes for maxDistance.",
      },
    ],
    checklist: [
      {
        vi: "computeAO với tất cả delta = 0 (mặt phẳng lý tưởng, minDistance > 0) trả về đúng 1 (không occlusion)",
        en: "computeAO with all deltas = 0 (an ideal flat plane, minDistance > 0) returns exactly 1 (no occlusion)",
      },
      {
        vi: "computeAO đếm đúng số sample có delta nằm trong khoảng (minDistance, maxDistance), bỏ qua delta ngoài khoảng",
        en: "computeAO correctly counts only samples whose delta falls inside (minDistance, maxDistance), skipping deltas outside that range",
      },
      {
        vi: "Kết quả luôn nằm trong [0, 1]",
        en: "The result always stays within [0, 1]",
      },
    ],
  },
  {
    id: "ssao-vs-raymarch-ao",
    kind: "concept",
    prompt: {
      vi: `So sánh trực tiếp SSAO (bài này) với AO raymarch trong SDF (Track 8, \`calcAO\`): cả hai đều so sánh một khoảng cách kỳ vọng với một khoảng cách đọc được để suy ra occlusion. Nêu đúng: (1) nguồn dữ liệu khác nhau ở đâu, (2) một giới hạn mà SSAO có nhưng raymarch AO không có (chọn một trong ba artifact đã học), và (3) vì sao \`SSAOPass\` ở chế độ output mặc định không thể tách riêng nhân AO vào mỗi \`ambient\` như công thức \`ambient·AO + diffuse·shadow\` của bài raymarch.`,
      en: `Directly compare SSAO (this lesson) with raymarched SDF AO (Track 8's \`calcAO\`): both compare an expected distance against a measured one to derive occlusion. State precisely: (1) where their data sources differ, (2) one limitation SSAO has that raymarch AO does not (pick one of the three learned artifacts), and (3) why \`SSAOPass\` in its default output mode can't isolate multiplying AO into just \`ambient\` the way the raymarch lesson's \`ambient·AO + diffuse·shadow\` formula does.`,
    },
    hints: [
      {
        vi: "Raymarch gọi map() — một hàm có TOÀN BỘ cảnh mã hoá bên trong, march bao xa cũng được. SSAO chỉ có một depth texture đã render sẵn từ đúng góc camera hiện tại.",
        en: "Raymarching calls map() — a function encoding the ENTIRE scene, marchable as far as needed. SSAO only has one already-rendered depth texture from the current camera's exact viewpoint.",
      },
      {
        vi: "RenderPass chạy trước SSAOPass đã gộp ambient+diffuse+specular thành một màu RGB duy nhất — không còn kênh riêng nào để SSAOPass nhắm chỉ vào ambient nữa.",
        en: "RenderPass, which runs before SSAOPass, has already merged ambient+diffuse+specular into a single RGB color — there's no separate channel left for SSAOPass to target ambient alone.",
      },
    ],
    checklist: [
      {
        vi: "Nêu đúng nguồn dữ liệu: map() SDF (toàn cảnh) so với depth/normal buffer đã render (chỉ góc camera hiện tại)",
        en: "Correctly stated the data sources: the SDF's map() (whole scene) versus an already-rendered depth/normal buffer (current camera view only)",
      },
      {
        vi: "Chọn đúng một giới hạn hợp lệ: screen-edge falloff, occluder ngoài khung hình, hoặc halo silhouette",
        en: "Picked one valid limitation: screen-edge falloff, off-screen occluders, or silhouette halo",
      },
      {
        vi: "Giải thích được RenderPass đã làm phẳng ánh sáng thành một màu duy nhất trước khi SSAOPass chạy, nên không tách được ambient riêng",
        en: "Explained that RenderPass flattens lighting into a single color before SSAOPass runs, so ambient can't be isolated separately",
      },
    ],
  },
];
