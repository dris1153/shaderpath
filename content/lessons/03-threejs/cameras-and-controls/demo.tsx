"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import {
  booleanOf,
  numberOf,
  stringOf,
} from "@/components/viz/control-schema";
import {
  useDisposable,
  type DisposableRegistry,
} from "@/lib/hooks/use-disposable";
import { useVisibleRaf } from "@/lib/hooks/use-visible-frameloop";

const LABELS = {
  vi: {
    title: "OrbitControls: Perspective ↔ Orthographic",
    damping: "Damping (quán tính)",
    autoRotate: "Tự xoay quanh tâm",
    minPolar: "Góc cực nhỏ nhất (rad)",
    maxPolar: "Góc cực lớn nhất (rad)",
    projection: "Phép chiếu",
    perspective: "Perspective",
    orthographic: "Orthographic",
    pos: "vị trí",
    target: "mục tiêu",
  },
  en: {
    title: "OrbitControls: Perspective ↔ Orthographic",
    damping: "Damping (inertia)",
    autoRotate: "Auto-rotate around target",
    minPolar: "Min polar angle (rad)",
    maxPolar: "Max polar angle (rad)",
    projection: "Projection",
    perspective: "Perspective",
    orthographic: "Orthographic",
    pos: "position",
    target: "target",
  },
} as const;

type Labels = (typeof LABELS)[keyof typeof LABELS];
type ProjectionKind = "perspective" | "orthographic";

const FOV_DEG = 50;
const NEAR = 0.1;
const FAR = 100;
const INITIAL_POSITION = new THREE.Vector3(3.2, 2.6, 5.0);

interface SceneState {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  perspective: THREE.PerspectiveCamera;
  orthographic: THREE.OrthographicCamera;
  controls: OrbitControls;
  active: ProjectionKind;
  orthoHalfHeight: number;
  lastWidth: number;
  lastHeight: number;
}

function orthoHalfHeightFor(distance: number): number {
  return distance * Math.tan((FOV_DEG * Math.PI) / 180 / 2);
}

// Small scene under orbit: an icosahedron core plus a ring of satellites, so
// rotating/panning/zooming has something worth looking at from every angle.
function buildScene(disposables: DisposableRegistry): THREE.Scene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c0d12);
  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
  dirLight.position.set(3, 5, 2);
  scene.add(dirLight);

  const coreGeometry = new THREE.IcosahedronGeometry(1, 0);
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0x5b8def,
    roughness: 0.4,
    metalness: 0.15,
  });
  scene.add(new THREE.Mesh(coreGeometry, coreMaterial));
  disposables.registerFn(() => {
    coreGeometry.dispose();
    coreMaterial.dispose();
  });

  const satGeometry = new THREE.BoxGeometry(0.35, 0.35, 0.35);
  const satMaterial = new THREE.MeshStandardMaterial({
    color: 0xf2a65a,
    roughness: 0.5,
  });
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const box = new THREE.Mesh(satGeometry, satMaterial);
    box.position.set(Math.cos(angle) * 2.4, 0, Math.sin(angle) * 2.4);
    scene.add(box);
  }
  disposables.registerFn(() => {
    satGeometry.dispose();
    satMaterial.dispose();
  });

  const grid = new THREE.GridHelper(8, 8, 0x2a2d3a, 0x1a1c24);
  grid.position.y = -1;
  scene.add(grid);
  disposables.registerFn(() => {
    grid.geometry.dispose();
    (grid.material as THREE.Material).dispose();
  });

  return scene;
}

