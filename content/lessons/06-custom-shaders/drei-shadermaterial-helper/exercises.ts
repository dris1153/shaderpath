import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "ref-vs-prop-frame-cost",
    kind: "concept",
    prompt: {
      vi: `Trong demo, thay vì mutate \`materialRef.current.uTime\` bên trong \`useFrame\`, tưởng tượng bạn đổi sang \`setState\` mỗi frame rồi truyền \`<waveMaterial uTime={uTime} />\` như một prop React bình thường.

(a) Ở 60fps trong một phiên xem demo dài 10 giây, có khoảng bao nhiêu lần component đó phải re-render, và bấy nhiêu lần R3F phải chạy \`applyProps\` để so khớp lại prop?

(b) Cách ref-mutation hiện tại của demo đi qua bao nhiêu bước trong số đó?

(c) Con số ở (a) có tự động nghĩa là "chậm, phải tránh JSX prop" không — vì sao?`,
      en: `In the demo, imagine replacing the \`useFrame\` ref-mutation of \`materialRef.current.uTime\` with a per-frame \`setState\` feeding \`<waveMaterial uTime={uTime} />\` as a normal React prop instead.

(a) At 60fps over a 10-second viewing session, roughly how many times would that component re-render, and how many times would R3F run \`applyProps\` to reconcile the prop?

(b) How many of those steps does the demo's current ref-mutation approach go through?

(c) Does the number in (a) automatically mean "slow, avoid JSX props" — why or why not?`,
    },
    hints: [
      {
        vi: "60 lần/giây × 10 giây là phép nhân trực tiếp — không cần công thức phức tạp hơn.",
        en: "60 times/second × 10 seconds is a direct multiplication — no fancier formula needed.",
      },
      {
        vi: "Ref-mutation không đi qua setState, không đi qua re-render, không đi qua applyProps — nó chỉ là `object.property = value`, y hệt code JS thuần bên ngoài React.",
        en: "Ref-mutation skips setState, skips re-render, skips applyProps — it's just `object.property = value`, exactly like plain JS code outside React.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng khoảng 600 lần re-render/applyProps (60 × 10)",
        en: "I correctly computed roughly 600 re-renders/applyProps calls (60 × 10)",
      },
      {
        vi: "Tôi trả lời đúng: ref-mutation đi qua 0 trong số các bước đó — chỉ một phép gán thuộc tính",
        en: "I correctly answered: ref-mutation goes through 0 of those steps — just a property assignment",
      },
      {
        vi: "Tôi giải thích được vì sao 600 lần KHÔNG tự động là 'chậm' — phải đo bằng profiler thật (Track 12) trước khi kết luận, vì con số tuyệt đối không nói lên nó có vượt ngân sách frame (16.6ms ở 60fps) hay không",
        en: "I explained why 600 times does NOT automatically mean 'slow' — a real profiler (Track 12) must measure it before concluding, since the raw count alone doesn't say whether it blows the frame budget (16.6ms at 60fps)",
      },
    ],
    solutionCode: `// (a) 60 fps * 10 s = 600 re-render, 600 lần applyProps so khớp lại TOÀN BỘ
//     object props (không chỉ uTime) mỗi lần.
//
// (b) 0. materialRef.current.uTime = value là một phép gán thuộc tính JS
//     thuần trong callback useFrame — không setState, không re-render,
//     không đi qua reconciler/applyProps của R3F.
//
// (c) Không tự động. 600 lần diff/10 giây nghe nhiều nhưng "nhiều" không
//     phải đơn vị đo hiệu năng — phải so với ngân sách frame (16.6ms ở
//     60fps) bằng profiler thật (Spector.js, React DevTools Profiler,
//     Track 12) mới biết applyProps của MỘT uniform có thực sự đáng lo hay
//     không. Với một vài material, khả năng cao vẫn nằm dưới ngưỡng cảm
//     nhận được; nhân lên hàng chục material cùng cập nhật mỗi frame mới là
//     lúc ref-mutation thật sự tạo khác biệt đo được.`,
  },
  {
    id: "type-a-custom-shader-element",
    kind: "code",
    prompt: {
      vi: `Bạn vừa tạo \`const GlowMaterial = shaderMaterial({ uIntensity: 1 }, vertexShader, fragmentShader);\`. Viết đủ code để: (1) đăng ký nó vào catalogue của R3F qua \`extend\`, và (2) khiến \`<glowMaterial uIntensity={2} />\` type-check sạch trong TypeScript — không \`any\`, không \`@ts-ignore\`.`,
      en: `You just created \`const GlowMaterial = shaderMaterial({ uIntensity: 1 }, vertexShader, fragmentShader);\`. Write enough code to: (1) register it into R3F's catalogue via \`extend\`, and (2) make \`<glowMaterial uIntensity={2} />\` type-check cleanly in TypeScript — no \`any\`, no \`@ts-ignore\`.`,
    },
    starterCode: `import { extend } from "@react-three/fiber";
import type { ThreeElement } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";

const GlowMaterial = shaderMaterial({ uIntensity: 1 }, vertexShader, fragmentShader);

// TODO 1: đăng ký GlowMaterial vào catalogue của R3F

// TODO 2: augment ThreeElements để <glowMaterial uIntensity={2} /> type-check`,
    solutionCode: `import { extend } from "@react-three/fiber";
import type { ThreeElement } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";

const GlowMaterial = shaderMaterial({ uIntensity: 1 }, vertexShader, fragmentShader);

extend({ GlowMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    glowMaterial: ThreeElement<typeof GlowMaterial>;
  }
}`,
    hints: [
      {
        vi: "`extend({ GlowMaterial })` dùng shorthand object property — key trở thành \"GlowMaterial\" (PascalCase), R3F tự đổi thành phần tử JSX viết thường \"glowMaterial\".",
        en: "`extend({ GlowMaterial })` uses object shorthand — the key becomes \"GlowMaterial\" (PascalCase), R3F automatically maps it to the lowercase JSX element \"glowMaterial\".",
      },
      {
        vi: "`declare module \"@react-three/fiber\" { interface ThreeElements { ... } }` là DECLARATION MERGING — nó mở rộng interface có sẵn của thư viện, không tạo ra một `ThreeElements` mới đè lên cái cũ.",
        en: "`declare module \"@react-three/fiber\" { interface ThreeElements { ... } }` is DECLARATION MERGING — it extends the library's existing interface, it doesn't create a new `ThreeElements` that overwrites the old one.",
      },
    ],
    checklist: [
      {
        vi: "Gọi extend({ GlowMaterial }) đúng cú pháp shorthand",
        en: "extend({ GlowMaterial }) is called with the correct shorthand syntax",
      },
      {
        vi: "Khối declare module dùng đúng tên module \"@react-three/fiber\" và interface ThreeElements",
        en: "The declare module block uses the exact module name \"@react-three/fiber\" and the ThreeElements interface",
      },
      {
        vi: "Key glowMaterial viết thường chữ cái đầu, kiểu ThreeElement<typeof GlowMaterial>, không any/@ts-ignore ở đâu cả",
        en: "The glowMaterial key is lowercase-first, typed ThreeElement<typeof GlowMaterial>, no any/@ts-ignore anywhere",
      },
    ],
  },
];
