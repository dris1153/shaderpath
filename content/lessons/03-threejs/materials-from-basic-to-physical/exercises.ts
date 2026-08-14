import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "metalness-roughness-arithmetic",
    kind: "concept",
    prompt: {
      vi: `Một \`MeshStandardMaterial\` có \`color\` (baseColor) $(0.8, 0.2, 0.2)$ và \`metalness = 0.7\`. Không chạy code, dùng công thức trong bài $\\text{diffuseColor} = \\text{baseColor} \\times (1 - \\text{metalness})$ và $F_0 = \\operatorname{mix}(0.04,\\ \\text{baseColor},\\ \\text{metalness})$ để tính \`diffuseColor\` và $F_0$.

Sau đó trả lời: vì sao vật liệu gần-kim loại này lại gần như không thấy màu diffuse dưới ánh sáng trắng, dù \`baseColor\` rõ ràng là màu đỏ đậm?`,
      en: `A \`MeshStandardMaterial\` has \`color\` (baseColor) $(0.8, 0.2, 0.2)$ and \`metalness = 0.7\`. Without running code, use this lesson's formulas $\\text{diffuseColor} = \\text{baseColor} \\times (1 - \\text{metalness})$ and $F_0 = \\operatorname{mix}(0.04,\\ \\text{baseColor},\\ \\text{metalness})$ to compute \`diffuseColor\` and $F_0$.

Then answer: why does this near-metal material show almost no visible diffuse color under white light, even though \`baseColor\` is clearly a strong red?`,
    },
    hints: [
      {
        vi: "diffuseColor chỉ là phép nhân từng thành phần: (0.8, 0.2, 0.2) * (1 - 0.7) = (0.8, 0.2, 0.2) * 0.3.",
        en: "diffuseColor is just component-wise multiplication: (0.8, 0.2, 0.2) * (1 - 0.7) = (0.8, 0.2, 0.2) * 0.3.",
      },
      {
        vi: "mix(0.04, baseColor, 0.7) = 0.04*(1-0.7) + baseColor*0.7 — tính từng kênh r/g/b riêng.",
        en: "mix(0.04, baseColor, 0.7) = 0.04*(1-0.7) + baseColor*0.7 — compute each r/g/b channel separately.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính được diffuseColor ≈ (0.24, 0.06, 0.06)",
        en: "I computed diffuseColor ≈ (0.24, 0.06, 0.06)",
      },
      {
        vi: "Tôi tính được F0 ≈ (0.572, 0.152, 0.152)",
        en: "I computed F0 ≈ (0.572, 0.152, 0.152)",
      },
      {
        vi: "Tôi giải thích được ở metalness cao, phần lớn năng lượng ánh sáng đi vào F0 (specular có màu) chứ không phải diffuseColor đã bị thu nhỏ",
        en: "I can explain that at high metalness, most light energy goes into F0 (colored specular) rather than the shrunken diffuseColor",
      },
    ],
    solutionNote: {
      vi: `diffuseColor = (0.8, 0.2, 0.2) × (1 − 0.7) = (0.8, 0.2, 0.2) × 0.3 ≈ (0.24, 0.06, 0.06).

F0 = mix(0.04, (0.8, 0.2, 0.2), 0.7) = 0.04 × 0.3 + (0.8, 0.2, 0.2) × 0.7 = 0.012 + (0.56, 0.14, 0.14) ≈ (0.572, 0.152, 0.152).

Ở metalness = 0.7, diffuseColor đã bị thu nhỏ còn 30% cường độ gốc, và phần "màu đỏ" chủ yếu chuyển sang F0 — tức là nó chỉ xuất hiện trong đốm specular (phản xạ gương, hẹp, phụ thuộc góc nhìn/ánh sáng), không còn tán xạ đều ra mọi hướng như diffuse thật. Nhìn từ góc không trúng highlight, vật liệu trông tối và gần như mất màu.`,
      en: `diffuseColor = (0.8, 0.2, 0.2) × (1 − 0.7) = (0.8, 0.2, 0.2) × 0.3 ≈ (0.24, 0.06, 0.06).

F0 = mix(0.04, (0.8, 0.2, 0.2), 0.7) = 0.04 × 0.3 + (0.8, 0.2, 0.2) × 0.7 = 0.012 + (0.56, 0.14, 0.14) ≈ (0.572, 0.152, 0.152).

At metalness = 0.7, diffuseColor has already shrunk to 30% of its original intensity, and most of the "red" shifts into F0 — meaning it only shows up in the specular highlight (a narrow, view/light-angle-dependent mirror-like reflection), no longer scattering evenly in every direction the way real diffuse does. Viewed from an angle that misses the highlight, the material looks dark and nearly colorless.`,
    },
  },
  {
    id: "material-ladder-factory",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`createLadderMaterial(kind, params)\` trả về đúng \`THREE.Material\` cho từng bậc thang (\`basic\`/\`lambert\`/\`phong\`/\`standard\`/\`physical\`). \`basic\`/\`lambert\`/\`phong\` chỉ nhận \`color\`; \`standard\`/\`physical\` nhận thêm \`metalness\`/\`roughness\`.`,
      en: `Write a \`createLadderMaterial(kind, params)\` function returning the correct \`THREE.Material\` for each ladder rung (\`basic\`/\`lambert\`/\`phong\`/\`standard\`/\`physical\`). \`basic\`/\`lambert\`/\`phong\` only take \`color\`; \`standard\`/\`physical\` additionally take \`metalness\`/\`roughness\`.`,
    },
    starterCode: `import * as THREE from "three";

type MaterialKind = "basic" | "lambert" | "phong" | "standard" | "physical";

interface LadderParams {
  color: number;
  metalness: number; // only standard/physical use this
  roughness: number; // only standard/physical use this
}

function createLadderMaterial(
  kind: MaterialKind,
  params: LadderParams,
): THREE.Material {
  // TODO: switch on kind, return the matching Mesh*Material.
  // Basic/Lambert/Phong only take { color } in their constructor — passing
  // metalness/roughness into them triggers a TypeScript excess-property error.
  throw new Error("not implemented");
}`,
    solutionCode: `function createLadderMaterial(
  kind: MaterialKind,
  params: LadderParams,
): THREE.Material {
  const { color, metalness, roughness } = params;
  switch (kind) {
    case "basic":
      return new THREE.MeshBasicMaterial({ color });
    case "lambert":
      return new THREE.MeshLambertMaterial({ color });
    case "phong":
      return new THREE.MeshPhongMaterial({ color, shininess: 60 });
    case "standard":
      return new THREE.MeshStandardMaterial({ color, metalness, roughness });
    case "physical":
      return new THREE.MeshPhysicalMaterial({
        color,
        metalness,
        roughness,
        clearcoat: 0.4,
      });
  }
}`,
    hints: [
      {
        vi: "MeshBasicMaterialParameters/MeshLambertMaterialParameters/MeshPhongMaterialParameters không có field metalness/roughness — object literal thừa property sẽ bị TS chặn ngay khi biên dịch, đó là tín hiệu tốt để bắt lỗi sớm.",
        en: "MeshBasicMaterialParameters/MeshLambertMaterialParameters/MeshPhongMaterialParameters have no metalness/roughness field — an object literal with those extra properties gets rejected by TS at compile time, which is a good early signal.",
      },
      {
        vi: "switch không cần default nếu liệt kê đủ 5 case của MaterialKind — TypeScript tự suy ra hàm luôn return, không rơi qua đáy.",
        en: "The switch doesn't need a default if all 5 MaterialKind cases are listed — TypeScript infers the function always returns and never falls through.",
      },
    ],
    checklist: [
      {
        vi: "Cả 5 case (basic/lambert/phong/standard/physical) đều trả về đúng class Material tương ứng",
        en: "All 5 cases (basic/lambert/phong/standard/physical) return the matching Material class",
      },
      {
        vi: "standard và physical nhận đủ metalness và roughness từ params",
        en: "standard and physical receive metalness and roughness from params",
      },
      {
        vi: "basic/lambert/phong không nhận metalness/roughness (không có property thừa trong object literal)",
        en: "basic/lambert/phong don't receive metalness/roughness (no excess properties in the object literal)",
      },
    ],
  },
];
