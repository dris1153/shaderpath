import * as THREE from "three";

// Shared geometry math for the culling-and-lod demo: 7 fixed stations along
// -Z (the "field"), a THREE.LOD builder/disposer, and a frustum-test helper
// used by the overview inset. Kept out of demo.tsx to keep the R3F half
// focused on JSX/hooks (spec file-size guideline).

export const STATIONS: readonly (readonly [x: number, z: number])[] = [
  [0, -2],
  [1.8, -6],
  [-1.6, -10],
  [2.4, -14],
  [-2.2, -18],
  [1.2, -22],
  [-0.8, -26],
];

// Distances passed to addLevel(object, distance): >=0 high detail,
// >=6 mid detail, >=14 flat billboard.
export const LOD_DISTANCES = [0, 6, 14] as const;
export const HYSTERESIS_RATIO = 0.15;

// Shared by BOTH the main dolly camera and the overview's math-only "shadow"
// camera — the wedge/markers in the inset must test the SAME frustum shape
// the main camera actually renders with.
export const CAMERA_FOV = 50;
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 24;
// Fixed at the Demo card's own ratio (16/9) rather than read from the live
// viewport each frame — close enough for a frustum-test visualization, not
// meant to be pixel-exact through every resize.
export const CAMERA_ASPECT = 16 / 9;
export const CAMERA_HEIGHT = 1.5;

export const DOLLY_RANGE = { min: -24, max: 8, step: 0.5, default: 2 } as const;

const LEVEL_COLORS = ["#38bdf8", "#fbbf24", "#a78bfa"] as const;

export interface LodStationHandle {
  lod: THREE.LOD;
  materials: THREE.MeshStandardMaterial[];
  geometries: THREE.BufferGeometry[];
}

/** One station: high-poly icosahedron / low-poly icosahedron / billboard-ish plane. */
export function buildLodStation(): LodStationHandle {
  const highGeo = new THREE.IcosahedronGeometry(0.9, 3);
  const midGeo = new THREE.IcosahedronGeometry(0.9, 0);
  const lowGeo = new THREE.PlaneGeometry(1.4, 1.4);

  const materials = LEVEL_COLORS.map(
    (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.5 }),
  );
  // The plane is "billboard-ish", not a true camera-facing billboard (spec
  // scope) — DoubleSide keeps it visible from both dolly directions instead
  // of back-face-culling into invisibility once the camera passes it.
  materials[2]!.side = THREE.DoubleSide;

  const highMesh = new THREE.Mesh(highGeo, materials[0]);
  const midMesh = new THREE.Mesh(midGeo, materials[1]);
  const lowMesh = new THREE.Mesh(lowGeo, materials[2]);

  const lod = new THREE.LOD();
  lod.addLevel(highMesh, LOD_DISTANCES[0]);
  lod.addLevel(midMesh, LOD_DISTANCES[1]);
  lod.addLevel(lowMesh, LOD_DISTANCES[2]);
  lod.position.y = 0.9;

  return { lod, materials, geometries: [highGeo, midGeo, lowGeo] };
}

export function disposeLodStation(handle: LodStationHandle) {
  for (const m of handle.materials) m.dispose();
  for (const g of handle.geometries) g.dispose();
}

export function setStationWireframe(handle: LodStationHandle, wireframe: boolean) {
  for (const m of handle.materials) m.wireframe = wireframe;
}

// levels[i].hysteresis is a plain mutable field (spec: no rebuild needed to
// change it, matches the addLevel(object, distance, hysteresis) API).
export function setStationHysteresis(handle: LodStationHandle, enabled: boolean) {
  for (const level of handle.lod.levels) level.hysteresis = enabled ? HYSTERESIS_RATIO : 0;
}

// A camera that's never rendered — pure math, reused across frames so the
// frustum test itself allocates nothing (fitting, given the lesson's topic).
const shadowCamera = new THREE.PerspectiveCamera(
  CAMERA_FOV,
  CAMERA_ASPECT,
  CAMERA_NEAR,
  CAMERA_FAR,
);
const shadowMatrix = new THREE.Matrix4();
const shadowFrustum = new THREE.Frustum();
const testPoint = new THREE.Vector3();

/** Same test WebGLRenderer runs per-mesh (Frustum.intersectsObject) — here applied to each station's anchor point. */
export function testStationsCulled(dollyZ: number): boolean[] {
  shadowCamera.position.set(0, CAMERA_HEIGHT, dollyZ);
  shadowCamera.rotation.set(0, 0, 0);
  shadowCamera.updateMatrixWorld(true);
  shadowCamera.updateProjectionMatrix();
  shadowMatrix.multiplyMatrices(shadowCamera.projectionMatrix, shadowCamera.matrixWorldInverse);
  shadowFrustum.setFromProjectionMatrix(shadowMatrix);

  return STATIONS.map(([x, z]) => {
    testPoint.set(x, 0.9, z);
    return !shadowFrustum.containsPoint(testPoint);
  });
}

/** Local-space (apex at origin) frustum wedge outline for the overview's top-down inset. */
export function buildFrustumWedgeGeometry(): THREE.BufferGeometry {
  const halfV = Math.tan((CAMERA_FOV * Math.PI) / 360);
  const halfH = halfV * CAMERA_ASPECT;
  const farHalfWidth = CAMERA_FAR * halfH;

  const positions = new Float32Array([
    0, 0, 0,
    -farHalfWidth, 0, -CAMERA_FAR,
    farHalfWidth, 0, -CAMERA_FAR,
  ]);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geometry;
}
