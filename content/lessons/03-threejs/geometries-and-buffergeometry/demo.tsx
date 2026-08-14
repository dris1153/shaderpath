"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf, stringOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { useVisibleRaf } from "@/lib/hooks/use-visible-frameloop";

const LABELS = {
  vi: {
    title: "Geometry & BufferGeometry — cùng một loại dữ liệu attribute",
    shape: "Hình dạng",
    shapeBox: "Box (built-in)",
    shapeSphere: "Sphere (built-in)",
    shapePlane: "Plane (built-in)",
    shapeTorus: "Torus (built-in)",
    shapePyramid: "Kim tự tháp (tự dựng tay)",
    wireframe: "Wireframe",
    segments: "Segments (bỏ qua với kim tự tháp)",
    vertexLabel: "vertex (buffer)",
    triLabel: "tam giác",
    reuseLabel: "index dùng lại",
    times: "lần",
  },
  en: {
    title: "Geometry & BufferGeometry — the same attribute data underneath",
    shape: "Shape",
    shapeBox: "Box (built-in)",
    shapeSphere: "Sphere (built-in)",
    shapePlane: "Plane (built-in)",
    shapeTorus: "Torus (built-in)",
    shapePyramid: "Pyramid (hand-built)",
    wireframe: "Wireframe",
    segments: "Segments (ignored for the pyramid)",
    vertexLabel: "buffer vertices",
    triLabel: "triangles",
    reuseLabel: "index reused",
    times: "×",
  },
} as const;

type Labels = (typeof LABELS)[keyof typeof LABELS];

/** Same formula as Track 0's dot/cross lesson: cross of two edges, normalized. */
function faceNormal(
  a: THREE.Vector3,
  b: THREE.Vector3,
  c: THREE.Vector3,
): THREE.Vector3 {
  const ab = new THREE.Vector3().subVectors(b, a);
  const ac = new THREE.Vector3().subVectors(c, a);
  return ab.cross(ac).normalize();
}

// A square pyramid built by hand: 5 geometric corners, but flat shading
// forces 16 buffer entries (12 side, unshareable + 4 base, shared) — the
// exact numbers this lesson's theory walks through.
function createPyramidGeometry(): THREE.BufferGeometry {
  const apex = new THREE.Vector3(0, 0.9, 0);
  const b0 = new THREE.Vector3(-0.6, -0.5, 0.6);
  const b1 = new THREE.Vector3(0.6, -0.5, 0.6);
  const b2 = new THREE.Vector3(0.6, -0.5, -0.6);
  const b3 = new THREE.Vector3(-0.6, -0.5, -0.6);

  const sides: [THREE.Vector3, THREE.Vector3, THREE.Vector3][] = [
    [b0, b1, apex],
    [b1, b2, apex],
    [b2, b3, apex],
    [b3, b0, apex],
  ];

  const positions: number[] = [];
  const normals: number[] = [];

  // 4 side faces: 12 entries, none shareable — every face has its own
  // slanted normal, even where a position coincides with a neighbor face.
  for (const [p0, p1, p2] of sides) {
    const n = faceNormal(p0, p1, p2);
    for (const p of [p0, p1, p2]) {
      positions.push(p.x, p.y, p.z);
      normals.push(n.x, n.y, n.z);
    }
  }

  // Base: flat, so all 4 corners share exactly ONE normal — these 4
  // entries (indices 12..15) are what setIndex below actually reuses.
  const baseNormal = faceNormal(b0, b2, b1);
  for (const p of [b0, b1, b2, b3]) {
    positions.push(p.x, p.y, p.z);
    normals.push(baseNormal.x, baseNormal.y, baseNormal.z);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(positions), 3),
  );
  geometry.setAttribute(
    "normal",
    new THREE.BufferAttribute(new Float32Array(normals), 3),
  );
  // 6 triangles × 3 = 18 indices. Sides (0..11) never repeat an index —
  // base triangles reuse corners 12(b0) and 14(b2), the only pair that
  // shares a normal.
  geometry.setIndex([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 13, 12, 15, 14,
  ]);
  return geometry;
}

