import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-mini-configurator",
    kind: "build",
    prompt: {
      vi: `Dựng một configurator sản phẩm nhỏ bằng React Three Fiber: một chiếc ghế mini ghép từ nhiều primitive (mặt ghế, tựa lưng, bốn chân) — không phải một khối đơn. Mỗi phần (\`seat\`, \`back\`, \`legs\`) có một \`<select>\` màu riêng; một \`<select>\` khác đổi material finish giữa \`matte\`/\`satin\`/\`glossy\`, áp \`roughness\` tương ứng cho toàn bộ ghế. Một checkbox bật/tắt xoay turntable liên tục quanh trục Y bằng \`useFrame\`, không dùng \`setInterval\`. Một dòng text hiển thị tổng giá, tính lại ngay từ state hiện tại (không gọi API, không debounce).

Toàn bộ ghế dùng \`OrbitControls\` có \`minDistance\`/\`maxDistance\` và \`minPolarAngle\`/\`maxPolarAngle\` để camera không lật xuống dưới sàn hay bay ra quá xa; bật \`shadows\` trên \`Canvas\` và \`castShadow\`/\`receiveShadow\` đúng chỗ. Geometry lặp lại (bốn chân dùng chung một hình trụ, mặt ghế và tựa lưng dùng chung một khối hộp) phải tạo đúng một lần bằng \`useMemo\`, không tạo mới bằng JSX \`<cylinderGeometry />\`/\`<boxGeometry />\` cho từng mesh, và phải tự \`.dispose()\` geometry đó trong cleanup effect khi unmount — vì geometry hoist ngoài JSX không được R3F auto-dispose.`,
      en: `Build a small product configurator with React Three Fiber: a mini chair assembled from several primitives (seat, backrest, four legs) — not a single block. Each part (\`seat\`, \`back\`, \`legs\`) gets its own color \`<select>\`; another \`<select>\` switches material finish between \`matte\`/\`satin\`/\`glossy\`, applying the matching \`roughness\` across the whole chair. A checkbox starts/stops a continuous turntable spin around the Y axis via \`useFrame\`, not \`setInterval\`. A text line shows the running total price, recomputed straight from current state (no API call, no debounce).

The whole chair sits under \`OrbitControls\` with \`minDistance\`/\`maxDistance\` and \`minPolarAngle\`/\`maxPolarAngle\` so the camera can't dip below the floor or fly off into the distance; enable \`shadows\` on the \`Canvas\` and set \`castShadow\`/\`receiveShadow\` where they belong. Repeated geometry (all four legs share one cylinder, the seat and backrest share one box) must be created exactly once with \`useMemo\`, not recreated per mesh via JSX \`<cylinderGeometry />\`/\`<boxGeometry />\`, and must be \`.dispose()\`d manually in a cleanup effect on unmount — geometry hoisted outside JSX is not auto-disposed by R3F.`,
    },
    starterCode: `import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

type PartKey = "seat" | "back" | "legs";
type PartColors = Record<PartKey, string>;
type Finish = "matte" | "satin" | "glossy";

const COLOR_OPTIONS = ["#ef4444", "#3b82f6", "#22c55e", "#eab308"];
const FINISH_ROUGHNESS: Record<Finish, number> = {
  matte: 0.9,
  satin: 0.5,
  glossy: 0.15,
};
const FINISH_SURCHARGE: Record<Finish, number> = {
  matte: 0,
  satin: 15,
  glossy: 35,
};
const BASE_PRICE = 120;

function ChairModel({
  colors,
  finish,
  spinning,
}: {
  colors: PartColors;
  finish: Finish;
  spinning: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const roughness = FINISH_ROUGHNESS[finish];

  // TODO 1: hoist ONE shared box geometry (seat + back reuse it via
  // \`scale\`) and ONE shared cylinder geometry (all four legs reuse it)
  // with useMemo. Do not put <boxGeometry />/<cylinderGeometry /> as JSX
  // children — that creates a separate instance per mesh instead of
  // sharing one.

  // TODO 2: geometry created outside JSX is NOT auto-disposed by R3F on
  // unmount — dispose both geometries yourself in a cleanup effect.

  useFrame((_, delta) => {
    // TODO 3: rotate groupRef.current.rotation.y by \`delta\` only while
    // \`spinning\` is true. Mutate the ref directly — do not store the
    // angle in React state (that would re-render every frame).
  });

  const legPositions: [number, number, number][] = [
    [-0.5, -0.42, -0.42],
    [0.5, -0.42, -0.42],
    [-0.5, -0.42, 0.42],
    [0.5, -0.42, 0.42],
  ];

  return (
    <group ref={groupRef} position={[0, 0.45, 0]}>
      {/* TODO 4: seat mesh — shared box geometry, scaled flat, material
          color = colors.seat, roughness = roughness */}
      {/* TODO 5: back mesh — same shared box geometry, scaled/positioned
          as a thin vertical panel, material color = colors.back */}
      {legPositions.map((position, i) => (
        <mesh key={i} position={position} castShadow>
          {/* TODO 6: use the shared leg geometry here instead of a new one */}
          <meshStandardMaterial color={colors.legs} roughness={roughness} />
        </mesh>
      ))}
    </group>
  );
}

function priceFor(finish: Finish): number {
  // TODO 7: base price + finish surcharge (color choice stays free)
  return 0;
}

export default function ChairConfigurator() {
  const [colors, setColors] = useState<PartColors>({
    seat: COLOR_OPTIONS[0],
    back: COLOR_OPTIONS[1],
    legs: COLOR_OPTIONS[2],
  });
  const [finish, setFinish] = useState<Finish>("satin");
  const [spinning, setSpinning] = useState(true);

  return (
    <div>
      {/* TODO 8: one <select> per part (seat/back/legs) updating colors,
          one <select> for finish, one checkbox for spinning — plain
          controlled inputs, no extra libraries */}
      <p>Total: \${priceFor(finish)}</p>
      <Canvas shadows camera={{ position: [2.6, 1.8, 3.2], fov: 40 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 4, 2]} intensity={1.2} castShadow />
        <ChairModel colors={colors} finish={finish} spinning={spinning} />
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[6, 6]} />
          <shadowMaterial opacity={0.25} />
        </mesh>
        {/* TODO 9: OrbitControls with minDistance/maxDistance and
            minPolarAngle/maxPolarAngle clamps */}
      </Canvas>
    </div>
  );
}`,
    solutionCode: `import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

type PartKey = "seat" | "back" | "legs";
type PartColors = Record<PartKey, string>;
type Finish = "matte" | "satin" | "glossy";

const COLOR_OPTIONS = ["#ef4444", "#3b82f6", "#22c55e", "#eab308"];
const FINISH_ROUGHNESS: Record<Finish, number> = {
  matte: 0.9,
  satin: 0.5,
  glossy: 0.15,
};
const FINISH_SURCHARGE: Record<Finish, number> = {
  matte: 0,
  satin: 15,
  glossy: 35,
};
const BASE_PRICE = 120;

function ChairModel({
  colors,
  finish,
  spinning,
}: {
  colors: PartColors;
  finish: Finish;
  spinning: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const roughness = FINISH_ROUGHNESS[finish];

  // Shared once: seat + back reuse this box via \`scale\`, all four legs
  // reuse the cylinder. Built with \`new\` inside useMemo on purpose (see
  // the cleanup effect below).
  const boxGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const legGeometry = useMemo(
    () => new THREE.CylinderGeometry(0.05, 0.05, 0.9, 12),
    [],
  );

  // R3F only auto-disposes geometry/material created as JSX children —
  // these two came from \`new\` inside useMemo, so nobody disposes them
  // unless we do it here.
  useEffect(() => {
    return () => {
      boxGeometry.dispose();
      legGeometry.dispose();
    };
  }, [boxGeometry, legGeometry]);

  useFrame((_, delta) => {
    if (spinning && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.6;
    }
  });

  const legPositions: [number, number, number][] = [
    [-0.5, -0.42, -0.42],
    [0.5, -0.42, -0.42],
    [-0.5, -0.42, 0.42],
    [0.5, -0.42, 0.42],
  ];

  return (
    <group ref={groupRef} position={[0, 0.45, 0]}>
      <mesh
        geometry={boxGeometry}
        scale={[1.2, 0.12, 1.1]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={colors.seat} roughness={roughness} />
      </mesh>
      <mesh
        geometry={boxGeometry}
        scale={[1.2, 0.9, 0.1]}
        position={[0, 0.5, -0.5]}
        castShadow
      >
        <meshStandardMaterial color={colors.back} roughness={roughness} />
      </mesh>
      {legPositions.map((position, i) => (
        <mesh key={i} geometry={legGeometry} position={position} castShadow>
          <meshStandardMaterial color={colors.legs} roughness={roughness} />
        </mesh>
      ))}
    </group>
  );
}

function priceFor(finish: Finish): number {
  return BASE_PRICE + FINISH_SURCHARGE[finish];
}

function PartColorSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <label>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {COLOR_OPTIONS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function ChairConfigurator() {
  const [colors, setColors] = useState<PartColors>({
    seat: COLOR_OPTIONS[0],
    back: COLOR_OPTIONS[1],
    legs: COLOR_OPTIONS[2],
  });
  const [finish, setFinish] = useState<Finish>("satin");
  const [spinning, setSpinning] = useState(true);

  function setPartColor(part: PartKey, color: string) {
    setColors((prev) => ({ ...prev, [part]: color }));
  }

  return (
    <div>
      <PartColorSelect
        label="Seat"
        value={colors.seat}
        onChange={(c) => setPartColor("seat", c)}
      />
      <PartColorSelect
        label="Back"
        value={colors.back}
        onChange={(c) => setPartColor("back", c)}
      />
      <PartColorSelect
        label="Legs"
        value={colors.legs}
        onChange={(c) => setPartColor("legs", c)}
      />
      <label>
        Finish
        <select
          value={finish}
          onChange={(e) => setFinish(e.target.value as Finish)}
        >
          <option value="matte">Matte</option>
          <option value="satin">Satin</option>
          <option value="glossy">Glossy</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={spinning}
          onChange={(e) => setSpinning(e.target.checked)}
        />
        Spin
      </label>
      <p>Total: \${priceFor(finish)}</p>

      <Canvas shadows camera={{ position: [2.6, 1.8, 3.2], fov: 40 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 4, 2]} intensity={1.2} castShadow />
        <ChairModel colors={colors} finish={finish} spinning={spinning} />
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[6, 6]} />
          <shadowMaterial opacity={0.25} />
        </mesh>
        <OrbitControls
          minDistance={2}
          maxDistance={6}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 2 - 0.05}
        />
      </Canvas>
    </div>
  );
}`,
    hints: [
      {
        vi: "Geometry hoist bằng `useMemo(() => new THREE.BoxGeometry(...), [])` chỉ chạy một lần — gắn nó vào nhiều `<mesh geometry={...}>` khác nhau bằng prop `geometry`, đừng viết `<boxGeometry />` làm con của từng mesh.",
        en: "Hoist geometry with `useMemo(() => new THREE.BoxGeometry(...), [])` so it only runs once — attach it to several `<mesh geometry={...}>` via the geometry prop, don't write `<boxGeometry />` as a child of each mesh.",
      },
      {
        vi: "R3F chỉ auto-dispose geometry/material tạo trực tiếp trong JSX. Geometry tạo bằng `new` trong `useMemo` phải tự `.dispose()` trong return của `useEffect`.",
        en: "R3F only auto-disposes geometry/material created directly in JSX. Geometry built with `new` inside `useMemo` needs its own `.dispose()` in a `useEffect` cleanup.",
      },
      {
        vi: "Turntable mượt vì `useFrame` mutate trực tiếp `groupRef.current.rotation.y` mỗi frame — không lưu góc quay vào `useState`, vì mỗi lần set state sẽ trigger re-render React không cần thiết 60 lần/giây.",
        en: "The turntable stays smooth because `useFrame` mutates `groupRef.current.rotation.y` directly every frame — don't store the angle in `useState`, or every tick triggers an unnecessary React re-render 60 times a second.",
      },
    ],
    checklist: [
      {
        vi: "Ghế được ghép từ nhiều primitive khác nhau (seat, back, 4 legs) — không phải một khối đơn",
        en: "The chair is assembled from several distinct primitives (seat, back, 4 legs) — not a single block",
      },
      {
        vi: "Đổi màu một phần (seat/back/legs) chỉ đổi đúng phần đó, không ảnh hưởng các phần còn lại",
        en: "Changing one part's color (seat/back/legs) only affects that part, not the others",
      },
      {
        vi: "Đổi material finish đổi roughness cho toàn bộ ghế theo đúng ba preset matte/satin/glossy",
        en: "Changing the material finish updates roughness across the whole chair for all three matte/satin/glossy presets",
      },
      {
        vi: "Bật/tắt turntable xoay mượt, không giật hay nhảy về góc 0 khi bật lại",
        en: "Toggling the turntable spins smoothly, with no jump back to angle 0 when re-enabled",
      },
      {
        vi: "Dòng giá cập nhật ngay khi đổi finish, không cần reload hay gọi API",
        en: "The price line updates immediately on a finish change, no reload or API call",
      },
      {
        vi: "Geometry dùng chung (box cho seat+back, cylinder cho 4 legs) được tạo đúng một lần bằng useMemo và tự dispose trong cleanup effect khi unmount",
        en: "The shared geometries (box for seat+back, cylinder for the 4 legs) are created exactly once with useMemo and disposed in a cleanup effect on unmount",
      },
      {
        vi: "OrbitControls có minDistance/maxDistance và minPolarAngle/maxPolarAngle để camera không lật xuống dưới sàn hoặc bay ra quá xa",
        en: "OrbitControls has minDistance/maxDistance and minPolarAngle/maxPolarAngle so the camera can't dip below the floor or fly off into the distance",
      },
      {
        vi: "Shadow bật trên Canvas, castShadow/receiveShadow đặt đúng mesh (ghế đổ bóng, sàn nhận bóng)",
        en: "Shadows are enabled on the Canvas, with castShadow/receiveShadow set on the right meshes (chair casts, floor receives)",
      },
    ],
  },
];
