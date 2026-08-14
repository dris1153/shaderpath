import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "shared-material-two-light-counts",
    kind: "concept",
    prompt: {
      vi: `Bạn tạo đúng MỘT \`const mat = new THREE.MeshStandardMaterial({ color: "orange" })\`, rồi gán \`mat\` làm material cho \`meshA\` (đặt trong một scene có 2 point light) và \`meshB\` (đặt trong một scene KHÁC có 3 point light) — không đổi gì thêm trên \`mat\`.

Dự đoán: Three sẽ biên dịch bao nhiêu chương trình WebGL cho \`mat\` qua cả hai lần render — một hay hai? Giải thích bằng đúng cơ chế \`getProgramCacheKey\` (gợi ý: \`numPointLights\` có nằm trong danh sách tham số đẩy vào cache key hay không), và cho biết Three lưu (các) chương trình đã compile ở đâu bên trong chính object \`mat\`.`,
      en: `You create exactly ONE \`const mat = new THREE.MeshStandardMaterial({ color: "orange" })\`, then assign \`mat\` as the material for \`meshA\` (sitting in a scene with 2 point lights) and \`meshB\` (sitting in a DIFFERENT scene with 3 point lights) — nothing else about \`mat\` changes.

Predict: how many WebGL programs will Three compile for \`mat\` across both renders — one or two? Explain it using the actual \`getProgramCacheKey\` mechanism (hint: is \`numPointLights\` among the parameters folded into the cache key?), and state where Three stores the compiled program(s) inside \`mat\` itself.`,
    },
    hints: [
      {
        vi: "`getProgramCacheKeyParameters` đẩy `numDirLights`, `numPointLights`, `numSpotLights`... vào mảng dùng để tạo cache key — không chỉ defines riêng của material.",
        en: "`getProgramCacheKeyParameters` pushes `numDirLights`, `numPointLights`, `numSpotLights`, and more into the array used to build the cache key — not just the material's own defines.",
      },
      {
        vi: "`materialProperties.programs` là một `Map` bên trong `properties.get(material)` — một material có thể giữ NHIỀU chương trình đã compile cùng lúc, mỗi cái ứng với một cache key khác nhau.",
        en: "`materialProperties.programs` is a `Map` living inside `properties.get(material)` — a single material can hold MULTIPLE compiled programs at once, one per distinct cache key.",
      },
    ],
    checklist: [
      {
        vi: "Trả lời đúng: HAI chương trình, dù chỉ có một object material",
        en: "Correctly answers: TWO programs, despite there being only one material object",
      },
      {
        vi: "Chỉ đúng `numPointLights` là tham số khác nhau gây ra cache key khác nhau giữa hai lần render",
        en: "Correctly identifies `numPointLights` as the differing parameter that produces two different cache keys across the two renders",
      },
      {
        vi: "Nêu được cả hai chương trình được lưu trong cùng `materialProperties.programs` (Map) của `mat`, không cái nào ghi đè cái nào",
        en: "States that both programs are stored in the same `materialProperties.programs` (Map) belonging to `mat`, neither overwriting the other",
      },
    ],
    solutionNote: {
      vi: `Hai chương trình. \`getProgramCacheKey()\` gộp \`numPointLights\` (cùng các tham số trạng thái ánh sáng khác) vào cache key TRƯỚC KHI nối thêm \`material.customProgramCacheKey()\` — nên CÙNG một object \`mat\` tạo ra hai cache key khác nhau tuỳ vào scene/ngữ cảnh ánh sáng nó được vẽ trong đó. Three lưu cả hai \`WebGLProgram\` đã compile trong \`materialProperties.programs\`, một \`Map\` khoá theo cache key, nằm bên trong \`properties.get(mat)\` — không cái nào ghi đè cái nào; \`mat\` chỉ đơn giản tích luỹ thêm một chương trình cho mỗi ngữ cảnh khác nhau mà nó từng được vẽ.`,
      en: `Two programs. \`getProgramCacheKey()\` folds \`numPointLights\` (among other light-state parameters) into the key BEFORE appending \`material.customProgramCacheKey()\` — so the SAME \`mat\` object produces two different cache keys depending on which scene/light context it's drawn under. Three stores both compiled \`WebGLProgram\`s in \`materialProperties.programs\`, a \`Map\` keyed by cache key, living inside \`properties.get(mat)\` — neither compile overwrites the other; \`mat\` simply accumulates one program per distinct context it has ever been drawn in.`,
    },
  },
  {
    id: "count-worst-case-variants",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`countWorstCaseVariants(dims)\` nhận số lượng trạng thái của từng tính năng độc lập trong scene (ví dụ: \`map\` có 2 trạng thái bật/tắt, \`shadowType\` có 3 lựa chọn), trả về số chương trình WebGL khác nhau Three có thể phải compile trong trường hợp XẤU NHẤT — đúng phép nhân đã học trong bài (tổ hợp Descartes của mọi chiều tính năng).`,
      en: `Write a \`countWorstCaseVariants(dims)\` function taking the number of states each independent feature in a scene can have (e.g. \`map\` has 2 on/off states, \`shadowType\` has 3 options), returning the number of distinct WebGL programs Three could end up compiling in the WORST case — the exact multiplication this lesson teaches (the Cartesian product across every feature dimension).`,
    },
    starterCode: `interface FeatureDimensions {
  mapStates: number;        // e.g. 2 (on/off)
  fogStates: number;        // e.g. 2 (on/off)
  shadowTypeStates: number; // e.g. 3 (none/PCF/VSM)
  skinningStates: number;   // e.g. 2 (on/off)
}

function countWorstCaseVariants(dims: FeatureDimensions): number {
  // TODO: multiply every dimension's state count together — do NOT add them.
  return 0;
}

// countWorstCaseVariants({ mapStates: 2, fogStates: 2, shadowTypeStates: 3, skinningStates: 2 }) === 24`,
    solutionCode: `interface FeatureDimensions {
  mapStates: number;
  fogStates: number;
  shadowTypeStates: number;
  skinningStates: number;
}

function countWorstCaseVariants(dims: FeatureDimensions): number {
  return dims.mapStates * dims.fogStates * dims.shadowTypeStates * dims.skinningStates;
}`,
    hints: [
      {
        vi: "Mỗi chiều tính năng nhân vào tổng, giống hệt cách đếm tổ hợp trang phục (áo × quần × giày) — không cộng dồn.",
        en: "Each feature dimension multiplies into the total, exactly like counting outfit combinations (shirts × pants × shoes) — never add them.",
      },
      {
        vi: "Với bốn chiều mặc định trong ví dụ (2, 2, 3, 2), kết quả đúng là 24 — nếu ra một con số nhỏ hơn nhiều, khả năng cao bạn đang cộng thay vì nhân.",
        en: "With the example's four default dimensions (2, 2, 3, 2), the correct result is 24 — if you get something much smaller, you're probably adding instead of multiplying.",
      },
    ],
    checklist: [
      {
        vi: "`countWorstCaseVariants({ mapStates: 2, fogStates: 2, shadowTypeStates: 3, skinningStates: 2 })` trả về 24",
        en: "`countWorstCaseVariants({ mapStates: 2, fogStates: 2, shadowTypeStates: 3, skinningStates: 2 })` returns 24",
      },
      {
        vi: "Giải thích được rằng thêm MỘT tính năng bật/tắt nữa (skinningStates giữ nguyên, thêm chiều mới = 2) sẽ nhân đôi kết quả lên 48, không phải cộng thêm 2",
        en: "Can explain that adding just ONE more binary feature dimension doubles the result to 48, not adds 2 to it",
      },
    ],
  },
];
