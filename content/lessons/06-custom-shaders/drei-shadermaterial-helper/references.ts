import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "drei-shadermaterial-source",
    type: "repo",
    title: "pmndrs/drei — src/core/shaderMaterial.tsx",
    authors: ["Poimandres"],
    url: "https://github.com/pmndrs/drei/blob/master/src/core/shaderMaterial.tsx",
    note: {
      vi: "Toàn bộ helper chỉ ~25 dòng: một class kế thừa THREE.ShaderMaterial, dùng Object.defineProperty để biến mỗi key trong uniforms thành getter/setter đọc/ghi thẳng .uniforms[key].value — đọc trực tiếp source rẻ hơn đoán qua tên hàm.",
      en: "The whole helper is ~25 lines: a class extending THREE.ShaderMaterial that uses Object.defineProperty to turn each uniforms key into a getter/setter reading and writing .uniforms[key].value directly — reading the source is cheaper than guessing from the function name.",
    },
  },
  {
    id: "r3f-docs-extend-3rd-party",
    type: "article",
    title: "React Three Fiber Docs — Using 3rd-party Objects Declaratively",
    url: "https://r3f.docs.pmnd.rs/api/objects#using-3rd-party-objects-declaratively",
    note: {
      vi: "Tài liệu chính thức của extend({ WaveMaterial }) — cách một class Three bất kỳ (không chỉ shaderMaterial của drei) trở thành một JSX element viết thường camelCase.",
      en: "The official docs for extend({ WaveMaterial }) — how any Three.js class (not just drei's shaderMaterial) becomes a camelCased JSX element.",
    },
  },
  {
    id: "r3f-docs-hooks-useframe",
    type: "article",
    title: "React Three Fiber Docs — Hooks (useFrame, invalidate)",
    url: "https://r3f.docs.pmnd.rs/api/hooks",
    note: {
      vi: "Giải thích frameloop='demand' và invalidate() — nền cho lý do vì sao mutate uniform qua ref cần gọi invalidate() thủ công, còn đổi qua JSX prop thì reconciler tự lo.",
      en: "Explains frameloop='demand' and invalidate() — the background for why mutating a uniform through a ref needs a manual invalidate() call, while changing it through a JSX prop lets the reconciler handle it automatically.",
    },
  },
  {
    id: "threejs-docs-shadermaterial",
    type: "spec",
    title: "Three.js Docs — ShaderMaterial",
    authors: ["Three.js contributors"],
    url: "https://threejs.org/docs/#api/en/materials/ShaderMaterial",
    note: {
      vi: "Định nghĩa chuẩn cho .uniforms, .vertexShader, .fragmentShader mà cả class thuần lẫn class do shaderMaterial() sinh ra đều kế thừa — helper của drei không thay thế lớp này, chỉ bọc thêm getter/setter quanh nó.",
      en: "The canonical definition of .uniforms/.vertexShader/.fragmentShader that both the plain class and the class shaderMaterial() generates ultimately inherit — drei's helper doesn't replace this class, it just wraps getters/setters around it.",
    },
  },
];
