import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-primitive-still-life",
    kind: "build",
    prompt: {
      vi: `Dựng một **cảnh tĩnh vật Three.js thuần** (không React) từ các geometry built-in, phối nhiều loại material, có ánh sáng và camera trôi nhẹ — tổng hợp toàn bộ bài \`materials-from-basic-to-physical\` thành một bố cục thật.

Yêu cầu: ít nhất 4 geometry built-in khác nhau (\`BoxGeometry\`, \`SphereGeometry\`, \`ConeGeometry\`, \`TorusGeometry\`...), mỗi geometry có \`position\`/\`scale\`/\`rotation\` riêng, không xếp chồng gốc toạ độ; ít nhất 3 loại material khác nhau, trong đó ít nhất một \`MeshStandardMaterial\` có \`metalness\`/\`roughness\` được canh chỉnh có chủ đích (không để mặc định); đúng một \`AmbientLight\` và một \`DirectionalLight\`; camera trôi nhẹ liên tục quanh cảnh bằng \`requestAnimationFrame\`; một hàm \`dispose()\` giải phóng toàn bộ geometry/material/renderer khi gọi.

Gợi ý cấu trúc: giữ hai mảng \`geometries[]\` và \`materials[]\`, push ngay lúc tạo mesh — \`dispose()\` chỉ là vòng lặp qua hai mảng đó.`,
      en: `Build a **vanilla Three.js still-life scene** (no React) from built-in geometries, combining several material types, with lighting and a gently drifting camera — a synthesis of everything in \`materials-from-basic-to-physical\` into one real composition.

Requirements: at least 4 different built-in geometries (\`BoxGeometry\`, \`SphereGeometry\`, \`ConeGeometry\`, \`TorusGeometry\`...), each with its own \`position\`/\`scale\`/\`rotation\`, nothing stacked at the origin; at least 3 different material types, with at least one \`MeshStandardMaterial\` whose \`metalness\`/\`roughness\` are deliberately tuned (not left at defaults); exactly one \`AmbientLight\` and one \`DirectionalLight\`; the camera drifts gently and continuously via \`requestAnimationFrame\`; a \`dispose()\` function that frees every geometry/material/renderer when called.

Suggested structure: keep two arrays, \`geometries[]\` and \`materials[]\`, pushing into them right when each mesh is created — \`dispose()\` then becomes a loop over those two arrays.`,
    },
    starterCode: `import * as THREE from "three";

const canvas = document.querySelector("canvas")!;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1b1d24);

const camera = new THREE.PerspectiveCamera(
  50,
  canvas.clientWidth / canvas.clientHeight,
  0.1,
  100,
);

const geometries: THREE.BufferGeometry[] = [];
const materials: THREE.Material[] = [];

// TODO 1: tạo >=4 mesh từ geometry built-in khác nhau (Box/Sphere/Cone/Torus/Cylinder...).
// Mỗi lần tạo, push geometry và material của mesh đó vào 2 mảng trên (để dispose sau này),
// và đặt position/scale/rotation có chủ đích — đừng xếp chồng lên nhau ở gốc toạ độ.

// TODO 2: dùng >=3 loại material khác nhau trong số các mesh trên; ít nhất một mesh dùng
// MeshStandardMaterial với metalness/roughness được canh chủ đích (không để mặc định —
// chọn một cặp có ý nghĩa, ví dụ kim loại đánh bóng hoặc sứ mờ).

// TODO 3: thêm đúng 1 AmbientLight (fill nhẹ) và 1 DirectionalLight (nguồn sáng chính) vào scene.

let raf = 0;
function render(t: number) {
  // TODO 4: camera trôi nhẹ quanh composition (dùng sin/cos theo t), rồi camera.lookAt về tâm cảnh.
  renderer.render(scene, camera);
  raf = requestAnimationFrame(render);
}
raf = requestAnimationFrame(render);

function dispose() {
  // TODO 5: dừng render loop, dispose từng geometry/material trong 2 mảng trên, dispose renderer.
}
window.addEventListener("beforeunload", dispose, { once: true });`,
    solutionCode: `import * as THREE from "three";

const canvas = document.querySelector("canvas")!;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1b1d24);

const camera = new THREE.PerspectiveCamera(
  50,
  canvas.clientWidth / canvas.clientHeight,
  0.1,
  100,
);

const geometries: THREE.BufferGeometry[] = [];
const materials: THREE.Material[] = [];

// tấm nền — dielectric mờ, KHÔNG kim loại
const groundGeo = new THREE.BoxGeometry(6, 0.2, 6);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x33363f,
  metalness: 0,
  roughness: 0.95,
});
geometries.push(groundGeo);
materials.push(groundMat);
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.position.y = -0.6;
scene.add(ground);

// quả cầu kim loại đánh bóng — metalness/roughness canh chủ đích
const sphereGeo = new THREE.SphereGeometry(0.9, 48, 48);
const sphereMat = new THREE.MeshStandardMaterial({
  color: 0xd8dde6,
  metalness: 1,
  roughness: 0.15,
});
geometries.push(sphereGeo);
materials.push(sphereMat);
const sphere = new THREE.Mesh(sphereGeo, sphereMat);
sphere.position.set(-1.4, 0.3, 0);
scene.add(sphere);

// hình nón — Phong, specular gọn
const coneGeo = new THREE.ConeGeometry(0.7, 1.6, 32);
const coneMat = new THREE.MeshPhongMaterial({ color: 0xe0663d, shininess: 80 });
geometries.push(coneGeo);
materials.push(coneMat);
const cone = new THREE.Mesh(coneGeo, coneMat);
cone.position.set(1.3, 0.4, -0.4);
cone.rotation.z = Math.PI * 0.04;
scene.add(cone);

// hình xuyến — Lambert, khuếch tán rẻ
const torusGeo = new THREE.TorusGeometry(0.55, 0.2, 24, 48);
const torusMat = new THREE.MeshLambertMaterial({ color: 0x5fb37a });
geometries.push(torusGeo);
materials.push(torusMat);
const torus = new THREE.Mesh(torusGeo, torusMat);
torus.position.set(0.1, 0.9, 1.1);
torus.rotation.x = Math.PI * 0.35;
torus.scale.setScalar(0.9);
scene.add(torus);

const ambient = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xffffff, 1.4);
sun.position.set(3, 4, 2);
scene.add(sun);

let raf = 0;
function render(t: number) {
  const drift = t * 0.00012;
  camera.position.set(Math.sin(drift) * 5, 2.4, Math.cos(drift) * 5);
  camera.lookAt(0, 0.2, 0);
  renderer.render(scene, camera);
  raf = requestAnimationFrame(render);
}
raf = requestAnimationFrame(render);

function dispose() {
  cancelAnimationFrame(raf);
  for (const g of geometries) g.dispose();
  for (const m of materials) m.dispose();
  renderer.dispose();
}
window.addEventListener("beforeunload", dispose, { once: true });`,
    hints: [
      {
        vi: "Đặt object theo bố cục thật: dùng position.set khác nhau cho từng mesh, và cho 1-2 object scale không đồng nhất — đừng để tất cả nằm ở gốc toạ độ như lúc mới tạo.",
        en: "Compose with intent: give each mesh a different position.set, and a non-uniform scale on 1-2 objects — don't leave everything sitting at the origin the way it spawns.",
      },
      {
        vi: "Với MeshStandardMaterial, chọn cặp metalness/roughness có ý nghĩa thay vì để mặc định (metalness=0, roughness=1) — ví dụ 1/0.15 cho kim loại bóng, 0/0.9 cho vật liệu mờ.",
        en: "For MeshStandardMaterial, pick a meaningful metalness/roughness pair instead of leaving the defaults (metalness=0, roughness=1) — e.g. 1/0.15 for polished metal, 0/0.9 for a matte material.",
      },
      {
        vi: "dispose() phải lặp qua CẢ mảng geometries lẫn materials — quên dispose material phổ biến hơn quên geometry vì material dễ bị bỏ sót khi code viết vội.",
        en: "dispose() must loop over BOTH the geometries and materials arrays — forgetting to dispose materials is more common than forgetting geometries, since materials are easy to skip when code is written in a hurry.",
      },
    ],
    checklist: [
      {
        vi: "Có ít nhất 4 geometry built-in khác nhau, mỗi cái vị trí/scale/rotation riêng biệt, không chồng nhau",
        en: "At least 4 different built-in geometries, each with its own position/scale/rotation, not overlapping",
      },
      {
        vi: "Có ít nhất 3 loại material khác nhau xuất hiện trong scene",
        en: "At least 3 different material types appear in the scene",
      },
      {
        vi: "Ít nhất một mesh dùng MeshStandardMaterial với metalness/roughness canh chủ đích (không phải giá trị mặc định)",
        en: "At least one mesh uses MeshStandardMaterial with a deliberately tuned metalness/roughness (not the defaults)",
      },
      {
        vi: "Scene có đúng một AmbientLight và một DirectionalLight",
        en: "The scene has exactly one AmbientLight and one DirectionalLight",
      },
      {
        vi: "Camera trôi nhẹ nhàng liên tục qua requestAnimationFrame, luôn lookAt về composition",
        en: "The camera drifts gently and continuously via requestAnimationFrame, always looking at the composition",
      },
      {
        vi: "dispose() giải phóng toàn bộ geometry, material và renderer khi gọi (không rò rỉ GPU)",
        en: "dispose() frees every geometry, material and the renderer when called (no GPU leak)",
      },
    ],
  },
];
