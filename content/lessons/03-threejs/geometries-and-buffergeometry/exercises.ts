import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "box-segment-triangle-count",
    kind: "concept",
    prompt: {
      vi: `Không chạy code: một \`BoxGeometry(1, 1, 1, s, s, s)\` dùng cùng một số segment $s$ trên cả ba trục. Mỗi mặt trở thành lưới $s \\times s$ ô, mỗi ô $2$ tam giác, và khối có $6$ mặt — viết công thức $\\text{triangles}(s)$ theo $s$, rồi tính cho $s=2$ và $s=4$.

Sau đó trả lời: tăng $s$ từ $2$ lên $4$ (gấp đôi) làm số tam giác tăng gấp mấy lần — đúng gấp đôi, hay nhiều hơn? Vì sao?`,
      en: `Without running code: a \`BoxGeometry(1, 1, 1, s, s, s)\` uses the same segment count $s$ on all three axes. Each face becomes an $s \\times s$ grid, $2$ triangles per cell, and the box has $6$ faces — write the formula $\\text{triangles}(s)$ in terms of $s$, then compute it for $s=2$ and $s=4$.

Then answer: does raising $s$ from $2$ to $4$ (doubling it) double the triangle count — or more? Why?`,
    },
    hints: [
      {
        vi: "Một mặt có s×s ô, mỗi ô 2 tam giác → 2s² tam giác/mặt. Nhân với 6 mặt.",
        en: "One face has s×s cells, 2 triangles per cell → 2s² triangles per face. Multiply by 6 faces.",
      },
      {
        vi: "triangles(s) = 12s² — một hàm BẬC HAI theo s, không phải tuyến tính. Nhân đôi s nghĩa là nhân s² với 4.",
        en: "triangles(s) = 12s² — a QUADRATIC function of s, not linear. Doubling s means multiplying s² by 4.",
      },
    ],
    checklist: [
      {
        vi: "Viết đúng công thức triangles(s) = 12s²",
        en: "Correctly wrote the formula triangles(s) = 12s²",
      },
      {
        vi: "Tính đúng triangles(2) = 48 và triangles(4) = 192",
        en: "Correctly computed triangles(2) = 48 and triangles(4) = 192",
      },
      {
        vi: "Giải thích được vì sao gấp đôi s cho ra gấp 4 lần tam giác, không phải gấp đôi",
        en: "Explained why doubling s quadruples the triangle count instead of doubling it",
      },
    ],
    solutionNote: {
      vi: `Mỗi mặt: lưới s×s ô, 2 tam giác/ô → 2s² tam giác/mặt. Khối có 6 mặt → triangles(s) = 6 × 2s² = 12s².

triangles(2) = 12 × 2² = 12 × 4 = 48. triangles(4) = 12 × 4² = 12 × 16 = 192.

192 / 48 = 4, không phải 2. triangles(s) là hàm BẬC HAI theo s (chứa s²) — nhân đôi s nhân s² lên 4 lần, đúng quy luật diện tích một lưới 2D tăng theo bình phương khi cả hai chiều cùng tăng theo cùng tỉ lệ. Đo trực tiếp trên \`BoxGeometry\` xác nhận đúng: s=1→12, s=2→48, s=4→192, s=8→768.`,
      en: `Each face: an s×s grid of cells, 2 triangles/cell → 2s² triangles/face. The box has 6 faces → triangles(s) = 6 × 2s² = 12s².

triangles(2) = 12 × 2² = 12 × 4 = 48. triangles(4) = 12 × 4² = 12 × 16 = 192.

192 / 48 = 4, not 2. triangles(s) is a QUADRATIC function of s (it contains s²) — doubling s multiplies s² by 4, the same rule by which a 2D grid's cell count grows quadratically when both dimensions scale by the same factor. Measuring directly on \`BoxGeometry\` confirms it: s=1→12, s=2→48, s=4→192, s=8→768.`,
    },
  },
  {
    id: "flat-triangle-attributes",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`buildFlatTriangle(a, b, c)\` nhận ba đỉnh \`THREE.Vector3\` của MỘT tam giác, trả về \`{ positions: number[], normals: number[] }\` — mảng phẳng sẵn sàng đưa vào \`BufferAttribute\`: \`positions\` chứa $9$ số ($3$ đỉnh × $xyz$), \`normals\` chứa $9$ số là pháp tuyến mặt (tính bằng cross product, giống \`triangleNormal()\` ở Track 0) lặp lại giống hệt cho cả $3$ đỉnh — vì shading phẳng nghĩa là cả tam giác chia sẻ đúng một pháp tuyến.`,
      en: `Write a \`buildFlatTriangle(a, b, c)\` function taking three \`THREE.Vector3\` corners of ONE triangle, returning \`{ positions: number[], normals: number[] }\` — flat arrays ready for a \`BufferAttribute\`: \`positions\` holds $9$ numbers ($3$ vertices × $xyz$), \`normals\` holds $9$ numbers that are the face normal (computed via cross product, same as \`triangleNormal()\` from Track 0) repeated identically for all $3$ vertices — since flat shading means the whole triangle shares exactly one normal.`,
    },
    starterCode: `import * as THREE from "three";

function buildFlatTriangle(
  a: THREE.Vector3,
  b: THREE.Vector3,
  c: THREE.Vector3,
): { positions: number[]; normals: number[] } {
  // TODO 1: compute the face normal via cross((b - a), (c - a)), normalize it
  // TODO 2: push the 3 vertices into positions (9 numbers)
  // TODO 3: push the SAME normal into normals, repeated for all 3 vertices (9 numbers)
  return { positions: [], normals: [] };
}`,
    solutionCode: `import * as THREE from "three";

function buildFlatTriangle(
  a: THREE.Vector3,
  b: THREE.Vector3,
  c: THREE.Vector3,
): { positions: number[]; normals: number[] } {
  const ab = new THREE.Vector3().subVectors(b, a);
  const ac = new THREE.Vector3().subVectors(c, a);
  const n = ab.cross(ac).normalize(); // same as triangleNormal() from Track 0

  const positions: number[] = [];
  const normals: number[] = [];
  for (const p of [a, b, c]) {
    positions.push(p.x, p.y, p.z);
    // Flat shading: all 3 vertices of ONE triangle share exactly one normal.
    normals.push(n.x, n.y, n.z);
  }
  return { positions, normals };
}`,
    hints: [
      {
        vi: "cross((b-a), (c-a)) đúng thứ tự tham số — đảo b và c cho pháp tuyến ngược dấu, mặt bị lộn.",
        en: "cross((b-a), (c-a)) in that exact order — swapping b and c flips the normal's sign, turning the face inside out.",
      },
      {
        vi: "positions.length phải luôn bằng normals.length (= 9) — mỗi đỉnh cần đúng một bộ 3 số normal đi kèm, kể cả khi 3 bộ đó giống hệt nhau.",
        en: "positions.length must always equal normals.length (= 9) — every vertex needs its own 3-number normal alongside it, even when all three are identical.",
      },
    ],
    checklist: [
      {
        vi: "positions có đúng 9 số, đúng thứ tự a, b, c",
        en: "positions has exactly 9 numbers, in order a, b, c",
      },
      {
        vi: "normals có đúng 9 số, cả 3 bộ (x,y,z) giống hệt nhau",
        en: "normals has exactly 9 numbers, all three (x,y,z) triples identical",
      },
      {
        vi: "Normal được normalize (độ dài xấp xỉ 1), không trả thẳng kết quả cross thô",
        en: "The normal is normalized (length ≈ 1), not the raw cross product result",
      },
    ],
  },
];
