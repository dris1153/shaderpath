"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { useVisibleRaf } from "@/lib/hooks/use-visible-frameloop";

const GRID_X = 6;
const GRID_Y = 4;
const SPACING = 1.3;
const BASE_COLOR = 0x3b82f6;
const SELECTED_COLOR = 0xf97316;
const HOVER_EMISSIVE = 0x442200;

const LABELS = {
  vi: {
    title: "Raycasting: hover + click trên lưới box",
    flipY: "Lật trục Y (đúng)",
    hit: "Trúng",
    none: "không có",
    dist: "Khoảng cách",
  },
  en: {
    title: "Raycasting: hover + click on a box grid",
    flipY: "Flip Y axis (correct)",
    hit: "Hit",
    none: "none",
    dist: "Distance",
  },
} as const;

interface SceneState {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  raycaster: THREE.Raycaster;
  pickables: THREE.Mesh[];
  selected: Set<THREE.Mesh>;
  hovered: THREE.Mesh | null;
  pointerNdc: THREE.Vector2;
  pointerInside: boolean;
}

function RaycastGridScene() {
  const { values, containerRef } = useDemoContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const disposables = useDisposable();
  const stateRef = useRef<SceneState | null>(null);
  const flipYRef = useRef(true);
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  useEffect(() => {
    flipYRef.current = booleanOf(values, "flipY", true);
  }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = disposables.register(
      new THREE.WebGLRenderer({ canvas, antialias: true }),
    );
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(3, 4, 5);
    scene.add(dirLight);

    const geometry = disposables.register(new THREE.BoxGeometry(0.9, 0.9, 0.9));
    const pickables: THREE.Mesh[] = [];
    for (let ix = 0; ix < GRID_X; ix++) {
      for (let iy = 0; iy < GRID_Y; iy++) {
        const material = disposables.register(
          new THREE.MeshLambertMaterial({ color: BASE_COLOR }),
        );
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
          (ix - (GRID_X - 1) / 2) * SPACING,
          (iy - (GRID_Y - 1) / 2) * SPACING,
          0,
        );
        mesh.name = `box-${ix}-${iy}`;
        scene.add(mesh);
        pickables.push(mesh);
      }
    }

    const st: SceneState = {
      renderer,
      scene,
      camera,
      raycaster: new THREE.Raycaster(),
      pickables,
      selected: new Set(),
      hovered: null,
      pointerNdc: new THREE.Vector2(),
      pointerInside: false,
    };
    stateRef.current = st;

    // The whole point of this lesson's bug toggle: this negation is what
    // makes browser mouse-y (down) match NDC-y (up). Flip off to see the
    // mirrored-hit offset, flip on to fix it.
    const setNdcFromEvent = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const u = (e.clientX - rect.left) / rect.width;
      const v = (e.clientY - rect.top) / rect.height;
      const x = u * 2 - 1;
      const y = flipYRef.current ? -(v * 2 - 1) : v * 2 - 1;
      st.pointerNdc.set(x, y);
    };

    const onMove = (e: PointerEvent) => {
      st.pointerInside = true;
      setNdcFromEvent(e);
    };
    const onLeave = () => {
      st.pointerInside = false;
    };
    // Reuses the hover already computed this frame instead of re-raycasting,
    // since intersect + click both need the exact same nearest-hit result.
    const onClick = () => {
      const mesh = st.hovered;
      if (!mesh) return;
      const material = mesh.material as THREE.MeshLambertMaterial;
      if (st.selected.has(mesh)) {
        st.selected.delete(mesh);
        material.color.setHex(BASE_COLOR);
      } else {
        st.selected.add(mesh);
        material.color.setHex(SELECTED_COLOR);
      }
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("click", onClick);

    disposables.registerFn(() => {
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("click", onClick);
      for (const mesh of pickables) scene.remove(mesh);
      stateRef.current = null;
    });
  }, [disposables]);

  useVisibleRaf(containerRef, () => {
    const st = stateRef.current;
    const canvas = canvasRef.current;
    if (!st || !canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      st.renderer.setSize(w, h, false);
      st.camera.aspect = w / h;
      st.camera.updateProjectionMatrix();
    }

    let hit: THREE.Intersection<THREE.Mesh> | undefined;
    if (st.pointerInside) {
      st.raycaster.setFromCamera(st.pointerNdc, st.camera);
      // Target list only, not scene.children: skips lights/helpers every frame.
      hit = st.raycaster.intersectObjects<THREE.Mesh>(st.pickables, false)[0];
    }
    const hitMesh = hit?.object ?? null;

    if (hitMesh !== st.hovered) {
      if (st.hovered) {
        (st.hovered.material as THREE.MeshLambertMaterial).emissive.setHex(0x000000);
      }
      if (hitMesh) {
        (hitMesh.material as THREE.MeshLambertMaterial).emissive.setHex(HOVER_EMISSIVE);
      }
      st.hovered = hitMesh;
    }

    const readout = readoutRef.current;
    if (readout) {
      const ndc = `${st.pointerNdc.x.toFixed(2)}, ${st.pointerNdc.y.toFixed(2)}`;
      const name = hitMesh ? hitMesh.name : L.none;
      const dist = hit ? hit.distance.toFixed(2) : "--";
      readout.textContent = `NDC: ${ndc}   ${L.hit}: ${name}   ${L.dist}: ${dist}`;
    }

    st.renderer.render(st.scene, st.camera);
  });

  return (
    <div className="relative size-full">
      <canvas ref={canvasRef} className="size-full cursor-pointer" />
      <div
        ref={readoutRef}
        className="bg-background/80 text-foreground pointer-events-none absolute bottom-2 left-2 rounded px-2 py-1 font-mono text-xs"
      />
    </div>
  );
}

export default function RaycastingDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        { kind: "boolean", key: "flipY", label: L.flipY, defaultValue: true },
      ]}
    >
      <RaycastGridScene />
    </Demo>
  );
}
