import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "r3f-docs-objects",
    type: "article",
    title: "React Three Fiber Docs — Objects, Properties & Args",
    authors: ["Poimandres"],
    url: "https://r3f.docs.pmnd.rs/api/objects",
    note: {
      vi: "Nguồn chính thức cho args, property prop, pierced prop (dấu gạch ngang) và attach — gần như toàn bộ nội dung bài này bám sát đúng trang này.",
      en: "The official source for args, property props, pierced (dash) props and attach — almost everything in this lesson maps directly onto this page.",
    },
  },
  {
    id: "threejs-docs-mesh",
    type: "article",
    title: "Three.js Docs — Mesh",
    authors: ["three.js contributors"],
    url: "https://threejs.org/docs/#api/en/objects/Mesh",
    note: {
      vi: "Constructor thật của THREE.Mesh(geometry, material) — đối chiếu để thấy args trong <mesh> JSX ánh xạ đúng vào đâu, dù trong thực tế mesh hiếm khi cần args.",
      en: "The real THREE.Mesh(geometry, material) constructor — cross-check to see exactly where args on <mesh> JSX would map, even though a mesh rarely needs args in practice.",
    },
  },
  {
    id: "threejs-docs-color",
    type: "article",
    title: "Three.js Docs — Color",
    authors: ["three.js contributors"],
    url: "https://threejs.org/docs/#api/en/math/Color",
    note: {
      vi: 'Xác nhận Color.set() chấp nhận chuỗi CSS/hex — cơ sở cho việc prop color="hotpink" hoạt động mà không tạo Color mới.',
      en: 'Confirms Color.set() accepts CSS/hex strings — the basis for why the color="hotpink" prop works without constructing a new Color.',
    },
  },
  {
    id: "r3f-docs-additional-exports",
    type: "article",
    title: "React Three Fiber Docs — Additional Exports",
    authors: ["Poimandres"],
    url: "https://r3f.docs.pmnd.rs/api/additional-exports",
    note: {
      vi: "Liệt kê extend() cùng các export tiện ích khác — nguồn cho phần cuối bài giới thiệu cách đăng ký một class ngoài namespace THREE mặc định.",
      en: "Lists extend() alongside R3F's other utility exports — the source for this lesson's closing section on registering a class outside the default THREE namespace.",
    },
  },
];
