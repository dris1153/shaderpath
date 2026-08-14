import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "reconciler-mutate-vs-recreate",
    kind: "concept",
    prompt: {
      vi: `Một component render \`<mesh key="cube-a" position={[x, 0, 0]}>\`, trong đó \`x\` là state đổi liên tục qua slider.

Nếu chỉ \`x\` đổi (giữ nguyên \`key="cube-a"\`), reconciler MUTATE object \`THREE.Mesh\` đã có hay HUỶ nó rồi tạo object mới? Giải thích bằng đúng cơ chế diff cây fiber đã học trong bài, rồi trả lời tiếp: điều gì xảy ra nếu lần render kế tiếp đổi luôn \`key\` thành \`"cube-b"\` trong khi \`x\` giữ nguyên?`,
      en: `A component renders \`<mesh key="cube-a" position={[x, 0, 0]}>\`, where \`x\` is state that changes continuously via a slider.

If only \`x\` changes (keeping \`key="cube-a"\`), does the reconciler MUTATE the existing \`THREE.Mesh\` or DESTROY it and create a new one? Explain using the exact fiber-tree diffing mechanism from this lesson, then answer: what happens if the next render also changes the \`key\` to \`"cube-b"\` while \`x\` stays the same?`,
    },
    hints: [
      {
        vi: "Reconciler so khớp node cũ với node mới bằng key + vị trí trong cây, không phải bằng giá trị của prop bên trong.",
        en: "The reconciler matches old nodes to new ones by key + tree position, not by the values of the props inside.",
      },
      {
        vi: "Chỉ prop bên trong đổi (position) → mutate. Key đổi → identity đổi → unmount rồi mount lại từ đầu.",
        en: "Only an inner prop changing (position) → mutate. Key changing → identity changes → full unmount then mount.",
      },
    ],
    checklist: [
      {
        vi: "Tôi giải thích được x đổi mà key giữ nguyên chỉ mutate .position trên object cũ, không có THREE.Mesh mới nào được tạo",
        en: "I can explain that x changing with the same key only mutates .position on the existing object — no new THREE.Mesh gets created",
      },
      {
        vi: "Tôi giải thích được đổi key buộc reconciler coi đó là node khác, huỷ mesh cũ và tạo mesh mới",
        en: "I can explain that changing the key forces the reconciler to treat it as a different node, destroying the old mesh and creating a new one",
      },
      {
        vi: "Tôi nêu được hệ quả thực tế: đổi key giữa hai lần render làm mất mọi state gắn qua ref vào mesh cũ",
        en: "I can state the practical consequence: changing the key between renders loses any state attached via ref to the old mesh",
      },
    ],
    solutionNote: {
      vi: `\`x\` đổi, \`key="cube-a"\` giữ nguyên: reconciler khớp node theo key, thấy CÙNG identity, nên chỉ mutate \`mesh.position\` trực tiếp — không gọi \`new THREE.Mesh()\` lần nào. Object trong bộ nhớ vẫn là cùng một instance suốt các lần render.

Nếu \`key\` đổi thành \`"cube-b"\` ở lần render kế tiếp: identity đổi, reconciler unmount node \`"cube-a"\` (dispose geometry/material, gỡ khỏi \`scene.children\`), rồi mount node \`"cube-b"\` như một node hoàn toàn mới (\`new THREE.Mesh()\`). Mọi state gắn qua ref vào mesh cũ (ví dụ một rotation đang animate dở) đều bị mất.`,
      en: `\`x\` changes while \`key="cube-a"\` stays the same: the reconciler matches the node by key, sees the SAME identity, so it just mutates \`mesh.position\` directly — never calling \`new THREE.Mesh()\`. The object in memory stays the same instance across every render.

If \`key\` changes to \`"cube-b"\` on the next render: identity changes, the reconciler unmounts node \`"cube-a"\` (disposing its geometry/material, removing it from \`scene.children\`), then mounts node \`"cube-b"\` as a completely new node (\`new THREE.Mesh()\`). Any state attached via ref to the old mesh (e.g. a rotation mid-animation) is lost.`,
    },
  },
  {
    id: "plan-reconcile-diff",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`planReconcile(oldKeys, newKeys)\` mô phỏng đúng quyết định mà reconciler đưa ra khi diff một danh sách JSX có \`key\`: trả về \`created\` (key có ở \`newKeys\` nhưng không có ở \`oldKeys\` — cần \`new\`), \`destroyed\` (key có ở \`oldKeys\` nhưng không còn ở \`newKeys\` — cần dispose), và \`mutated\` (key có mặt ở CẢ hai — object cũ chỉ bị mutate).`,
      en: `Write a \`planReconcile(oldKeys, newKeys)\` function that mirrors exactly the decision a reconciler makes when diffing a keyed JSX list: return \`created\` (keys in \`newKeys\` but not \`oldKeys\` — need \`new\`), \`destroyed\` (keys in \`oldKeys\` but no longer in \`newKeys\` — need disposal), and \`mutated\` (keys present in BOTH — the existing object just gets mutated).`,
    },
    starterCode: `interface ReconcilePlan {
  created: string[];
  mutated: string[];
  destroyed: string[];
}

// oldKeys/newKeys are the "key" prop of every JSX node in a list, in order,
// before and after a re-render — exactly what the reconciler diffs.
function planReconcile(oldKeys: string[], newKeys: string[]): ReconcilePlan {
  // TODO 1: created = keys in newKeys but NOT in oldKeys
  // TODO 2: destroyed = keys in oldKeys but NOT in newKeys
  // TODO 3: mutated = keys present in BOTH arrays
  return { created: [], mutated: [], destroyed: [] };
}`,
    solutionCode: `interface ReconcilePlan {
  created: string[];
  mutated: string[];
  destroyed: string[];
}

function planReconcile(oldKeys: string[], newKeys: string[]): ReconcilePlan {
  const oldSet = new Set(oldKeys);
  const newSet = new Set(newKeys);
  return {
    created: newKeys.filter((k) => !oldSet.has(k)),
    destroyed: oldKeys.filter((k) => !newSet.has(k)),
    mutated: newKeys.filter((k) => oldSet.has(k)),
  };
}`,
    hints: [
      {
        vi: "Dùng Set để tra cứu O(1) thay vì .includes() lồng trong vòng lặp — cùng cách reconciler thật khớp key hiệu quả trên danh sách lớn.",
        en: "Use a Set for O(1) lookups instead of a nested .includes() — the same trick a real reconciler uses to match keys efficiently on large lists.",
      },
      {
        vi: '"mutated" chỉ quan tâm key có mặt ở cả hai mảng hay không — không quan tâm thứ tự hay bất kỳ prop nào khác đã đổi.',
        en: '"mutated" only cares whether a key exists in both arrays — it doesn\'t care about order or any other prop that changed.',
      },
    ],
    checklist: [
      {
        vi: 'planReconcile(["a","b","c"], ["a","b","c","d"]) trả về created=["d"], destroyed=[], mutated=["a","b","c"]',
        en: 'planReconcile(["a","b","c"], ["a","b","c","d"]) returns created=["d"], destroyed=[], mutated=["a","b","c"]',
      },
      {
        vi: 'planReconcile(["a","b","c"], ["a","c"]) trả về destroyed=["b"], created=[], mutated=["a","c"]',
        en: 'planReconcile(["a","b","c"], ["a","c"]) returns destroyed=["b"], created=[], mutated=["a","c"]',
      },
      {
        vi: 'Đổi key của một phần tử (ví dụ "b" thành "b2") khiến nó rơi vào CẢ destroyed VÀ created, không rơi vào mutated',
        en: 'Changing an element\'s key (e.g. "b" to "b2") makes it land in BOTH destroyed AND created, never in mutated',
      },
    ],
  },
];
