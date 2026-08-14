"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { stringOf } from "@/components/viz/control-schema";

// The four sites below are real #include markers verified against
// node_modules/three/src/renderers/shaders/ShaderLib/meshphysical.glsl.js
// (three@0.185.1 / tag r185). Each replaces the marker with itself PLUS one
// extra line — the original chunk still runs, ours just runs right after it.
const SITES = [
  {
    key: "begin_vertex",
    marker: "#include <begin_vertex>",
    inject: "transformed += objectNormal * (0.12 * sin(uTime * 2.0 + position.x * 6.0 + position.y * 6.0));",
    stage: "vertex" as const,
  },
  {
    key: "normal_fragment_begin",
    marker: "#include <normal_fragment_begin>",
    inject:
      "normal = normalize(normal + 0.35 * vec3(sin(normal.x * 30.0 + uTime), sin(normal.y * 30.0 + uTime), sin(normal.z * 30.0 + uTime)));",
    stage: "fragment" as const,
  },
  {
    key: "color_fragment",
    marker: "#include <color_fragment>",
    inject: "diffuseColor.rgb *= 0.6 + 0.4 * vec3(sin(vViewPosition.y * 8.0 + uTime));",
    stage: "fragment" as const,
  },
  {
    key: "emissivemap_fragment",
    marker: "#include <emissivemap_fragment>",
    inject: "totalEmissiveRadiance += vec3(0.1, 0.6, 1.0) * (0.5 + 0.5 * sin(uTime * 3.0));",
    stage: "fragment" as const,
  },
] as const;

type SiteKey = (typeof SITES)[number]["key"];
const DEFAULT_SITE: SiteKey = "begin_vertex";

const LABELS = {
  vi: {
    title: "Anatomy viewer: chọn anchor, xem hiệu ứng",
    site: "Chèn tại",
    panelTitle: "Dòng bị thay thế",
    options: {
      begin_vertex: "Vertex: begin_vertex (đẩy vị trí đỉnh)",
      normal_fragment_begin: "Fragment: normal_fragment_begin (làm nhiễu pháp tuyến)",
      color_fragment: "Fragment: color_fragment (nhuộm màu nền)",
      emissivemap_fragment: "Fragment: emissivemap_fragment (cộng glow)",
    },
  },
  en: {
    title: "Anatomy Viewer: Pick an Anchor, See the Effect",
    site: "Inject at",
    panelTitle: "Replaced line",
    options: {
      begin_vertex: "Vertex: begin_vertex (displaces vertex position)",
      normal_fragment_begin: "Fragment: normal_fragment_begin (perturbs the normal)",
      color_fragment: "Fragment: color_fragment (tints the base color)",
      emissivemap_fragment: "Fragment: emissivemap_fragment (adds emissive glow)",
    },
  },
} as const;

function AnatomyMesh() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);
  const site = (stringOf(values, "site", DEFAULT_SITE) as SiteKey) || DEFAULT_SITE;

  // Read fresh inside onBeforeCompile/customProgramCacheKey, both of which
  // Three calls from its own render loop, never during React's render.
  const siteRef = useRef<SiteKey>(site);
  siteRef.current = site;

  const timeUniform = useMemo(() => ({ value: 0 }), []);
  const groupRef = useRef<THREE.Group>(null);

  // Runs once per program-cache miss. customProgramCacheKey below forces a
  // miss (and this to re-run) every time the selected site changes — without
  // it Three reuses the first compiled program and the select does nothing.
  const handleCompile = useCallback(
    (shader: THREE.WebGLProgramParametersWithUniforms) => {
      const active = SITES.find((s) => s.key === siteRef.current) ?? SITES[0];
      shader.uniforms.uTime = timeUniform;

      if (active.stage === "vertex") {
        shader.vertexShader = shader.vertexShader
          .replace("#include <common>", "#include <common>\nuniform float uTime;")
          .replace(active.marker, `${active.marker}\n  ${active.inject}`);
      } else {
        shader.fragmentShader = shader.fragmentShader
          .replace("#include <common>", "#include <common>\nuniform float uTime;")
          .replace(active.marker, `${active.marker}\n  ${active.inject}`);
      }
    },
    [timeUniform],
  );

  const cacheKey = useCallback(() => siteRef.current, []);

  useEffect(() => {
    invalidate();
  }, [site, invalidate]);

  useFrame((state) => {
    timeUniform.value = state.clock.elapsedTime;
    if (groupRef.current) groupRef.current.rotation.y += 0.004;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[1, 4]} />
        <meshStandardMaterial
          color="#c9c9d6"
          roughness={0.45}
          metalness={0.05}
          onBeforeCompile={handleCompile}
          customProgramCacheKey={cacheKey}
        />
      </mesh>
    </group>
  );
}

export default function ThreeShaderChunkSystemDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        {
          kind: "select",
          key: "site",
          label: L.site,
          options: SITES.map((s) => ({ value: s.key, label: L.options[s.key] })),
          defaultValue: DEFAULT_SITE,
        },
      ]}
    >
      <DemoCanvas camera={{ position: [0, 0, 3.2], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={2.2} />
        <AnatomyMesh />
      </DemoCanvas>
      <SiteInfoPanel panelTitle={L.panelTitle} />
    </Demo>
  );
}

// Reads the same control value Demo already tracks, so the panel below the
// canvas always matches what onBeforeCompile is currently injecting.
function SiteInfoPanel({ panelTitle }: { panelTitle: string }) {
  const { values } = useDemoContext();
  const site = (stringOf(values, "site", DEFAULT_SITE) as SiteKey) || DEFAULT_SITE;
  const current = SITES.find((s) => s.key === site) ?? SITES[0];

  return (
    <div className="bg-muted/30 mt-3 rounded-md border p-3 font-mono text-xs wrap-break-word">
      <div className="text-muted-foreground mb-1 font-sans font-medium">
        {panelTitle}
      </div>
      <div>{current.marker}</div>
      <div className="text-foreground/80">{current.inject}</div>
    </div>
  );
}
