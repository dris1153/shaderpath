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
// TODO 1: 2048 o dinh dang Float chua nen la qua nang cho mot env map chi
// dung de phan xa nhe -- giam kich thuoc va doi sang HalfFloatType, ghi ro
// ly do bang comment
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
  // TODO 2: prop nay rong ~0.3 don vi the gioi, hiem khi chiem qua vai chuc
  // pixel man hinh o khoang cach camera binh thuong -- 4096 la lang phi,
  // rightsize xuong bao nhieu? ghi ro ly do bang comment
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
  // TODO 3: 128x128 segment cho mot sphere ban kinh 0.3 dat cach camera
  // 10-15 don vi -- giam xuong bao nhieu la du, ghi ro cong thuc/ly do
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
// TODO 4: hero khong co LOD -- luon render o do chi tiet cao nhat du camera
// dung xa co nao. Dung THREE.LOD voi it nhat hai muc chi tiet thap hon roi
// scene.add(lod) thay vi scene.add(hero) truc tiep.

// --- somebody set this thinking it would help. it didn't. ---
for (const obj of [...props, ...fillers, hero]) {
  obj.frustumCulled = false;
}
// TODO 5: bo vong lap tren (hoac tra frustumCulled ve true) -- giai thich
// trong comment vi sao tat culling o day khong giup gi, co khi con hai

function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// TODO 6: viet dispose() goi .dispose() tren MOI geometry/material/texture
// da tao (bao gom envTexture va moi level cua LOD tu TODO 4), cong
// renderer.dispose()

// TODO 7: viet logSceneStats(label) doc renderer.info.memory.geometries,
// renderer.info.memory.textures va renderer.info.render.calls (goi sau it
// nhat mot lan renderer.render()) -- goi mot lan TRUOC khi ap cac TODO tren,
// mot lan SAU khi ap xong, dung hai lan doc do lam cot "do song" trong bang
// deliverable`,
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

// Env map: 512 thay vi 2048, HalfFloatType thay vi FloatType -- nhe hon
// khoang (2048/512)^2 * 2 = 32 lan (giam ca do phan giai lan so byte moi
// kenh), du muot cho phan xa nhe tren vat lieu khong guong. Du an that se
// dung RGBE that qua RGBELoader roi nen KTX2 (xem bai asset-pipeline-draco-ktx2).
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

// Prop cao ~0.3 don vi the gioi, o khoang cach camera 8-10 don vi chiem uoc
// luong duoi 40px chieu cao man hinh -- 512 da vuot xa nhu cau, con 4096 chi
// ton VRAM khong doi nao ve chat luong nhin thay. Du an that: KTX2/ETC1S cho
// texture nay (mau don gian, khong can giu chi tiet cao tan).
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

// Sphere ban kinh 0.3, dat cach camera ~10-15 don vi -- ban kinh man hinh uoc
// luong duoi 15px o do phan giai binh thuong. 16 kinh tuyen x 12 vi tuyen (192
// quad) da du muot cho kich thuoc do; 128x128 (16384 quad) la lang phi hon 85
// lan so vertex ma mat khong bao gio phan biet duoc o khoang cach nay.
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

// Hero: LOD 3 muc -- gan camera dung geometry goc, xa hon chuyen dan sang
// mesh nhe hon. Nguong khoang cach chon theo kich thuoc hero (ban kinh ~1.35
// don vi): duoi 6 don vi hero con chiem phan lon khung hinh nen giu full
// detail; 6-14 don vi giam segment mot nua; qua 14 chi con la mot khoi mo ta
// hinh dang, khong ai nhin ra khac biet segment o khoang cach do.
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

// frustumCulled tra ve mac dinh (true) -- khong co ly do gi de tat no o day:
// scene nay khong dung custom bounding volume nao lech voi hinh hoc that, nen
// tat culling chi khien GPU ve them nhung object dang nam ngoai khung hinh.

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

// Doc renderer.info NGAY SAU it nhat mot lan renderer.render() -- goi ham nay
// mot lan tren ban build "beo" (starterCode) va mot lan tren ban diet nay de
// lay cot "do song" cua bang deliverable.
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

// Bang deliverable mau -- dien so do that tu logSceneStats("before"/"after")
// va so uoc luong tu cong thuc bai asset-pipeline-draco-ktx2 vao day:
//
// | Asset            | Quyet dinh                          | File uoc luong truoc | File uoc luong sau |
// |-------------------|--------------------------------------|-----------------------|----------------------|
// | env map           | 2048 Float -> 512 HalfFloat           | ... MB (uoc luong)    | ... MB (uoc luong)   |
// | prop texture x3   | 4096 -> 512, du kien nen KTX2/ETC1S    | ... MB                | ... MB               |
// | filler geometry    | 128x128 -> 16x12 segment              | -                     | -                    |
// | hero               | them THREE.LOD 3 muc                  | -                     | -                    |
// VRAM (renderer.info.memory) va draw calls (renderer.info.render.calls): tu logSceneStats`,
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
