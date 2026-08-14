import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "html-occlude-cost-vs-analytic",
    kind: "concept",
    prompt: {
      vi: `Một scene R3F có 40 marker trên một quả cầu xoay liên tục, mỗi marker cần một nhãn text neo đúng vị trí 3D của nó và tự ẩn khi nằm ở mặt sau quả cầu (bị chính quả cầu che). Có hai cách triển khai: (A) 40 \`<Html occlude>\` riêng biệt; (B) tự viết một phép kiểm tra hình học cho đúng trường hợp "che bởi một quả cầu".

Không chạy code: giải thích chi phí raycast mỗi frame của (A) tăng theo $n$ (số marker) và $m$ (số mesh trong scene) như thế nào — rồi mô tả một phép tính thay thế cho (B), chạy $O(n)$ mà không cần raycast, tận dụng đúng việc occluder là một quả cầu.`,
      en: `An R3F scene has 40 markers on a continuously-rotating sphere, each needing a text label anchored to its exact 3D position that hides itself when on the sphere's far side (occluded by the sphere itself). Two implementation choices: (A) 40 separate \`<Html occlude>\`; (B) a hand-written geometric test specific to "occluded by a sphere."

Without running code: explain how (A)'s per-frame raycast cost scales with $n$ (marker count) and $m$ (scene mesh count) — then describe a replacement calculation for (B) that runs in $O(n)$ with no raycasting at all, exploiting the fact that the occluder is specifically a sphere.`,
    },
    hints: [
      {
        vi: "Mỗi `<Html occlude>` raycast độc lập, không chia sẻ kết quả với instance khác — n marker nghĩa là n lần raycast, mỗi lần lại duyệt qua các mesh trong scene để tìm giao điểm gần nhất.",
        en: "Each `<Html occlude>` raycasts independently, sharing no result with other instances — n markers means n raycasts, each one sweeping through the scene's meshes looking for the nearest hit.",
      },
      {
        vi: "Với một quả cầu, một marker bị che khi và chỉ khi nó nằm ở \"nửa sau\" nhìn từ camera — điều này suy ra trực tiếp từ dấu của một dot product, không cần bắn tia hình học thật.",
        en: "For a sphere, a marker is occluded exactly when it sits on the \"far half\" as seen from the camera — that falls straight out of the sign of a dot product, no real geometric ray needed.",
      },
    ],
    checklist: [
      {
        vi: "Tôi giải thích được chi phí của (A) tăng theo tích $n \\times m$, không phải hằng số hay chỉ tuyến tính theo $n$",
        en: "I can explain that (A)'s cost scales with the product $n \\times m$, not a constant or only linear in $n$",
      },
      {
        vi: "Tôi mô tả được phép dot product thay thế cho (B) và giải thích vì sao nó chạy $O(n)$",
        en: "I can describe the dot-product replacement for (B) and explain why it runs in $O(n)$",
      },
      {
        vi: "Tôi chỉ ra được ít nhất một tình huống (A) generic vẫn đáng dùng hơn (B) tự viết",
        en: "I can identify at least one situation where generic (A) is still worth using over hand-written (B)",
      },
    ],
    solutionCode: `// (A) 40x <Html occlude>: mỗi instance tự raycast từ camera tới điểm neo
// của NÓ, kiểm tra va chạm với các mesh trong scene — n marker × m mesh
// occluder ⇒ chi phí ~O(n·m) raycast test mỗi frame, không chia sẻ được
// giữa các marker dù chúng cùng bị một quả cầu duy nhất che.

// (B) Occluder là một quả cầu tâm C, bán kính r. Marker tại vị trí P bị
// che khi nó nằm ở nửa hướng ra xa camera:
//
//   toMarker = normalize(P - C)
//   toCamera = normalize(camera.position - C)
//   visible  = dot(toMarker, toCamera) > 0
//
// Một dot product mỗi marker, không raycast, không phụ thuộc số mesh
// khác trong scene ⇒ O(n) thay vì O(n·m). Vẫn nên dùng (A) khi occluder
// không phải hình đơn giản (mesh bất kỳ, nhiều lớp che nhau) hoặc số
// marker quá ít để chênh lệch hiệu năng còn đáng để viết code riêng.`,
  },
  {
    id: "wrap-dynamic-row-in-center",
    kind: "code",
    prompt: {
      vi: `\`AutoCenteredRow\` bên dưới vẽ một hàng \`count\` box, nhưng luôn bắt đầu từ $x = 0$ và mọc dần sang phải — không bao giờ căn giữa gốc toạ độ, và đổi \`count\` không tự sửa lại vị trí. Sửa bằng \`Center\` của drei để cả hàng luôn căn giữa gốc bất kể \`count\`, mà KHÔNG đổi công thức tính \`position\` của từng box.`,
      en: `\`AutoCenteredRow\` below draws a row of \`count\` boxes, but always starts at $x = 0$ and grows rightward — never centered on the origin, and changing \`count\` doesn't fix the offset. Fix it with drei's \`Center\` so the whole row stays centered on the origin regardless of \`count\`, WITHOUT changing the per-box \`position\` formula.`,
    },
    starterCode: `// BUG: row always starts at x=0 and grows rightward — never centered on
// the origin, and re-centering by hand means recomputing an offset every
// time \`count\` changes.
function AutoCenteredRow({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} position={[i * 1.2, 0, 0]}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
      ))}
    </>
  );
}

// TODO: wrap the row below in drei's <Center> so it's always centered on
// the origin, no matter what \`count\` is — without touching the per-box
// position calculation above.`,
    solutionCode: `import { Center } from "@react-three/drei";

function AutoCenteredRow({ count }: { count: number }) {
  return (
    <Center>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} position={[i * 1.2, 0, 0]}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
      ))}
    </Center>
  );
}`,
    hints: [
      {
        vi: "`Center` đo bounding box thật của children rồi tự dịch một group cha đúng bằng lượng cần thiết — bạn không cần tự tính offset `-((count-1) * 1.2) / 2`.",
        en: "`Center` measures its children's real bounding box and shifts a parent group by exactly the right amount — you don't need to hand-compute an offset like `-((count-1) * 1.2) / 2`.",
      },
      {
        vi: "Chỉ cần bọc `<Center>` quanh đúng phần JSX đang trả về; không sửa dòng nào bên trong `.map`/`Array.from`.",
        en: "Just wrap `<Center>` around the exact JSX already being returned; don't touch any line inside the `.map`/`Array.from` call.",
      },
    ],
    checklist: [
      {
        vi: "Import `Center` từ `\"@react-three/drei\"`",
        en: "`Center` is imported from `\"@react-three/drei\"`",
      },
      {
        vi: "Toàn bộ mảng box được bọc bên trong `<Center>`",
        en: "The entire array of boxes is wrapped inside `<Center>`",
      },
      {
        vi: "Công thức vị trí từng box (`i * 1.2`) giữ nguyên, không bị sửa",
        en: "Each box's position formula (`i * 1.2`) stays unchanged",
      },
    ],
  },
];
