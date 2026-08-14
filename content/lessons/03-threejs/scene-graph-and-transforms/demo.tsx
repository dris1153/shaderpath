"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf } from "@/components/viz/control-schema";
import {
  useDisposable,
  type DisposableRegistry,
} from "@/lib/hooks/use-disposable";
import { useVisibleRaf } from "@/lib/hooks/use-visible-frameloop";

const LABELS = {
  vi: {
    title: "Hệ mặt trời mini: Group làm pivot",
    sunSpin: "Mặt Trời quay (kéo quỹ đạo hành tinh theo)",
    planetSpin: "Hành tinh tự quay (kéo khung quỹ đạo mặt trăng theo)",
    moonSpin: "Mặt Trăng quay quanh hành tinh",
    moonAroundSun: "Mặt Trăng bay thẳng quanh Mặt Trời (attach)",
    local: "local",
    world: "world",
  },
  en: {
    title: "Mini Solar System: Groups as Pivots",
    sunSpin: "Sun spin (drags the planet's orbit along)",
    planetSpin: "Planet's own spin (drags the moon's orbit frame along)",
    moonSpin: "Moon orbiting the planet",
    moonAroundSun: "Moon orbits the Sun directly instead (attach)",
    local: "local",
    world: "world",
  },
} as const;

type Labels = (typeof LABELS)[keyof typeof LABELS];

interface SceneState {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  sun: THREE.Mesh;
  planetGroup: THREE.Group;
  moonGroup: THREE.Group;
  moon: THREE.Mesh;
  moonAroundSun: boolean;
  lastWidth: number;
  lastHeight: number;
  lastTime: number;
}

// Reused every frame for getWorldPosition — the allocation-free pattern the
// theory calls out (Object3D APIs never allocate a Vector3 for you).
const worldScratch = new THREE.Vector3();

// sun -> planetGroup (orbit pivot, holds planet + moonGroup) -> moonGroup ->
// moon. Three levels, three sliders, one rotation each.
function buildScene(disposables: DisposableRegistry) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07080d);
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
  dirLight.position.set(4, 6, 3);
  scene.add(dirLight);

  const sunGeometry = new THREE.SphereGeometry(0.8, 24, 16);
  const sunMaterial = new THREE.MeshStandardMaterial({
    color: 0xffcf6b,
    emissive: 0xff9d1f,
    emissiveIntensity: 0.55,
    roughness: 0.4,
  });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sun);
  disposables.registerFn(() => {
    sunGeometry.dispose();
    sunMaterial.dispose();
  });

  const planetGroup = new THREE.Group();
  planetGroup.position.set(3, 0, 0);
  sun.add(planetGroup);

  const planetGeometry = new THREE.SphereGeometry(0.4, 20, 14);
  const planetMaterial = new THREE.MeshStandardMaterial({
    color: 0x5b8def,
    roughness: 0.6,
  });
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  planetGroup.add(planet);
  disposables.registerFn(() => {
    planetGeometry.dispose();
    planetMaterial.dispose();
  });

  const moonGroup = new THREE.Group();
  planetGroup.add(moonGroup);

  const moonGeometry = new THREE.SphereGeometry(0.15, 16, 12);
  const moonMaterial = new THREE.MeshStandardMaterial({
    color: 0xcfcfcf,
    roughness: 0.8,
  });
  const moon = new THREE.Mesh(moonGeometry, moonMaterial);
  moon.position.set(1.0, 0, 0);
  moonGroup.add(moon);
  disposables.registerFn(() => {
    moonGeometry.dispose();
    moonMaterial.dispose();
  });

  return { scene, sun, planetGroup, moonGroup, moon };
}

function SolarSystemScene({ L }: { L: Labels }) {
  const { values, containerRef } = useDemoContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const disposables = useDisposable();
  const stateRef = useRef<SceneState | null>(null);
  const paramsRef = useRef({
    sunSpin: 0.4,
    planetSpin: 0.6,
    moonSpin: 1.2,
    moonAroundSun: false,
  });

  useEffect(() => {
    paramsRef.current = {
      sunSpin: numberOf(values, "sunSpin", 0.4),
      planetSpin: numberOf(values, "planetSpin", 0.6),
      moonSpin: numberOf(values, "moonSpin", 1.2),
      moonAroundSun: booleanOf(values, "moonAroundSun", false),
    };
  }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    disposables.registerFn(() => renderer.dispose());

    const { scene, sun, planetGroup, moonGroup, moon } = buildScene(disposables);

    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 5, 8.5);
    camera.lookAt(0, 0, 0);

    stateRef.current = {
      renderer,
      scene,
      camera,
      sun,
      planetGroup,
      moonGroup,
      moon,
      moonAroundSun: false,
      lastWidth: 0,
      lastHeight: 0,
      lastTime: 0,
    };

    disposables.registerFn(() => {
      stateRef.current = null;
      // No forceContextLoss(): Strict Mode remounts reuse the SAME canvas,
      // and a lost context can never be recreated on it.
    });
  }, [disposables]);

  useVisibleRaf(containerRef, (t) => {
    const st = stateRef.current;
    const canvas = canvasRef.current;
    if (!st || !canvas) return;

    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;
    if (width !== st.lastWidth || height !== st.lastHeight) {
      st.renderer.setSize(width, height, false);
      st.camera.aspect = width / height;
      st.camera.updateProjectionMatrix();
      st.lastWidth = width;
      st.lastHeight = height;
    }

    const dt = st.lastTime ? Math.min((t - st.lastTime) / 1000, 0.1) : 0;
    st.lastTime = t;

    const { sunSpin, planetSpin, moonSpin, moonAroundSun } = paramsRef.current;
    st.sun.rotation.y += sunSpin * dt;
    st.planetGroup.rotation.y += planetSpin * dt;
    st.moonGroup.rotation.y += moonSpin * dt;

    // attach() reparents while preserving matrixWorld: the moon's world
    // position doesn't jump, only which pivot it orbits changes going forward.
    if (moonAroundSun !== st.moonAroundSun) {
      if (moonAroundSun) {
        st.sun.attach(st.moon);
      } else {
        st.moonGroup.attach(st.moon);
      }
      st.moonAroundSun = moonAroundSun;
    }

    st.renderer.render(st.scene, st.camera);

    const readout = readoutRef.current;
    if (readout) {
      const world = st.moon.getWorldPosition(worldScratch);
      const local = st.moon.position;
      readout.textContent =
        `${L.local} (${local.x.toFixed(2)}, ${local.y.toFixed(2)}, ${local.z.toFixed(2)})  ` +
        `${L.world} (${world.x.toFixed(2)}, ${world.y.toFixed(2)}, ${world.z.toFixed(2)})`;
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

export default function SceneGraphAndTransformsDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        {
          kind: "number",
          key: "sunSpin",
          label: L.sunSpin,
          min: -2,
          max: 2,
          step: 0.05,
          defaultValue: 0.4,
        },
        {
          kind: "number",
          key: "planetSpin",
          label: L.planetSpin,
          min: -2,
          max: 2,
          step: 0.05,
          defaultValue: 0.6,
        },
        {
          kind: "number",
          key: "moonSpin",
          label: L.moonSpin,
          min: -2,
          max: 2,
          step: 0.05,
          defaultValue: 1.2,
        },
        {
          kind: "boolean",
          key: "moonAroundSun",
          label: L.moonAroundSun,
          defaultValue: false,
        },
      ]}
    >
      <SolarSystemScene L={L} />
    </Demo>
  );
}
