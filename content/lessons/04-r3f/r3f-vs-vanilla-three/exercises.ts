import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "pointer-event-cost-relocation",
    kind: "concept",
    prompt: {
      vi: `Một scene có 50 mesh, mỗi mesh gắn \`onPointerOver\`. Trong R3F bạn không viết một dòng raycaster nào; trong Three.js thuần bạn phải tự raycast cả 50 mesh đó mỗi lần \`pointermove\` bắn ra. Giải thích: cơ chế bên trong \`<Canvas>\` của R3F thay thế công việc đó bằng gì, và chi phí raycast có thực sự biến mất hay chỉ chuyển sang chỗ khác — chuyển đi đâu?`,
      en: `A scene has 50 meshes, each with an \`onPointerOver\` handler. In R3F you don't write a single line of raycaster code; in vanilla Three.js you'd have to raycast all 50 meshes yourself every time \`pointermove\` fires. Explain what mechanism inside R3F's \`<Canvas>\` replaces that work, and whether the raycasting cost actually disappears or just moves somewhere else — where does it go?`,
    },
    hints: [
      {
        vi: "`<Canvas>` của R3F tự đăng ký đúng một hệ thống pointer event nội bộ khi mount, không phải bạn tự viết listener cho từng mesh.",
        en: "R3F's `<Canvas>` registers exactly one internal pointer event system on mount, not a listener you write per mesh.",
      },
      {
        vi: "Hệ thống đó vẫn phải raycast — chỉ là raycast một lần, tập trung, so với 50 lần bạn có thể viết trùng lặp và dễ sai nếu tự tay quản lý.",
        en: "That system still has to raycast — just once, centrally, versus 50 hand-written calls you could easily duplicate or get wrong if you managed it yourself.",
      },
    ],
    checklist: [
      {
        vi: "Tôi giải thích được R3F có một hệ thống pointer event trung tâm, không phải mỗi mesh tự raycast riêng",
        en: "I can explain that R3F has one centralized pointer event system, not each mesh raycasting on its own",
      },
      {
        vi: "Tôi chỉ ra được chi phí raycast KHÔNG biến mất — nó chỉ được R3F quản lý tập trung thay vì viết tay 50 lần",
        en: "I can point out the raycast cost does NOT disappear — R3F just centralizes it instead of 50 hand-written calls",
      },
      {
        vi: "Tôi liên hệ được với đoạn code vanilla trong demo của bài này (raycaster + intersectObject viết tay)",
        en: "I can connect this to the vanilla code shown in this lesson's demo (hand-written raycaster + intersectObject)",
      },
    ],
    solutionCode: `// R3F's <Canvas> mounts ONE PointerEvents manager (see the Hooks/Events
// docs cited in references.ts). On every pointermove it raycasts against
// the whole scene graph ONCE and dispatches onPointerOver/Out/Move to
// whichever JSX meshes registered a handler.
//
// The cost is NOT eliminated: 50 meshes still get checked against the
// ray. It's just centralized in one well-tested place instead of being
// hand-rolled (and possibly duplicated or buggy) 50 times across your
// own event listeners — exactly what the vanilla source in this lesson's
// demo has to do explicitly.`,
  },
  {
    id: "hand-roll-hover-raycast",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`isMeshHovered\` nhận \`pointerNDC: [number, number]\`, một \`THREE.PerspectiveCamera\` và một \`THREE.Mesh\`, trả về \`true\` nếu tia từ camera qua toạ độ NDC đó cắt mesh — đúng phần việc mà \`<Canvas>\` của R3F làm hộ bạn mỗi khi bạn viết \`onPointerOver\`. Dùng \`THREE.Raycaster\`.`,
      en: `Write a function \`isMeshHovered\` taking \`pointerNDC: [number, number]\`, a \`THREE.PerspectiveCamera\` and a \`THREE.Mesh\`, returning \`true\` if the ray from the camera through that NDC coordinate hits the mesh — exactly the work R3F's \`<Canvas>\` does for you whenever you write \`onPointerOver\`. Use \`THREE.Raycaster\`.`,
    },
    starterCode: `import * as THREE from "three";

function isMeshHovered(
  pointerNDC: [number, number],
  camera: THREE.PerspectiveCamera,
  mesh: THREE.Mesh,
): boolean {
  // TODO: tạo THREE.Raycaster, gọi setFromCamera với pointerNDC (dạng
  // Vector2) và camera, rồi kiểm tra intersectObject(mesh) có phần tử nào không.
  return false;
}`,
    solutionCode: `import * as THREE from "three";

function isMeshHovered(
  pointerNDC: [number, number],
  camera: THREE.PerspectiveCamera,
  mesh: THREE.Mesh,
): boolean {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(pointerNDC[0], pointerNDC[1]);
  raycaster.setFromCamera(pointer, camera);
  return raycaster.intersectObject(mesh).length > 0;
}`,
    hints: [
      {
        vi: "`setFromCamera` cần một `THREE.Vector2` ở toạ độ NDC $[-1,1]$, không phải toạ độ pixel — đúng công thức đã học ở Track 0.",
        en: "`setFromCamera` needs a `THREE.Vector2` in NDC coordinates $[-1,1]$, not pixel coordinates — the exact formula from Track 0.",
      },
      {
        vi: "`intersectObject` trả về một mảng điểm giao — mesh được hover khi mảng đó không rỗng, không cần đọc thêm gì khác trong bài này.",
        en: "`intersectObject` returns an array of intersection hits — the mesh is hovered when that array isn't empty, nothing else needs reading for this exercise.",
      },
    ],
    checklist: [
      {
        vi: "Hàm tạo mới `THREE.Raycaster` và `THREE.Vector2` đúng từ `pointerNDC`",
        en: "The function creates a new `THREE.Raycaster` and `THREE.Vector2` correctly from `pointerNDC`",
      },
      {
        vi: "`setFromCamera` được gọi trước `intersectObject`, không phải sau",
        en: "`setFromCamera` is called before `intersectObject`, not after",
      },
      {
        vi: "Tôi giải thích được đây chính xác là đoạn code mà `onPointerOver` của R3F chạy hộ mỗi khi pointer di chuyển",
        en: "I can explain this is exactly the code R3F's `onPointerOver` runs for you every time the pointer moves",
      },
    ],
  },
];