function CamerasScene({ L }: { L: Labels }) {
  const { values, containerRef } = useDemoContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const disposables = useDisposable();
  const stateRef = useRef<SceneState | null>(null);
  const paramsRef = useRef({
    damping: true,
    autoRotate: false,
    minPolar: 0,
    maxPolar: Math.PI,
    projection: "perspective" as ProjectionKind,
  });

  useEffect(() => {
    paramsRef.current = {
      damping: booleanOf(values, "damping", true),
      autoRotate: booleanOf(values, "autoRotate", false),
      minPolar: numberOf(values, "minPolar", 0),
      maxPolar: numberOf(values, "maxPolar", Math.PI),
      projection: stringOf(values, "projection", "perspective") as ProjectionKind,
    };
  }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    disposables.registerFn(() => renderer.dispose());

    const scene = buildScene(disposables);

    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;
    const aspect = width / height;
    const target = new THREE.Vector3(0, 0, 0);
    const distance = INITIAL_POSITION.length();

    const perspective = new THREE.PerspectiveCamera(FOV_DEG, aspect, NEAR, FAR);
    perspective.position.copy(INITIAL_POSITION);

    const orthoHalfHeight = orthoHalfHeightFor(distance);
    const orthographic = new THREE.OrthographicCamera(
      -orthoHalfHeight * aspect,
      orthoHalfHeight * aspect,
      orthoHalfHeight,
      -orthoHalfHeight,
      NEAR,
      FAR,
    );
    orthographic.position.copy(INITIAL_POSITION);
    orthographic.lookAt(target);

    const controls = new OrbitControls(perspective, canvas);
    controls.target.copy(target);
    controls.update();

    const state: SceneState = {
      renderer,
      scene,
      perspective,
      orthographic,
      controls,
      active: "perspective",
      orthoHalfHeight,
      lastWidth: 0,
      lastHeight: 0,
    };
    stateRef.current = state;

    disposables.registerFn(() => {
      state.controls.dispose();
      stateRef.current = null;
      // No forceContextLoss(): Strict Mode remounts reuse the SAME canvas,
      // and a lost context can never be recreated on it.
    });
  }, [disposables]);

  useVisibleRaf(containerRef, () => {
    const st = stateRef.current;
    const canvas = canvasRef.current;
    if (!st || !canvas) return;

    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;
    if (width !== st.lastWidth || height !== st.lastHeight) {
      st.renderer.setSize(width, height, false);
      const aspect = width / height;
      st.perspective.aspect = aspect;
      st.perspective.updateProjectionMatrix();
      st.orthographic.left = -st.orthoHalfHeight * aspect;
      st.orthographic.right = st.orthoHalfHeight * aspect;
      st.orthographic.updateProjectionMatrix();
      st.lastWidth = width;
      st.lastHeight = height;
    }

    const { damping, autoRotate, minPolar, maxPolar, projection } =
      paramsRef.current;

    // Preserve framing across a projection swap: reuse the current distance
    // to the target so the object doesn't visually jump in size.
    if (projection !== st.active) {
      const from = st.active === "perspective" ? st.perspective : st.orthographic;
      const to = projection === "perspective" ? st.perspective : st.orthographic;
      const distance = from.position.distanceTo(st.controls.target);
      to.position.copy(from.position);
      to.up.copy(from.up);
      to.lookAt(st.controls.target);

      if (to === st.orthographic) {
        const aspect = width / height;
        st.orthoHalfHeight = orthoHalfHeightFor(distance);
        to.left = -st.orthoHalfHeight * aspect;
        to.right = st.orthoHalfHeight * aspect;
        to.top = st.orthoHalfHeight;
        to.bottom = -st.orthoHalfHeight;
      }
      to.updateProjectionMatrix();

      const target = st.controls.target.clone();
      st.controls.dispose();
      const controls = new OrbitControls(to, canvas);
      controls.target.copy(target);
      controls.update();
      st.controls = controls;
      st.active = projection;
    }

    st.controls.enableDamping = damping;
    st.controls.dampingFactor = 0.08;
    st.controls.autoRotate = autoRotate;
    st.controls.autoRotateSpeed = 1.4;
    st.controls.minPolarAngle = Math.min(minPolar, maxPolar);
    st.controls.maxPolarAngle = Math.max(minPolar, maxPolar);
    st.controls.update();

    const activeCamera =
      st.active === "perspective" ? st.perspective : st.orthographic;
    st.renderer.render(st.scene, activeCamera);

    const readout = readoutRef.current;
    if (readout) {
      const p = activeCamera.position;
      const t = st.controls.target;
      readout.textContent =
        `${L.pos} (${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)})  ` +
        `${L.target} (${t.x.toFixed(2)}, ${t.y.toFixed(2)}, ${t.z.toFixed(2)})`;
    }
  });

  return (
    <div className="relative size-full">
      <canvas ref={canvasRef} className="size-full" />
      <div
        ref={readoutRef}
        className="text-muted-foreground pointer-events-none absolute bottom-2 left-2 rounded bg-background/80 px-2 py-1 text-xs font-medium"
      />
    </div>
  );
}

export default function CamerasAndControlsDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        { kind: "boolean", key: "damping", label: L.damping, defaultValue: true },
        {
          kind: "boolean",
          key: "autoRotate",
          label: L.autoRotate,
          defaultValue: false,
        },
        {
          kind: "number",
          key: "minPolar",
          label: L.minPolar,
          min: 0,
          max: Math.PI,
          step: 0.05,
          defaultValue: 0,
        },
        {
          kind: "number",
          key: "maxPolar",
          label: L.maxPolar,
          min: 0,
          max: Math.PI,
          step: 0.05,
          defaultValue: Math.PI,
        },
        {
          kind: "select",
          key: "projection",
          label: L.projection,
          defaultValue: "perspective",
          options: [
            { value: "perspective", label: L.perspective },
            { value: "orthographic", label: L.orthographic },
          ],
        },
      ]}
    >
      <CamerasScene L={L} />
    </Demo>
  );
}
