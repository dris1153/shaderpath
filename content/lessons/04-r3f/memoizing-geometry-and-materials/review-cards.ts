import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "usememo-missing-dependency",
    q: {
      vi: "`useMemo(() => new THREE.MeshStandardMaterial({ color }), [])`. Prop `color` đổi liên tục thì material ra sao, và sửa thế nào?",
      en: "`useMemo(() => new THREE.MeshStandardMaterial({ color }), [])`. When the `color` prop keeps changing, what does the material do, and how do you fix it?",
    },
    a: {
      vi: "Đóng băng ở màu ban đầu: deps rỗng nên material không bao giờ được tạo lại. Thêm `color` vào deps (và dispose bản cũ), hoặc giữ một material rồi gọi `material.color.set(color)` khi prop đổi.",
      en: "It freezes at the first color: with empty deps the material is never recreated. Add `color` to the deps (and dispose the old one), or keep one material and call `material.color.set(color)` when the prop changes.",
    },
  },
  {
    id: "siblings-do-not-dedupe",
    q: {
      vi: "200 `<mesh>` trong một `.map()`, mỗi cái chứa `<boxGeometry args={[0.6, 0.6, 0.6]} />`. Có bao nhiêu geometry được tạo, và vì sao?",
      en: "200 `<mesh>` elements in a `.map()`, each containing `<boxGeometry args={[0.6, 0.6, 0.6]} />`. How many geometries are created, and why?",
    },
    a: {
      vi: "200. So sánh `args` chỉ đối chiếu một element với chính nó ở lần render trước, không gộp giữa các element anh em. Tạo một geometry ở module scope (hoặc `useMemo`) rồi truyền `geometry={geo}` cho cả 200 mesh.",
      en: "200. The `args` comparison only checks an element against itself from the previous render; it never merges siblings. Create one geometry at module scope (or with `useMemo`) and pass `geometry={geo}` to all 200 meshes.",
    },
  },
  {
    id: "programs-already-shared",
    q: {
      vi: "200 mesh đang mỗi cái một instance `MeshStandardMaterial` giống hệt nhau. Chuyển sang dùng chung một instance, `renderer.info.programs` có giảm không, và vì sao?",
      en: "200 meshes each have their own identical `MeshStandardMaterial` instance. Switching them to one shared instance, does `renderer.info.programs` go down, and why?",
    },
    a: {
      vi: "Không: Three.js vốn đã dùng chung shader program theo cache key cấu trúc — cùng loại material, cùng cấu hình thì cùng một program — bất kể có chia sẻ instance hay không. Chia sẻ instance tiết kiệm object và state phía JavaScript, không phải program GPU.",
      en: "No: Three.js already shares shader programs by a structural cache key — same material type and configuration, same program — whether or not instances are shared. Sharing the instance saves JavaScript objects and state, not GPU programs.",
    },
  },
];
