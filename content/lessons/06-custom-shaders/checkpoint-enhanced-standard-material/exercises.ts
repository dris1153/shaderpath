import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-enhanced-standard-material",
    kind: "build",
    prompt: {
      vi: `Nâng cấp một \`MeshStandardMaterial\` bằng \`onBeforeCompile\` thành hiệu ứng dissolve: một hàm noise 3D so sánh với ngưỡng \`uProgress\` để \`discard\` fragment (vật thể tan dần ngẫu nhiên, không phải cắt phẳng theo một trục), cộng thêm một dải viền phát sáng ngay tại ranh giới — điều khiển bằng uniform \`uEdgeColor\`, cộng vào \`totalEmissiveRadiance\` chứ không thay \`diffuseColor\`.

Yêu cầu bắt buộc: \`uProgress\` và \`uEdgeColor\` là object uniform tạo BÊN NGOÀI \`onBeforeCompile\`, mutate \`.value\` trực tiếp từ React — không tạo lại material mỗi lần progress đổi. Bóng đổ của vật thể (qua \`mesh.customDepthMaterial\`, một \`MeshDepthMaterial\` riêng) phải dissolve theo đúng cùng ngưỡng — dùng lại đúng hàm noise và đúng object \`uProgress\` (share bằng reference). Vì nội dung shader phụ thuộc vào \`noiseScale\` được bake thẳng vào chuỗi GLSL (không phải uniform), cả material chính lẫn \`depthMaterial\` đều cần \`customProgramCacheKey\` để Three không tái dùng nhầm program đã compile cho một \`noiseScale\` khác.

Gợi ý cấu trúc: một hàm \`createDissolveMaterial({ color, noiseScale })\` trả về \`{ material, depthMaterial, uniforms }\` — component chỉ cần mutate \`uniforms.uProgress.value\` mỗi khi progress đổi và gán \`depthMaterial\` vào \`customDepthMaterial\` của mesh.`,
      en: `Upgrade a \`MeshStandardMaterial\` via \`onBeforeCompile\` into a dissolve effect: a 3D noise function compared against a \`uProgress\` threshold to \`discard\` fragments (the object dissolves through random noise, not a flat cut along one axis), plus a glowing edge band right at the boundary — controlled by a \`uEdgeColor\` uniform, added onto \`totalEmissiveRadiance\`, not replacing \`diffuseColor\`.

Hard requirements: \`uProgress\` and \`uEdgeColor\` are uniform objects created OUTSIDE \`onBeforeCompile\`, mutated through \`.value\` directly from React — never recreate the material every time progress changes. The object's shadow (via \`mesh.customDepthMaterial\`, a separate \`MeshDepthMaterial\`) must dissolve at the exact same threshold — reusing the same noise function and the same \`uProgress\` object (shared by reference). Because the shader's content depends on \`noiseScale\` baked straight into the GLSL string (not a uniform), both the main material and \`depthMaterial\` need \`customProgramCacheKey\` so Three doesn't mistakenly reuse a program compiled for a different \`noiseScale\`.

Suggested structure: a \`createDissolveMaterial({ color, noiseScale })\` function returning \`{ material, depthMaterial, uniforms }\` — the component just mutates \`uniforms.uProgress.value\` whenever progress changes and assigns \`depthMaterial\` to the mesh's \`customDepthMaterial\`.`,
    },
    starterCode: `"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

// Shared GLSL injected into BOTH the visible material and its shadow-casting
// depth material -- one string means the two can never drift out of sync.
// noiseScale is baked directly into the source (not a uniform) on purpose --
// see TODO 4 below for why that matters.
function dissolveChunk(noiseScale: number) {
  return \`
    varying vec3 vDissolvePos;

    float dissolveHash(vec3 p) {
      p = fract(p * vec3(443.897, 441.423, 437.195));
      p += dot(p, p.yzx + 19.19);
      return fract((p.x + p.y) * p.z);
    }

    float dissolveNoise(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(
          mix(dissolveHash(i + vec3(0.0, 0.0, 0.0)), dissolveHash(i + vec3(1.0, 0.0, 0.0)), f.x),
          mix(dissolveHash(i + vec3(0.0, 1.0, 0.0)), dissolveHash(i + vec3(1.0, 1.0, 0.0)), f.x),
          f.y
        ),
        mix(
          mix(dissolveHash(i + vec3(0.0, 0.0, 1.0)), dissolveHash(i + vec3(1.0, 0.0, 1.0)), f.x),
          mix(dissolveHash(i + vec3(0.0, 1.0, 1.0)), dissolveHash(i + vec3(1.0, 1.0, 1.0)), f.x),
          f.y
        ),
        f.z
      );
    }

    float dissolveSample(vec3 p) {
      return dissolveNoise(p * \${noiseScale.toFixed(2)});
    }
  \`;
}

function createDissolveMaterial({
  color,
  noiseScale = 3,
}: {
  color: THREE.ColorRepresentation;
  noiseScale?: number;
}) {
  // TODO 2: dissolveUniforms = { uProgress: { value: 0 }, uEdgeColor: { value: new THREE.Color(...) } }
  // Created ONCE here, mutated from outside later -- never recreated per frame.

  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.5 });
  material.onBeforeCompile = (shader) => {
    // TODO 2: shader.uniforms.uProgress = dissolveUniforms.uProgress (same
    // reference, not a copy); same for uEdgeColor.

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\\nvarying vec3 vDissolvePos;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\\n  vDissolvePos = position;");

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <common>",
      \`#include <common>
      uniform float uProgress;
      uniform vec3 uEdgeColor;
      \${dissolveChunk(noiseScale)}
      float dissolveEdge = 0.0;\`,
    );

    // TODO 1: shader.fragmentShader = shader.fragmentShader.replace(
    //   "#include <alphatest_fragment>",
    //   ... discard when dissolveSample(vDissolvePos) < uProgress,
    //       set dissolveEdge via smoothstep near the threshold ...
    // );

    // TODO 1: shader.fragmentShader = shader.fragmentShader.replace(
    //   "#include <emissivemap_fragment>",
    //   ... totalEmissiveRadiance += uEdgeColor * dissolveEdge ...
    // );
  };

  // TODO 4: material.customProgramCacheKey = () => \`dissolve-\${noiseScale}\`;

  // TODO 3: build a MeshDepthMaterial (depthPacking: THREE.BasicDepthPacking)
  // with its own onBeforeCompile -- same vDissolvePos plumbing, same
  // dissolveChunk(noiseScale), same discard test, SAME dissolveUniforms.uProgress
  // reference, and its own customProgramCacheKey.

  return { material /*, depthMaterial, uniforms: dissolveUniforms */ };
}

export function DissolvingMesh({ progress }: { progress: number }) {
  const { material } = useMemo(
    () => createDissolveMaterial({ color: "#3b82f6", noiseScale: 3 }),
    [],
  );

  useEffect(() => {
    // TODO 2: uniforms.uProgress.value = progress;
  }, [progress]);

  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh castShadow receiveShadow /* TODO 3: customDepthMaterial={depthMaterial} */>
      <torusKnotGeometry args={[0.7, 0.24, 128, 24]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}`,
    solutionCode: `"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

// Shared GLSL injected into BOTH the visible material and its shadow-casting
// depth material -- one string means the two can never drift out of sync.
// noiseScale is baked directly into the source (not a uniform): that's
// exactly why both materials below need customProgramCacheKey.
function dissolveChunk(noiseScale: number) {
  return \`
    varying vec3 vDissolvePos;

    float dissolveHash(vec3 p) {
      p = fract(p * vec3(443.897, 441.423, 437.195));
      p += dot(p, p.yzx + 19.19);
      return fract((p.x + p.y) * p.z);
    }

    float dissolveNoise(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(
          mix(dissolveHash(i + vec3(0.0, 0.0, 0.0)), dissolveHash(i + vec3(1.0, 0.0, 0.0)), f.x),
          mix(dissolveHash(i + vec3(0.0, 1.0, 0.0)), dissolveHash(i + vec3(1.0, 1.0, 0.0)), f.x),
          f.y
        ),
        mix(
          mix(dissolveHash(i + vec3(0.0, 0.0, 1.0)), dissolveHash(i + vec3(1.0, 0.0, 1.0)), f.x),
          mix(dissolveHash(i + vec3(0.0, 1.0, 1.0)), dissolveHash(i + vec3(1.0, 1.0, 1.0)), f.x),
          f.y
        ),
        f.z
      );
    }

    float dissolveSample(vec3 p) {
      return dissolveNoise(p * \${noiseScale.toFixed(2)});
    }
  \`;
}

function createDissolveMaterial({
  color,
  noiseScale = 3,
}: {
  color: THREE.ColorRepresentation;
  noiseScale?: number;
}) {
  // External uniform handle pattern: created once, mutated from outside via
  // .value -- both materials below hold the SAME references, so one write
  // updates the mesh and its shadow together.
  const dissolveUniforms = {
    uProgress: { value: 0 },
    uEdgeColor: { value: new THREE.Color("#ff8a00") },
  };

  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.5 });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uProgress = dissolveUniforms.uProgress;
    shader.uniforms.uEdgeColor = dissolveUniforms.uEdgeColor;

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\\nvarying vec3 vDissolvePos;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\\n  vDissolvePos = position;");

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        \`#include <common>
        uniform float uProgress;
        uniform vec3 uEdgeColor;
        \${dissolveChunk(noiseScale)}
        float dissolveEdge = 0.0;\`,
      )
      .replace(
        "#include <alphatest_fragment>",
        \`#include <alphatest_fragment>
        float dissolveN = dissolveSample(vDissolvePos);
        if (dissolveN < uProgress) discard;
        dissolveEdge = 1.0 - smoothstep(uProgress, uProgress + 0.08, dissolveN);\`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        \`#include <emissivemap_fragment>
        totalEmissiveRadiance += uEdgeColor * dissolveEdge;\`,
      );
  };

  // The compiled GLSL differs per noiseScale (it's baked into the string,
  // not a uniform) -- without this, Three's program cache could reuse a
  // program compiled for a different noiseScale and silently keep it.
  material.customProgramCacheKey = () => \`dissolve-\${noiseScale}\`;

  // Shadow parity: the depth pass runs a completely separate shader and does
  // NOT inherit the material's onBeforeCompile -- without a matching cut
  // here, the mesh dissolves but its shadow stays solid.
  const depthMaterial = new THREE.MeshDepthMaterial({
    depthPacking: THREE.BasicDepthPacking,
  });
  depthMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uProgress = dissolveUniforms.uProgress; // same reference

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\\nvarying vec3 vDissolvePos;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\\n  vDissolvePos = position;");

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        \`#include <common>
        uniform float uProgress;
        \${dissolveChunk(noiseScale)}\`,
      )
      .replace(
        "#include <alphatest_fragment>",
        \`#include <alphatest_fragment>
        if (dissolveSample(vDissolvePos) < uProgress) discard;\`,
      );
  };
  depthMaterial.customProgramCacheKey = () => \`dissolve-depth-\${noiseScale}\`;

  return { material, depthMaterial, uniforms: dissolveUniforms };
}

export function DissolvingMesh({ progress }: { progress: number }) {
  const { material, depthMaterial, uniforms } = useMemo(
    () => createDissolveMaterial({ color: "#3b82f6", noiseScale: 3 }),
    [],
  );

  useEffect(() => {
    uniforms.uProgress.value = progress;
  }, [progress, uniforms]);

  useEffect(
    () => () => {
      material.dispose();
      depthMaterial.dispose();
    },
    [material, depthMaterial],
  );

  return (
    <mesh castShadow receiveShadow customDepthMaterial={depthMaterial}>
      <torusKnotGeometry args={[0.7, 0.24, 128, 24]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}`,
    hints: [
      {
        vi: `Alpha/discard chèn vào ngay sau \`#include <alphatest_fragment>\` (chỗ Three vốn đã test alpha) — nối thêm phép so sánh noise, đừng thay thế chunk gốc. Emissive chèn ngay sau \`#include <emissivemap_fragment>\`, cộng dồn (\`+=\`) vào \`totalEmissiveRadiance\` đã có sẵn, đừng gán đè nó.`,
        en: `Alpha/discard goes right after \`#include <alphatest_fragment>\` (where Three already tests alpha) -- append the noise comparison, don't replace the original chunk. Emissive goes right after \`#include <emissivemap_fragment>\`, adding (\`+=\`) onto the existing \`totalEmissiveRadiance\`, never overwriting it.`,
      },
      {
        vi: `\`uProgress\` và \`uEdgeColor\` phải là object bên ngoài (\`{ value: ... }\`) được GÁN — không copy — vào \`shader.uniforms\` trong \`onBeforeCompile\`. Mutate \`.value\` của chính object đó ở ngoài (một \`useEffect\`) thì cả material chính lẫn \`customDepthMaterial\` đọc thấy giá trị mới ngay, không cần set lại gì thêm.`,
        en: `\`uProgress\` and \`uEdgeColor\` must be outside objects (\`{ value: ... }\`) ASSIGNED -- not copied -- into \`shader.uniforms\` inside \`onBeforeCompile\`. Mutate that same object's \`.value\` from outside (a \`useEffect\`) and both the main material and \`customDepthMaterial\` see the new value immediately, nothing else to update.`,
      },
      {
        vi: `Bóng đổ chạy shader RIÊNG (\`MeshDepthMaterial\`), không tự động thừa hưởng \`onBeforeCompile\` của material chính. Gán \`mesh.customDepthMaterial\` = một \`MeshDepthMaterial\` có \`onBeforeCompile\` CÙNG hàm noise và CÙNG object \`uProgress\` -- thiếu bước này, vật thể tan dần nhưng bóng của nó vẫn đặc nguyên.`,
        en: `The shadow pass runs a SEPARATE shader (\`MeshDepthMaterial\`) and does not automatically inherit the main material's \`onBeforeCompile\`. Set \`mesh.customDepthMaterial\` to a \`MeshDepthMaterial\` whose \`onBeforeCompile\` uses the SAME noise function and the SAME \`uProgress\` object -- skip this and the object dissolves while its shadow stays perfectly solid.`,
      },
    ],
    checklist: [
      {
        vi: "Lighting vẫn đúng như MeshStandardMaterial gốc (roughness/metalness/ánh sáng phản chiếu bình thường) ở phần chưa dissolve",
        en: "Lighting still matches the original MeshStandardMaterial (roughness/metalness/lit response behave normally) on the part that hasn't dissolved yet",
      },
      {
        vi: "Có một dải viền phát sáng (emissive) rõ ràng ngay tại ranh giới giữa phần còn và phần đã dissolve",
        en: "A clearly visible glowing (emissive) edge band sits right at the boundary between the remaining and the dissolved parts",
      },
      {
        vi: "Bóng đổ trên mặt sàn dissolve cùng lúc và cùng hình dạng với vật thể -- không phải bóng đặc nguyên trong khi vật thể đã tan",
        en: "The shadow on the floor dissolves in lockstep and matches the shape of the object -- not a solid shadow while the object has already dissolved away",
      },
      {
        vi: "uProgress = 0 hiển thị vật thể nguyên vẹn, không noise lấm tấm; uProgress = 1 vật thể biến mất hoàn toàn, không còn mảnh vụn sót lại",
        en: "uProgress = 0 shows the object fully intact with no stray noise specks; uProgress = 1 makes the object disappear completely, no leftover fragments",
      },
      {
        vi: "material.customProgramCacheKey và depthMaterial.customProgramCacheKey đều được set, phản ánh đúng tham số ảnh hưởng tới nội dung shader (noiseScale)",
        en: "Both material.customProgramCacheKey and depthMaterial.customProgramCacheKey are set, reflecting the parameter that actually changes the shader's content (noiseScale)",
      },
      {
        vi: "onBeforeCompile không mutate THREE.ShaderChunk toàn cục ở bất cứ đâu -- chỉ sửa chuỗi shader.vertexShader/fragmentShader cục bộ của từng material",
        en: "onBeforeCompile never mutates THREE.ShaderChunk globally anywhere -- it only edits each material's own local shader.vertexShader/fragmentShader strings",
      },
      {
        vi: "uProgress và uEdgeColor mutate qua .value trên object dùng chung -- material và onBeforeCompile không bị tạo lại mỗi lần progress đổi",
        en: "uProgress and uEdgeColor are mutated through .value on a shared object -- the material and its onBeforeCompile are never recreated when progress changes",
      },
    ],
  },
];
