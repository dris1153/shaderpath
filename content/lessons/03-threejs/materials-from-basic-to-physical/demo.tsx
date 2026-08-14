"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf, stringOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { useVisibleRaf } from "@/lib/hooks/use-visible-frameloop";

const LABELS = {
  vi: {
    title: "Bậc thang material: Basic → Physical",
    material: "Loại material",
    metalness: "Metalness (Standard/Physical)",
    roughness: "Roughness (Standard/Physical)",
    optBasic: "Basic — không ánh sáng",
    optLambert: "Lambert — khuếch tán/vertex",
    optPhong: "Phong — specular/fragment",
    optStandard: "Standard — PBR",
    optPhysical: "Physical — PBR + clearcoat",
  },
  en: {
    title: "Material Ladder: Basic → Physical",
    material: "Material type",
    metalness: "Metalness (Standard/Physical)",
    roughness: "Roughness (Standard/Physical)",
    optBasic: "Basic — unlit",
    optLambert: "Lambert — per-vertex diffuse",
    optPhong: "Phong — per-fragment specular",
    optStandard: "Standard — PBR",
    optPhysical: "Physical — PBR + clearcoat",
  },
} as const;

type MaterialKind = "basic" | "lambert" | "phong" | "standard" | "physical";

// Base color chosen mid-saturation so both diffuse (dielectric) and
// specular (metal) rungs stay legible against the dark background.
const SPHERE_COLOR = 0x4e7cff;

function createMaterial(
  kind: MaterialKind,
  metalness: number,
  roughness: number,
): THREE.Material {
  switch (kind) {
    case "basic":
      return new THREE.MeshBasicMaterial({ color: SPHERE_COLOR });
    case "lambert":
      return new THREE.MeshLambertMaterial({ color: SPHERE_COLOR });
    case "phong":
      return new THREE.MeshPhongMaterial({
        color: SPHERE_COLOR,
        shininess: 70,
      });
    case "standard":
      return new THREE.MeshStandardMaterial({
        color: SPHERE_COLOR,
        metalness,
        roughness,
      });
    case "physical":
      return new THREE.MeshPhysicalMaterial({
        color: SPHERE_COLOR,
        metalness,
        roughness,
        clearcoat: 0.4,
        clearcoatRoughness: 0.2,
      });
  }
}

interface SceneState {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  mesh: THREE.Mesh<THREE.SphereGeometry, THREE.Material>;
  light: THREE.PointLight;
  lastWidth: number;
  lastHeight: number;
  lastDpr: number;
}

// The non-R3F path (spec: Vanilla-Three lessons): imperative THREE on a
// plain <canvas>, cleanup via useDisposable, loop via useVisibleRaf.
function MaterialLadder() {
  const { values, containerRef } = useDemoContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const disposables = useDisposable();
  const stateRef = useRef<SceneState | null>(null);
  const paramsRef = useRef<{
    material: MaterialKind;
    metalness: number;
    roughness: number;
  }>({ material: "standard", metalness: 0.2, roughness: 0.5 });

  // Swap the mesh's material on control change; dispose the orphaned one.
  useEffect(() => {
    paramsRef.current.material = stringOf(
      values,
      "material",
      "standard",
    ) as MaterialKind;
    paramsRef.current.metalness = numberOf(values, "metalness", 0.2);
    paramsRef.current.roughness = numberOf(values, "roughness", 0.5);

    const st = stateRef.current;
    if (!st) return;
    const { material, metalness, roughness } = paramsRef.current;
    const next = createMaterial(material, metalness, roughness);
    const prev = st.mesh.material;
    st.mesh.material = next; // swap first...
    prev.dispose(); // ...then dispose the now-orphaned material
  }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = disposables.register(
      new THREE.WebGLRenderer({ canvas, antialias: true }),
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x14161c);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 4.4);

    const geometry = disposables.register(
      new THREE.SphereGeometry(1.3, 64, 64),
    );
    const { material, metalness, roughness } = paramsRef.current;
    const mesh = new THREE.Mesh<THREE.SphereGeometry, THREE.Material>(
      geometry,
      createMaterial(material, metalness, roughness),
    );
    scene.add(mesh);

    // One light only — MeshBasicMaterial ignoring it entirely IS the lesson.
    const light = new THREE.PointLight(0xffffff, 45);
    light.position.set(3, 2, 3);
    scene.add(light);

    stateRef.current = {
      renderer,
      scene,
      camera,
      mesh,
      light,
      lastWidth: 0,
      lastHeight: 0,
      lastDpr: 0,
    };

    disposables.registerFn(() => {
      stateRef.current?.mesh.material.dispose();
      stateRef.current = null;
    });
  }, [disposables]);

  useVisibleRaf(containerRef, (t) => {
    const st = stateRef.current;
    const canvas = canvasRef.current;
    if (!st || !canvas) return;
    const { renderer, scene, camera, light } = st;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w !== st.lastWidth || h !== st.lastHeight || dpr !== st.lastDpr) {
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
      st.lastWidth = w;
      st.lastHeight = h;
      st.lastDpr = dpr;
    }

    // Slow orbit sweeps the specular highlight across the sphere so the
    // rung differences (or Basic's total lack of reaction) are obvious.
    const angle = t * 0.0006;
    light.position.set(Math.cos(angle) * 3.2, 1.7, Math.sin(angle) * 3.2);

    renderer.render(scene, camera);
  });

  return <canvas ref={canvasRef} className="size-full" />;
}

export default function MaterialsFromBasicToPhysicalDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        {
          kind: "select",
          key: "material",
          label: L.material,
          defaultValue: "standard",
          options: [
            { value: "basic", label: L.optBasic },
            { value: "lambert", label: L.optLambert },
            { value: "phong", label: L.optPhong },
            { value: "standard", label: L.optStandard },
            { value: "physical", label: L.optPhysical },
          ],
        },
        {
          kind: "number",
          key: "metalness",
          label: L.metalness,
          min: 0,
          max: 1,
          step: 0.05,
          defaultValue: 0.2,
        },
        {
          kind: "number",
          key: "roughness",
          label: L.roughness,
          min: 0,
          max: 1,
          step: 0.05,
          defaultValue: 0.5,
        },
      ]}
    >
      <MaterialLadder />
    </Demo>
  );
}
