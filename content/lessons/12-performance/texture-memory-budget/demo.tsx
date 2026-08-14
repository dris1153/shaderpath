"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, stringOf } from "@/components/viz/control-schema";
import { Button } from "@/components/ui/button";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { bytesToMB, textureFootprintBytes, type TextureFormat } from "./texture-formula";

const LABELS = {
  vi: {
    title: "VRAM Ledger — spawn texture, xem ngân sách sống",
    size: "Kích thước",
    format: "Định dạng",
    mipmaps: "Bật mipmap",
    add: "Thêm texture",
    disposeAll: "Dispose tất cả",
    colSize: "Cỡ",
    colFormat: "Định dạng",
    total: "Tổng (công thức)",
    liveCounter: "renderer.info.memory.textures",
    overBudget: "> ngân sách minh hoạ",
  },
  en: {
    title: "VRAM Ledger — Spawn Textures, Watch a Live Budget",
    size: "Size",
    format: "Format",
    mipmaps: "Mipmaps on",
    add: "Add texture",
    disposeAll: "Dispose all",
    colSize: "Size",
    colFormat: "Format",
    total: "Total (formula)",
    liveCounter: "renderer.info.memory.textures",
    overBudget: "> example budget",
  },
} as const;

type Labels = (typeof LABELS)[keyof typeof LABELS];

const MAX_TEXTURES = 8;
const GRID_COLS = 4;
// A labeled EXAMPLE threshold for this demo's visual warning — not a claim
// about any real device's actual VRAM budget (spec's numbers rule).
const BUDGET_MB = 512;

interface LedgerEntry {
  id: number;
  sizePx: number;
  format: TextureFormat;
  texture: THREE.Texture;
}

function gridPosition(i: number): [number, number, number] {
  const rows = MAX_TEXTURES / GRID_COLS;
  const col = i % GRID_COLS;
  const row = Math.floor(i / GRID_COLS);
  return [(col - (GRID_COLS - 1) / 2) * 1.15, ((rows - 1) / 2 - row) * 1.15, 0];
}

// Row-by-row fill (W calls to TypedArray.set instead of W*H individual
// writes) keeps a 4096x4096 half-float buffer (16M+ texels) snappy to build.
function makeHalfFloatTexture(sizePx: number, hue: number): THREE.DataTexture {
  const row = new Uint16Array(sizePx * 4);
  for (let x = 0; x < sizePx; x++) {
    const u = x / sizePx;
    row[x * 4 + 0] = THREE.DataUtils.toHalfFloat(u * hue);
    row[x * 4 + 1] = THREE.DataUtils.toHalfFloat(1 - u);
    row[x * 4 + 2] = THREE.DataUtils.toHalfFloat(0.5 + 0.5 * (1 - hue));
    row[x * 4 + 3] = THREE.DataUtils.toHalfFloat(1);
  }
  const data = new Uint16Array(sizePx * sizePx * 4);
  for (let y = 0; y < sizePx; y++) {
    data.set(row, y * sizePx * 4);
  }
  const texture = new THREE.DataTexture(data, sizePx, sizePx, THREE.RGBAFormat, THREE.HalfFloatType);
  return texture;
}

