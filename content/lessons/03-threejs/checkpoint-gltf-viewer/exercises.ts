import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-gltf-viewer",
    kind: "build",
    prompt: {
      vi: `Dựng một mini GLTF viewer hoàn chỉnh, dùng lại đúng file glTF nhúng và hàm \`disposeHierarchy\` từ bài \`loading-gltf-draco-meshopt\` — không thư viện nào ngoài \`three\` và \`three/addons\`.

Yêu cầu: parse glTF bằng \`GLTFLoader.parse()\`; tính bounding box bằng \`new THREE.Box3().setFromObject(model)\`, suy ra tâm (\`box.getCenter\`) và bán kính bao (\`box.getBoundingSphere\`) để tự động đặt camera sao cho model luôn vừa khung hình dù to hay nhỏ, không hardcode khoảng cách; gắn \`OrbitControls\` quay quanh đúng tâm đó; thêm \`DirectionalLight\` (\`castShadow = true\`) và \`AmbientLight\`, đổ bóng model lên một mặt phẳng ground (\`receiveShadow = true\`); toggle wireframe; dispose toàn bộ hierarchy, controls và renderer khi unmount.

Công thức khoảng cách camera theo fov (đo theo chiều đứng): $d = \\dfrac{r}{\\sin(\\text{fov} / 2)}$, với $r$ là bán kính bounding sphere của model và fov tính theo radian.`,
      en: `Build a complete mini GLTF viewer, reusing the exact same embedded glTF file and the \`disposeHierarchy\` function from the \`loading-gltf-draco-meshopt\` lesson — no libraries beyond \`three\` and \`three/addons\`.

Requirements: parse the glTF with \`GLTFLoader.parse()\`; compute a bounding box with \`new THREE.Box3().setFromObject(model)\`, derive its center (\`box.getCenter\`) and bounding radius (\`box.getBoundingSphere\`) to automatically place the camera so the model is always framed regardless of size, with no hardcoded distance; attach \`OrbitControls\` orbiting around that exact center; add a \`DirectionalLight\` (\`castShadow = true\`) and an \`AmbientLight\`, casting the model's shadow onto a ground plane (\`receiveShadow = true\`); include a wireframe toggle; dispose the entire hierarchy, the controls and the renderer on unmount.

Camera-distance-from-fov formula (measured vertically): $d = \\dfrac{r}{\\sin(\\text{fov} / 2)}$, where $r$ is the model's bounding sphere radius and fov is in radians.`,
    },
    starterCode: `import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EMBEDDED_COLOR_CUBE_GLTF } from "./embedded-color-cube-gltf";

const canvas = document.querySelector("canvas")!;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);

// TODO 1: ground plane (PlaneGeometry, receiveShadow = true) + AmbientLight +
//         DirectionalLight (castShadow = true)

// TODO 2: OrbitControls(camera, canvas) with damping enabled

const materials: THREE.Material[] = [];

const loader = new GLTFLoader();
loader.parse(JSON.stringify(EMBEDDED_COLOR_CUBE_GLTF), "", (gltf) => {
  const model = gltf.scene;
  scene.add(model);

  // TODO 3: traverse model, set castShadow/receiveShadow on every Mesh and
  //         collect its material(s) into "materials" for the wireframe toggle

  // TODO 4: new THREE.Box3().setFromObject(model) -> center + bounding sphere
  //         radius -> position camera and controls.target using the fov
  //         distance formula so the model is framed regardless of its size
}, undefined, (err) => console.error("GLTF load failed", err));

function setWireframe(value: boolean) {
  // TODO 5: apply "value" to every material's wireframe property
}

function animate() {
  requestAnimationFrame(animate);
  // TODO 6: controls.update() then renderer.render(scene, camera)
}
animate();

function dispose() {
  // TODO 7: controls.dispose(), traverse+dispose every mesh's geometry/material/
  //         texture (same shape as disposeHierarchy), then renderer.dispose()
}`,
    solutionCode: `import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EMBEDDED_COLOR_CUBE_GLTF } from "./embedded-color-cube-gltf";

const canvas = document.querySelector("canvas")!;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x333333 }),
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.5;
ground.receiveShadow = true;
scene.add(ground);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
dirLight.position.set(3, 5, 2);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(1024, 1024);
scene.add(dirLight);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const materials: THREE.Material[] = [];

const loader = new GLTFLoader();
loader.parse(
  JSON.stringify(EMBEDDED_COLOR_CUBE_GLTF),
  "",
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    model.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        materials.push(...mats);
      }
    });

    // Bounding-box framing: works for any model size, no hardcoded distance.
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const fovRad = (camera.fov * Math.PI) / 180;
    const distance = sphere.radius / Math.sin(fovRad / 2);

    camera.position
      .copy(center)
      .add(new THREE.Vector3(distance * 0.6, distance * 0.5, distance * 0.6));
    camera.near = Math.max(distance / 100, 0.01);
    camera.far = distance * 10;
    camera.updateProjectionMatrix();

    controls.target.copy(center);
    controls.update();
  },
  undefined,
  (err) => console.error("GLTF load failed", err),
);

function setWireframe(value: boolean) {
  for (const material of materials) {
    if ("wireframe" in material) {
      (material as THREE.MeshStandardMaterial).wireframe = value;
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

function dispose() {
  controls.dispose();
  scene.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    obj.geometry.dispose();
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const material of mats) {
      for (const key of Object.keys(material)) {
        const value = (material as unknown as Record<string, unknown>)[key];
        if (value && typeof value === "object" && "isTexture" in value) {
          (value as THREE.Texture).dispose();
        }
      }
      material.dispose();
    }
  });
  renderer.dispose();
}`,
    hints: [
      {
        vi: "Box3.setFromObject phải chạy SAU khi model đã add vào scene và bên trong callback onLoad — gọi trước khi glTF parse xong sẽ ra bounding box rỗng (kích thước 0).",
        en: "Box3.setFromObject must run AFTER the model has been added to the scene, inside the onLoad callback — calling it before the glTF finishes parsing yields an empty (zero-size) bounding box.",
      },
      {
        vi: "d = r / sin(fov/2), với r là bán kính bounding sphere (Box3.getBoundingSphere) — object càng lớn thì r càng lớn, d tự tăng theo, không cần hardcode khoảng cách camera.",
        en: "d = r / sin(fov/2), where r is the bounding sphere radius (Box3.getBoundingSphere) — the bigger the object, the bigger r, so d scales automatically without a hardcoded camera distance.",
      },
      {
        vi: "OrbitControls.target phải được set trước lần gọi controls.update() đầu tiên, và update() phải chạy lại mỗi frame trong animate() vì enableDamping đang bật.",
        en: "OrbitControls.target has to be set before the first controls.update() call, and update() must run again every frame inside animate() since enableDamping is on.",
      },
    ],
    checklist: [
      {
        vi: "Model luôn nằm gọn trong khung hình camera — thử tưởng tượng model to gấp 5 lần vẫn framing đúng nhờ công thức theo bounding sphere, không bị cắt hay quá nhỏ",
        en: "The model always sits fully framed in the camera — reasoning through a model 5x larger still frames correctly via the bounding-sphere formula, without clipping or looking tiny",
      },
      {
        vi: "OrbitControls xoay mượt quanh đúng tâm model (controls.target = center), không quay quanh gốc toạ độ (0,0,0)",
        en: "OrbitControls orbits smoothly around the model's actual center (controls.target = center), not around the world origin (0,0,0)",
      },
      {
        vi: "Bóng đổ từ model xuống mặt phẳng ground rõ ràng, không bị shadow acne hay peter-panning nặng",
        en: "The model casts a clearly visible shadow onto the ground plane, without heavy shadow acne or peter-panning",
      },
      {
        vi: "Toggle wireframe áp dụng cho toàn bộ material của model, không chỉ mesh đầu tiên tìm thấy",
        en: "The wireframe toggle applies to every material on the model, not just the first mesh found",
      },
      {
        vi: "Sau khi unmount, không còn geometry/material/texture nào bị giữ lại — kiểm tra qua renderer.info.memory hoặc devtools memory snapshot",
        en: "After unmount, no geometry/material/texture is left retained — verified via renderer.info.memory or a devtools memory snapshot",
      },
      {
        vi: "Không có 2 model trùng nhau trong scene khi component remount hai lần dưới React Strict Mode",
        en: "No duplicate model ends up in the scene when the component remounts twice under React Strict Mode",
      },
    ],
  },
];
