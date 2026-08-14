"use client";

import { useEffect, useImperativeHandle, useMemo, useRef, type Ref } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { Button } from "@/components/ui/button";
import { booleanOf, numberOf, stringOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import fragmentShader from "./attribute-sphere.frag";
import vertexShader from "./attribute-sphere.vert";

const LABELS = {
  vi: {
    title: "Attribute tuỳ biến trên mặt cầu",
    amplitude: "Biên độ dịch chuyển",
    mode: "Hướng dịch chuyển",
    modeNormal: "Theo pháp tuyến",
    modeRandomDir: "Theo hướng ngẫu nhiên",
    colorByAttribute: "Tô màu theo attribute",
    regenerate: "Đổi seed ngẫu nhiên",
  },
  en: {
    title: "Custom Attributes on a Sphere",
    amplitude: "Displacement amplitude",
    mode: "Displacement direction",
    modeNormal: "Along normal",
    modeRandomDir: "Along random direction",
    colorByAttribute: "Color by attribute",
    regenerate: "Reroll seed",
  },
} as const;

const SEGMENTS = 64;

function randomUnitDirection(): THREE.Vector3 {
  const v = new THREE.Vector3();
  do {
    v.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
  } while (v.lengthSq() < 1e-6);
  return v.normalize();
}

// aWeight simulates "painted" (authored, fixed) data; aRandom/aRandomDir
// simulate rolled data. Regenerate only re-rolls the latter — see theory.
function buildAttributeSphere(): THREE.BufferGeometry {
  const geometry = new THREE.SphereGeometry(1, SEGMENTS, SEGMENTS);
  const position = geometry.attributes.position;
  if (!position) return geometry;
  const count = position.count;

  const random = new Float32Array(count);
  const weight = new Float32Array(count);
  const dir = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    random[i] = Math.random();
    weight[i] = position.getY(i) * 0.5 + 0.5; // y in [-1,1] -> [0,1]
    const d = randomUnitDirection();
    dir[i * 3] = d.x;
    dir[i * 3 + 1] = d.y;
    dir[i * 3 + 2] = d.z;
  }

  geometry.setAttribute("aRandom", new THREE.BufferAttribute(random, 1));
  geometry.setAttribute("aWeight", new THREE.BufferAttribute(weight, 1));
  geometry.setAttribute("aRandomDir", new THREE.BufferAttribute(dir, 3));
  return geometry;
}

interface SphereHandle {
  regenerate: () => void;
}

function AttributeSphere({ ref }: { ref: Ref<SphereHandle> }) {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);
  const disposables = useDisposable();

  // Built once via useMemo (not JSX) so we can attach custom attributes to
  // it — manual construction means manual disposal (§8.2), hence useDisposable.
  const geometry = useMemo(
    () => disposables.register(buildAttributeSphere()),
    [disposables],
  );

  useImperativeHandle(
    ref,
    () => ({
      regenerate() {
        const random = geometry.getAttribute("aRandom");
        const dir = geometry.getAttribute("aRandomDir");
        if (!random || !dir) return;
        for (let i = 0; i < random.count; i++) {
          random.setX(i, Math.random());
          const d = randomUnitDirection();
          dir.setXYZ(i, d.x, d.y, d.z);
        }
        random.needsUpdate = true;
        dir.needsUpdate = true;
        invalidate();
      },
    }),
    [geometry, invalidate],
  );

  const uniforms = useMemo(
    () => ({
      uAmplitude: { value: 0.15 },
      uMode: { value: 0 },
      uColorByAttribute: { value: 0 },
      uBaseColor: { value: new THREE.Color("#8892b0") },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uAmplitude.value = numberOf(values, "amplitude", 0.15);
    uniforms.uMode.value = stringOf(values, "mode", "normal") === "randomDir" ? 1 : 0;
    uniforms.uColorByAttribute.value = booleanOf(values, "colorByAttribute", false)
      ? 1
      : 0;
    invalidate();
  }, [values, uniforms, invalidate]);

  // Slow idle spin so the seam and weight gradient stay visible from every angle.
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_state, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.15;
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function CustomGeometryAttributesDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;
  const sphereRef = useRef<SphereHandle>(null);

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        {
          kind: "number",
          key: "amplitude",
          label: L.amplitude,
          min: 0,
          max: 0.5,
          step: 0.01,
          defaultValue: 0.15,
        },
        {
          kind: "select",
          key: "mode",
          label: L.mode,
          defaultValue: "normal",
          options: [
            { value: "normal", label: L.modeNormal },
            { value: "randomDir", label: L.modeRandomDir },
          ],
        },
        {
          kind: "boolean",
          key: "colorByAttribute",
          label: L.colorByAttribute,
          defaultValue: false,
        },
      ]}
    >
      <div className="relative size-full">
        <DemoCanvas camera={{ position: [0, 0, 2.6], fov: 45 }}>
          <AttributeSphere ref={sphereRef} />
        </DemoCanvas>
        <div className="absolute right-2 bottom-2">
          <Button size="sm" onClick={() => sphereRef.current?.regenerate()}>
            {L.regenerate}
          </Button>
        </div>
      </div>
    </Demo>
  );
}
