import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "geometry-attaches-to-nearest-host",
    q: {
      vi: "Bạn đặt `<boxGeometry />` bên trong `<group>` thay vì bên trong `<mesh>`. Có lỗi không, và trên màn hình hiện gì?",
      en: "You put `<boxGeometry />` inside a `<group>` instead of a `<mesh>`. Is there an error, and what shows on screen?",
    },
    a: {
      vi: "Không lỗi, và không hiện gì. Auto-attach gắn theo kiểu instance vào host cha gần nhất, nên geometry thành `group.geometry` — một property mà group không dùng. (Bọc qua component React tự viết thì vẫn ổn, vì component không tạo host node.)",
      en: "No error, and nothing shows. Auto-attach binds by instance type to the nearest host parent, so the geometry becomes `group.geometry` — a property a group never uses. (Wrapping it in your own React component is fine, since components create no host node.)",
    },
  },
  {
    id: "color-string-reuses-instance",
    q: {
      vi: "`<meshStandardMaterial color=\"hotpink\" />` nằm trong một component re-render 60 lần mỗi giây. R3F có tạo 60 `THREE.Color` mới mỗi giây không?",
      en: "`<meshStandardMaterial color=\"hotpink\" />` sits in a component that re-renders 60 times a second. Does R3F allocate 60 new `THREE.Color` objects per second?",
    },
    a: {
      vi: "Không: re-render với cùng chuỗi thì bước diff của R3F thấy prop không đổi và bỏ qua hẳn; chỉ khi giá trị đổi nó mới gọi `.set()` trên Color có sẵn của material. Object rác chỉ xuất hiện nếu chính bạn `new THREE.Color()` trong thân component (ngoài `useMemo`) rồi truyền qua một prop.",
      en: "No: re-rendering with the same string, R3F's diff sees an unchanged prop and skips it entirely; only when the value changes does it call `.set()` on the material's existing Color. Garbage appears only if you yourself call `new THREE.Color()` in the component body (outside `useMemo`) and pass it through a prop.",
    },
  },
];