function buildGeometry(shape: string, segments: number): THREE.BufferGeometry {
  switch (shape) {
    case "box":
      return new THREE.BoxGeometry(1, 1, 1, segments, segments, segments);
    case "sphere":
      return new THREE.SphereGeometry(
        0.65,
        Math.max(3, segments),
        Math.max(2, Math.round(segments / 2)),
      );
    case "plane":
      return new THREE.PlaneGeometry(1.3, 1.3, segments, segments);
    case "torus":
      return new THREE.TorusGeometry(
        0.5,
        0.22,
        Math.max(3, Math.round(segments / 2)),
        Math.max(3, segments),
      );
    default:
      return createPyramidGeometry();
  }
}

interface SceneState {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  mesh: THREE.Mesh;
  material: THREE.MeshNormalMaterial;
}

// The vanilla-Three path (Track 3): plain <canvas>, imperative scene setup.
// Geometry is rebuilt (and the OLD one disposed) only when shape/segments
// actually change — the exact geometry.dispose() lesson this file teaches.
function GeometryPlayground({ L }: { L: Labels }) {
  const { values, containerRef } = useDemoContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const disposables = useDisposable();
  const stateRef = useRef<SceneState | null>(null);

  const shape = stringOf(values, "shape", "pyramid");
  const segments = numberOf(values, "segments", 8);
  const wireframe = booleanOf(values, "wireframe", false);

  // Mount once: renderer/scene/camera/material are stable across control
  // changes — only the geometry gets swapped.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(1.6, 1.3, 2.6);
    camera.lookAt(0, 0, 0);

    const material = new THREE.MeshNormalMaterial();
    const geometry = createPyramidGeometry();
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    stateRef.current = { renderer, scene, camera, mesh, material };

    disposables.registerFn(() => {
      const st = stateRef.current;
      stateRef.current = null;
      st?.mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
      // No forceContextLoss(): Strict Mode remounts reuse the SAME canvas.
    });
  }, [disposables]);

  // Rebuild geometry only when shape/segments change — dispose the old
  // buffer before swapping in the new one (§ this lesson's mistake #1).
  useEffect(() => {
    const st = stateRef.current;
    if (!st) return;

    const geometry = buildGeometry(shape, segments);
    const old = st.mesh.geometry;
    st.mesh.geometry = geometry;
    old.dispose();

    const vertexCount = geometry.attributes.position?.count ?? 0;
    const triangleCount = geometry.index
      ? geometry.index.count / 3
      : vertexCount / 3;
    const indexCount = geometry.index?.count ?? triangleCount * 3;
    const reused = Math.max(0, indexCount - vertexCount);

    const readout = readoutRef.current;
    if (readout) {
      readout.textContent = `${vertexCount} ${L.vertexLabel} · ${triangleCount} ${L.triLabel} · ${L.reuseLabel} ${reused} ${L.times}`;
    }
  }, [shape, segments, L]);

  useEffect(() => {
    const st = stateRef.current;
    if (st) st.material.wireframe = wireframe;
  }, [wireframe]);

  useVisibleRaf(containerRef, (t) => {
    const st = stateRef.current;
    const canvas = canvasRef.current;
    if (!st || !canvas) return;
    const { renderer, scene, camera, mesh } = st;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    mesh.rotation.y = t * 0.0004;

    renderer.render(scene, camera);
  });

  return (
    <div className="relative size-full">
      <canvas ref={canvasRef} className="size-full" />
      <div
        ref={readoutRef}
        className="text-muted-foreground pointer-events-none absolute inset-x-2 bottom-2 rounded bg-background/80 px-2 py-1 text-xs font-medium"
      />
    </div>
  );
}

export default function GeometriesAndBufferGeometryDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        {
          kind: "select",
          key: "shape",
          label: L.shape,
          defaultValue: "pyramid",
          options: [
            { value: "box", label: L.shapeBox },
            { value: "sphere", label: L.shapeSphere },
            { value: "plane", label: L.shapePlane },
            { value: "torus", label: L.shapeTorus },
            { value: "pyramid", label: L.shapePyramid },
          ],
        },
        {
          kind: "number",
          key: "segments",
          label: L.segments,
          min: 2,
          max: 24,
          step: 1,
          defaultValue: 8,
        },
        {
          kind: "boolean",
          key: "wireframe",
          label: L.wireframe,
          defaultValue: false,
        },
      ]}
    >
      <GeometryPlayground L={L} />
    </Demo>
  );
}