function makeRgba8Texture(sizePx: number, hue: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = sizePx;
  canvas.height = sizePx;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const h = Math.floor(hue * 360);
    const grad = ctx.createLinearGradient(0, 0, sizePx, sizePx);
    grad.addColorStop(0, `hsl(${h}, 65%, 55%)`);
    grad.addColorStop(1, `hsl(${(h + 60) % 360}, 65%, 32%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, sizePx, sizePx);
  }
  return new THREE.CanvasTexture(canvas);
}

function makeTexture(sizePx: number, format: TextureFormat, mipmaps: boolean): THREE.Texture {
  const hue = Math.random();
  const texture = format === "rgba8" ? makeRgba8Texture(sizePx, hue) : makeHalfFloatTexture(sizePx, hue);
  texture.generateMipmaps = mipmaps;
  texture.minFilter = mipmaps ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

// Ground truth for the live "renderer.info.memory.textures" readout — a
// COUNT of live texture objects, not bytes (the theory's whole point).
function TextureCountProbe({ onChange }: { onChange: (n: number) => void }) {
  const gl = useThree((s) => s.gl);
  const last = useRef(-1);
  useFrame(() => {
    const n = gl.info.memory.textures;
    if (n !== last.current) {
      last.current = n;
      onChange(n);
    }
  });
  return null;
}

function VramLedgerPlayground({ L }: { L: Labels }) {
  const { values } = useDemoContext();
  const disposables = useDisposable();
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [textureCount, setTextureCount] = useState(0);
  const entriesRef = useRef<LedgerEntry[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  // Safety net only — dispose whatever's still alive if the demo unmounts
  // mid-session (disposeAll already clears everything on click).
  useEffect(() => {
    disposables.registerFn(() => {
      for (const e of entriesRef.current) e.texture.dispose();
    });
  }, [disposables]);

  const mipmaps = booleanOf(values, "mipmaps", true);

  // Global toggle: mutate EVERY live texture, not just future spawns, so the
  // 4/3 tax is visible immediately on already-spawned entries too.
  useEffect(() => {
    for (const e of entries) {
      e.texture.generateMipmaps = mipmaps;
      e.texture.minFilter = mipmaps ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
      e.texture.needsUpdate = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mipmaps]);

  const addTexture = () => {
    if (entries.length >= MAX_TEXTURES) return;
    const sizePx = Number(stringOf(values, "size", "2048"));
    const format = stringOf(values, "format", "rgba8") as TextureFormat;
    const texture = makeTexture(sizePx, format, mipmaps);
    setEntries((prev) => [...prev, { id: nextId.current++, sizePx, format, texture }]);
  };

  const disposeAll = () => {
    for (const e of entries) e.texture.dispose();
    setEntries([]);
  };

  const totalMB = entries.reduce(
    (sum, e) => sum + bytesToMB(textureFootprintBytes(e.sizePx, e.format, mipmaps)),
    0,
  );
  const overBudget = totalMB > BUDGET_MB;

  return (
    <div className="relative size-full">
      <DemoCanvas camera={{ position: [0, 0, 6], fov: 40 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[3, 4, 5]} intensity={40} />
        <TextureCountProbe onChange={setTextureCount} />
        {entries.map((e, i) => (
          <mesh key={e.id} position={gridPosition(i)}>
            <planeGeometry args={[0.95, 0.95]} />
            <meshBasicMaterial map={e.texture} />
          </mesh>
        ))}
      </DemoCanvas>

      <div className="absolute inset-x-3 top-3 max-h-[65%] overflow-y-auto rounded-lg border bg-background/90 p-2 font-mono text-[11px] backdrop-blur-sm">
        <table className="w-full">
          <thead>
            <tr className="text-muted-foreground">
              <th className="text-left font-normal">#</th>
              <th className="text-left font-normal">{L.colSize}</th>
              <th className="text-left font-normal">{L.colFormat}</th>
              <th className="text-right font-normal">MB</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={e.id}>
                <td>{i + 1}</td>
                <td>
                  {e.sizePx}×{e.sizePx}
                </td>
                <td>{e.format === "rgba8" ? "RGBA8" : "Half-float"}</td>
                <td className="text-right">
                  {bytesToMB(textureFootprintBytes(e.sizePx, e.format, mipmaps)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div
          className={`mt-1 flex items-baseline justify-between border-t pt-1 ${overBudget ? "text-destructive" : ""}`}
        >
          <span>{L.total}</span>
          <span>
            {totalMB.toFixed(2)} MB {overBudget ? `(${L.overBudget}: ${BUDGET_MB} MB)` : ""}
          </span>
        </div>
        <div className="text-muted-foreground flex items-baseline justify-between">
          <span>{L.liveCounter}</span>
          <span>{textureCount}</span>
        </div>
      </div>

      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
        <Button size="sm" onClick={addTexture} disabled={entries.length >= MAX_TEXTURES}>
          {L.add} ({entries.length}/{MAX_TEXTURES})
        </Button>
        <Button size="sm" variant="outline" onClick={disposeAll} disabled={entries.length === 0}>
          {L.disposeAll}
        </Button>
      </div>
    </div>
  );
}

export default function TextureMemoryBudgetDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={4 / 3}
      controls={[
        {
          kind: "select",
          key: "size",
          label: L.size,
          defaultValue: "2048",
          options: [
            { value: "512", label: "512²" },
            { value: "1024", label: "1024²" },
            { value: "2048", label: "2048²" },
            { value: "4096", label: "4096²" },
          ],
        },
        {
          kind: "select",
          key: "format",
          label: L.format,
          defaultValue: "rgba8",
          options: [
            { value: "rgba8", label: "RGBA8" },
            { value: "half", label: "Half-float" },
          ],
        },
        { kind: "boolean", key: "mipmaps", label: L.mipmaps, defaultValue: true },
      ]}
    >
      <VramLedgerPlayground L={L} />
    </Demo>
  );
}
