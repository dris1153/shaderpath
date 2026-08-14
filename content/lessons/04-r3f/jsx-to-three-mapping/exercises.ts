import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "args-vs-property-cost",
    kind: "concept",
    prompt: {
      vi: `Bạn có \`<boxGeometry args={[w, h, d]} />\` với \`w\` nối vào một slider, và tách riêng \`<mesh scale-x={sx} />\` với \`sx\` nối vào một slider khác — cả hai trực quan đều làm khối hộp rộng ra. Kéo mỗi slider 60 lần một giây trong 3 giây liên tục.

Thao tác nào tốn hiệu năng hơn, và chính xác điều gì xảy ra bên dưới ở MỖI lần kéo cho từng thao tác?`,
      en: `You have \`<boxGeometry args={[w, h, d]} />\` with \`w\` wired to a slider, and separately \`<mesh scale-x={sx} />\` with \`sx\` wired to a different slider — both visually widen the box. You drag each slider 60 times a second for 3 straight seconds.

Which one is more expensive performance-wise, and exactly what happens underneath on EACH drag tick for each one?`,
    },
    hints: [
      {
        vi: "args chỉ chạy trong đúng lệnh gọi constructor — không có setter nào đổi kích thước một BufferGeometry đã dựng xong.",
        en: "args only runs inside the constructor call itself — there's no setter to resize a BufferGeometry that's already been built.",
      },
      {
        vi: "scale-x là pierced prop trỏ vào Vector3 scale đã tồn tại trên mesh — R3F chỉ ghi lại một số, không đụng gì tới buffer GPU nào.",
        en: "scale-x is a pierced prop pointing into the mesh's existing scale Vector3 — R3F just writes a number, touching no GPU buffer at all.",
      },
    ],
    checklist: [
      {
        vi: "Tôi xác định đúng: đổi w (qua args) đắt hơn nhiều so với đổi sx (qua scale-x)",
        en: "I correctly identified that changing w (via args) is far more expensive than changing sx (via scale-x)",
      },
      {
        vi: "Tôi giải thích được đổi args huỷ geometry cũ, dựng lại và upload buffer GPU mới ở mỗi lần kéo",
        en: "I can explain that changing args destroys the old geometry, rebuilds it, and uploads a fresh GPU buffer on every drag tick",
      },
      {
        vi: "Tôi giải thích được đổi scale-x chỉ mutate một số trong Vector3 đã có sẵn, không object nào bị tạo hay huỷ",
        en: "I can explain that changing scale-x only mutates a number in an existing Vector3, with no object created or destroyed",
      },
    ],
    solutionCode: `// w qua args: mỗi lần kéo → new THREE.BoxGeometry(w, h, d) chạy lại từ
// đầu, geometry cũ bị .dispose(), buffer vertex/index mới được upload lên
// GPU. 60 lần/giây × 3 giây = 180 lần huỷ + dựng + upload.
//
// sx qua scale-x (pierced prop): mỗi lần kéo → mesh.scale.x = sx, chỉ ghi
// một number vào Vector3 ĐÃ tồn tại trên mesh. Không object nào bị tạo hay
// huỷ, không buffer GPU nào bị đụng tới — rẻ hơn nhiều bậc so với args.`,
  },
  {
    id: "resolve-pierced-prop-path",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`resolvePierced(root, dashedProp)\` mô phỏng đúng cách R3F phân giải một pierced prop: tách \`dashedProp\` theo dấu gạch ngang, đi vào \`root\` qua từng bước TRỪ bước cuối, rồi trả về \`{ target, key }\` — object cha thật sự cần gán và tên property cuối cùng trên object đó. Ví dụ \`resolvePierced(mesh, "material-color")\` phải trả về \`target = mesh.material\`, \`key = "color"\`.`,
      en: `Write a \`resolvePierced(root, dashedProp)\` function mirroring exactly how R3F resolves a pierced prop: split \`dashedProp\` on dashes, walk into \`root\` through every step EXCEPT the last, and return \`{ target, key }\` — the actual parent object to assign into and the final property name on it. For example, \`resolvePierced(mesh, "material-color")\` must return \`target = mesh.material\`, \`key = "color"\`.`,
    },
    starterCode: `interface Resolved {
  target: Record<string, unknown>;
  key: string;
}

function resolvePierced(root: Record<string, unknown>, dashedProp: string): Resolved {
  // TODO 1: split dashedProp on "-" -- the LAST piece is always the real key
  // TODO 2: walk root through every piece BEFORE the last one
  // TODO 3: return { target, key } -- target is where the key gets assigned
  return { target: root, key: dashedProp };
}`,
    solutionCode: `interface Resolved {
  target: Record<string, unknown>;
  key: string;
}

function resolvePierced(root: Record<string, unknown>, dashedProp: string): Resolved {
  const parts = dashedProp.split("-");
  const key = parts.pop()!; // last piece is always the real property name
  let target = root;
  for (const part of parts) {
    target = target[part] as Record<string, unknown>;
  }
  return { target, key };
}`,
    hints: [
      {
        vi: 'dashedProp.split("-") cho ra một mảng các bước; phần tử CUỐI luôn là property thật cần gán, các phần trước là đường dẫn để "đi vào".',
        en: 'dashedProp.split("-") gives an array of steps; the LAST element is always the real property to assign, the earlier ones are the path to walk into.',
      },
      {
        vi: 'Không dấu gạch nào (như "visible") vẫn phải hoạt động đúng — mảng chỉ có 1 phần tử, vòng lặp "đi vào" không chạy lần nào, target vẫn là chính root.',
        en: 'No dashes at all (like "visible") still has to work correctly — the array has 1 element, the walking loop never runs, target stays the root itself.',
      },
    ],
    checklist: [
      {
        vi: 'resolvePierced(mesh, "material-color") trả về target là mesh.material, key là "color"',
        en: 'resolvePierced(mesh, "material-color") returns target as mesh.material, key as "color"',
      },
      {
        vi: 'resolvePierced(mesh, "position-x") trả về target là mesh.position, key là "x"',
        en: 'resolvePierced(mesh, "position-x") returns target as mesh.position, key as "x"',
      },
      {
        vi: 'resolvePierced(mesh, "visible") (không có gạch ngang) trả về target là chính root, key là "visible"',
        en: 'resolvePierced(mesh, "visible") (no dash at all) returns target as the root itself, key as "visible"',
      },
    ],
  },
];
