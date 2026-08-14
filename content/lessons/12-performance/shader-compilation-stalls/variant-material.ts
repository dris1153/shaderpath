import * as THREE from "three";

// Deliberately pads compile time so the stall reads on the graph regardless
// of device speed — each variant's fragment source is a genuinely DIFFERENT
// string (literal constants baked in per index), not just a different cache
// key, mirroring how real #define permutations produce distinct GLSL.
const FILLER_OP_COUNT = 48;

function fillerGLSL(index: number): string {
  let lines = "  vec3 c = diffuseColor.rgb;\n";
  for (let i = 0; i < FILLER_OP_COUNT; i++) {
    const a = ((index * 37 + i * 13) % 97) / 97;
    const freq = (i % 12) + 1;
    lines += `  c = mix(c, vec3(${a.toFixed(4)}, ${(1 - a).toFixed(4)}, ${(a * 0.5).toFixed(4)}), abs(sin(c.r * ${freq.toFixed(1)} + ${a.toFixed(3)})));\n`;
  }
  lines += "  diffuseColor.rgb = c;\n";
  return lines;
}

/**
 * A MeshBasicMaterial whose compiled program is unique per `index` — real
 * distinct fragment source forces a genuine compile the first time each
 * index is ever drawn.
 */
export function createVariantMaterial(index: number): THREE.MeshBasicMaterial {
  const material = new THREE.MeshBasicMaterial({ color: "#ffffff" });

  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <color_fragment>",
      `#include <color_fragment>\n${fillerGLSL(index)}`,
    );
  };

  // Every variant's onBeforeCompile closure has the SAME source text (only
  // the closed-over `index` differs), so Three's default
  // customProgramCacheKey() (= this.onBeforeCompile.toString()) can't tell
  // them apart. Without this override every variant here would collapse
  // onto whichever one compiled first — Track 6's lesson, live.
  material.customProgramCacheKey = () => `stall-variant-${index}`;

  return material;
}
