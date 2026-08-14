"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { useVisibleRaf } from "@/lib/hooks/use-visible-frameloop";

const LABELS = {
  vi: {
    title: "Scene, Camera & Renderer — vòng lặp render là của bạn",
    fov: "fov (°)",
    distance: "Khoảng cách camera",
    mapping:
      "renderer sở hữu context (Track 1: gl.getContext) · render() duyệt scene, gọi gl.draw* cho mesh (Track 1: bạn từng gọi tay)",
  },
  en: {
    title: "Scene, Camera & Renderer — the render loop is yours",
    fov: "fov (°)",
    distance: "Camera distance",
    mapping:
      "renderer owns the context (Track 1: gl.getContext) · render() walks the scene, calling gl.draw* per mesh (Track 1: you called this by hand)",
  },
} as const;

type Labels = (typeof LABELS)[keyof typeof LABELS];

interface SceneState {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  mesh: THREE.Mesh;
}

// The vanilla-Three path (Track 3): imperative `new THREE.WebGLRenderer`
// on a plain <canvas>, no React reconciler. Cleanup via useDisposable
// (§8.2), the render loop via useVisibleRaf (§8.3) — Three never loops on
// its own, exactly the point this lesson makes.
function SceneCameraRenderer({ L }: { L: Labels }) {
  const { values, containerRef } = useDemoContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const disposables = useDisposable();
  const stateRef = useRef<SceneState | null>(null);
  const paramsRef = useRef({ fov: 50, distance: 4 });
  const prevFovRef = useRef(50);

  useEffect(() => {
    paramsRef.current.fov = numberOf(values, "fov", 50);
    paramsRef.current.distance = numberOf(values, "distance", 4);
  }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 4);

    // MeshNormalMaterial needs no light — materials/lighting arrive in
    // later lessons of this module.
    const geometry = new THREE.BoxGeometry(1.3, 1.3, 1.3);
    const material = new THREE.MeshNormalMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    stateRef.current = { renderer, scene, camera, mesh };

    disposables.registerFn(() => {
      stateRef.current = null;
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      // No forceContextLoss(): Strict Mode remounts reuse the SAME canvas,
      // and a lost context can never be recreated on it.
    });
  }, [disposables]);

  useVisibleRaf(containerRef, (t) => {
    const st = stateRef.current;
    const canvas = canvasRef.current;
    const readout = readoutRef.current;
    if (!st || !canvas) return;
    const { renderer, scene, camera, mesh } = st;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    const w = Math.max(1, Math.round(cssW * dpr));
    const h = Math.max(1, Math.round(cssH * dpr));
    const sizeChanged = canvas.width !== w || canvas.height !== h;
    if (sizeChanged) {
      // updateStyle=false: Tailwind's size-full already controls the CSS
      // box; the renderer only needs to own the drawing buffer resolution.
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
    }

    const { fov, distance } = paramsRef.current;
    if (sizeChanged || fov !== prevFovRef.current) {
      camera.fov = fov;
      // §mistake 1: aspect/fov are plain fields — nothing recomputes P
      // without this call.
      camera.updateProjectionMatrix();
      prevFovRef.current = fov;
    }
    camera.position.z = distance;

    mesh.rotation.x = t * 0.0003;
    mesh.rotation.y = t * 0.0006;

    // Exactly one frame — the requestAnimationFrame loop above is ours,
    // not Three's.
    renderer.render(scene, camera);

    if (readout) {
      readout.textContent =
        `fov ${fov.toFixed(0)}° · distance ${distance.toFixed(1)} · aspect ${(w / h).toFixed(2)} · buffer ${w}×${h} @ dpr ${dpr.toFixed(1)}\n` +
        L.mapping;
    }
  });

  return (
    <div className="relative size-full">
      <canvas ref={canvasRef} className="size-full" />
      <div
        ref={readoutRef}
        className="text-muted-foreground pointer-events-none absolute inset-x-2 bottom-2 rounded bg-background/80 px-2 py-1 text-xs leading-relaxed font-medium whitespace-pre-line"
      />
    </div>
  );
}

export default function SceneCameraRendererDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        {
          kind: "number",
          key: "fov",
          label: L.fov,
          min: 20,
          max: 110,
          step: 1,
          defaultValue: 50,
        },
        {
          kind: "number",
          key: "distance",
          label: L.distance,
          min: 2,
          max: 10,
          step: 0.1,
          defaultValue: 4,
        },
      ]}
    >
      <SceneCameraRenderer L={L} />
    </Demo>
  );
}
