"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf, stringOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { useVisibleRaf } from "@/lib/hooks/use-visible-frameloop";

const LABELS = {
  vi: {
    title: "Road Texture Lab — filter, wrap & anisotropy",
    filter: "Filter mode",
    filterNearest: "Nearest (không mip)",
    filterLinear: "Linear (không mip)",
    filterMip: "Trilinear (có mip)",
    wrap: "Wrap mode",
    wrapRepeat: "Repeat",
    wrapClamp: "Clamp to edge",
    wrapMirror: "Mirrored repeat",
    aniso: "Anisotropy",
    resolution: "Độ phân giải",
    vram: "VRAM ước lượng",
    anisoActual: "Anisotropy thực nhận",
    hint: "Nghiêng thấp về đường chân trời: không mip thì nhiễu lấp lánh, có mip mà anisotropy=1 thì mờ nhoè dọc mặt đường — kéo anisotropy lên để thấy nét trở lại.",
  },
  en: {
    title: "Road Texture Lab — Filter, Wrap & Anisotropy",
    filter: "Filter mode",
    filterNearest: "Nearest (no mip)",
    filterLinear: "Linear (no mip)",
    filterMip: "Trilinear (mipmapped)",
    wrap: "Wrap mode",
    wrapRepeat: "Repeat",
    wrapClamp: "Clamp to edge",
    wrapMirror: "Mirrored repeat",
    aniso: "Anisotropy",
    resolution: "Resolution",
    vram: "Estimated VRAM",
    anisoActual: "Actual anisotropy applied",
    hint: "At this shallow angle toward the horizon: no mip means sparkly aliasing, mip with anisotropy=1 blurs along the road — raise anisotropy to bring it back into focus.",
  },
} as const;

const TEXTURE_SIZE = 512;

// Procedural — no binary assets in the repo. A checker + dashed centerline
// drawn on an off-DOM canvas, read as a CanvasTexture (never attached to the DOM).
function drawRoadPattern(canvas: HTMLCanvasElement) {
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const tiles = 8;
  const cell = TEXTURE_SIZE / tiles;
  for (let y = 0; y < tiles; y++) {
    for (let x = 0; x < tiles; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? "#3a3f4a" : "#20242c";
      ctx.fillRect(x * cell, y * cell, cell, cell);
    }
  }

  ctx.strokeStyle = "#e8c34a";
  ctx.lineWidth = TEXTURE_SIZE * 0.025;
  ctx.setLineDash([TEXTURE_SIZE * 0.09, TEXTURE_SIZE * 0.07]);
  ctx.beginPath();
  ctx.moveTo(TEXTURE_SIZE / 2, 0);
  ctx.lineTo(TEXTURE_SIZE / 2, TEXTURE_SIZE);
  ctx.stroke();
}

interface SceneState {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  texture: THREE.CanvasTexture;
  maxAnisotropy: number;
}

interface Readout {
  vramMB: string;
  effectiveAniso: number;
}

// Vanilla Three.js (Track 3): scene built by hand in an effect, rendered via
// useVisibleRaf, cleaned up via useDisposable. No R3F.
function RoadTextureLab({ onReadout }: { onReadout: (r: Readout) => void }) {
  const { values, containerRef } = useDemoContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const disposables = useDisposable();
  const stateRef = useRef<SceneState | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(1); // sizing loop below already bakes DPR into width/height

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0e14);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 1.2, 11);
    camera.lookAt(0, 0, -30);

    const sourceCanvas = document.createElement("canvas");
    drawRoadPattern(sourceCanvas);
    const texture = new THREE.CanvasTexture(sourceCanvas);
    texture.colorSpace = THREE.SRGBColorSpace; // color data — Track 0 payoff
    texture.repeat.set(2, 24);

    const geometry = new THREE.PlaneGeometry(6, 40);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const road = new THREE.Mesh(geometry, material);
    road.rotation.x = -Math.PI / 2;
    road.position.z = -6;
    scene.add(road);

    disposables.register(renderer);
    disposables.register(geometry);
    disposables.register(material);
    disposables.register(texture);

    stateRef.current = {
      renderer,
      scene,
      camera,
      texture,
      maxAnisotropy: renderer.capabilities.getMaxAnisotropy(),
    };
  }, [disposables]);

  useEffect(() => {
    const st = stateRef.current;
    if (!st) return;

    const filterMode = stringOf(values, "filter", "mipmap");
    const wrapMode = stringOf(values, "wrap", "repeat");
    const anisoRequested = numberOf(values, "aniso", 1);

    const { texture } = st;
    if (filterMode === "nearest") {
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;
      texture.generateMipmaps = false;
    } else if (filterMode === "linear") {
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
    } else {
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.generateMipmaps = true;
    }

    const wrapConst =
      wrapMode === "clamp"
        ? THREE.ClampToEdgeWrapping
        : wrapMode === "mirror"
          ? THREE.MirroredRepeatWrapping
          : THREE.RepeatWrapping;
    texture.wrapS = wrapConst;
    texture.wrapT = wrapConst;

    const effectiveAniso = Math.min(anisoRequested, st.maxAnisotropy);
    texture.anisotropy = effectiveAniso;
    texture.needsUpdate = true;

    const hasMip = filterMode === "mipmap";
    const baseBytes = TEXTURE_SIZE * TEXTURE_SIZE * 4;
    const totalBytes = hasMip ? baseBytes * (4 / 3) : baseBytes;
    onReadout({
      vramMB: (totalBytes / 1024 / 1024).toFixed(2),
      effectiveAniso,
    });
  }, [values, onReadout]);

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

export default function TexturesAndCompressionKtx2Demo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;
  // Matches the default controls (mipmap filter, anisotropy 1) so the panel
  // doesn't flash a wrong number before the first effect run.
  const [readout, setReadout] = useState<Readout>({
    vramMB: "1.33",
    effectiveAniso: 1,
  });

  return (
    <Demo
      title={L.title}
      controls={[
        {
          kind: "select",
          key: "filter",
          label: L.filter,
          defaultValue: "mipmap",
          options: [
            { value: "nearest", label: L.filterNearest },
            { value: "linear", label: L.filterLinear },
            { value: "mipmap", label: L.filterMip },
          ],
        },
        {
          kind: "select",
          key: "wrap",
          label: L.wrap,
          defaultValue: "repeat",
          options: [
            { value: "repeat", label: L.wrapRepeat },
            { value: "clamp", label: L.wrapClamp },
            { value: "mirror", label: L.wrapMirror },
          ],
        },
        {
          kind: "number",
          key: "aniso",
          label: L.aniso,
          min: 1,
          max: 16,
          step: 1,
          defaultValue: 1,
        },
      ]}
    >
      <div className="relative size-full">
        <RoadTextureLab onReadout={setReadout} />
        <div className="absolute inset-x-3 top-3 space-y-1 rounded-lg border bg-background/85 p-3 font-mono text-xs backdrop-blur-sm">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-muted-foreground">{L.resolution}</span>
            <span>
              {TEXTURE_SIZE}×{TEXTURE_SIZE} · RGBA8
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-muted-foreground">{L.vram}</span>
            <span>≈ {readout.vramMB} MB</span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-muted-foreground">{L.anisoActual}</span>
            <span>{readout.effectiveAniso}×</span>
          </div>
        </div>
        <div className="absolute inset-x-3 bottom-3 rounded-lg border bg-background/85 px-3 py-1.5 text-xs">
          {L.hint}
        </div>
      </div>
    </Demo>
  );
}
