"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { useVisibleRaf } from "@/lib/hooks/use-visible-frameloop";
import { EMBEDDED_COLOR_CUBE_GLTF } from "./embedded-color-cube-gltf";

const LABELS = {
  vi: {
    title: "GLTFLoader.parse() trên một glTF nhúng sẵn",
    wireframe: "Wireframe",
    loading: "đang parse glTF…",
    errorPrefix: "Lỗi nạp glTF",
    hint: "JSON glTF (24 vertex, 36 index, 1 material vertex-color) nằm ngay trong file .ts cạnh demo này — không có request mạng nào. Draco/meshopt nén thật chỉ có ý nghĩa với asset thật, xem phần lý thuyết.",
  },
  en: {
    title: "GLTFLoader.parse() on an Embedded glTF",
    wireframe: "Wireframe",
    loading: "parsing glTF…",
    errorPrefix: "GLTF load error",
    hint: "The glTF JSON (24 vertices, 36 indices, 1 vertex-color material) lives right in the .ts file next to this demo — zero network requests. Real Draco/meshopt compression only pays off with real assets — see the theory.",
  },
} as const;

interface NodeRow {
  depth: number;
  type: string;
  name: string;
  detail?: string;
}

function collectNodeRows(
  root: THREE.Object3D,
  depth = 0,
  out: NodeRow[] = [],
): NodeRow[] {
  let detail: string | undefined;
  if (root instanceof THREE.Mesh) {
    const geometry = root.geometry;
    const vertexCount = geometry.attributes.position?.count ?? 0;
    const triCount = geometry.index ? geometry.index.count / 3 : vertexCount / 3;
    detail = `${vertexCount} verts / ${triCount} tris`;
  }
  out.push({ depth, type: root.type, name: root.name || "(unnamed)", detail });
  for (const child of root.children) collectNodeRows(child, depth + 1, out);
  return out;
}

// Same traverse+dispose shape taught in theory.mdx — reused verbatim by the checkpoint.
function disposeHierarchy(root: THREE.Object3D) {
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    obj.geometry.dispose();
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const material of materials) {
      for (const key of Object.keys(material)) {
        const value = (material as unknown as Record<string, unknown>)[key];
        if (value && typeof value === "object" && "isTexture" in value) {
          (value as THREE.Texture).dispose();
        }
      }
      material.dispose();
    }
  });
}

interface SceneState {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  group: THREE.Object3D;
  materials: THREE.Material[];
}

// The vanilla-Three path (Track 3 rule): plain <canvas>, imperative THREE
// setup in an effect, useVisibleRaf drives the loop, useDisposable guards
// cleanup. GLTFLoader.parse() runs the identical pipeline a real .glb fetch
// would use — only the transport differs (inline string vs. network request).
function GltfCubeViewer() {
  const { values, containerRef } = useDemoContext();
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const disposables = useDisposable();
  const stateRef = useRef<SceneState | null>(null);
  const paramsRef = useRef({ wireframe: false });

  const [rows, setRows] = useState<NodeRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    paramsRef.current.wireframe = booleanOf(values, "wireframe", false);
  }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f1115);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 50);
    camera.position.set(1.6, 1.3, 2.1);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(3, 4, 2);
    scene.add(dirLight);

    const group = new THREE.Group();
    scene.add(group);

    let cancelled = false;
    const loader = new GLTFLoader();
    loader.parse(
      JSON.stringify(EMBEDDED_COLOR_CUBE_GLTF),
      "",
      (gltf) => {
        if (cancelled) return;
        const materials: THREE.Material[] = [];
        // Objective: traverse gltf.scene to enable shadows and collect nodes by name.
        gltf.scene.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            materials.push(...mats);
          }
        });
        group.add(gltf.scene);
        stateRef.current = { renderer, scene, camera, group, materials };
        setRows(collectNodeRows(gltf.scene));
      },
      (err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
      },
    );

    disposables.registerFn(() => {
      cancelled = true;
      stateRef.current = null;
      disposeHierarchy(scene);
      renderer.dispose();
      // No forceContextLoss(): Strict Mode remounts reuse the SAME canvas.
    });
  }, [disposables]);

  useVisibleRaf(containerRef, (t) => {
    const st = stateRef.current;
    const canvas = canvasRef.current;
    if (!st || !canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      st.renderer.setSize(w, h, false);
      st.camera.aspect = w / h;
      st.camera.updateProjectionMatrix();
    }

    for (const material of st.materials) {
      if ("wireframe" in material) {
        (material as THREE.MeshStandardMaterial).wireframe = paramsRef.current.wireframe;
      }
    }
    st.group.rotation.y = t * 0.0004;
    st.renderer.render(st.scene, st.camera);
  });

  return (
    <div className="relative size-full">
      <canvas ref={canvasRef} className="size-full" />
      <div className="absolute inset-x-3 top-3 max-h-[55%] space-y-1 overflow-y-auto rounded-lg border bg-background/85 p-3 font-mono text-xs backdrop-blur-sm">
        {error && <div className="text-destructive">{L.errorPrefix}: {error}</div>}
        {!error && !rows && <div>{L.loading}</div>}
        {rows?.map((row, i) => (
          <div key={i} style={{ paddingLeft: row.depth * 12 }}>
            <span className="text-muted-foreground">{row.type}</span>{" "}
            <span>{row.name}</span>
            {row.detail && (
              <span className="text-muted-foreground"> — {row.detail}</span>
            )}
          </div>
        ))}
      </div>
      <div className="absolute inset-x-3 bottom-3 rounded-lg border bg-background/85 px-3 py-1.5 text-xs">
        {L.hint}
      </div>
    </div>
  );
}

export default function LoadingGltfDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        { kind: "boolean", key: "wireframe", label: L.wireframe, defaultValue: false },
      ]}
    >
      <GltfCubeViewer />
    </Demo>
  );
}
