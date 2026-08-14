import * as THREE from "three";

// No binary assets in this repo — every map below is generated on an
// off-DOM canvas at runtime, never attached to the DOM (spec: procedural
// textures only). Each function returns a fresh CanvasTexture the caller
// owns and must dispose.

// Cause #1 ("roughness too low + uniform"): a real surface's roughness
// drifts slightly point to point (fingerprints, wear, dust) — this bakes
// fine per-pixel grain plus a handful of soft smudge patches into the
// green channel, which is the ONE channel MeshStandardMaterial.roughnessMap
// reads (roughnessmap_fragment multiplies material.roughness by texture.g).
export function createRoughnessVariationTexture(size = 256): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#e6e6e6"; // ~0.9 base multiplier on top of material.roughness
  ctx.fillRect(0, 0, size, size);

  const grain = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < grain.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 36;
    grain.data[i] = (grain.data[i] ?? 0) + n;
    grain.data[i + 1] = (grain.data[i + 1] ?? 0) + n;
    grain.data[i + 2] = (grain.data[i + 2] ?? 0) + n;
  }
  ctx.putImageData(grain, 0, 0);

  for (let i = 0; i < 22; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = size * (0.08 + Math.random() * 0.12);
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    const darker = Math.random() > 0.5;
    gradient.addColorStop(0, darker ? "rgba(70,70,70,0.35)" : "rgba(255,255,255,0.25)");
    gradient.addColorStop(1, "rgba(128,128,128,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

// Cause #6 ("normal map wrong scale or missing"): builds a real normal map
// FROM a procedural height field via central-difference (the standard
// height->normal technique), not random RGB noise pretending to be normals.
export function createNormalMapTexture(size = 256): THREE.CanvasTexture {
  const heightCanvas = document.createElement("canvas");
  heightCanvas.width = size;
  heightCanvas.height = size;
  const hctx = heightCanvas.getContext("2d")!;
  hctx.fillStyle = "#808080";
  hctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 130; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 2 + Math.random() * 5;
    const gradient = hctx.createRadialGradient(x, y, 0, x, y, r);
    const bump = Math.random() > 0.5;
    gradient.addColorStop(0, bump ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)");
    gradient.addColorStop(1, "rgba(128,128,128,0)");
    hctx.fillStyle = gradient;
    hctx.beginPath();
    hctx.arc(x, y, r, 0, Math.PI * 2);
    hctx.fill();
  }
  const heightData = hctx.getImageData(0, 0, size, size).data;
  const heightAt = (x: number, y: number) => {
    const xi = (x + size) % size;
    const yi = (y + size) % size;
    return (heightData[(yi * size + xi) * 4] ?? 128) / 255;
  };

  const normalCanvas = document.createElement("canvas");
  normalCanvas.width = size;
  normalCanvas.height = size;
  const nctx = normalCanvas.getContext("2d")!;
  const out = nctx.createImageData(size, size);
  const strength = 2.2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const left = heightAt(x - 1, y);
      const right = heightAt(x + 1, y);
      const up = heightAt(x, y - 1);
      const down = heightAt(x, y + 1);
      const nx = (left - right) * strength;
      const ny = (up - down) * strength; // canvas y grows down; flip to match tangent-space +Y
      const nz = 1.0;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      const i = (y * size + x) * 4;
      out.data[i] = ((nx / len) * 0.5 + 0.5) * 255;
      out.data[i + 1] = ((ny / len) * 0.5 + 0.5) * 255;
      out.data[i + 2] = ((nz / len) * 0.5 + 0.5) * 255;
      out.data[i + 3] = 255;
    }
  }
  nctx.putImageData(out, 0, 0);

  const texture = new THREE.CanvasTexture(normalCanvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

// Cause #5 ("missing AO/contact shadows"): a soft radial gradient decal
// used as a transparent plane's map right at an object's contact point —
// cheaper than baking a real AO map, and enough to sell "grounded" vs "floating".
export function createContactShadowTexture(size = 256): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, "rgba(0,0,0,0.55)");
  gradient.addColorStop(0.65, "rgba(0,0,0,0.22)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}
