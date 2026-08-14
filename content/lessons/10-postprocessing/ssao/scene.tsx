"use client";

const STACK_LAYERS: { size: [number, number, number]; y: number; color: string }[] = [
  { size: [3, 1, 3], y: 0.5, color: "#64748b" },
  { size: [2, 1, 2], y: 1.5, color: "#94a3b8" },
  { size: [1, 1, 1], y: 2.5, color: "#cbd5e1" },
];

const SCATTER_BOXES: { position: [number, number, number]; size: [number, number, number] }[] = [
  { position: [-3.5, 0.4, 2.5], size: [0.8, 0.8, 0.8] },
  { position: [-2.6, 0.6, 3.3], size: [1, 1.2, 1] },
  { position: [3.8, 0.3, -2.8], size: [0.6, 0.6, 0.6] },
  { position: [3.0, 0.5, -3.6], size: [1, 1, 1] },
];

function Arch({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[-0.9, 1, 0]}>
        <boxGeometry args={[0.4, 2, 0.4]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.6} />
      </mesh>
      <mesh position={[0.9, 1, 0]}>
        <boxGeometry args={[0.4, 2, 0.4]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.1, 0]}>
        <boxGeometry args={[2.2, 0.4, 0.5]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.6} />
      </mesh>
    </group>
  );
}

// Deliberately full of concave corners (the step stack, the two arches) so
// SSAO has real contact points to occlude — a bare floor+sphere shows nothing.
export function Scene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 3]} intensity={1} />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>

      {STACK_LAYERS.map((layer) => (
        <mesh key={layer.y} position={[0, layer.y, 0]}>
          <boxGeometry args={layer.size} />
          <meshStandardMaterial color={layer.color} roughness={0.7} />
        </mesh>
      ))}

      {SCATTER_BOXES.map((box) => (
        <mesh key={box.position.join(",")} position={box.position}>
          <boxGeometry args={box.size} />
          <meshStandardMaterial color="#78716c" roughness={0.8} />
        </mesh>
      ))}

      <Arch position={[-4.5, 0, -1]} rotationY={0.3} />
      <Arch position={[4.5, 0, -2.5]} rotationY={-0.4} />
    </>
  );
}
