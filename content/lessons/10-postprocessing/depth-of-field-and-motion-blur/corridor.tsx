"use client";

import type { ThreeEvent } from "@react-three/fiber";

const COLUMN_Z = [2, 6, 10, 14, 18, 22, 26];
const COLUMN_COLORS = [
  "#f97316",
  "#22d3ee",
  "#a78bfa",
  "#f43f5e",
  "#4ade80",
  "#facc15",
  "#60a5fa",
];

// Floor/ceiling/walls/end-cap close the tunnel so the camera-only motion
// blur pass never has to reconstruct a world position for an empty
// far-plane background (see theory: it would streak wildly while orbiting).
export function Corridor({ onFocusPick }: { onFocusPick: (distance: number) => void }) {
  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    onFocusPick(e.distance);
  }

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 6, -2]} intensity={1.2} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 14]}>
        <planeGeometry args={[6, 32]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 14]}>
        <planeGeometry args={[6, 32]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-3, 2, 14]}>
        <planeGeometry args={[32, 4]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[3, 2, 14]}>
        <planeGeometry args={[32, 4]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, 2, 30]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#475569" />
      </mesh>

      {COLUMN_Z.map((z, i) => (
        <mesh key={z} position={[i % 2 === 0 ? -1.6 : 1.6, 1, z]} onClick={handleClick}>
          <boxGeometry args={[0.8, 2, 0.8]} />
          <meshStandardMaterial color={COLUMN_COLORS[i]} roughness={0.4} />
        </mesh>
      ))}
    </>
  );
}
