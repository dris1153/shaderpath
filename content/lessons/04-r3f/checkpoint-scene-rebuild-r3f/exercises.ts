import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-scene-rebuild-r3f",
    kind: "build",
    prompt: {
      vi: `Dựng lại showroom tương tác của Track 3 (\`checkpoint-interactive-showroom\`) nhưng bằng React Three Fiber — component render trực tiếp bên trong \`<Canvas>\` của nền tảng, không cần tự dựng \`<canvas>\` hay \`WebGLRenderer\`.

Yêu cầu: ít nhất 3 sản phẩm (geometry bất kỳ, \`meshStandardMaterial\`) trên pedestal riêng dựng bằng JSX; \`ambientLight\` + \`directionalLight\` với \`castShadow\` trên light và \`castShadow\`/\`receiveShadow\` trên mesh; camera điều khiển bằng \`<OrbitControls>\` của drei (giới hạn \`minDistance\`/\`maxDistance\`/\`maxPolarAngle\` hợp lý); hover sáng nhẹ + click chọn dùng thẳng \`onPointerOver\`/\`onPointerOut\`/\`onClick\` trên \`<mesh>\` — không tự dựng \`THREE.Raycaster\`, R3F đã raycast hộ qua pointer event; sản phẩm đang chọn tự xoay mỗi frame bằng \`useFrame\`, mutate ref, không setState.

Gợi ý cấu trúc: một component \`Product\` nhận props (định nghĩa sản phẩm, \`selected\`, hàm \`onSelect\`) và tự quản lý state hover cục bộ bằng \`useState\`; component cha giữ state \`selected\` (id sản phẩm đang chọn) và một mảng dữ liệu định nghĩa 3 sản phẩm.`,
      en: `Rebuild Track 3's interactive showroom (\`checkpoint-interactive-showroom\`) but with React Three Fiber — the component renders directly inside the platform's \`<Canvas>\`, no need to build a \`<canvas>\` or \`WebGLRenderer\` by hand.

Requirements: at least 3 products (any geometry, \`meshStandardMaterial\`) on separate pedestals built as JSX; \`ambientLight\` + \`directionalLight\` with \`castShadow\` on the light and \`castShadow\`/\`receiveShadow\` on the meshes; a camera driven by drei's \`<OrbitControls>\` (sane \`minDistance\`/\`maxDistance\`/\`maxPolarAngle\`); hover highlight and click-to-select using \`onPointerOver\`/\`onPointerOut\`/\`onClick\` straight on \`<mesh>\` — no hand-built \`THREE.Raycaster\`, R3F already raycasts for you through pointer events; the selected product rotates every frame via \`useFrame\`, mutating a ref, never setState.

Suggested structure: a \`Product\` component taking props (a product definition, \`selected\`, an \`onSelect\` callback) that manages its own local hover state with \`useState\`; the parent holds the \`selected\` state (the chosen product's id) and an array of data defining the 3 products.`,
    },
    starterCode: `"use client";

import { useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { Mesh } from "three";

// Assumes this component renders inside:
// <Canvas shadows camera={{ position: [4, 3, 6], fov: 45 }}>

interface ProductDef {
  id: string;
  kind: "icosahedron" | "torusKnot" | "cone";
  color: string;
  x: number;
}

const PRODUCTS: ProductDef[] = [
  { id: "a", kind: "icosahedron", color: "#f59e0b", x: -2.5 },
  { id: "b", kind: "torusKnot", color: "#38bdf8", x: 0 },
  { id: "c", kind: "cone", color: "#22c55e", x: 2.5 },
];

function ProductGeometry({ kind }: { kind: ProductDef["kind"] }) {
  if (kind === "icosahedron") return <icosahedronGeometry args={[0.5, 0]} />;
  if (kind === "torusKnot") return <torusKnotGeometry args={[0.35, 0.13, 100, 16]} />;
  return <coneGeometry args={[0.5, 1, 32]} />;
}

function Product({
  def,
  selected,
  onSelect,
}: {
  def: ProductDef;
  selected: boolean;
  onSelect: (id: string | null) => void;
}) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // TODO 1: trong useFrame, nếu "selected" thì xoay meshRef.current.rotation.y
  // theo delta -- KHÔNG setState, guard meshRef.current trước khi dùng

  return (
    <group position={[def.x, 0, 0]}>
      {/* TODO 2: pedestal -- cylinderGeometry, castShadow + receiveShadow */}

      <mesh
        ref={meshRef}
        position={[0, 0.9, 0]}
        castShadow
        receiveShadow
        // TODO 3: onPointerOver/onPointerOut set "hovered" (nhớ e.stopPropagation())
        // TODO 4: onClick toggle "selected" qua onSelect(...) (nhớ e.stopPropagation())
      >
        <ProductGeometry kind={def.kind} />
        <meshStandardMaterial
          color={def.color}
          // TODO 5: emissive sáng hơn khi selected, sáng nhẹ hơn khi hovered, đen khi bình thường
        />
      </mesh>
    </group>
  );
}

function Showroom() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      {/* TODO 6: ambientLight + directionalLight -- directionalLight castShadow */}

      {/* TODO 7: sàn -- planeGeometry lớn, rotation -PI/2, receiveShadow */}

      {PRODUCTS.map((p) => (
        <Product key={p.id} def={p} selected={selected === p.id} onSelect={setSelected} />
      ))}

      {/* TODO 8: <OrbitControls> với minDistance/maxDistance/maxPolarAngle */}
    </>
  );
}

export default function ShowroomScene() {
  return <Showroom />;
}`,
    solutionCode: `"use client";

import { useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { Mesh } from "three";

// Assumes this component renders inside:
// <Canvas shadows camera={{ position: [4, 3, 6], fov: 45 }}>

interface ProductDef {
  id: string;
  kind: "icosahedron" | "torusKnot" | "cone";
  color: string;
  x: number;
}

const PRODUCTS: ProductDef[] = [
  { id: "a", kind: "icosahedron", color: "#f59e0b", x: -2.5 },
  { id: "b", kind: "torusKnot", color: "#38bdf8", x: 0 },
  { id: "c", kind: "cone", color: "#22c55e", x: 2.5 },
];

function ProductGeometry({ kind }: { kind: ProductDef["kind"] }) {
  if (kind === "icosahedron") return <icosahedronGeometry args={[0.5, 0]} />;
  if (kind === "torusKnot") return <torusKnotGeometry args={[0.35, 0.13, 100, 16]} />;
  return <coneGeometry args={[0.5, 1, 32]} />;
}

function Product({
  def,
  selected,
  onSelect,
}: {
  def: ProductDef;
  selected: boolean;
  onSelect: (id: string | null) => void;
}) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (!selected || !meshRef.current) return;
    meshRef.current.rotation.y += delta * 1.2; // delta-correct, no setState
  });

  return (
    <group position={[def.x, 0, 0]}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.7, 0.4, 24]} />
        <meshStandardMaterial color="#3a3f4b" roughness={0.8} />
      </mesh>

      <mesh
        ref={meshRef}
        position={[0, 0.9, 0]}
        castShadow
        receiveShadow
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation(); // don't let the hit test fall through to the pedestal/floor
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onSelect(selected ? null : def.id);
        }}
      >
        <ProductGeometry kind={def.kind} />
        <meshStandardMaterial
          color={def.color}
          emissive={selected ? "#333333" : hovered ? "#222222" : "#000000"}
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>
    </group>
  );
}

function Showroom() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[5, 6, 4]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0015}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#22252b" roughness={1} />
      </mesh>

      {PRODUCTS.map((p) => (
        <Product key={p.id} def={p} selected={selected === p.id} onSelect={setSelected} />
      ))}

      <OrbitControls
        enableDamping
        minDistance={3}
        maxDistance={10}
        maxPolarAngle={Math.PI / 2 - 0.05}
        target={[0, 0.5, 0]}
      />
    </>
  );
}

export default function ShowroomScene() {
  return <Showroom />;
}`,
    hints: [
      {
        vi: `R3F đã raycast hộ bạn: \`onPointerOver\`/\`onPointerOut\`/\`onClick\` khai báo thẳng trên \`<mesh>\` chính là raycasting, không cần tự dựng \`THREE.Raycaster\` hay tự nghe \`pointermove\` trên canvas như ở Track 3.`,
        en: `R3F already raycasts for you: \`onPointerOver\`/\`onPointerOut\`/\`onClick\` declared directly on \`<mesh>\` IS raycasting — no need to build a \`THREE.Raycaster\` or listen to \`pointermove\` on the canvas by hand like in Track 3.`,
      },
      {
        vi: `Gọi \`e.stopPropagation()\` trong pointer handler để hit-test không "xuyên qua" xuống pedestal hay sàn phía sau -- thiếu dòng này, hover một sản phẩm có thể vô tình kích hoạt luôn handler của mesh nằm sau nó.`,
        en: `Call \`e.stopPropagation()\` inside pointer handlers so the hit test doesn't fall through to the pedestal or floor behind it -- without this, hovering a product can accidentally also trigger the handler of a mesh sitting behind it.`,
      },
      {
        vi: `\`useFrame\` không cho phép setState mỗi frame để xoay -- ghi thẳng \`meshRef.current.rotation.y += delta * speed\`; \`delta\` ở đây bắt buộc, thiếu nó tốc độ xoay sẽ phụ thuộc framerate máy người dùng.`,
        en: `\`useFrame\` doesn't allow setState every frame to spin the object -- write directly \`meshRef.current.rotation.y += delta * speed\`; \`delta\` is mandatory here, without it the spin speed depends on the user's machine framerate.`,
      },
    ],
    checklist: [
      {
        vi: `Có ít nhất 3 sản phẩm với hình khối rõ ràng khác nhau, mỗi cái đứng trên pedestal riêng dựng bằng JSX`,
        en: `At least 3 products with clearly distinct shapes, each standing on its own pedestal built as JSX`,
      },
      {
        vi: `\`directionalLight\` có \`castShadow\`, và cả mesh sản phẩm lẫn sàn có \`castShadow\`/\`receiveShadow\` đúng chỗ -- bóng đổ nhìn thấy được trên sàn`,
        en: `\`directionalLight\` has \`castShadow\`, and both the product meshes and the floor have \`castShadow\`/\`receiveShadow\` set correctly -- shadows are visibly cast on the floor`,
      },
      {
        vi: `Camera điều khiển bằng \`<OrbitControls>\` của drei với \`minDistance\`/\`maxDistance\`/\`maxPolarAngle\` hợp lý, không phải camera cố định`,
        en: `The camera is driven by drei's \`<OrbitControls>\` with sane \`minDistance\`/\`maxDistance\`/\`maxPolarAngle\`, not a fixed camera`,
      },
      {
        vi: `Hover/click dùng thẳng \`onPointerOver\`/\`onPointerOut\`/\`onClick\` trên \`<mesh>\` -- không có \`THREE.Raycaster\` hay \`addEventListener("pointermove", ...)\` thủ công nào trong code`,
        en: `Hover/click use \`onPointerOver\`/\`onPointerOut\`/\`onClick\` directly on \`<mesh>\` -- no hand-written \`THREE.Raycaster\` or \`addEventListener("pointermove", ...)\` anywhere in the code`,
      },
      {
        vi: `Sản phẩm đang chọn tự xoay mỗi frame trong \`useFrame\`, tốc độ nhân với \`delta\` (không phụ thuộc framerate)`,
        en: `The selected product spins every frame inside \`useFrame\`, speed multiplied by \`delta\` (framerate-independent)`,
      },
      {
        vi: `Không có lệnh \`setState\`/\`set...(...)\` nào được gọi bên trong \`useFrame\` -- animation hoàn toàn dựa trên mutate ref`,
        en: `No \`setState\`/\`set...(...)\` call happens anywhere inside \`useFrame\` -- animation relies entirely on ref mutation`,
      },
      {
        vi: `Click lại đúng sản phẩm đang chọn thì bỏ chọn (toggle), và hover không "dính" vào sản phẩm khác khi đã có sản phẩm được chọn`,
        en: `Clicking the already-selected product again deselects it (toggle), and hover doesn't "stick" to another product while one is already selected`,
      },
    ],
  },
];
