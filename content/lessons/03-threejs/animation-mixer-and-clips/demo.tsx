"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import {
  booleanOf,
  numberOf,
  stringOf,
} from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { useVisibleRaf } from "@/lib/hooks/use-visible-frameloop";

const LOOP_MODES = ["repeat", "once", "pingpong"] as const;
type LoopMode = (typeof LOOP_MODES)[number];

const THREE_LOOP: Record<LoopMode, THREE.AnimationActionLoopStyles> = {
  repeat: THREE.LoopRepeat,
  once: THREE.LoopOnce,
  pingpong: THREE.LoopPingPong,
};

const LABELS = {
  vi: {
    title: "AnimationMixer: clip dựng tay + crossfade",
    playing: "Đang phát",
    timeScale: "Tốc độ (timeScale)",
    loop: "Chế độ loop",
    weight: "Crossfade (A → B)",
    loopOptions: { repeat: "Lặp lại", once: "Một lần", pingpong: "Ping-pong" },
  },
  en: {
    title: "AnimationMixer: hand-built clip + crossfade",
    playing: "Playing",
    timeScale: "Speed (timeScale)",
    loop: "Loop mode",
    weight: "Crossfade (A → B)",
    loopOptions: { repeat: "Repeat", once: "Once", pingpong: "Ping-pong" },
  },
} as const;

// Track 0 covers slerp: QuaternionKeyframeTrack values must be unit quaternions.
function buildOrbitClip(): THREE.AnimationClip {
  const times = [0, 1, 2];
  // prettier-ignore
  const positions = [-1.2, 0, 0, 1.2, 0.6, 0, -1.2, 0, 0]; // returns to start: loops seamlessly
  const axis = new THREE.Vector3(0, 1, 0);
  const q = (angle: number) => new THREE.Quaternion().setFromAxisAngle(axis, angle);
  const quaternions = [
    ...q(0).toArray(),
    ...q(Math.PI).toArray(),
    ...q(Math.PI * 2).toArray(), // full turn == identity: matches the position loop
  ];
  return new THREE.AnimationClip("orbit", 2, [
    new THREE.VectorKeyframeTrack(".position", times, positions),
    new THREE.QuaternionKeyframeTrack(".quaternion", times, quaternions),
  ]);
}

function buildBounceClip(): THREE.AnimationClip {
  const times = [0, 0.5, 1, 1.5, 2];
  // prettier-ignore
  const positions = [0, -0.8, 0, 0.6, 0.9, 0, 0, -0.8, 0, -0.6, 0.9, 0, 0, -0.8, 0];
  const axis = new THREE.Vector3(1, 0, 1).normalize();
  const q = (angle: number) => new THREE.Quaternion().setFromAxisAngle(axis, angle);
  const quaternions = [
    ...q(0).toArray(),
    ...q(Math.PI / 2).toArray(),
    ...q(Math.PI).toArray(),
    ...q((Math.PI * 3) / 2).toArray(),
    ...q(Math.PI * 2).toArray(),
  ];
  return new THREE.AnimationClip("bounce", 2, [
    new THREE.VectorKeyframeTrack(".position", times, positions),
    new THREE.QuaternionKeyframeTrack(".quaternion", times, quaternions),
  ]);
}

interface SceneState {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  mixer: THREE.AnimationMixer;
  actionA: THREE.AnimationAction;
  actionB: THREE.AnimationAction;
  clock: THREE.Clock;
}

interface Params {
  playing: boolean;
  timeScale: number;
  loop: LoopMode;
  weight: number;
}

function AnimationMixerScene() {
  const { values, containerRef } = useDemoContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const disposables = useDisposable();
  const stateRef = useRef<SceneState | null>(null);
  const paramsRef = useRef<Params>({
    playing: true,
    timeScale: 1,
    loop: "repeat",
    weight: 0,
  });

  // Scene/mixer setup runs first (mount effect declared before the params
  // sync effect below), so actionA/actionB already exist once values sync.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = disposables.register(
      new THREE.WebGLRenderer({ canvas, antialias: true }),
    );
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 5);

    const geometry = disposables.register(new THREE.IcosahedronGeometry(0.9, 1));
    const material = disposables.register(
      new THREE.MeshNormalMaterial({ flatShading: true }),
    );
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const mixer = new THREE.AnimationMixer(mesh);
    const actionA = mixer.clipAction(buildOrbitClip());
    const actionB = mixer.clipAction(buildBounceClip());
    actionA.play();
    actionB.play();
    actionA.weight = 1;
    actionB.weight = 0;

    stateRef.current = {
      renderer,
      scene,
      camera,
      mixer,
      actionA,
      actionB,
      clock: new THREE.Clock(),
    };

    disposables.registerFn(() => {
      mixer.stopAllAction();
      scene.remove(mesh);
      stateRef.current = null;
    });
  }, [disposables]);

  useEffect(() => {
    paramsRef.current = {
      playing: booleanOf(values, "playing", true),
      timeScale: numberOf(values, "timeScale", 1),
      loop: (stringOf(values, "loop", "repeat") as LoopMode) || "repeat",
      weight: numberOf(values, "weight", 0),
    };

    const st = stateRef.current;
    if (!st) return;
    const mode = THREE_LOOP[paramsRef.current.loop];
    st.actionA.setLoop(mode, Infinity);
    st.actionB.setLoop(mode, Infinity);
    st.actionA.clampWhenFinished = mode === THREE.LoopOnce;
    st.actionB.clampWhenFinished = mode === THREE.LoopOnce;
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

    const { playing, timeScale, weight } = paramsRef.current;
    st.actionA.weight = 1 - weight;
    st.actionB.weight = weight;
    // mixer.timeScale = 0 is the documented way to pause every action at once.
    st.mixer.timeScale = playing ? timeScale : 0;
    st.mixer.update(st.clock.getDelta());
    st.renderer.render(st.scene, st.camera);
  });

  return <canvas ref={canvasRef} className="size-full" />;
}

export default function AnimationMixerDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        { kind: "boolean", key: "playing", label: L.playing, defaultValue: true },
        {
          kind: "number",
          key: "timeScale",
          label: L.timeScale,
          min: 0,
          max: 3,
          step: 0.1,
          defaultValue: 1,
        },
        {
          kind: "select",
          key: "loop",
          label: L.loop,
          options: LOOP_MODES.map((m) => ({ value: m, label: L.loopOptions[m] })),
          defaultValue: "repeat",
        },
        {
          kind: "number",
          key: "weight",
          label: L.weight,
          min: 0,
          max: 1,
          step: 0.01,
          defaultValue: 0,
        },
      ]}
    >
      <AnimationMixerScene />
    </Demo>
  );
}
