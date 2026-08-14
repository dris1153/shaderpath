import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "shadow-pass-call-count",
    kind: "concept",
    prompt: {
      vi: `Một cảnh có 300 mesh giống hệt nhau (cùng geometry, cùng material), cộng 2 đèn đổ bóng (shadow-casting). Bạn đọc \`renderer.info.render.calls = 900\` ngay sau một frame.

Giải thích vì sao con số là 900 chứ không phải 300. Sau đó: nếu bạn chuyển 300 mesh đó sang MỘT \`InstancedMesh\` duy nhất (vẫn giữ nguyên 2 đèn đổ bóng), bạn kỳ vọng \`render.calls\` đọc được là bao nhiêu, và vì sao con số đó không phải là 1?`,
      en: `A scene has 300 identical meshes (same geometry, same material), plus 2 shadow-casting lights. You read \`renderer.info.render.calls = 900\` right after one frame.

Explain why the number is 900, not 300. Then: if you convert those 300 meshes into a SINGLE \`InstancedMesh\` (keeping the same 2 shadow-casting lights), what do you expect \`render.calls\` to read, and why isn't that number 1?`,
    },
    hints: [
      {
        vi: "Mỗi đèn đổ bóng render lại toàn bộ vật thể đổ bóng từ góc nhìn RIÊNG của nó, cộng thêm vào pass chính — 900 = 300 × (1 pass chính + 2 pass shadow).",
        en: "Each shadow-casting light re-renders every shadow-casting object from ITS OWN view, on top of the main pass — 900 = 300 × (1 main pass + 2 shadow passes).",
      },
      {
        vi: "InstancedMesh gộp N mesh thành một draw call cho MỖI PASS nó tham gia — nhưng số pass (chính + shadow) không đổi, chỉ số draw call TRONG mỗi pass giảm.",
        en: "InstancedMesh collapses N meshes into one draw call for EACH PASS it participates in — the number of passes (main + shadow) doesn't change, only the draw-call count WITHIN each pass drops.",
      },
    ],
    checklist: [
      {
        vi: "Tôi giải thích đúng 900 = 300 mesh × 3 pass (1 chính + 2 shadow)",
        en: "I correctly explained 900 = 300 meshes × 3 passes (1 main + 2 shadow)",
      },
      {
        vi: "Tôi kỳ vọng đúng InstancedMesh cho ra 3 draw call (1 mỗi pass), không phải 1",
        en: "I correctly expect InstancedMesh to produce 3 draw calls (one per pass), not 1",
      },
      {
        vi: "Tôi giải thích được vì sao 3 vẫn là cải thiện lớn so với 900, dù không phải lý tưởng tuyệt đối",
        en: "I explained why 3 is still a massive improvement over 900, even though it isn't the theoretical absolute minimum",
      },
    ],
    solutionNote: {
      vi: `$900 = 300$ mesh × 3 pass render: 1 pass chính (camera chính) + 2 pass shadow map (mỗi đèn đổ bóng render lại toàn bộ vật thể đổ bóng từ góc nhìn RIÊNG của nó). Mỗi mesh riêng lẻ vẫn cần một draw call cho MỖI pass nó xuất hiện trong, nên tổng là $300 \\times 3 = 900$, không phải 300.

Chuyển sang MỘT \`InstancedMesh\`: nó vẫn là MỘT object phải được vẽ trong CẢ 3 pass đó (1 chính + 2 shadow) — mỗi pass giờ chỉ cần ĐÚNG MỘT lệnh \`gl.drawElementsInstanced\` thay vì 300 lệnh riêng lẻ. Kết quả kỳ vọng: \`render.calls = 3\` (1 + 2), không phải 1, vì số PASS không đổi — chỉ số draw call TRONG mỗi pass giảm từ 300 xuống 1. Vẫn là cải thiện 300 lần.`,
      en: `$900 = 300$ meshes × 3 render passes: 1 main pass (the main camera) + 2 shadow-map passes (each shadow-casting light re-renders every shadow-casting object from ITS OWN view). Each individual mesh still needs one draw call for EVERY pass it appears in, so the total is $300 \\times 3 = 900$, not 300.

Converting to a SINGLE \`InstancedMesh\`: it's still ONE object that must be drawn in ALL 3 of those passes (1 main + 2 shadow) — each pass now needs EXACTLY ONE \`gl.drawElementsInstanced\` call instead of 300 separate ones. Expected result: \`render.calls = 3\` (1 + 2), not 1, because the number of PASSES doesn't change — only the draw-call count WITHIN each pass drops from 300 to 1. Still a 300x improvement.`,
    },
  },
  {
    id: "estimate-draw-calls",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`estimateDrawCalls(count, technique, shadowLights)\` trả về số draw call ước lượng cho \`count\` object giống hệt nhau, với \`technique\` là \`"individual"\`, \`"merged"\` hoặc \`"instanced"\`, và \`shadowLights\` là số đèn đổ bóng (mỗi đèn thêm một pass). Giả định: mỗi object tham gia mọi pass (1 pass chính + \`shadowLights\` pass shadow).`,
      en: `Write \`estimateDrawCalls(count, technique, shadowLights)\` returning the estimated draw-call count for \`count\` identical objects, where \`technique\` is \`"individual"\`, \`"merged"\`, or \`"instanced"\`, and \`shadowLights\` is the number of shadow-casting lights (each adding one pass). Assume every object participates in every pass (1 main pass + \`shadowLights\` shadow passes).`,
    },
    starterCode: `type Technique = "individual" | "merged" | "instanced";

function estimateDrawCalls(
  count: number,
  technique: Technique,
  shadowLights: number,
): number {
  const passes = 1 + shadowLights;
  // TODO: "individual" costs one call per object per pass; "merged" and
  // "instanced" both collapse the whole group to one call per pass.
  return 0;
}`,
    solutionCode: `type Technique = "individual" | "merged" | "instanced";

function estimateDrawCalls(
  count: number,
  technique: Technique,
  shadowLights: number,
): number {
  const passes = 1 + shadowLights;
  if (technique === "individual") return count * passes;
  return passes;
}`,
    hints: [
      {
        vi: "\"merged\" và \"instanced\" luôn cho cùng công thức ở bài toán này: cả hai đều gộp N object thành một draw call MỖI pass.",
        en: "\"merged\" and \"instanced\" always give the same formula for this problem: both collapse N objects into one draw call PER pass.",
      },
      {
        vi: "Số pass = 1 (chính) + shadowLights — nhân số này với count chỉ khi technique là individual.",
        en: "passes = 1 (main) + shadowLights — multiply that by count only when technique is individual.",
      },
    ],
    checklist: [
      {
        vi: "estimateDrawCalls(300, 'individual', 2) trả về 900",
        en: "estimateDrawCalls(300, 'individual', 2) returns 900",
      },
      {
        vi: "estimateDrawCalls(300, 'instanced', 2) và estimateDrawCalls(300, 'merged', 2) đều trả về 3",
        en: "estimateDrawCalls(300, 'instanced', 2) and estimateDrawCalls(300, 'merged', 2) both return 3",
      },
      {
        vi: "estimateDrawCalls(300, 'instanced', 0) trả về 1",
        en: "estimateDrawCalls(300, 'instanced', 0) returns 1",
      },
    ],
  },
];
