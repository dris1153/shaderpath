"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { IconRefresh } from "@tabler/icons-react";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf } from "@/components/viz/control-schema";
import { Button } from "@/components/ui/button";
import { useDisposable } from "@/lib/hooks/use-disposable";
import fragmentShader from "./particle.frag";
import vertexShader from "./particle.vert";
import fullscreenVertexShader from "./fullscreen.vert";
import stateViewFragmentShader from "./state-view.frag";
import { BOUNDS, PARTICLE_COUNT, PingPongSimulation, STATE_SIZE } from "./simulation";

const LABELS = {
  vi: {
    title: "Ping-pong FBO thủ công: 16.384 particle sống trong texture",
    paused: "Tạm dừng",
    showState: "Hiện texture trạng thái",
    reset: "Khởi tạo lại",
  },
  en: {
    title: "Manual Ping-Pong FBO: 16,384 Particles Living in a Texture",
    paused: "Paused",
    showState: "Show state texture",
    reset: "Reseed",
  },
} as const;

// Per-particle UV into the state texture — (x+0.5)/SIZE lands each reference
// on its texel's center (same half-texel reasoning as Track 0's pixel↔UV lesson).
function buildReferences(): Float32Array {
  const refs = new Float32Array(PARTICLE_COUNT * 2);
  for (let y = 0; y < STATE_SIZE; y++) {
    for (let x = 0; x < STATE_SIZE; x++) {
      const i = y * STATE_SIZE + x;
      refs[i * 2] = (x + 0.5) / STATE_SIZE;
      refs[i * 2 + 1] = (y + 0.5) / STATE_SIZE;
    }
  }
  return refs;
}

function SimulationScene({ resetSignal }: { resetSignal: number }) {
  const { values } = useDemoContext();
  const gl = useThree((s) => s.gl);
  const disposables = useDisposable();
  const sim = useMemo(
    () => disposables.register(new PingPongSimulation(gl)),
    [gl, disposables],
  );

  const pausedRef = useRef(false);
  useEffect(() => {
    pausedRef.current = booleanOf(values, "paused", false);
  }, [values]);

  useEffect(() => {
    sim.reset();
  }, [resetSignal, sim]);

  const references = useMemo(() => buildReferences(), []);
  // Required by Three's vertex pipeline (vertex count, bounding sphere) but
  // never read in particle.vert — the real position comes from aReference.
  const placeholderPositions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);

  const particleUniforms = useMemo(
    () => ({
      uTexturePosition: { value: null as THREE.Texture | null },
      uPointSize: { value: 2.2 },
    }),
    [],
  );
  const stateViewUniforms = useMemo(
    () => ({
      uTexturePosition: { value: null as THREE.Texture | null },
      uBounds: { value: BOUNDS },
    }),
    [],
  );

  useFrame((_, delta) => {
    if (!pausedRef.current) sim.step(delta);
    particleUniforms.uTexturePosition.value = sim.positionTexture;
    stateViewUniforms.uTexturePosition.value = sim.positionTexture;
  });

  const showState = booleanOf(values, "showState", false);

  if (showState) {
    return (
      <mesh>
        <planeGeometry args={[3.6, 3.6]} />
        <shaderMaterial
          vertexShader={fullscreenVertexShader}
          fragmentShader={stateViewFragmentShader}
          uniforms={stateViewUniforms}
        />
      </mesh>
    );
  }

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[placeholderPositions, 3]}
        />
        <bufferAttribute attach="attributes-aReference" args={[references, 2]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={particleUniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

export default function PingpongFboStateTexturesDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;
  const [resetSignal, setResetSignal] = useState(0);

  return (
    <Demo
      title={L.title}
      controls={[
        { kind: "boolean", key: "paused", label: L.paused, defaultValue: false },
        { kind: "boolean", key: "showState", label: L.showState, defaultValue: false },
      ]}
    >
      <div className="relative size-full">
        <DemoCanvas camera={{ position: [0, 0.3, 3.4], fov: 50 }}>
          <SimulationScene resetSignal={resetSignal} />
        </DemoCanvas>
        <div className="absolute right-2 bottom-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setResetSignal((n) => n + 1)}
          >
            <IconRefresh /> {L.reset}
          </Button>
        </div>
      </div>
    </Demo>
  );
}
