import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "split-sum-lut-recombine",
    kind: "concept",
    prompt: {
      vi: `Ở bước tổ hợp cuối của split-sum, Three.js tính specular IBL bằng \`specularColor * fab.x + specularF90 * fab.y\`, trong đó \`fab\` đọc từ BRDF LUT theo \`(roughness, dotNV)\`.

Giả sử tại một điểm cụ thể LUT trả về \`fab = (0.9, 0.02)\`, \`specularF90 = 1\`, $F_0 = (1.0, 0.8, 0.35)$ (ước lượng F0 của vàng — xem bảng F0 kim loại trong tài liệu Filament ở phần Tham khảo) và mẫu prefiltered environment tại hướng phản xạ là $L = (2.0, 1.8, 1.5)$ (linear radiance).

Tính vector specular IBL cuối cùng bằng $L \\times (F_0 \\cdot \\text{fab.x} + \\text{specularF90} \\cdot \\text{fab.y})$ (nhân theo từng thành phần màu). Sau đó trả lời: số nào trong hai số của \`fab\` — scale (\`fab.x\`) hay bias (\`fab.y\`) — chịu trách nhiệm cho viền sáng trắng xuất hiện ở góc nhìn xiên trên một kim loại có màu như vàng, và vì sao số đó không phụ thuộc $F_0$?`,
      en: `In the final recombination step of split-sum, Three.js computes specular IBL as \`specularColor * fab.x + specularF90 * fab.y\`, where \`fab\` is read from the BRDF LUT by \`(roughness, dotNV)\`.

Say at one point the LUT returns \`fab = (0.9, 0.02)\`, \`specularF90 = 1\`, $F_0 = (1.0, 0.8, 0.35)$ (an estimate for gold's F0 — see the metal F0 table in the Filament docs under References) and the prefiltered environment sample along the reflection direction is $L = (2.0, 1.8, 1.5)$ (linear radiance).

Compute the final specular IBL vector as $L \\times (F_0 \\cdot \\text{fab.x} + \\text{specularF90} \\cdot \\text{fab.y})$ (component-wise per color channel). Then answer: which of the two numbers in \`fab\` — scale (\`fab.x\`) or bias (\`fab.y\`) — is responsible for the white rim that appears at grazing angles on a colored metal like gold, and why doesn't that number depend on $F_0$?`,
    },
    hints: [
      {
        vi: "Tính từng kênh màu riêng: nhân F0 với fab.x, cộng specularF90*fab.y, rồi mới nhân với L của đúng kênh đó — đừng cộng gộp ba kênh lại với nhau.",
        en: "Compute each color channel separately: multiply F0 by fab.x, add specularF90*fab.y, then multiply by L for that same channel — don't collapse the three channels together.",
      },
      {
        vi: "specularF90 mặc định là 1 (trắng) và không hề nhân với F0 — nó CỘNG THẲNG vào sau khi nhân với bias. Số hạng nào trong công thức mang màu (nhân trực tiếp với F0-vector), số hạng nào là một hằng số trắng cộng thêm?",
        en: "specularF90 defaults to 1 (white) and is never multiplied by F0 — it's ADDED directly after being scaled by bias. Which term in the formula carries color (multiplied directly by the F0 vector), and which is a flat white constant added on top?",
      },
    ],
    checklist: [
      {
        vi: "Tính đúng vector specular IBL ≈ (1.84, 1.33, 0.50) (sai số nhỏ do làm tròn được chấp nhận)",
        en: "Correctly computes the specular IBL vector ≈ (1.84, 1.33, 0.50) (small rounding error is fine)",
      },
      {
        vi: "Xác định đúng bias (fab.y) nhân với specularF90 (mặc định trắng =1) là số hạng gây viền sáng trắng ở góc xiên, KHÔNG phụ thuộc màu F0",
        en: "Correctly identifies bias (fab.y) multiplied by specularF90 (default white =1) as the term causing the white grazing-angle rim, INDEPENDENT of the F0 color",
      },
      {
        vi: "Giải thích được scale (fab.x) mới là số hạng mang màu, vì nó nhân trực tiếp với F0-vector",
        en: "Explains that scale (fab.x) is the term that carries color, since it multiplies directly against the F0 vector",
      },
    ],
    solutionCode: `// Theo channel (R, G, B):
// specularIBL = L * (F0 * fab.x + specularF90 * fab.y)
//
// R: 2.0 * (1.00 * 0.9 + 1 * 0.02) = 2.0 * 0.92  = 1.84
// G: 1.8 * (0.80 * 0.9 + 1 * 0.02) = 1.8 * 0.74  = 1.332
// B: 1.5 * (0.35 * 0.9 + 1 * 0.02) = 1.5 * 0.335 = 0.5025
//
// specularIBL ≈ (1.84, 1.33, 0.50)
//
// bias (fab.y) nhân với specularF90 — mặc định 1 (trắng) cho hầu hết vật
// liệu — CỘNG THẲNG vào kết quả, không nhân với F0. Ở góc nhìn xiên,
// dotNV -> 0 khiến bias tăng mạnh (đúng dự đoán Schlick: F(theta) -> 1 khi
// theta -> 90 độ), nên số hạng bias LẤN ÁT số hạng scale*F0 và kéo màu
// tổng hợp về gần trắng — đó chính là viền sáng trắng ở góc xiên, xuất
// hiện trên MỌI kim loại bất kể F0 màu gì, vì bias không hề nhân với F0.`,
  },
  {
    id: "build-environment-from-scene-or-texture",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`buildEnvironment\` nhận một \`WebGLRenderer\` và một nguồn — hoặc \`THREE.Scene\` (đi qua \`PMREMGenerator.fromScene\`) hoặc \`THREE.Texture\` equirect (đi qua \`PMREMGenerator.fromEquirectangular\`) — trả về \`{ texture, dispose }\`. \`dispose()\` phải giải phóng cả render target lẫn chính \`PMREMGenerator\`, không rò rỉ khi gọi lặp lại nhiều lần (ví dụ mỗi lần người dùng đổi environment qua control).`,
      en: `Write a \`buildEnvironment\` function taking a \`WebGLRenderer\` and a source — either a \`THREE.Scene\` (routed through \`PMREMGenerator.fromScene\`) or an equirect \`THREE.Texture\` (routed through \`PMREMGenerator.fromEquirectangular\`) — returning \`{ texture, dispose }\`. \`dispose()\` must free both the render target and the \`PMREMGenerator\` itself, with no leak across repeated calls (e.g. every time a user swaps environments through a control).`,
    },
    starterCode: `import * as THREE from "three";

interface BuiltEnvironment {
  texture: THREE.Texture;
  dispose: () => void;
}

function buildEnvironment(
  renderer: THREE.WebGLRenderer,
  source: THREE.Scene | THREE.Texture,
): BuiltEnvironment {
  const pmrem = new THREE.PMREMGenerator(renderer);

  // TODO: branch on \`source instanceof THREE.Scene\` — call pmrem.fromScene(source)
  // for a Scene, pmrem.fromEquirectangular(source) for a Texture. Both return the
  // same WebGLRenderTarget shape ({ texture, dispose() }).

  // TODO: return { texture, dispose } — dispose() must free BOTH the render
  // target returned above AND the PMREMGenerator instance itself.
  return { texture: new THREE.Texture(), dispose: () => {} };
}`,
    solutionCode: `import * as THREE from "three";

interface BuiltEnvironment {
  texture: THREE.Texture;
  dispose: () => void;
}

function buildEnvironment(
  renderer: THREE.WebGLRenderer,
  source: THREE.Scene | THREE.Texture,
): BuiltEnvironment {
  const pmrem = new THREE.PMREMGenerator(renderer);

  const renderTarget =
    source instanceof THREE.Scene
      ? pmrem.fromScene(source)
      : pmrem.fromEquirectangular(source);

  return {
    texture: renderTarget.texture,
    dispose: () => {
      renderTarget.dispose();
      pmrem.dispose();
    },
  };
}`,
    hints: [
      {
        vi: "\`source instanceof THREE.Scene\` phân biệt hai overload — cả \`fromScene\` lẫn \`fromEquirectangular\` đều trả về CÙNG một shape \`WebGLRenderTarget\` (có \`.texture\` và \`.dispose()\`), nên không cần xử lý khác nhau sau bước gọi.",
        en: "\`source instanceof THREE.Scene\` distinguishes the two overloads — both \`fromScene\` and \`fromEquirectangular\` return the SAME \`WebGLRenderTarget\` shape (\`.texture\` and \`.dispose()\`), so nothing downstream needs to differ after the call.",
      },
      {
        vi: "Cả render target LẪN chính PMREMGenerator đều giữ tài nguyên GPU — dispose CẢ HAI trong \`dispose()\` trả về, không chỉ mỗi render target.",
        en: "BOTH the render target AND the PMREMGenerator itself hold GPU resources — dispose BOTH inside the returned \`dispose()\`, not just the render target.",
      },
    ],
    checklist: [
      {
        vi: "\`buildEnvironment\` phân nhánh đúng giữa \`THREE.Scene\` và \`THREE.Texture\`, gọi đúng \`fromScene\`/\`fromEquirectangular\` tương ứng",
        en: "\`buildEnvironment\` correctly branches between \`THREE.Scene\` and \`THREE.Texture\`, calling the matching \`fromScene\`/\`fromEquirectangular\`",
      },
      {
        vi: "\`dispose()\` trả về giải phóng cả render target lẫn PMREMGenerator",
        en: "The returned \`dispose()\` frees both the render target and the PMREMGenerator",
      },
      {
        vi: "Hàm không tự ý dispose \`source\` truyền vào — vòng đời của scene/texture nguồn do caller quản lý",
        en: "The function never disposes the passed-in \`source\` itself — the source scene/texture's lifecycle stays owned by the caller",
      },
    ],
  },
];
