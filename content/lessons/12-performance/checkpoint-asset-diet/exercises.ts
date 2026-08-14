import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-asset-diet",
    kind: "build",
    prompt: {
      vi: `Bạn nhận một cảnh Three.js thuần (không React) cố tình dựng "béo": ba prop nhỏ cỡ nắm tay, mỗi cái mang một \`CanvasTexture\` procedural $4096 \\times 4096$; một environment map dạng \`FloatType\` chưa nén ở độ phân giải đầy đủ, không qua PMREM; mười hai filler sphere dùng \`SphereGeometry(0.3, 128, 128)\` dù mỗi cái chỉ chiếm vài chục pixel trên màn hình; một hero \`TorusKnotGeometry(1, 0.35, 400, 64)\` luôn render ở độ chi tiết cao nhất bất kể camera đứng xa cỡ nào; và mọi mesh trong cảnh bị set \`frustumCulled = false\` không vì lý do gì.

Nhiệm vụ: đưa cảnh về đúng khẩu phần. Rightsize từng texture theo texel density thực tế trên màn hình chứ không theo phản xạ "cứ để to cho chắc" — prop cỡ nắm tay không cần hơn $512$; ghi rõ quyết định định dạng nén dưới dạng comment cho từng asset (repo này không có pipeline binary thật nên không nén file thật được, nhưng phải nêu đúng sẽ dùng gì, ví dụ KTX2 cho texture prop — xem bài \`asset-pipeline-draco-ktx2\`); giảm segment count của filler và giải thích bằng đúng lý do màn hình cần bao nhiêu, không phải một con số tuỳ tiện; dựng \`THREE.LOD\` cho hero với ít nhất hai mức chi tiết thấp hơn mức gốc; trả \`frustumCulled\` về mặc định; viết một hàm \`dispose()\` audit đầy đủ mọi geometry/material/texture đã tạo, kể cả environment map và mọi level của LOD.

Deliverable cuối cùng là một bảng before/after: cột dung lượng file dùng số ước lượng có công thức (như bài lý thuyết \`asset-pipeline-draco-ktx2\`) cho asset "dự án thật" tương ứng, còn cột VRAM và draw call phải đo sống bằng \`renderer.info\` trên chính scene, một lần trước khi áp diet và một lần sau — không suy đoán.`,
      en: `You're given a vanilla Three.js scene (no React) deliberately built "fat": three fist-sized props, each dragging a $4096 \\times 4096$ procedural \`CanvasTexture\`; an uncompressed full-resolution \`FloatType\` environment map with no PMREM prefilter; twelve filler spheres using \`SphereGeometry(0.3, 128, 128)\` even though each covers only a few dozen screen pixels; a hero \`TorusKnotGeometry(1, 0.35, 400, 64)\` always rendered at full detail no matter how far the camera sits; and every mesh in the scene has \`frustumCulled = false\` set for no reason at all.

Your job: put the scene on a proper diet. Rightsize every texture to its actual on-screen texel density instead of reflexively "leaving it big to be safe" — a fist-sized prop needs no more than $512$; document the compression-format decision as a comment for each asset (this repo has no real binary pipeline so you can't actually compress a file, but you must state what you'd use — e.g. KTX2 for the prop textures, see the \`asset-pipeline-draco-ktx2\` lesson); cut the filler segment counts and justify the new numbers with the actual screen coverage, not an arbitrary pick; build a \`THREE.LOD\` for the hero with at least two levels below full detail; restore \`frustumCulled\` to its default; write a \`dispose()\` function that audits every geometry/material/texture created, including the environment map and every LOD level.

The final deliverable is a before/after table: the file-size column uses the same formula-driven estimates as the \`asset-pipeline-draco-ktx2\` theory lesson for the equivalent "real project" asset, while the VRAM and draw-call columns must be measured live with \`renderer.info\` on the actual scene, once before the diet and once after — no guessing.`,
    },
    starterCode: `import * as THREE from "three";

const canvas = document.querySelector("canvas")!;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  50,
  canvas.clientWidth / canvas.clientHeight,
  0.1,
  100,
);
camera.position.set(0, 3, 10);
camera.lookAt(0, 0.5, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const key = new THREE.DirectionalLight(0xffffff, 1);
key.position.set(5, 8, 5);
scene.add(key);

// --- environment: uncompressed float, full resolution, no PMREM prefilter ---
function makeFloatEnvironment(size: number): THREE.DataTexture {
  const data = new Float32Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const v = 0.4 + 0.3 * Math.sin(i * 0.001);
    data[i * 4] = v;
    data[i * 4 + 1] = v * 0.9;
    data[i * 4 + 2] = v * 1.1;
    data[i * 4 + 3] = 1;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.needsUpdate = true;
  return tex;
}
// TODO 1: 2048 in uncompressed Float format is way too heavy for an env map
// only used for light reflections -- shrink the size and switch to
// HalfFloatType, document the reason in a comment
const envTexture = makeFloatEnvironment(2048);
scene.environment = envTexture;

// --- small props, each dragging a 4096^2 procedural texture ---
function makeNoiseTexture(size: number): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return new THREE.CanvasTexture(c);
}

const props: THREE.Mesh[] = [];
for (let i = 0; i < 3; i++) {
  // TODO 2: this prop is ~0.3 world units wide, rarely covering more than a
  // few dozen screen pixels at a normal camera distance -- 4096 is wasteful,
  // rightsize it to how much? document the reason in a comment
  const texture = makeNoiseTexture(4096);
  const geometry = new THREE.IcosahedronGeometry(0.15, 3);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(i * 1.2 - 1.2, 0.4, 2);
  scene.add(mesh);
  props.push(mesh);
}

// --- filler objects, far more segments than their screen size ever needs ---
const fillers: THREE.Mesh[] = [];
for (let i = 0; i < 12; i++) {
  // TODO 3: 128x128 segments for a radius-0.3 sphere sitting 10-15 units from
  // the camera -- how far down is enough, document the formula/reasoning
  const geometry = new THREE.SphereGeometry(0.3, 128, 128);
  const material = new THREE.MeshStandardMaterial({ color: 0x88aabb });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set((Math.random() - 0.5) * 12, 0.3, (Math.random() - 0.5) * 12 - 4);
  scene.add(mesh);
  fillers.push(mesh);
}

// --- the hero: heaviest object in the scene, always rendered at full detail ---
const heroGeometry = new THREE.TorusKnotGeometry(1, 0.35, 400, 64);
const heroMaterial = new THREE.MeshStandardMaterial({
  color: 0xd9a441,
  metalness: 0.3,
  roughness: 0.4,
});
const hero = new THREE.Mesh(heroGeometry, heroMaterial);
hero.position.set(0, 1.2, -2);
scene.add(hero);
// TODO 4: the hero has no LOD -- always rendered at full detail no matter how
// far the camera stands. Use THREE.LOD with at least two lower-detail levels,
// then scene.add(lod) instead of scene.add(hero) directly.

// --- somebody set this thinking it would help. it didn't. ---
for (const obj of [...props, ...fillers, hero]) {
  obj.frustumCulled = false;
}
// TODO 5: remove the loop above (or restore frustumCulled to true) -- explain
// in a comment why disabling culling here doesn't help, and may even hurt

function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// TODO 6: write dispose() calling .dispose() on EVERY geometry/material/texture
// created (including envTexture and every LOD level from TODO 4), plus
// renderer.dispose()

// TODO 7: write logSceneStats(label) reading renderer.info.memory.geometries,
// renderer.info.memory.textures and renderer.info.render.calls (call it after
// at least one renderer.render()) -- call it once BEFORE applying the TODOs
// above, once AFTER, and use those two readings as the "measured live" column
// in the deliverable table`,
    solutionCode: `import * as THREE from "three";

const canvas = document.querySelector("canvas")!;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  50,
  canvas.clientWidth / canvas.clientHeight,
  0.1,
  100,
);
camera.position.set(0, 3, 10);
camera.lookAt(0, 0.5, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const key = new THREE.DirectionalLight(0xffffff, 1);
key.position.set(5, 8, 5);
scene.add(key);

const geometries: THREE.BufferGeometry[] = [];
const materials: THREE.Material[] = [];
const textures: THREE.Texture[] = [];

// Env map: 512 instead of 2048, HalfFloatType instead of FloatType -- roughly
// (2048/512)^2 * 2 = 32x lighter (both resolution and bytes-per-channel drop),
// smooth enough for soft reflections on non-mirror materials. A real project
// would use a real RGBE loaded via RGBELoader then compressed to KTX2 (see
// the asset-pipeline-draco-ktx2 lesson).
function makeFloatEnvironment(size: number): THREE.DataTexture {
  const data = new Float32Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const v = 0.4 + 0.3 * Math.sin(i * 0.001);
    data[i * 4] = v;
    data[i * 4 + 1] = v * 0.9;
    data[i * 4 + 2] = v * 1.1;
    data[i * 4 + 3] = 1;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.HalfFloatType);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.needsUpdate = true;
  return tex;
}
const envTexture = makeFloatEnvironment(512);
scene.environment = envTexture;
textures.push(envTexture);

function makeNoiseTexture(size: number): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return new THREE.CanvasTexture(c);
}

// Prop is ~0.3 world units tall, at a camera distance of 8-10 units it covers
// an estimated under 40px of screen height -- 512 already exceeds the need,
// while 4096 only burns VRAM with no visible quality gain. Real project:
// KTX2/ETC1S for this texture (simple colors, no need for high-frequency detail).
const PROP_TEXTURE_SIZE = 512;
const props: THREE.Mesh[] = [];
for (let i = 0; i < 3; i++) {
  const texture = makeNoiseTexture(PROP_TEXTURE_SIZE);
  const geometry = new THREE.IcosahedronGeometry(0.15, 3);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(i * 1.2 - 1.2, 0.4, 2);
  scene.add(mesh);
  props.push(mesh);
  geometries.push(geometry);
  materials.push(material);
  textures.push(texture);
}

// Radius-0.3 sphere sitting ~10-15 units from the camera -- an estimated
// under-15px screen radius at normal resolution. 16 longitude x 12 latitude
// segments (192 quads) is already smooth enough for that size; 128x128
// (16384 quads) is over 85x more vertices than the eye could ever tell apart
// at this distance.
const FILLER_SEGMENTS = 16;
const fillers: THREE.Mesh[] = [];
for (let i = 0; i < 12; i++) {
  const geometry = new THREE.SphereGeometry(0.3, FILLER_SEGMENTS, FILLER_SEGMENTS * 0.75);
  const material = new THREE.MeshStandardMaterial({ color: 0x88aabb });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set((Math.random() - 0.5) * 12, 0.3, (Math.random() - 0.5) * 12 - 4);
  scene.add(mesh);
  fillers.push(mesh);
  geometries.push(geometry);
  materials.push(material);
}

// Hero: 3-level LOD -- close to the camera uses the original geometry, farther
// away steps down to lighter meshes. Distance thresholds picked from the
// hero's size (radius ~1.35 units): under 6 units the hero still fills most
// of the frame so it keeps full detail; 6-14 units halves the segment count;
// past 14 it's just a shape-describing blob, nobody can tell segments apart
// at that distance.
const heroGeometryHigh = new THREE.TorusKnotGeometry(1, 0.35, 400, 64);
const heroGeometryMid = new THREE.TorusKnotGeometry(1, 0.35, 120, 24);
const heroGeometryLow = new THREE.TorusKnotGeometry(1, 0.35, 40, 8);
const heroMaterial = new THREE.MeshStandardMaterial({
  color: 0xd9a441,
  metalness: 0.3,
  roughness: 0.4,
});

const heroLod = new THREE.LOD();
heroLod.addLevel(new THREE.Mesh(heroGeometryHigh, heroMaterial), 0);
heroLod.addLevel(new THREE.Mesh(heroGeometryMid, heroMaterial), 6);
heroLod.addLevel(new THREE.Mesh(heroGeometryLow, heroMaterial), 14);
heroLod.position.set(0, 1.2, -2);
scene.add(heroLod);
geometries.push(heroGeometryHigh, heroGeometryMid, heroGeometryLow);
materials.push(heroMaterial);

// frustumCulled restored to its default (true) -- there's no reason to
// disable it here: this scene doesn't use any custom bounding volume that
// diverges from the real geometry, so disabling culling only makes the GPU
// draw extra objects that are outside the frustum.

function animate() {
  renderer.render(scene, camera);
  heroLod.update(camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

function dispose() {
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();
  for (const texture of textures) texture.dispose();
  renderer.dispose();
}

// Read renderer.info RIGHT AFTER at least one renderer.render() -- call this
// once on the "fat" build (starterCode) and once on this diet build to get
// the "measured live" column of the deliverable table.
function logSceneStats(label: string) {
  const { memory, render } = renderer.info;
  console.table({
    [label]: {
      geometries: memory.geometries,
      textures: memory.textures,
      drawCalls: render.calls,
    },
  });
}

// Sample deliverable table -- fill in the real measurements from
// logSceneStats("before"/"after") and the formula-based estimates from the
// asset-pipeline-draco-ktx2 lesson here:
//
// | Asset              | Decision                                 | File size before (est.) | File size after (est.) |
// |----------------------|---------------------------------------------|----------------------------|----------------------------|
// | env map              | 2048 Float -> 512 HalfFloat                  | ... MB                     | ... MB                     |
// | prop texture x3      | 4096 -> 512, planned KTX2/ETC1S                | ... MB                     | ... MB                     |
// | filler geometry       | 128x128 -> 16x12 segments                      | -                          | -                          |
// | hero                  | added a 3-level THREE.LOD                      | -                          | -                          |
// VRAM (renderer.info.memory) and draw calls (renderer.info.render.calls): from logSceneStats`,
    hints: [
      {
        vi: "Bắt đầu từ texel density: hỏi asset đó thực sự chiếm bao nhiêu pixel trên màn hình ở khoảng cách bình thường, rồi mới chọn kích thước texture — đây luôn là khoản tiết kiệm lớn nhất trong bài này.",
        en: "Start with texel density: ask how many screen pixels that asset actually covers at a normal viewing distance, then pick the texture size — this is always the biggest win in this exercise.",
      },
      {
        vi: "renderer.info.memory chính là bảng điểm của bạn — đọc geometries/textures/drawCalls trước và sau mỗi thay đổi, đừng đoán con số đã giảm bao nhiêu.",
        en: "renderer.info.memory is your scoreboard — read geometries/textures/drawCalls before and after each change, don't guess how much dropped.",
      },
      {
        vi: "Khoản thuế mipmap ×4/3 áp dụng cho MỌI map có generateMipmaps bật, kể cả environment map — tính VRAM ước lượng đừng quên nhân thêm hệ số này.",
        en: "The ×4/3 mipmap tax applies to EVERY map with generateMipmaps enabled, including the environment map — don't forget to multiply it into any estimated VRAM figure.",
      },
    ],
    checklist: [
      {
        vi: "VRAM đo được (renderer.info.memory) giảm ít nhất 50% so với bản gốc",
        en: "Measured VRAM (renderer.info.memory) drops by at least 50% versus the original",
      },
      {
        vi: "Số draw call (renderer.info.render.calls) giảm so với bản gốc, nhờ LOD và/hoặc culling hoạt động đúng",
        en: "The draw call count (renderer.info.render.calls) drops from the original, thanks to LOD and/or culling working correctly",
      },
      {
        vi: "Nhìn ở khoảng cách bình thường trong scene, không thấy khác biệt chất lượng rõ rệt so với bản gốc",
        en: "At a normal viewing distance in the scene, there's no visibly noticeable quality drop from the original",
      },
      {
        vi: "Mỗi quyết định rightsize/nén đều có comment giải thích lý do riêng cho từng asset, không phải một câu chung chung cho cả scene",
        en: "Every rightsize/compression decision has its own comment justifying that specific asset, not one generic blanket statement for the whole scene",
      },
      {
        vi: "dispose() giải phóng đúng mọi geometry, material và texture đã tạo, kể cả environment map và mọi level của LOD — không sót cái nào",
        en: "dispose() correctly releases every geometry, material and texture created, including the environment map and every LOD level — nothing left behind",
      },
      {
        vi: "Bảng before/after đầy đủ: cột file-size dùng số ước lượng có công thức, cột VRAM/draw call dùng số đo sống từ renderer.info",
        en: "The before/after table is complete: the file-size column uses formula-driven estimates, the VRAM/draw-call columns use live numbers from renderer.info",
      },
    ],
  },
];
