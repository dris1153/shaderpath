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
    title: "Shadow Lab — góc sáng, bias & mapSize",
    angle: "Góc sáng (độ)",
    bias: "shadow.bias",
    mapSize: "shadow.mapSize",
    hint: "Bias = 0 ở góc sáng thấp lộ ngay shadow acne trên quả cầu; kéo bias lên quá cao thì bóng của khối hộp tách khỏi chân — đó là peter-panning.",
  },
  en: {
    title: "Shadow Lab — Light Angle, Bias & Map Size",
    angle: "Light angle (deg)",
    bias: "shadow.bias",
    mapSize: "shadow.mapSize",
    hint: "bias = 0 at a low light angle exposes shadow acne on the sphere right away; push bias too high and the box's shadow detaches from its base — that's peter-panning.",
  },
} as const;

// Fixed azimuth so only elevation (the "angle" slider) moves the light —
// keeps the acne/peter-panning artifacts easy to reason about.
const AZIMUTH = 0.6;
const LIGHT_DIST = 10;

interface SceneState {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  light: THREE.DirectionalLight;
}

// Vanilla Three.js, no R3F (Track 3 teaches the raw API): scene built by
// hand in an effect, rendered via useVisibleRaf, cleaned up via useDisposable.
function ShadowLab() {
  const { values, containerRef } = useDemoContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const disposables = useDisposable();
  const stateRef = useRef<SceneState | null>(null);
  const lastMapSizeRef = useRef(1024);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(1); // sizing loop below already bakes DPR into width/height
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x11151c);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    camera.position.set(4.5, 3.6, 6.5);
    camera.lookAt(0, 0.6, 0);

    const ambient = new THREE.AmbientLight(0x445066, 0.45);
    scene.add(ambient);

    const light = new THREE.DirectionalLight(0xfff2df, 2.4);
    light.castShadow = true;
    light.shadow.mapSize.set(lastMapSizeRef.current, lastMapSizeRef.current);
    light.shadow.camera.left = -5;
    light.shadow.camera.right = 5;
    light.shadow.camera.top = 5;
    light.shadow.camera.bottom = -5;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 25;
    light.shadow.camera.updateProjectionMatrix();
    scene.add(light);
    scene.add(light.target);

    const groundGeo = new THREE.PlaneGeometry(14, 14);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x8891a3,
      roughness: 0.95,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Sphere: the classic acne demonstrator — its curved surface self-shadows
    // at grazing light angles, unlike a box's flat faces.
    const sphereGeo = new THREE.SphereGeometry(1, 48, 32);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xe0522f,
      roughness: 0.5,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.set(-1.5, 1, 0);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);

    // Box: sharp edges make a peter-panning gap between shadow and base obvious.
    const boxGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0x3fa7d6,
      roughness: 0.6,
    });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(1.7, 0.7, -0.5);
    box.castShadow = true;
    box.receiveShadow = true;
    scene.add(box);

    disposables.register(renderer);
    disposables.register(groundGeo);
    disposables.register(groundMat);
    disposables.register(sphereGeo);
    disposables.register(sphereMat);
    disposables.register(boxGeo);
    disposables.register(boxMat);
    disposables.registerFn(() => {
      light.shadow.map?.dispose();
      stateRef.current = null;
    });

    stateRef.current = { renderer, scene, camera, light };
  }, [disposables]);

  // Apply control values imperatively — the effect above always runs first
  // on mount (declared earlier), so stateRef.current exists by the time this fires.
  useEffect(() => {
    const st = stateRef.current;
    if (!st) return;

    const angleDeg = numberOf(values, "angle", 20);
    const bias = numberOf(values, "bias", 0);
    const mapSize = Number(stringOf(values, "mapSize", "1024"));

    const elevRad = (angleDeg * Math.PI) / 180;
    st.light.position.set(
      LIGHT_DIST * Math.cos(elevRad) * Math.cos(AZIMUTH),
      LIGHT_DIST * Math.sin(elevRad) + 0.5,
      LIGHT_DIST * Math.cos(elevRad) * Math.sin(AZIMUTH),
    );
    st.light.shadow.bias = bias;

    if (mapSize !== lastMapSizeRef.current) {
      lastMapSizeRef.current = mapSize;
      st.light.shadow.mapSize.set(mapSize, mapSize);
      // Existing render target is sized for the old mapSize — dispose so
      // WebGLShadowMap recreates it at the new resolution next frame.
      st.light.shadow.map?.dispose();
      st.light.shadow.map = null;
    }
  }, [values]);

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
    st.renderer.render(st.scene, st.camera);
  });

  return <canvas ref={canvasRef} className="size-full" />;
}

export default function LightsAndShadowMapsDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        {
          kind: "number",
          key: "angle",
          label: L.angle,
          min: 8,
          max: 80,
          step: 1,
          defaultValue: 20,
        },
        {
          kind: "number",
          key: "bias",
          label: L.bias,
          min: -0.01,
          max: 0.01,
          step: 0.0005,
          defaultValue: 0,
        },
        {
          kind: "select",
          key: "mapSize",
          label: L.mapSize,
          defaultValue: "1024",
          options: [
            { value: "512", label: "512" },
            { value: "1024", label: "1024" },
            { value: "2048", label: "2048" },
          ],
        },
      ]}
    >
      <div className="relative size-full">
        <ShadowLab />
        <div className="absolute inset-x-3 bottom-3 rounded-lg border bg-background/85 px-3 py-1.5 text-xs">
          {L.hint}
        </div>
      </div>
    </Demo>
  );
}
