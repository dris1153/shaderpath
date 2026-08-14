import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "why-nothing-moves",
    kind: "concept",
    prompt: {
      vi: `Đoạn code sau tạo mixer, lấy action rồi gọi \`.play()\`, nhưng khi chạy thật, object trên canvas đứng yên tuyệt đối và console không có lỗi nào:

\`\`\`js
const mixer = new THREE.AnimationMixer(mesh);
const action = mixer.clipAction(clip);
action.play();

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
\`\`\`

Giải thích chính xác vì sao object không di chuyển dù \`action.play()\` đã chạy không lỗi. Sau đó trả lời: nếu đổi thứ tự gọi \`animate()\` trước \`action.play()\`, kết quả có khác gì không — vì sao?`,
      en: `The following code creates a mixer, gets an action and calls \`.play()\`, but when it runs, the object on the canvas sits perfectly frozen and the console shows no error:

\`\`\`js
const mixer = new THREE.AnimationMixer(mesh);
const action = mixer.clipAction(clip);
action.play();

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
\`\`\`

Explain precisely why the object doesn't move even though \`action.play()\` ran without error. Then answer: if the call order of \`animate()\` and \`action.play()\` were swapped, would the result differ — why or why not?`,
    },
    hints: [
      {
        vi: "`.play()` chỉ đổi một cờ trạng thái nội bộ trên action — nó không tự ghi giá trị nào lên `mesh.position`/`mesh.quaternion`.",
        en: "`.play()` only flips an internal state flag on the action — it never writes any value onto `mesh.position`/`mesh.quaternion` itself.",
      },
      {
        vi: "Tìm dòng nào trong render loop chịu trách nhiệm tiến thời gian action và ghi giá trị nội suy lên object.",
        en: "Look for which line in the render loop is responsible for advancing the action's time and writing the interpolated value onto the object.",
      },
    ],
    checklist: [
      {
        vi: "Tôi nêu đúng: render loop thiếu `mixer.update(delta)` nên không có gì tiến thời gian hay ghi giá trị",
        en: "I correctly state: the render loop is missing `mixer.update(delta)`, so nothing advances time or writes any value",
      },
      {
        vi: "Tôi giải thích được `.play()` chỉ đổi cờ trạng thái, không tự vẽ hay ghi property",
        en: "I can explain that `.play()` only flips a state flag and never draws or writes a property itself",
      },
      {
        vi: "Tôi trả lời đúng: thứ tự gọi animate()/play() không quan trọng vì cả hai chỉ set trạng thái, kết quả vẫn đứng yên do thiếu update(delta)",
        en: "I correctly answer: the call order of animate()/play() doesn't matter — both only set state, so the result is still frozen due to the missing update(delta)",
      },
    ],
    solutionCode: `// Thiếu dòng: mixer.update(delta) bên trong animate().
// action.play() chỉ đổi action._startTime / cờ nội bộ của action — nó
// không đọc/ghi mesh.position hay mesh.quaternion. Việc GHI giá trị chỉ
// xảy ra bên trong mixer.update(delta), advance theo delta rồi nội suy
// track. Không gọi update() => object giữ nguyên pose ban đầu mãi mãi.
//
// Đổi thứ tự animate()/play() không thay đổi gì: cả hai chỉ set state,
// bug nằm ở việc THIẾU một lệnh gọi (update), không phải thứ tự các
// lệnh đã có.

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  mixer.update(delta); // dòng còn thiếu
  renderer.render(scene, camera);
}`,
  },
  {
    id: "build-fade-clip",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`buildFadeClip(duration)\` trả về một \`AnimationClip\` tên \`"fade"\`, dài \`duration\` giây, chứa một \`NumberKeyframeTrack\` nhắm thuộc tính \`.material.opacity\` của root, đi từ $1$ xuống $0$ rồi về lại $1$ qua đúng ba keyframe đặt tại $0$, $\\text{duration}/2$ và $\\text{duration}$.`,
      en: `Write a \`buildFadeClip(duration)\` function returning an \`AnimationClip\` named \`"fade"\`, \`duration\` seconds long, containing a single \`NumberKeyframeTrack\` targeting the root's \`.material.opacity\`, going from $1$ down to $0$ and back to $1$ across exactly three keyframes placed at $0$, $\\text{duration}/2$ and $\\text{duration}$.`,
    },
    starterCode: `import * as THREE from "three";

function buildFadeClip(duration: number): THREE.AnimationClip {
  // TODO 1: mảng times với 3 mốc — 0, duration/2, duration
  // TODO 2: mảng values tương ứng — 1, 0, 1 (mỗi keyframe đúng 1 số vì opacity là scalar)
  // TODO 3: tạo NumberKeyframeTrack nhắm ".material.opacity"
  // TODO 4: bọc track vào AnimationClip tên "fade", dài duration giây
  throw new Error("not implemented");
}`,
    solutionCode: `import * as THREE from "three";

function buildFadeClip(duration: number): THREE.AnimationClip {
  const times = [0, duration / 2, duration];
  const values = [1, 0, 1]; // 1 số/keyframe: opacity là scalar, không phải vector/quaternion

  const track = new THREE.NumberKeyframeTrack(
    ".material.opacity",
    times,
    values,
  );

  return new THREE.AnimationClip("fade", duration, [track]);
}`,
    hints: [
      {
        vi: "NumberKeyframeTrack dùng cho thuộc tính scalar (một số) — khác VectorKeyframeTrack (3 số/keyframe) và QuaternionKeyframeTrack (4 số/keyframe) đã thấy trong bài.",
        en: "NumberKeyframeTrack is for scalar properties (a single number) — unlike VectorKeyframeTrack (3 numbers/keyframe) and QuaternionKeyframeTrack (4 numbers/keyframe) seen earlier in the lesson.",
      },
      {
        vi: "Path không có tên node phía trước (bắt đầu bằng dấu chấm) áp thẳng lên root — object bạn sẽ truyền vào AnimationMixer.",
        en: "A path with no node name in front of it (starting with a dot) applies directly to the root — the object you'll pass into AnimationMixer.",
      },
    ],
    checklist: [
      {
        vi: "times có đúng 3 mốc: 0, duration/2, duration",
        en: "times has exactly 3 marks: 0, duration/2, duration",
      },
      {
        vi: "values đúng 1, 0, 1 — một số mỗi keyframe vì opacity là scalar",
        en: "values are exactly 1, 0, 1 — one number per keyframe since opacity is scalar",
      },
      {
        vi: "AnimationClip trả về đúng tên \"fade\" và duration bằng tham số truyền vào",
        en: "The returned AnimationClip has name \"fade\" and duration matching the passed-in parameter",
      },
    ],
  },
];
