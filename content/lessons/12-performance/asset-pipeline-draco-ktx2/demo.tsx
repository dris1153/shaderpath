"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf, stringOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { useVisibleRaf } from "@/lib/hooks/use-visible-frameloop";
import {
  EMBEDDED_PIPELINE_CUBE_GLTF,
  EMBEDDED_PIPELINE_CUBE_TRIANGLE_COUNT,
  EMBEDDED_PIPELINE_CUBE_VERTEX_COUNT,
} from "./embedded-pipeline-cube-gltf";

const LABELS = {
  vi: {
    title: "Máy tính pipeline nén: Draco + KTX2",
    vertexCount: "Số vertex",
    textureCount: "Số texture",
    textureSize: "Kích thước texture",
    colGeometry: "Hình học",
    colTextures: "Texture",
    colTotal: "Tổng",
    rowRaw: "Thô",
    rowDraco: "+Draco",
    rowFull: "+Draco+KTX2",
    note: `Bộ 3D bên dưới chỉ là glTF nhúng thật (${EMBEDDED_PIPELINE_CUBE_VERTEX_COUNT} vertex, ${EMBEDDED_PIPELINE_CUBE_TRIANGLE_COUNT} tam giác) parse bằng GLTFLoader.parse() — không liên quan tới slider. Bảng số là máy tính ĐỘC LẬP, dùng công thức ước lượng ở phần lý thuyết, không phải kết quả nén thật.`,
    wiringLabel: "Wiring thật (verified với node_modules/three):",
    loading: "đang parse glTF nhúng…",
    errorPrefix: "Lỗi parse glTF",
  },
  en: {
    title: "Compression Pipeline Calculator: Draco + KTX2",
    vertexCount: "Vertex count",
    textureCount: "Texture count",
    textureSize: "Texture size",
    colGeometry: "Geometry",
    colTextures: "Textures",
    colTotal: "Total",
    rowRaw: "Raw",
    rowDraco: "+Draco",
    rowFull: "+Draco+KTX2",
    note: `The 3D preview below is a real embedded glTF (${EMBEDDED_PIPELINE_CUBE_VERTEX_COUNT} vertices, ${EMBEDDED_PIPELINE_CUBE_TRIANGLE_COUNT} triangles) parsed via GLTFLoader.parse() -- unrelated to the sliders. The table is a SEPARATE calculator using the estimate formulas from the theory, not real compression output.`,
    wiringLabel: "Real wiring (verified against node_modules/three):",
    loading: "parsing the embedded glTF…",
    errorPrefix: "glTF parse error",
  },
} as const;

// Formula-driven estimates only (see theory.mdx for sourcing/derivation) --
// this demo never runs real Draco/KTX2 compression (no binary assets in repo).
const BYTES_PER_VERTEX_RAW = 32; // position(12) + normal(12) + uv(8), float32
const INDEX_BYTES_PER_VERTEX = 3; // ~1.5 index/vertex * 2 bytes (uint16), typical closed mesh
const DRACO_RATIO = 1 / 8; // midpoint of the 5-10x range cited in theory
const KTX2_BITS_PER_PIXEL = 6; // midpoint of the 4-8 bpp range cited in theory
const MIP_TAX = 4 / 3;

function rawGeometryBytes(vertexCount: number) {
  return vertexCount * (BYTES_PER_VERTEX_RAW + INDEX_BYTES_PER_VERTEX);
}
function dracoGeometryBytes(vertexCount: number) {
  return rawGeometryBytes(vertexCount) * DRACO_RATIO;
}
function rawTextureBytes(size: number) {
  return size * size * 4 * MIP_TAX;
}
function ktx2TextureBytes(size: number) {
  return size * size * (KTX2_BITS_PER_PIXEL / 8) * MIP_TAX;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

interface PipelineRow {
  key: "raw" | "draco" | "full";
  geometry: number;
  textures: number;
}

function computeRows(
  vertexCount: number,
  textureCount: number,
  textureSize: number,
): PipelineRow[] {
  const rawGeo = rawGeometryBytes(vertexCount);
  const dracoGeo = dracoGeometryBytes(vertexCount);
  const rawTex = textureCount * rawTextureBytes(textureSize);
  const ktx2Tex = textureCount * ktx2TextureBytes(textureSize);

  return [
    { key: "raw", geometry: rawGeo, textures: rawTex },
    { key: "draco", geometry: dracoGeo, textures: rawTex },
    { key: "full", geometry: dracoGeo, textures: ktx2Tex },
  ];
}

const WIRING_SNIPPET = `const dracoLoader = new DRACOLoader().setDecoderPath("/draco/");
const ktx2Loader = new KTX2Loader()
  .setTranscoderPath("/basis/")
  .detectSupport(renderer); // must run before load()

const loader = new GLTFLoader()
  .setDRACOLoader(dracoLoader)
  .setKTX2Loader(ktx2Loader);

loader.load("/models/product.glb", (gltf) => scene.add(gltf.scene));`;

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
}

