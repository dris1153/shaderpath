import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-interactive-showroom",
    kind: "build",
    prompt: {
      vi: `Dựng một **showroom 3D tương tác** bằng Three.js thuần (không React), assume một \`<canvas>\` đã có sẵn trong DOM.

Yêu cầu: ít nhất 3 sản phẩm (geometry built-in, \`MeshStandardMaterial\`) trên pedestal riêng; rig \`DirectionalLight\` + \`AmbientLight\` với shadow map bật (\`castShadow\`/\`receiveShadow\` đúng chỗ); \`OrbitControls\` với \`minDistance\`/\`maxDistance\`/\`maxPolarAngle\` hợp lý; \`Raycaster\` cho hover highlight và click-select; sản phẩm đang chọn tự xoay mỗi frame; giải phóng toàn bộ geometry/material/controls/renderer khi xong.

Gợi ý cấu trúc: một hàm \`createProduct(geometry, color, x)\` dựng cặp pedestal + sản phẩm, và một mảng \`items\` chỉ chứa mesh sản phẩm để raycast không nhầm trúng pedestal.`,
      en: `Build an **interactive 3D showroom** with vanilla Three.js (no React), assuming a \`<canvas>\` already exists in the DOM.

Requirements: at least 3 products (built-in geometry, \`MeshStandardMaterial\`) on separate pedestals; a \`DirectionalLight\` + \`AmbientLight\` rig with shadow maps enabled (\`castShadow\`/\`receiveShadow\` set correctly); \`OrbitControls\` with sane \`minDistance\`/\`maxDistance\`/\`maxPolarAngle\`; a \`Raycaster\` for hover highlight and click-to-select; the selected product rotates every frame; dispose every geometry/material/controls/renderer when done.

Suggested structure: a \`createProduct(geometry, color, x)\` helper building a pedestal + product pair, and an \`items\` array holding only product meshes so raycasting never mistakenly hits a pedestal.`,
    },
    starterCode: `import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const canvas = document.querySelector("canvas")!;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
// TODO 1: enable the shadow map on the renderer (renderer.shadowMap.enabled, .type)

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  canvas.clientWidth / canvas.clientHeight,
  0.1,
  50,
);
camera.position.set(4, 3, 6);

const controls = new OrbitControls(camera, renderer.domElement);
// TODO 2: enableDamping, minDistance/maxDistance, maxPolarAngle (don't let it dip below the floor)
controls.target.set(0, 0.5, 0);

// TODO 3: light rig -- AmbientLight + DirectionalLight (castShadow = true,
// shadow.mapSize, shadow.camera.left/right/top/bottom, shadow.bias)

// TODO 4: floor -- large PlaneGeometry, MeshStandardMaterial, rotation.x = -PI/2,
// receiveShadow = true

interface Product {
  pedestal: THREE.Mesh;
  item: THREE.Mesh;
}

function createProduct(geometry: THREE.BufferGeometry, color: number, x: number): Product {
  // TODO 5: pedestal (CylinderGeometry) at (x, ~0.2, 0), castShadow + receiveShadow
  // TODO 6: product using "geometry" + MeshStandardMaterial(color), at (x, ~0.9, 0),
  // castShadow + receiveShadow
  throw new Error("TODO: return { pedestal, item }");
}

const products: Product[] = [
  createProduct(new THREE.IcosahedronGeometry(0.5, 0), 0xf59e0b, -2.5),
  createProduct(new THREE.TorusKnotGeometry(0.35, 0.13, 100, 16), 0x38bdf8, 0),
  createProduct(new THREE.ConeGeometry(0.5, 1, 32), 0x22c55e, 2.5),
];
const items = products.map((p) => p.item);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hovered: THREE.Mesh | null = null;
let selected: THREE.Mesh | null = null;

function setPointer(event: PointerEvent) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

// TODO 7: pointermove -- raycast "items", highlight the object under the cursor
// (e.g. change material.emissive), clear the old highlighted object when leaving it

// TODO 8: pointerdown -- raycast "items", set/toggle "selected"

let last = performance.now();
function animate(now: number) {
  const delta = (now - last) / 1000;
  last = now;

  // TODO 9: if there's a "selected" item, rotate it by delta every frame

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// TODO 10: dispose() function -- call .dispose() on EVERY geometry/material created,
// controls.dispose(), renderer.dispose()`,
    solutionCode: `import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const canvas = document.querySelector("canvas")!;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111318);

const camera = new THREE.PerspectiveCamera(
  45,
  canvas.clientWidth / canvas.clientHeight,
  0.1,
  50,
);
camera.position.set(4, 3, 6);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 3;
controls.maxDistance = 10;
controls.maxPolarAngle = Math.PI / 2 - 0.05; // never dip below the floor
controls.target.set(0, 0.5, 0);

const ambient = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xffffff, 1.2);
key.position.set(5, 6, 4);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
key.shadow.camera.near = 1;
key.shadow.camera.far = 20;
key.shadow.camera.left = -6;
key.shadow.camera.right = 6;
key.shadow.camera.top = 6;
key.shadow.camera.bottom = -6;
key.shadow.bias = -0.0015;
scene.add(key);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x22252b, roughness: 1 }),
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

interface Product {
  pedestal: THREE.Mesh;
  item: THREE.Mesh;
}

function createProduct(geometry: THREE.BufferGeometry, color: number, x: number): Product {
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.7, 0.4, 24),
    new THREE.MeshStandardMaterial({ color: 0x3a3f4b, roughness: 0.8 }),
  );
  pedestal.position.set(x, 0.2, 0);
  pedestal.castShadow = true;
  pedestal.receiveShadow = true;
  scene.add(pedestal);

  const item = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.15 }),
  );
  item.position.set(x, 0.9, 0);
  item.castShadow = true;
  item.receiveShadow = true;
  scene.add(item);

  return { pedestal, item };
}

const products: Product[] = [
  createProduct(new THREE.IcosahedronGeometry(0.5, 0), 0xf59e0b, -2.5),
  createProduct(new THREE.TorusKnotGeometry(0.35, 0.13, 100, 16), 0x38bdf8, 0),
  createProduct(new THREE.ConeGeometry(0.5, 1, 32), 0x22c55e, 2.5),
];
const items = products.map((p) => p.item);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hovered: THREE.Mesh | null = null;
let selected: THREE.Mesh | null = null;

function setPointer(event: PointerEvent) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function pickItem(): THREE.Mesh | null {
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(items, false);
  return (hits[0]?.object as THREE.Mesh | undefined) ?? null;
}

canvas.addEventListener("pointermove", (event) => {
  setPointer(event);
  const next = pickItem();
  if (hovered && hovered !== next && hovered !== selected) {
    (hovered.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
  }
  if (next && next !== selected) {
    (next.material as THREE.MeshStandardMaterial).emissive.setHex(0x222222);
  }
  hovered = next;
});

canvas.addEventListener("pointerdown", (event) => {
  setPointer(event);
  const hit = pickItem();
  if (selected) {
    (selected.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
  }
  selected = hit === selected ? null : hit;
  if (selected) {
    (selected.material as THREE.MeshStandardMaterial).emissive.setHex(0x333333);
  }
});

let last = performance.now();
function animate(now: number) {
  const delta = (now - last) / 1000;
  last = now;

  if (selected) selected.rotation.y += delta * 1.2;

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

function dispose() {
  floor.geometry.dispose();
  (floor.material as THREE.Material).dispose();
  for (const { pedestal, item } of products) {
    pedestal.geometry.dispose();
    (pedestal.material as THREE.Material).dispose();
    item.geometry.dispose();
    (item.material as THREE.Material).dispose();
  }
  controls.dispose();
  renderer.dispose();
}`,
    hints: [
      {
        vi: "Giữ hai mảng riêng: \"items\" (chỉ mesh sản phẩm) để raycast, và \"products\" (cả pedestal lẫn item) để dispose -- gộp chung dễ khiến raycaster nhầm trúng pedestal.",
        en: "Keep two separate arrays: \"items\" (product meshes only) for raycasting, and \"products\" (both pedestal and item) for disposal -- merging them makes the raycaster liable to hit a pedestal by mistake.",
      },
      {
        vi: "maxPolarAngle của OrbitControls tính từ trục +Y xuống -- Math.PI/2 đúng bằng mặt phẳng ngang (mức sàn); trừ thêm một chút (vd 0.05 rad) để camera không bao giờ chạm/xuyên sàn.",
        en: "OrbitControls' maxPolarAngle is measured from the +Y axis downward -- Math.PI/2 is exactly the horizontal plane (floor level); subtract a small margin (e.g. 0.05 rad) so the camera never touches/clips through the floor.",
      },
      {
        vi: "Đừng đổi emissive của vật đang \"selected\" khi hover đi ngang qua nó rồi rời đi -- kiểm tra hovered !== selected trước khi tắt emissive, nếu không trạng thái chọn sẽ mất highlight khi chuột chỉ lướt qua.",
        en: "Don't clear the emissive of the currently \"selected\" item when hover passes over then leaves it -- check hovered !== selected before clearing emissive, or the selection highlight disappears just from the pointer passing by.",
      },
    ],
    checklist: [
      {
        vi: "Có ít nhất 3 sản phẩm, mỗi cái hình khối khác nhau rõ ràng, mỗi cái đứng trên pedestal riêng",
        en: "At least 3 products, each with a clearly distinct shape, each standing on its own pedestal",
      },
      {
        vi: "renderer.shadowMap.enabled = true và cả DirectionalLight lẫn mesh sản phẩm/sàn có castShadow/receiveShadow đúng chỗ -- bóng đổ nhìn thấy được trên sàn",
        en: "renderer.shadowMap.enabled = true and both the DirectionalLight and the product/floor meshes have castShadow/receiveShadow set correctly -- shadows are visibly cast on the floor",
      },
      {
        vi: "OrbitControls không cho camera xoay xuống dưới mặt sàn (maxPolarAngle) và có minDistance/maxDistance hợp lý",
        en: "OrbitControls never lets the camera rotate below the floor plane (maxPolarAngle) and has sane minDistance/maxDistance",
      },
      {
        vi: "Di chuột qua từng sản phẩm làm nó sáng nhẹ lên (hover highlight), và tắt highlight khi rời đi -- không dính vào sản phẩm đã click chọn",
        en: "Hovering over each product makes it glow slightly (hover highlight), clearing when the pointer leaves -- without touching whatever product is already click-selected",
      },
      {
        vi: "Click chọn đúng sản phẩm dưới con trỏ; click lại đúng sản phẩm đang chọn thì bỏ chọn (toggle)",
        en: "Clicking selects the correct product under the cursor; clicking the already-selected product again deselects it (toggle)",
      },
      {
        vi: "Sản phẩm đang được chọn tự xoay mượt mỗi frame, tốc độ không phụ thuộc framerate (nhân với delta)",
        en: "The currently selected product rotates smoothly every frame, at a rate independent of framerate (multiplied by delta)",
      },
      {
        vi: "Có một hàm dispose() gọi .dispose() trên MỌI geometry và material đã tạo, cộng controls.dispose() và renderer.dispose()",
        en: "There is a dispose() function calling .dispose() on EVERY geometry and material created, plus controls.dispose() and renderer.dispose()",
      },
    ],
  },
];
