"use client";

import { useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { stringOf } from "@/components/viz/control-schema";

const LABELS = {
  vi: {
    title: "R3F vs Three.js thuần: cùng một scene, hai cách viết",
    view: "Xem source",
    r3f: "R3F (JSX)",
    vanilla: "Vanilla Three.js",
    lines: "dòng code",
    concepts: "khái niệm phải tự quản lý",
    hint: "Khối 3D bên trái là scene THẬT, dựng bằng R3F. Panel bên phải chỉ đổi giữa hai cách VIẾT cùng hành vi đó — không đổi scene đang chạy.",
  },
  en: {
    title: "R3F vs Vanilla Three.js: Same Scene, Two Ways to Write It",
    view: "Source shown",
    r3f: "R3F (JSX)",
    vanilla: "Vanilla Three.js",
    lines: "lines of code",
    concepts: "concepts to self-manage",
    hint: "The 3D box on the left is a REAL scene, built with R3F. The panel on the right only swaps WHICH way of writing that same behavior is shown — it never changes the running scene.",
  },
} as const;

type ViewKind = "r3f" | "vanilla";

// Both sources implement the exact same visible behavior as <SpinningBox />
// below: a box that spins continuously and swaps color on hover.
const R3F_SOURCE = `function SpinningBox() {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta;
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[1.4, 1.4, 1.4]} />
      <meshStandardMaterial color={hovered ? "#f59e0b" : "#3b82f6"} />
    </mesh>
  );
}`;

const VANILLA_SOURCE = `const geometry = new THREE.BoxGeometry(1.4, 1.4, 1.4);
const material = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hovered = false;

canvas.addEventListener("pointermove", (e) => {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
});

function animate() {
  mesh.rotation.y += clock.getDelta();

  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObject(mesh).length > 0;
  if (hit !== hovered) {
    hovered = hit;
    material.color.set(hovered ? 0xf59e0b : 0x3b82f6);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// on unmount / route change:
geometry.dispose();
material.dispose();
renderer.dispose();`;

const CONCEPTS: Record<ViewKind, Record<"vi" | "en", string[]>> = {
  r3f: {
    vi: [
      "Ánh xạ JSX ↔ class Three.js (mesh → THREE.Mesh)",
      "useFrame làm vòng lặp animation",
      "Pointer event có sẵn (raycasting tự động)",
      "Auto-dispose geometry/material khi unmount",
    ],
    en: [
      "JSX ↔ Three.js class mapping (mesh → THREE.Mesh)",
      "useFrame as the animation loop",
      "Built-in pointer events (automatic raycasting)",
      "Auto-dispose geometry/material on unmount",
    ],
  },
  vanilla: {
    vi: [
      "Tự khởi tạo geometry/material/mesh bằng constructor",
      "Tự đăng ký pointermove và tính toạ độ NDC",
      "Tự dựng THREE.Raycaster + intersectObject mỗi frame",
      "Tự viết vòng lặp requestAnimationFrame",
      "Tự gọi .dispose() cho từng resource",
    ],
    en: [
      "Manually construct geometry/material/mesh",
      "Manually register pointermove and compute NDC coordinates",
      "Manually build THREE.Raycaster + intersectObject every frame",
      "Manually write the requestAnimationFrame loop",
      "Manually call .dispose() on every resource",
    ],
  },
};

// The one live scene both source panels describe — always rendered via R3F
// regardless of which source string is selected below.
function SpinningBox() {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta;
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[1.4, 1.4, 1.4]} />
      <meshStandardMaterial color={hovered ? "#f59e0b" : "#3b82f6"} />
    </mesh>
  );
}

function ComparisonPanel() {
  const { values } = useDemoContext();
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;
  const loc: "vi" | "en" = locale === "en" ? "en" : "vi";
  const view = stringOf(values, "view", "r3f") as ViewKind;

  const source = view === "r3f" ? R3F_SOURCE : VANILLA_SOURCE;
  const lineCount = source.trim().split("\n").length;
  const concepts = CONCEPTS[view][loc];

  return (
    <div className="flex size-full flex-col md:flex-row">
      <div className="relative h-1/2 w-full md:h-full md:w-1/2">
        <DemoCanvas camera={{ position: [2.2, 1.6, 2.6], fov: 40 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[3, 4, 2]} intensity={1.1} />
          <SpinningBox />
        </DemoCanvas>
      </div>
      <div className="bg-background/60 h-1/2 w-full overflow-auto border-t p-3 md:h-full md:w-1/2 md:border-t-0 md:border-l">
        <p className="text-muted-foreground mb-1 text-xs font-medium">
          {L[view]} — {lineCount} {L.lines} · {concepts.length} {L.concepts}
        </p>
        <p className="text-muted-foreground mb-2 text-[11px] italic">
          {L.hint}
        </p>
        <pre className="overflow-x-auto text-[11px] leading-4 whitespace-pre">
          <code>{source}</code>
        </pre>
        <ul className="text-muted-foreground mt-2 list-disc space-y-0.5 pl-4 text-[11px]">
          {concepts.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function R3fVsVanillaThreeDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        {
          kind: "select",
          key: "view",
          label: L.view,
          defaultValue: "r3f",
          options: [
            { value: "r3f", label: L.r3f },
            { value: "vanilla", label: L.vanilla },
          ],
        },
      ]}
    >
      <ComparisonPanel />
    </Demo>
  );
}
