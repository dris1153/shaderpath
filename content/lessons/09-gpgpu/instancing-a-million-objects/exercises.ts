import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "vertex-texture-fetch-budget",
    kind: "concept",
    prompt: {
      vi: `Một cảnh instancing dùng geometry tứ diện không lập chỉ mục (12 đỉnh/instance), mỗi đỉnh đọc đúng 2 texture (\`texturePosition\`, \`textureVelocity\`) trong vertex shader, ở $N = 500{,}000$ instance, chạy 60fps.

Tính tổng số lần đọc texture mỗi giây chỉ để định vị (chưa tính fragment shading). Sau đó giả sử một bản LOD ở xa dùng geometry tam giác đơn (3 đỉnh) thay vì tứ diện — tính lại tổng số lần đọc, và nêu tỉ lệ giảm chính xác so với bản gốc.`,
      en: `An instancing scene uses non-indexed tetrahedron geometry (12 vertices/instance), each vertex reading exactly 2 textures (\`texturePosition\`, \`textureVelocity\`) in the vertex shader, at $N = 500{,}000$ instances, running at 60fps.

Compute the total texture reads per second for placement alone (not fragment shading). Then suppose a distant LOD uses a single-triangle geometry (3 vertices) instead of the tetrahedron — recompute the total, and state the exact reduction ratio versus the original.`,
    },
    hints: [
      {
        vi: "Công thức tổng quát: reads/giây = N × vertices_per_instance × reads_per_vertex × fps — nhân đủ bốn số hạng, đừng bỏ sót vertices_per_instance.",
        en: "General formula: reads/second = N × verticesPerInstance × readsPerVertex × fps — multiply all four factors, don't drop verticesPerInstance.",
      },
      {
        vi: "Tỉ lệ giảm khi đổi geometry chỉ phụ thuộc tỉ lệ số đỉnh (12→3 là giảm 4 lần) — ba số hạng còn lại (N, reads_per_vertex, fps) không đổi nên triệt tiêu khi lấy tỉ lệ.",
        en: "The reduction ratio from switching geometry only depends on the vertex-count ratio (12→3 is a 4x drop) — the other three factors (N, readsPerVertex, fps) stay the same and cancel out of the ratio.",
      },
    ],
    checklist: [
      {
        vi: "Tính đúng tổng gốc với tứ diện 12 đỉnh (720 triệu lần/giây)",
        en: "Correctly computes the original total with the 12-vertex tetrahedron (720 million reads/second)",
      },
      {
        vi: "Tính đúng tổng sau LOD với tam giác 3 đỉnh (180 triệu lần/giây)",
        en: "Correctly computes the post-LOD total with the 3-vertex triangle (180 million reads/second)",
      },
      {
        vi: "Nêu đúng tỉ lệ giảm là 4 lần, đúng bằng tỉ lệ số đỉnh 12:3",
        en: "States the correct 4x reduction, exactly matching the 12:3 vertex-count ratio",
      },
    ],
    solutionCode: `// reads/sec = N * verticesPerInstance * readsPerVertex * fps
// original (tetrahedron, 12 verts): 500_000 * 12 * 2 * 60 = 720,000,000
// LOD (triangle, 3 verts):          500_000 *  3 * 2 * 60 = 180,000,000
// ratio = 720M / 180M = 4x, exactly the 12:3 vertex-count ratio —
// the other three factors (N, readsPerVertex, fps) are identical in both
// and cancel out of the ratio.`,
  },
  {
    id: "instance-uv-attribute",
    kind: "code",
    prompt: {
      vi: `Viết hàm TypeScript \`buildInstanceUvAttribute(gridSize, instanceCount)\` trả về một \`Float32Array\` 2 số/instance, ánh xạ chỉ số instance $i$ sang toạ độ UV tâm texel $(u, v)$ trong lưới \`gridSize × gridSize\`, đúng công thức pixel-to-UV: cột $= i \\bmod W$, hàng $= \\lfloor i / W \\rfloor$, $u = (\\text{column}+0.5)/W$, $v = (\\text{row}+0.5)/W$.`,
      en: `Write a TypeScript \`buildInstanceUvAttribute(gridSize, instanceCount)\` function returning a \`Float32Array\` with 2 numbers per instance, mapping instance index $i$ to the UV coordinate of its texel's center $(u, v)$ in a \`gridSize × gridSize\` grid, using the pixel-to-UV formula: column $= i \\bmod W$, row $= \\lfloor i / W \\rfloor$, $u = (\\text{column}+0.5)/W$, $v = (\\text{row}+0.5)/W$.`,
    },
    starterCode: `function buildInstanceUvAttribute(gridSize: number, instanceCount: number): Float32Array {
  const uvs = new Float32Array(instanceCount * 2);
  for (let i = 0; i < instanceCount; i++) {
    // TODO: column = i % gridSize, row = floor(i / gridSize)
    // TODO: uvs[i*2] = (column + 0.5) / gridSize
    // TODO: uvs[i*2 + 1] = (row + 0.5) / gridSize
  }
  return uvs;
}`,
    solutionCode: `function buildInstanceUvAttribute(gridSize: number, instanceCount: number): Float32Array {
  const uvs = new Float32Array(instanceCount * 2);
  for (let i = 0; i < instanceCount; i++) {
    const column = i % gridSize;
    const row = Math.floor(i / gridSize);
    uvs[i * 2] = (column + 0.5) / gridSize;
    uvs[i * 2 + 1] = (row + 0.5) / gridSize;
  }
  return uvs;
}`,
    hints: [
      {
        vi: "Đây đúng là công thức pixel→UV của Track 0 (u = (x+0.5)/W), chỉ đổi tên biến: cột đóng vai x, hàng đóng vai y.",
        en: "This is exactly the Track 0 pixel-to-UV formula (u = (x+0.5)/W), just renamed: column plays the role of x, row the role of y.",
      },
      {
        vi: "instanceCount có thể nhỏ hơn gridSize², dùng chỉ một phần lưới — vòng lặp chỉ chạy tới instanceCount, không phải gridSize².",
        en: "instanceCount can be smaller than gridSize², using only part of the grid — the loop only runs to instanceCount, not gridSize².",
      },
    ],
    checklist: [
      {
        vi: "Ánh xạ cột = i % gridSize, hàng = floor(i / gridSize) chính xác",
        en: "Correctly maps column = i % gridSize, row = floor(i / gridSize)",
      },
      {
        vi: "Cộng đúng 0.5 trước khi chia cho gridSize (tâm texel, không phải góc)",
        en: "Adds 0.5 before dividing by gridSize (the texel's center, not its corner)",
      },
      {
        vi: "Mảng trả về có độ dài đúng instanceCount * 2",
        en: "The returned array has length exactly instanceCount * 2",
      },
    ],
  },
];
