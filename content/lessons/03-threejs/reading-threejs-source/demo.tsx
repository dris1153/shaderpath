"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf, stringOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { useVisibleRaf } from "@/lib/hooks/use-visible-frameloop";
import {
  buildAttachScene,
  buildCullingScene,
  buildOrderScene,
  buildStateScene,
  type ConceptControls,
  type ConceptScene,
} from "./concept-scenes";
import { LABELS, type ConceptId, type DemoLocale } from "./demo-labels";
import { SOURCE_SNIPPETS } from "./source-snippets";

// The imperative vanilla-Three half: one WebGLRenderer, one Scene, swapped
// concept scenes. Cleanup goes through useDisposable (§8.2), the loop
// through useVisibleRaf (§8.3).
function ThreeSourceMap() {
  const locale = useLocale() as DemoLocale;
  const { values, containerRef } = useDemoContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const disposables = useDisposable();

  const controlsRef = useRef<ConceptControls>({
    attachToggle: true,
    cullYaw: 0,
    sortObjects: true,
    stateThrash: false,
  });
  const conceptRef = useRef<ConceptId>("attach");

  useEffect(() => {
    controlsRef.current = {
      attachToggle: booleanOf(values, "attachToggle", true),
      cullYaw: numberOf(values, "cullYaw", 0),
      sortObjects: booleanOf(values, "sortObjects", true),
      stateThrash: booleanOf(values, "stateThrash", false),
    };
    conceptRef.current = stringOf(values, "concept", "attach") as ConceptId;
  }, [values]);

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const handleRef = useRef<ConceptScene | null>(null);
  const activeIdRef = useRef<ConceptId | null>(null);
  const glCounterRef = useRef({ count: 0 });
  const startRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setClearColor(0x0f1115, 1);
    rendererRef.current = renderer;

    // Wrap the raw gl.enable/disable calls to count how often WebGLState's
    // cache (source-snippets.ts, "state" concept) actually reaches the driver.
    const gl = renderer.getContext();
    const rawEnable = gl.enable.bind(gl);
    const rawDisable = gl.disable.bind(gl);
    const counter = glCounterRef.current;
    gl.enable = ((cap: number) => {
      counter.count++;
      rawEnable(cap);
    }) as typeof gl.enable;
    gl.disable = ((cap: number) => {
      counter.count++;
      rawDisable(cap);
    }) as typeof gl.disable;

    sceneRef.current = new THREE.Scene();
    cameraRef.current = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    startRef.current = performance.now();

    disposables.registerFn(() => {
      handleRef.current?.dispose();
      handleRef.current = null;
      activeIdRef.current = null;
      renderer.dispose();
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      // No loseContext(): Strict Mode remounts reuse this same canvas.
    });
  }, [disposables]);

  useVisibleRaf(containerRef, () => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const canvas = canvasRef.current;
    if (!renderer || !scene || !camera || !canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    if (renderer.getPixelRatio() !== dpr) renderer.setPixelRatio(dpr);
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    const conceptId = conceptRef.current;
    if (activeIdRef.current !== conceptId) {
      handleRef.current?.dispose();
      handleRef.current =
        conceptId === "attach"
          ? buildAttachScene(scene, camera)
          : conceptId === "culling"
            ? buildCullingScene(scene, camera)
            : conceptId === "order"
              ? buildOrderScene(scene, camera)
              : buildStateScene(scene, camera, glCounterRef.current);
      activeIdRef.current = conceptId;
    }

    const elapsedSec = (performance.now() - startRef.current) / 1000;
    glCounterRef.current.count = 0;
    handleRef.current?.update(controlsRef.current, elapsedSec);
    renderer.sortObjects = conceptId === "order" ? controlsRef.current.sortObjects : true;
    renderer.render(scene, camera);

    const [a, b] = handleRef.current?.metrics(renderer) ?? [0, 0];
    const statusEl = statusRef.current;
    if (statusEl) statusEl.textContent = LABELS[locale].status[conceptId](a, b);
  });

  return (
    <>
      <canvas ref={canvasRef} className="size-full" />
      <div
        ref={statusRef}
        className="text-muted-foreground pointer-events-none absolute bottom-2 left-2 max-w-[92%] rounded bg-background/80 px-2 py-1 text-[10px] font-medium sm:text-xs"
      />
    </>
  );
}

// Reactive half: the excerpted source panel, updated instantly on concept
// select (no need to wait for the next RAF tick).
function SourceMapPanel() {
  const locale = useLocale() as DemoLocale;
  const { values } = useDemoContext();
  const conceptId = stringOf(values, "concept", "attach") as ConceptId;
  const snippet = SOURCE_SNIPPETS.find((s) => s.id === conceptId) ?? SOURCE_SNIPPETS[0]!;

  return (
    <div className="flex size-full">
      <div className="bg-muted/30 hidden w-[44%] shrink-0 overflow-y-auto border-r p-3 md:block">
        <div className="mb-1 text-xs font-semibold">{snippet.label[locale]}</div>
        <a
          href={snippet.url}
          target="_blank"
          rel="noreferrer"
          className="text-muted-foreground mb-2 block truncate text-[10px] underline"
        >
          {snippet.file}
        </a>
        <pre className="overflow-x-auto text-[10px] leading-snug">
          <code>{snippet.code}</code>
        </pre>
      </div>
      <div className="relative flex-1">
        <ThreeSourceMap />
      </div>
    </div>
  );
}

export default function ReadingThreejsSourceDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 7}
      controls={[
        {
          kind: "select",
          key: "concept",
          label: L.concept,
          options: [
            { value: "attach", label: L.concepts.attach },
            { value: "culling", label: L.concepts.culling },
            { value: "order", label: L.concepts.order },
            { value: "state", label: L.concepts.state },
          ],
          defaultValue: "attach",
        },
        { kind: "boolean", key: "attachToggle", label: L.attachToggle, defaultValue: true },
        { kind: "number", key: "cullYaw", label: L.cullYaw, min: -70, max: 70, step: 1, defaultValue: 0 },
        { kind: "boolean", key: "sortObjects", label: L.sortObjects, defaultValue: true },
        { kind: "boolean", key: "stateThrash", label: L.stateThrash, defaultValue: false },
      ]}
    >
      <SourceMapPanel />
    </Demo>
  );
}
