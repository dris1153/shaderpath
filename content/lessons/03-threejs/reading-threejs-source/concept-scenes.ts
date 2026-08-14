import * as THREE from "three";

// Four tiny vanilla-Three scenes, one per source concept. Each mirrors the
// EXACT public API cited in source-snippets.ts (attach/add, frustumCulled,
// renderer.sortObjects, material.depthTest) so the on-screen behavior is the
// real mechanism, not a re-implementation of it.

export interface ConceptControls {
  attachToggle: boolean;
  cullYaw: number;
  sortObjects: boolean;
  stateThrash: boolean;
}

export interface ConceptScene {
  update(controls: ConceptControls, elapsedSec: number): void;
  /** Read AFTER renderer.render() for the same frame -- some metrics only exist post-draw. */
  metrics(renderer: THREE.WebGLRenderer): [number, number];
  dispose(): void;
}

function resetCamera(
  camera: THREE.PerspectiveCamera,
  pos: [number, number, number],
  fov: number,
  lookAtTarget?: [number, number, number],
) {
  camera.position.set(...pos);
  camera.rotation.set(0, 0, 0); // identity: forward is -Z, matches the culling scene's needs
  camera.fov = fov;
  camera.near = 0.1;
  camera.far = 50;
  // lookAt(origin) is undefined when the camera SITS at the origin (culling scene) -- skip it there.
  if (lookAtTarget) camera.lookAt(...lookAtTarget);
  camera.updateProjectionMatrix();
}

// attach(): reparenting that preserves world transform vs add() that doesn't.
export function buildAttachScene(scene: THREE.Scene, camera: THREE.PerspectiveCamera): ConceptScene {
  resetCamera(camera, [0, 3.5, 7], 45, [0, 0, 0]);

  const turntable = new THREE.Group();
  turntable.position.set(2, 0, 0);
  scene.add(turntable);

  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true }),
  );
  marker.position.set(3, 0, 0); // fixed reference: the cube's ORIGINAL world spot
  scene.add(marker);

  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.6, 0.6),
    new THREE.MeshBasicMaterial({ color: 0xf59e0b }),
  );
  let mode: boolean | null = null;

  return {
    update(controls, elapsedSec) {
      turntable.rotation.y = elapsedSec * 0.6;
      if (mode !== controls.attachToggle) {
        mode = controls.attachToggle;
        cube.parent?.remove(cube);
        cube.position.set(3, 0, 0);
        scene.add(cube);
        cube.updateMatrixWorld(true);
        if (mode) turntable.attach(cube); // real Object3D.attach()
        else turntable.add(cube); // real Object3D.add()
      }
    },
    metrics() {
      // local distance from the turntable's origin: 1 after attach() converts
      // world (3,0,0) into turntable-local space; 3 if add() left it untouched.
      return [cube.position.length(), 0];
    },
    dispose() {
      cube.parent?.remove(cube);
      cube.geometry.dispose();
      (cube.material as THREE.Material).dispose();
      scene.remove(marker, turntable);
      marker.geometry.dispose();
      (marker.material as THREE.Material).dispose();
    },
  };
}

// object.frustumCulled + WebGLRenderer's built-in frustum test: panning the
// camera changes how many of these boxes survive the cull, tracked via the
// real renderer.info.render.calls counter (reset every render() call).
export function buildCullingScene(scene: THREE.Scene, camera: THREE.PerspectiveCamera): ConceptScene {
  resetCamera(camera, [0, 0, 0], 35);

  const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const material = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const count = 16;
  const boxes: THREE.Mesh[] = [];
  for (let i = 0; i < count; i++) {
    const angle = THREE.MathUtils.degToRad(-70 + (140 * i) / (count - 1));
    const box = new THREE.Mesh(geometry, material);
    box.position.set(Math.sin(angle) * 6, 0, -Math.cos(angle) * 6);
    scene.add(box);
    boxes.push(box);
  }

  return {
    update(controls) {
      camera.rotation.y = THREE.MathUtils.degToRad(controls.cullYaw);
      camera.updateMatrixWorld();
    },
    metrics(renderer) {
      return [renderer.info.render.calls, count];
    },
    dispose() {
      for (const box of boxes) scene.remove(box);
      geometry.dispose();
      material.dispose();
    },
  };
}

// renderer.sortObjects toggles the real painterSortStable/reversePainterSortStable
// call in WebGLRenderer.render(); with it off, these transparent planes draw in
// insertion order (deliberately near-to-far) and blend incorrectly.
export function buildOrderScene(scene: THREE.Scene, camera: THREE.PerspectiveCamera): ConceptScene {
  resetCamera(camera, [0, 0.8, 7], 45, [0, 0, 0]);

  const planeGeo = new THREE.PlaneGeometry(3, 2);
  const layers = [
    { z: 1.5, color: 0xef4444 }, // nearest to camera
    { z: 0.5, color: 0x22c55e },
    { z: -0.5, color: 0x3b82f6 },
    { z: -1.5, color: 0xf59e0b }, // farthest from camera
  ];
  const planes = layers.map(({ z, color }) => {
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(planeGeo, mat);
    plane.position.z = z;
    scene.add(plane); // insertion order is deliberately nearest -> farthest
    return plane;
  });

  return {
    update() {
      // static composition: the toggle being demonstrated lives on the renderer,
      // wired centrally in demo.tsx via renderer.sortObjects.
    },
    metrics(renderer) {
      return [renderer.sortObjects ? 1 : 0, planes.length];
    },
    dispose() {
      for (const plane of planes) {
        scene.remove(plane);
        (plane.material as THREE.Material).dispose();
      }
      planeGeo.dispose();
    },
  };
}

// WebGLState's enable()/disable() cache: thrashing material.depthTest per mesh
// forces real gl.enable/disable calls every mesh; sharing one setting collapses
// them to (at most) one real call for the whole grid.
export function buildStateScene(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  glCallCounter: { count: number },
): ConceptScene {
  resetCamera(camera, [0, 0, 6], 45, [0, 0, 0]);

  const geometry = new THREE.SphereGeometry(0.16, 10, 8);
  const cols = 6;
  const rows = 5;
  const spheres: THREE.Mesh[] = [];
  for (let i = 0; i < cols * rows; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const mat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
    const sphere = new THREE.Mesh(geometry, mat);
    sphere.position.set((col - (cols - 1) / 2) * 0.9, (row - (rows - 1) / 2) * 0.9, 0);
    scene.add(sphere);
    spheres.push(sphere);
  }

  return {
    update(controls) {
      spheres.forEach((sphere, i) => {
        const mat = sphere.material as THREE.MeshBasicMaterial;
        mat.depthTest = controls.stateThrash ? i % 2 === 0 : true;
      });
    },
    metrics() {
      return [glCallCounter.count, spheres.length];
    },
    dispose() {
      for (const sphere of spheres) {
        scene.remove(sphere);
        (sphere.material as THREE.Material).dispose();
      }
      geometry.dispose();
    },
  };
}
