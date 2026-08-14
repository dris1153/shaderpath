"use client";

// A few primitives + two HDR emissive accents: enough contrast for the
// AO-lite pass (crevices on the knot) and enough true-HDR brightness
// (emissiveIntensity > 1) for bloom to have something real to extract.
// toneMapped={false} on every material keeps RenderPass's output pure
// linear HDR — tone mapping only ever happens in the OutputPass step,
// never baked in earlier (see the lesson's canonical-order section).
const ACCENTS: { position: [number, number, number]; color: string; intensity: number }[] = [
  { position: [-1.1, 0.5, 0.1], color: "#ff2e88", intensity: 6 },
  { position: [1.15, 0.35, -0.3], color: "#21e6ff", intensity: 8 },
];

export function PostfxScene() {
  return (
    <group>
      <ambientLight intensity={0.15} />
      <directionalLight position={[3, 4, 2]} intensity={0.6} />

      <mesh position={[0, -0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#141821" roughness={0.9} toneMapped={false} />
      </mesh>

      <mesh>
        <torusKnotGeometry args={[0.55, 0.18, 128, 24]} />
        <meshStandardMaterial color="#5a6270" roughness={0.35} metalness={0.4} toneMapped={false} />
      </mesh>

      {ACCENTS.map((accent) => (
        <mesh key={accent.color} position={accent.position}>
          <icosahedronGeometry args={[0.26, 0]} />
          <meshStandardMaterial
            color={accent.color}
            emissive={accent.color}
            emissiveIntensity={accent.intensity}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
