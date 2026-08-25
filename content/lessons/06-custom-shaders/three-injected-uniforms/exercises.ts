import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "normal-matrix-nonuniform-scale",
    kind: "concept",
    prompt: {
      vi: `Một mesh chỉ bị scale (không xoay) theo $M = \\mathrm{diag}(2, 1, 1)$ — kéo dài gấp đôi theo trục X cục bộ. Pháp tuyến gốc (trước biến đổi) là $\\vec n = (\\tfrac{1}{\\sqrt2}, \\tfrac{1}{\\sqrt2}, 0)$. Không chạy code: (a) tính $M\\vec n$ (biến đổi SAI, dùng thẳng $M$ thay vì normal matrix) và nhận xét nó nghiêng về phía trục nào so với $\\vec n$ gốc; (b) tính $N\\vec n$ với $N$ là normal matrix đúng ($N = (M^{-1})^{\\mathsf T}$, và vì $M$ là ma trận đường chéo nên phép tính rút gọn còn lấy nghịch đảo từng phần tử trên đường chéo), rồi so sánh hướng nghiêng với câu (a).

Sau đó: trong ba khai báo \`uniform mat4 modelMatrix;\`, \`uniform mat3 uNormalHelper;\`, \`uniform vec3 cameraPosition;\` thêm vào MỘT ShaderMaterial thường, khai báo nào gây lỗi redefinition và khai báo nào biên dịch bình thường?`,
      en: `A mesh is only scaled (no rotation) by $M = \\mathrm{diag}(2, 1, 1)$ — stretched 2× along local X. The original (pre-transform) normal is $\\vec n = (\\tfrac{1}{\\sqrt2}, \\tfrac{1}{\\sqrt2}, 0)$. Without running code: (a) compute $M\\vec n$ (the WRONG transform, applying $M$ directly instead of the normal matrix) and note which axis it leans toward compared to the original $\\vec n$; (b) compute $N\\vec n$ where $N$ is the correct normal matrix ($N = (M^{-1})^{\\mathsf T}$, and since $M$ is diagonal this reduces to taking the reciprocal of each diagonal entry), then compare its lean direction against (a).

Then: among these three declarations — \`uniform mat4 modelMatrix;\`, \`uniform mat3 uNormalHelper;\`, \`uniform vec3 cameraPosition;\` — added to a SINGLE regular ShaderMaterial, which ones trigger a redefinition error and which compile fine?`,
    },
    hints: [
      {
        vi: "$M\\vec n$ chỉ là nhân từng thành phần: $(2 \\cdot \\tfrac{1}{\\sqrt2},\\ 1 \\cdot \\tfrac{1}{\\sqrt2},\\ 0)$. Đừng vội chuẩn hoá lại — so sánh TỈ LỆ giữa thành phần X và Y trước rồi mới normalize để thấy hướng nghiêng.",
        en: "$M\\vec n$ is just component-wise multiplication: $(2 \\cdot \\tfrac{1}{\\sqrt2},\\ 1 \\cdot \\tfrac{1}{\\sqrt2},\\ 0)$. Don't renormalize right away — compare the RATIO between the X and Y components first, then normalize to see the lean direction.",
      },
      {
        vi: "Ma trận đường chéo có nghịch đảo là nghịch đảo từng phần tử, và chuyển vị của nó là chính nó — nên $N = \\mathrm{diag}(1/2, 1, 1)$, không cần công thức nghịch đảo tổng quát.",
        en: "A diagonal matrix's inverse is the element-wise reciprocal, and its transpose is itself — so $N = \\mathrm{diag}(1/2, 1, 1)$, no need for the general matrix-inverse formula.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tự tính $M\\vec n$ và mô tả được nó nghiêng về phía trục nào — và vì sao đó là hướng sai",
        en: "I computed $M\\vec n$ myself and can describe which axis it leans toward — and why that direction is wrong",
      },
      {
        vi: "Tôi tự tính $N\\vec n$, normalize xong so với $M\\vec n$ và giải thích được khác biệt giữa hai kết quả",
        en: "I computed $N\\vec n$ myself, normalized it, compared it against $M\\vec n$ and can explain the difference",
      },
      {
        vi: "Tôi phân loại cả ba khai báo redefinition-hay-không bằng cách đối chiếu từng tên với prelude, không đoán theo hình thức",
        en: "I classified all three declarations as redefinition-or-not by checking each name against the prelude, not by guessing from their shape",
      },
    ],
    solutionNote: {
      vi: `(a) $M\\vec n = \\mathrm{diag}(2,1,1) \\cdot (\\tfrac{1}{\\sqrt2}, \\tfrac{1}{\\sqrt2}, 0) = (\\tfrac{2}{\\sqrt2}, \\tfrac{1}{\\sqrt2}, 0) = (\\sqrt2, \\tfrac{1}{\\sqrt2}, 0)$ — thành phần X lớn hơn Y ~2 lần → nghiêng THÊM về trục X vừa kéo dài (SAI về mặt hình học).

(b) $M$ là đường chéo → $M^{-1} = \\mathrm{diag}(0.5, 1, 1)$, chuyển vị của ma trận đường chéo là chính nó → $N = \\mathrm{diag}(0.5, 1, 1)$. $N\\vec n = (0.5 \\cdot \\tfrac{1}{\\sqrt2}, \\tfrac{1}{\\sqrt2}, 0) = (\\tfrac{1}{2\\sqrt2}, \\tfrac{1}{\\sqrt2}, 0)$ — sau khi normalize, thành phần Y lớn hơn X → nghiêng về trục Y, tức RA XA trục X vừa kéo dài (ĐÚNG: mặt càng bị kéo dài theo X thì càng "phẳng" ra theo X).

\`uniform mat4 modelMatrix;\` → LỖI redefinition (Three đã chèn sẵn). \`uniform mat3 uNormalHelper;\` → OK (tên tự đặt, không trùng built-in). \`uniform vec3 cameraPosition;\` → LỖI redefinition (Three đã chèn sẵn).`,
      en: `(a) $M\\vec n = \\mathrm{diag}(2,1,1) \\cdot (\\tfrac{1}{\\sqrt2}, \\tfrac{1}{\\sqrt2}, 0) = (\\tfrac{2}{\\sqrt2}, \\tfrac{1}{\\sqrt2}, 0) = (\\sqrt2, \\tfrac{1}{\\sqrt2}, 0)$ — the X component is ~2x larger than Y → leans FURTHER toward the just-stretched X axis (WRONG geometrically).

(b) $M$ is diagonal → $M^{-1} = \\mathrm{diag}(0.5, 1, 1)$, and a diagonal matrix's transpose is itself → $N = \\mathrm{diag}(0.5, 1, 1)$. $N\\vec n = (0.5 \\cdot \\tfrac{1}{\\sqrt2}, \\tfrac{1}{\\sqrt2}, 0) = (\\tfrac{1}{2\\sqrt2}, \\tfrac{1}{\\sqrt2}, 0)$ — after normalizing, the Y component is larger than X → leans toward Y, i.e. AWAY from the just-stretched X axis (CORRECT: the more a surface is stretched along X, the "flatter" it becomes along X).

\`uniform mat4 modelMatrix;\` → redefinition ERROR (Three already injects it). \`uniform mat3 uNormalHelper;\` → OK (custom name, no built-in collision). \`uniform vec3 cameraPosition;\` → redefinition ERROR (Three already injects it).`,
    },
  },
  {
    id: "fix-uniform-recreate-antipattern",
    kind: "code",
    prompt: {
      vi: `Component R3F dưới đây cập nhật \`uTime\` bằng cách gọi \`setTime\` (React state) mỗi frame trong \`useFrame\`, rồi truyền một object \`uniforms\` MỚI vào \`<shaderMaterial>\` ở mỗi lần render — đúng anti-pattern bài học vừa nói (buộc React re-render toàn bộ subtree hàng chục lần/giây, chỉ để ghi một con số). Viết lại theo đúng "mẫu nhà": tạo object uniforms một lần bằng \`useMemo\`, cập nhật \`.value\` trực tiếp trong \`useFrame\`, không dùng \`useState\` cho giá trị animate theo thời gian — và bind object đó vào material qua ref bằng hook nhà \`useSharedUniforms\` (\`lib/hooks/use-shared-uniforms.ts\`), KHÔNG truyền qua prop \`uniforms\`: R3F copy từng entry của prop vào map riêng của material lúc mount, nên mutate object gốc qua đường prop sẽ không bao giờ tới GPU.`,
      en: `The R3F component below updates \`uTime\` by calling \`setTime\` (React state) every frame inside \`useFrame\`, then passes a NEW \`uniforms\` object into \`<shaderMaterial>\` on every render — exactly the anti-pattern this lesson just covered (forcing a full subtree React re-render dozens of times per second, just to write one number). Rewrite it using the "house pattern": create the uniforms object once with \`useMemo\`, update \`.value\` directly inside \`useFrame\`, drop \`useState\` for the time-animated value — and bind the object to the material by ref with the house hook \`useSharedUniforms\` (\`lib/hooks/use-shared-uniforms.ts\`), NOT via the \`uniforms\` prop: R3F copies each prop entry into the material's own map at mount, so mutating the original through the prop route never reaches the GPU.`,
    },
    starterCode: `function GlowMesh() {
  const [time, setTime] = useState(0);

  useFrame((state) => {
    setTime(state.clock.elapsedTime); // TODO: drop setState, mutate directly
  });

  return (
    <mesh>
      <icosahedronGeometry args={[1, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ uTime: { value: time } }} // TODO: new object every render — and the prop itself copies entries away from you
      />
    </mesh>
  );
}`,
    solutionCode: `function GlowMesh() {
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  // Assigns material.uniforms = uniforms BY REFERENCE — the uniforms prop
  // would copy each entry into the material's own map, freezing them.
  const bindUniforms = useSharedUniforms(uniforms);

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime; // write directly, no setState
  });

  return (
    <mesh>
      <icosahedronGeometry args={[1, 2]} />
      <shaderMaterial
        ref={bindUniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}`,
    hints: [
      {
        vi: "`useMemo(() => ({ uTime: { value: 0 } }), [])` tạo object uniforms đúng một lần — mảng dependency rỗng nghĩa là không bao giờ tạo lại.",
        en: "`useMemo(() => ({ uTime: { value: 0 } }), [])` creates the uniforms object exactly once — an empty dependency array means it's never recreated.",
      },
      {
        vi: "`useFrame` chạy ngoài chu kỳ render của React — ghi thẳng `uniforms.uTime.value = ...` trong đó không kích hoạt re-render nào, khác hẳn `setState`.",
        en: "`useFrame` runs outside React's render cycle — writing `uniforms.uTime.value = ...` directly inside it triggers no re-render at all, unlike `setState`.",
      },
      {
        vi: "`useSharedUniforms(uniforms)` trả về một callback ref: gắn vào `<shaderMaterial ref={...}>` là material dùng CHÍNH object bạn mutate, thay vì bản copy mà prop `uniforms` tạo ra.",
        en: "`useSharedUniforms(uniforms)` returns a callback ref: attach it as `<shaderMaterial ref={...}>` and the material uses the VERY object you mutate, instead of the copy the `uniforms` prop creates.",
      },
    ],
    checklist: [
      {
        vi: "Không còn `useState` cho giá trị animate theo thời gian",
        en: "No more `useState` for the time-animated value",
      },
      {
        vi: "Object `uniforms` được tạo đúng một lần (useMemo, deps rỗng), không phải một literal mới mỗi render",
        en: "The `uniforms` object is created exactly once (useMemo, empty deps), not a fresh literal every render",
      },
      {
        vi: "`<shaderMaterial>` bind qua `ref={useSharedUniforms(uniforms)}` — không còn prop `uniforms` nào nữa",
        en: "`<shaderMaterial>` binds via `ref={useSharedUniforms(uniforms)}` — no `uniforms` prop remains",
      },
    ],
  },
];
