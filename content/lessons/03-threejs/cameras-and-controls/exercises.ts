import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "polar-angle-clamp-degrees",
    kind: "concept",
    prompt: {
      vi: `Bạn đặt \`controls.minPolarAngle = 0.15\` và \`controls.maxPolarAngle = Math.PI - 0.15\` cho một cảnh có mặt đất tại $y = 0$. Không chạy code, đổi cả hai giá trị này sang độ (làm tròn 1 chữ số thập phân).

Sau đó trả lời bằng một câu: vì sao không nên đặt \`minPolarAngle = 0\` hay \`maxPolarAngle = Math.PI\` chính xác, dù cả hai giá trị này vẫn hợp lệ về mặt hình học?`,
      en: `You set \`controls.minPolarAngle = 0.15\` and \`controls.maxPolarAngle = Math.PI - 0.15\` for a scene with the ground at $y = 0$. Without running code, convert both values to degrees (rounded to 1 decimal place).

Then answer in one sentence: why should you avoid clamping to exactly \`minPolarAngle = 0\` or \`maxPolarAngle = Math.PI\`, even though both are geometrically valid?`,
    },
    hints: [
      {
        vi: "Đổi radian sang độ bằng nhân $180/\\pi \\approx 57.2958$. Tính $\\pi - 0.15$ trước khi đổi đơn vị.",
        en: "Convert radians to degrees by multiplying by $180/\\pi \\approx 57.2958$. Compute $\\pi - 0.15$ before converting units.",
      },
      {
        vi: "Ở đúng góc cực 0 hay $\\pi$, camera nhìn thẳng xuống/lên trục xoay — vector \"lên\" không còn xác định duy nhất, giống vấn đề gimbal đã gặp ở Track 0.",
        en: "At polar angle exactly 0 or $\\pi$, the camera looks straight down/up the rotation axis — the \"up\" vector stops being uniquely defined, the same gimbal-style problem from Track 0.",
      },
    ],
    checklist: [
      {
        vi: "Tính đúng minPolarAngle ≈ 8.6° và maxPolarAngle ≈ 171.4°",
        en: "Correctly computed minPolarAngle ≈ 8.6° and maxPolarAngle ≈ 171.4°",
      },
      {
        vi: "Giải thích được vì sao 0/π là hai cực suy biến của góc xoay",
        en: "Explained why 0/π are the two degenerate poles of the orbit angle",
      },
      {
        vi: "Liên hệ được lý do này với việc controls hay giật khi chạm đúng biên clamp",
        en: "Connected this to why controls tend to jitter right at the clamp boundary",
      },
    ],
    solutionNote: {
      vi: `0.15 rad × (180/π) ≈ 8.6°, và (π − 0.15) rad × (180/π) ≈ 171.4°.

Đặt biên đúng 0° hoặc 180° đưa camera tới đúng cực xoay — tại đó hướng "lên" của camera không còn xác định duy nhất (giống gimbal lock ở Track 0), nên \`OrbitControls\` dễ giật/nhảy hướng khi người dùng chạm sát biên. Chừa một khoảng đệm nhỏ (ở đây ~8.6°) tránh hoàn toàn vùng suy biến đó.`,
      en: `0.15 rad × (180/π) ≈ 8.6°, and (π − 0.15) rad × (180/π) ≈ 171.4°.

Clamping exactly at 0° or 180° puts the camera right at the rotation pole — where the camera's "up" direction stops being uniquely defined (the same gimbal-lock issue from Track 0), so \`OrbitControls\` tends to jitter/snap when the user gets close to the boundary. Leaving a small margin (here ~8.6°) avoids that degenerate region entirely.`,
    },
  },
  {
    id: "sync-camera-aspect",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`syncCameraAspect\` nhận một camera có thể là \`THREE.PerspectiveCamera\` hoặc \`THREE.OrthographicCamera\`, kích thước \`width\`/\`height\` mới, và \`frustumHalfHeight\` (chỉ dùng cho Orthographic). Hàm phải cập nhật đúng field theo từng loại camera rồi gọi \`updateProjectionMatrix()\` đúng một lần.`,
      en: `Write a \`syncCameraAspect\` function taking a camera that may be either \`THREE.PerspectiveCamera\` or \`THREE.OrthographicCamera\`, a new \`width\`/\`height\`, and a \`frustumHalfHeight\` (used only for Orthographic). The function must update the right fields for each camera type, then call \`updateProjectionMatrix()\` exactly once.`,
    },
    starterCode: `import * as THREE from "three";

function syncCameraAspect(
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
  width: number,
  height: number,
  frustumHalfHeight: number,
) {
  const aspect = width / height;
  // TODO: if camera is a PerspectiveCamera, just update .aspect
  // TODO: if camera is an OrthographicCamera, recompute left/right/top/bottom
  //       from frustumHalfHeight and aspect (top/bottom don't depend on aspect)
  // TODO: call updateProjectionMatrix() exactly once, after the branch above
}`,
    solutionCode: `import * as THREE from "three";

function syncCameraAspect(
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
  width: number,
  height: number,
  frustumHalfHeight: number,
) {
  const aspect = width / height;
  if (camera instanceof THREE.PerspectiveCamera) {
    camera.aspect = aspect;
  } else {
    camera.left = -frustumHalfHeight * aspect;
    camera.right = frustumHalfHeight * aspect;
    camera.top = frustumHalfHeight;
    camera.bottom = -frustumHalfHeight;
  }
  // One call handles both branches — Orthographic has no .aspect field at all.
  camera.updateProjectionMatrix();
}`,
    hints: [
      {
        vi: "\`camera instanceof THREE.PerspectiveCamera\` là cách phân biệt runtime chuẩn — \`OrthographicCamera\` không có field \`.aspect\`.",
        en: "\`camera instanceof THREE.PerspectiveCamera\` is the standard runtime check — \`OrthographicCamera\` has no \`.aspect\` field at all.",
      },
      {
        vi: "\`top\`/\`bottom\` của Orthographic không phụ thuộc \`aspect\` — chỉ \`left\`/\`right\` cần nhân với nó.",
        en: "Orthographic's \`top\`/\`bottom\` don't depend on \`aspect\` — only \`left\`/\`right\` need to be multiplied by it.",
      },
    ],
    checklist: [
      {
        vi: "Nhánh Perspective chỉ gán camera.aspect, không đụng left/right/top/bottom",
        en: "The Perspective branch only assigns camera.aspect, leaving left/right/top/bottom untouched",
      },
      {
        vi: "Nhánh Orthographic gán đúng cả 4 field left/right/top/bottom trước khi cập nhật ma trận",
        en: "The Orthographic branch assigns all 4 fields — left/right/top/bottom — before updating the matrix",
      },
      {
        vi: "updateProjectionMatrix() được gọi đúng một lần sau nhánh if, không bị bỏ sót ở nhánh nào",
        en: "updateProjectionMatrix() is called exactly once after the branch, never skipped in either case",
      },
    ],
  },
];