// Vanilla-Three path (Track 3 pattern, reused per the Track 12 brief): plain
// <canvas>, imperative THREE setup in an effect, useVisibleRaf drives the
// loop, useDisposable guards cleanup. GLTFLoader.parse() runs the identical
// pipeline a real .glb fetch would use -- only the transport differs.
function EmbeddedCubeViewer({
  onError,
}: {
  onError: (message: string) => void;
}) {
  const { containerRef } = useDemoContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const disposables = useDisposable();
  const stateRef = useRef<SceneState | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f1115);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    camera.position.set(1.6, 1.3, 2.2);
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
      JSON.stringify(EMBEDDED_PIPELINE_CUBE_GLTF),
      "",
      (gltf) => {
        if (cancelled) return;
        gltf.scene.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
          }
        });
        group.add(gltf.scene);
      },
      (err) => {
        if (cancelled) return;
        onError(err instanceof Error ? err.message : String(err));
      },
    );

    stateRef.current = { renderer, scene, camera, group };

    disposables.registerFn(() => {
      cancelled = true;
      stateRef.current = null;
      disposeHierarchy(scene);
      renderer.dispose();
      // No forceContextLoss(): Strict Mode remounts reuse the SAME canvas.
    });
  }, [disposables, onError]);

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
    st.group.rotation.y = t * 0.0003;
    st.renderer.render(st.scene, st.camera);
  });

  return <canvas ref={canvasRef} className="size-full" />;
}

function PipelineCalculatorPanel() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;
  const { values } = useDemoContext();
  const vertexCount = numberOf(values, "vertexCount", 20000);
  const textureCount = numberOf(values, "textureCount", 4);
  const textureSize = Number(stringOf(values, "textureSize", "2048"));

  const rows = useMemo(
    () => computeRows(vertexCount, textureCount, textureSize),
    [vertexCount, textureCount, textureSize],
  );
  const rawTotal = rows[0]!.geometry + rows[0]!.textures;
  const rowLabel: Record<PipelineRow["key"], string> = {
    raw: L.rowRaw,
    draco: L.rowDraco,
    full: L.rowFull,
  };

  return (
    <div className="absolute inset-x-3 top-3 rounded-lg border bg-background/85 p-3 font-mono text-xs backdrop-blur-sm">
      <div className="grid grid-cols-4 items-baseline gap-x-3 gap-y-1">
        <span />
        <span className="text-muted-foreground">{L.colGeometry}</span>
        <span className="text-muted-foreground">{L.colTextures}</span>
        <span className="text-muted-foreground">{L.colTotal}</span>
        {rows.map((row) => {
          const total = row.geometry + row.textures;
          const reduction = rawTotal > 0 ? Math.round((1 - total / rawTotal) * 100) : 0;
          return (
            <Fragment key={row.key}>
              <span>{rowLabel[row.key]}</span>
              <span>{formatBytes(row.geometry)}</span>
              <span>{formatBytes(row.textures)}</span>
              <span>
                {formatBytes(total)}
                {row.key !== "raw" && ` (-${reduction}%)`}
              </span>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default function AssetPipelineDracoKtx2Demo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;
  const [error, setError] = useState<string | null>(null);

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        {
          kind: "number",
          key: "vertexCount",
          label: L.vertexCount,
          min: 500,
          max: 200000,
          step: 500,
          defaultValue: 20000,
        },
        {
          kind: "number",
          key: "textureCount",
          label: L.textureCount,
          min: 1,
          max: 12,
          step: 1,
          defaultValue: 4,
        },
        {
          kind: "select",
          key: "textureSize",
          label: L.textureSize,
          defaultValue: "2048",
          options: [
            { value: "512", label: "512" },
            { value: "1024", label: "1024" },
            { value: "2048", label: "2048" },
            { value: "4096", label: "4096" },
          ],
        },
      ]}
    >
      <div className="relative size-full">
        <EmbeddedCubeViewer onError={setError} />
        <PipelineCalculatorPanel />
        <div className="absolute inset-x-3 bottom-3 max-h-[46%] space-y-2 overflow-y-auto rounded-lg border bg-background/85 p-3 text-xs backdrop-blur-sm">
          {error && (
            <div className="text-destructive">
              {L.errorPrefix}: {error}
            </div>
          )}
          <div className="text-muted-foreground">{L.note}</div>
          <div>{L.wiringLabel}</div>
          <pre className="overflow-x-auto font-mono whitespace-pre">{WIRING_SNIPPET}</pre>
        </div>
      </div>
    </Demo>
  );
}
