import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "exposure-vs-post-brightness-by-the-numbers",
    kind: "concept",
    prompt: {
      vi: `Một HDRI đơn giản có hai vùng radiance (linear, chưa tone map): bầu trời $c_{sky} = 1.0$ và đĩa mặt trời $c_{sun} = 50.0$. Renderer dùng Reinhard: $c' = \\dfrac{E \\cdot c}{1 + E \\cdot c}$.

Không chạy code, tính ba trường hợp:
(A) $E = 1$ (0 stop): $c'_{sky}$ và $c'_{sun}$?
(B) $E = 4$ (+2 stop, exposure thật): $c'_{sky}$ và $c'_{sun}$?
(C) Giữ $E = 1$ như (A), rồi nhân thêm hậu kỳ \`brightness(4)\` lên $c'_{sky}$ và $c'_{sun}$ đã tính ở (A), clamp về $[0,1]$: kết quả?

So sánh (B) và (C) — cả hai đều "x4" ở đâu đó trong pipeline, nhưng cho kết quả khác nhau thế nào, và vì sao?`,
      en: `A simplified HDRI has two radiance regions (linear, not yet tone mapped): sky $c_{sky} = 1.0$ and sun disk $c_{sun} = 50.0$. The renderer uses Reinhard: $c' = \\dfrac{E \\cdot c}{1 + E \\cdot c}$.

Without running code, compute three cases:
(A) $E = 1$ (0 stops): $c'_{sky}$ and $c'_{sun}$?
(B) $E = 4$ (+2 stops, real exposure): $c'_{sky}$ and $c'_{sun}$?
(C) Keep $E = 1$ as in (A), then multiply the (A) results by a post-hoc \`brightness(4)\`, clamped to $[0,1]$: what's the result?

Compare (B) and (C) — both involve a "x4" somewhere in the pipeline, but how do the results differ, and why?`,
    },
    hints: [
      {
        vi: "Thay số trực tiếp vào Reinhard cho từng trường hợp: (A) và (B) áp E vào TRƯỚC phép chia; (C) áp hệ số 4 vào SAU khi (A) đã tính xong, rồi mới clamp.",
        en: "Substitute directly into Reinhard for each case: (A) and (B) apply E BEFORE the division; (C) applies the x4 factor AFTER (A) is already computed, then clamps.",
      },
      {
        vi: "Ở (C), cả hai giá trị 0.5*4=2.0 và 0.9804*4~3.92 đều vượt 1.0 — clamp về đúng 1.0 cho cả hai, bất kể chênh lệch ban đầu giữa chúng là bao nhiêu.",
        en: "In (C), both 0.5*4=2.0 and 0.9804*4~3.92 exceed 1.0 — both clamp to exactly 1.0, regardless of how different they started out.",
      },
    ],
    checklist: [
      {
        vi: "Tính đúng (A): sky' = 0.5, sun' ~ 0.9804",
        en: "Correctly computed (A): sky' = 0.5, sun' ~ 0.9804",
      },
      {
        vi: "Tính đúng (B): sky' = 0.8, sun' ~ 0.9950 — hai giá trị vẫn phân biệt được, cách nhau ~0.195",
        en: "Correctly computed (B): sky' = 0.8, sun' ~ 0.9950 — the two values are still distinguishable, ~0.195 apart",
      },
      {
        vi: "Tính đúng (C): cả sky'' và sun'' đều clamp về 1.0 — giải thích được đây là lý do post-brightness 'bẹt' cảnh trong khi exposure thật thì không",
        en: "Correctly computed (C): both sky'' and sun'' clamp to 1.0 — can explain this is why post-brightness 'flattens' the scene while real exposure doesn't",
      },
    ],
    solutionNote: {
      vi: `(A) $E = 1$: $c'_{sky} = (1 \\times 1.0)/(1 + 1 \\times 1.0) = 1/2 = 0.5$; $c'_{sun} = (1 \\times 50.0)/(1 + 1 \\times 50.0) = 50/51 \\approx 0.9804$.

(B) $E = 4$ (+2 stop): $c'_{sky} = (4 \\times 1.0)/(1 + 4 \\times 1.0) = 4/5 = 0.8$; $c'_{sun} = (4 \\times 50.0)/(1 + 4 \\times 50.0) = 200/201 \\approx 0.9950$ — sky và sun vẫn là HAI giá trị khác nhau, cách nhau khoảng 0.195.

(C) $E = 1$ (dùng kết quả (A)), rồi nhân hậu kỳ ×4, clamp $[0,1]$: $c''_{sky} = \\min(1, 0.5 \\times 4) = \\min(1, 2.0) = 1.0$; $c''_{sun} = \\min(1, 0.9804 \\times 4) = \\min(1, 3.92) = 1.0$ — CẢ HAI đều clamp về đúng 1.0, không còn phân biệt được nữa.

Vì sao khác nhau: (B) nhân $E$ TRƯỚC hàm Reinhard, nên hàm vẫn còn "chạy" và nén hai input thành hai output khác nhau (vẫn nằm trên đường cong). (C) nhân SAU khi Reinhard đã chạy xong (đã nằm trong $[0,1]$) — phép nhân chỉ đẩy pixel lên rồi CLAMP cùng một mức trần, xoá sạch chênh lệch gốc.`,
      en: `(A) $E = 1$: $c'_{sky} = (1 \\times 1.0)/(1 + 1 \\times 1.0) = 1/2 = 0.5$; $c'_{sun} = (1 \\times 50.0)/(1 + 1 \\times 50.0) = 50/51 \\approx 0.9804$.

(B) $E = 4$ (+2 stops): $c'_{sky} = (4 \\times 1.0)/(1 + 4 \\times 1.0) = 4/5 = 0.8$; $c'_{sun} = (4 \\times 50.0)/(1 + 4 \\times 50.0) = 200/201 \\approx 0.9950$ — sky and sun are still TWO distinct values, about 0.195 apart.

(C) $E = 1$ (using (A)'s results), then a post-hoc ×4 multiply, clamped to $[0,1]$: $c''_{sky} = \\min(1, 0.5 \\times 4) = \\min(1, 2.0) = 1.0$; $c''_{sun} = \\min(1, 0.9804 \\times 4) = \\min(1, 3.92) = 1.0$ — BOTH clamp to exactly 1.0, no longer distinguishable.

Why they differ: (B) multiplies $E$ BEFORE the Reinhard function, so the function is still "running" and compresses the two inputs into two different outputs (both still on the curve). (C) multiplies AFTER Reinhard already ran (already inside $[0,1]$) — the multiply just pushes pixels up and then CLAMPS them to the same ceiling, erasing the original difference.`,
    },
  },
  {
    id: "snapshot-and-restore-renderer-tone-state",
    kind: "code",
    prompt: {
      vi: `Một demo R3F mượn \`renderer\` (dùng chung với các demo khác trên trang) để đổi \`toneMapping\` và \`toneMappingExposure\`. Viết ba hàm TypeScript: \`exposureFromStops(stops)\` (đổi số stop sang số nhân, $E = 2^{stops}$), \`snapshotToneState(gl)\` (lưu lại trạng thái hiện tại) và \`restoreToneState(gl, snapshot)\` (khôi phục đúng trạng thái đã lưu) — đúng pattern dùng để dọn dẹp khi demo unmount.`,
      en: `An R3F demo borrows a \`renderer\` (shared with other demos on the page) to change \`toneMapping\` and \`toneMappingExposure\`. Write three TypeScript functions: \`exposureFromStops(stops)\` (converts a stop count to a multiplier, $E = 2^{stops}$), \`snapshotToneState(gl)\` (captures the current state) and \`restoreToneState(gl, snapshot)\` (restores exactly that saved state) — the pattern used to clean up when the demo unmounts.`,
    },
    starterCode: `interface ToneState {
  toneMapping: THREE.ToneMapping;
  toneMappingExposure: number;
}

function exposureFromStops(stops: number): number {
  // TODO: +1 stop doubles the light -> E = 2^stops
  return 0;
}

function snapshotToneState(gl: THREE.WebGLRenderer): ToneState {
  // TODO: read gl.toneMapping / gl.toneMappingExposure into a plain object
  return { toneMapping: THREE.NoToneMapping, toneMappingExposure: 1 };
}

function restoreToneState(gl: THREE.WebGLRenderer, snapshot: ToneState): void {
  // TODO: write snapshot's fields back onto gl
}`,
    solutionCode: `interface ToneState {
  toneMapping: THREE.ToneMapping;
  toneMappingExposure: number;
}

function exposureFromStops(stops: number): number {
  return Math.pow(2, stops);
}

function snapshotToneState(gl: THREE.WebGLRenderer): ToneState {
  return {
    toneMapping: gl.toneMapping,
    toneMappingExposure: gl.toneMappingExposure,
  };
}

function restoreToneState(gl: THREE.WebGLRenderer, snapshot: ToneState): void {
  gl.toneMapping = snapshot.toneMapping;
  gl.toneMappingExposure = snapshot.toneMappingExposure;
}`,
    hints: [
      {
        vi: "exposureFromStops chỉ là Math.pow(2, stops) — 0 stop phải trả về 1 (không đổi), +1 stop trả về 2 (gấp đôi).",
        en: "exposureFromStops is just Math.pow(2, stops) — 0 stops must return 1 (unchanged), +1 stop returns 2 (doubled).",
      },
      {
        vi: "snapshot/restore chỉ đọc và ghi lại đúng hai field, không tính toán gì thêm — bẫy duy nhất là quên field nào đó và để demo khác 'kế thừa' nhầm trạng thái.",
        en: "snapshot/restore just read and write back exactly those two fields, no extra computation — the only trap is forgetting a field and letting another demo inherit the wrong state.",
      },
    ],
    checklist: [
      {
        vi: "exposureFromStops(0) === 1 và exposureFromStops(1) === 2",
        en: "exposureFromStops(0) === 1 and exposureFromStops(1) === 2",
      },
      {
        vi: "snapshotToneState đọc đúng cả hai field từ gl, không hard-code giá trị mặc định",
        en: "snapshotToneState reads both fields from gl, not hard-coded defaults",
      },
      {
        vi: "restoreToneState ghi lại đúng snapshot lên gl, đối xứng hoàn toàn với snapshotToneState",
        en: "restoreToneState writes the snapshot back onto gl, fully symmetric with snapshotToneState",
      },
    ],
  },
];
