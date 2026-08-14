import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "predict-add-vs-attach",
    kind: "concept",
    prompt: {
      vi: `Cho \`parent\` là một \`THREE.Group\` đặt tại world position $(2, 0, 0)$ (không xoay, scale $=1$), và là con trực tiếp của \`scene\`. \`cube\` hiện đang là con trực tiếp của \`scene\`, với \`cube.position = (5, 0, 0)\`.

Không chạy code, dựa vào đúng những gì bạn vừa đọc trong \`Object3D.js\`, dự đoán: (a) sau \`parent.add(cube)\`, giá trị \`cube.position\` là gì, và world position thực tế của cube lúc đó là gì; (b) nếu thay bằng \`parent.attach(cube)\`, giá trị \`cube.position\` là gì, và world position của cube có đổi so với NGAY TRƯỚC lệnh gọi hay không.`,
      en: `Let \`parent\` be a \`THREE.Group\` at world position $(2, 0, 0)$ (no rotation, scale $=1$), itself a direct child of \`scene\`. \`cube\` is currently a direct child of \`scene\`, with \`cube.position = (5, 0, 0)\`.

Without running any code, and based on exactly what you just read in \`Object3D.js\`, predict: (a) after \`parent.add(cube)\`, what is \`cube.position\`, and what is the cube's actual world position afterward; (b) if you instead call \`parent.attach(cube)\`, what is \`cube.position\`, and does the cube's world position change from right before the call.`,
    },
    hints: [
      {
        vi: "add() không chạm tới object.position — con số (5,0,0) giữ nguyên, chỉ bị TÁI DIỄN GIẢI như toạ độ local trong hệ quy chiếu mới của parent.",
        en: "add() never touches object.position — the number (5,0,0) stays exactly the same, only RE-INTERPRETED as a local coordinate in the parent's new frame.",
      },
      {
        vi: "attach() gọi applyMatrix4 để ghi lại position/quaternion/scale TRƯỚC khi đổi parent — mục tiêu duy nhất của bước đó là giữ world position không đổi.",
        en: "attach() calls applyMatrix4 to rewrite position/quaternion/scale BEFORE the parent actually changes — that step's entire purpose is keeping world position unchanged.",
      },
    ],
    checklist: [
      {
        vi: "Tôi biết add() giữ nguyên cube.position = (5,0,0), nên world position mới là parent world (2,0,0) + local (5,0,0) = (7,0,0) — nhảy +2 trên X",
        en: "I know add() leaves cube.position = (5,0,0) unchanged, so the new world position is parent world (2,0,0) + local (5,0,0) = (7,0,0) — a +2 jump on X",
      },
      {
        vi: "Tôi biết attach() ghi lại cube.position thành (3,0,0) — đúng bằng (5,0,0) trừ world position của parent — để world position giữ nguyên (5,0,0)",
        en: "I know attach() rewrites cube.position to (3,0,0) — exactly (5,0,0) minus the parent's world position — so the world position stays (5,0,0)",
      },
      {
        vi: "Tôi giải thích được vì sao độ lệch nhảy vị trí ở (a) luôn đúng bằng world position của parent mới",
        en: "I can explain why the position jump in (a) always equals the new parent's world position",
      },
    ],
    solutionNote: {
      vi: `(a) \`parent.add(cube)\`: \`cube.position\` vẫn là (5, 0, 0) — \`add()\` không đụng tới nó. Nhưng giờ (5, 0, 0) là toạ độ LOCAL trong hệ quy chiếu của parent, nên world position thật = parent world (2, 0, 0) + local (5, 0, 0) = (7, 0, 0) — cube nhảy +2 trên trục X.

(b) \`parent.attach(cube)\`: \`attach()\` tính world position hiện tại của cube (5, 0, 0), rồi TRỪ ĐI world position của parent (2, 0, 0) để ra local mới: (3, 0, 0). \`cube.position\` trở thành (3, 0, 0), nhưng world position KHÔNG đổi, vẫn là (5, 0, 0) — đúng như tên gọi "giữ world transform".`,
      en: `(a) \`parent.add(cube)\`: \`cube.position\` stays (5, 0, 0) — \`add()\` never touches it. But now (5, 0, 0) is a LOCAL coordinate in the parent's frame, so the actual world position = parent world (2, 0, 0) + local (5, 0, 0) = (7, 0, 0) — the cube jumps +2 on the X axis.

(b) \`parent.attach(cube)\`: \`attach()\` computes the cube's current world position (5, 0, 0), then SUBTRACTS the parent's world position (2, 0, 0) to get the new local value: (3, 0, 0). \`cube.position\` becomes (3, 0, 0), but the world position does NOT change — it stays (5, 0, 0), exactly matching the name "keep world transform".`,
    },
  },
  {
    id: "reparent-keep-world-position",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`reparentKeepingWorldPosition(newParent, object)\` tự tay làm lại đúng phần POSITION của \`attach()\` (bỏ qua rotation/scale để đơn giản): sau khi hàm chạy xong, \`object\` phải là con của \`newParent\`, và world position của nó phải không đổi so với trước khi gọi hàm -- chỉ \`object.position\` (local) được phép thay đổi. Dùng \`object.getWorldPosition\` và \`newParent.worldToLocal\` thay vì tự nhân ma trận tay.`,
      en: `Write \`reparentKeepingWorldPosition(newParent, object)\`, hand-rolling just the POSITION half of what \`attach()\` does (skip rotation/scale for simplicity): after the function returns, \`object\` must be a child of \`newParent\`, and its world position must be unchanged from right before the call -- only \`object.position\` (local) is allowed to change. Use \`object.getWorldPosition\` and \`newParent.worldToLocal\` instead of hand-rolling matrix inversion.`,
    },
    starterCode: `import * as THREE from "three";

function reparentKeepingWorldPosition(
  newParent: THREE.Object3D,
  object: THREE.Object3D,
): void {
  // TODO 1: read object's current WORLD position into a Vector3
  //         (object.position is LOCAL -- you can't read it off directly)
  // TODO 2: reparent: object.removeFromParent(); newParent.add(object);
  // TODO 3: convert that world position into newParent's local space
  //         and assign it to object.position, then call object.updateMatrix()
}`,
    solutionCode: `import * as THREE from "three";

function reparentKeepingWorldPosition(
  newParent: THREE.Object3D,
  object: THREE.Object3D,
): void {
  const worldPos = new THREE.Vector3();
  object.getWorldPosition(worldPos); // reads matrixWorld, not object.position

  object.removeFromParent();
  newParent.add(object);

  // worldToLocal() updates newParent's matrixWorld then applies its inverse --
  // exactly the _m1.copy(matrixWorld).invert() step real attach() performs.
  newParent.worldToLocal(worldPos);
  object.position.copy(worldPos);
  object.updateMatrix();
}`,
    hints: [
      {
        vi: "object.position là local -- muốn lấy world position phải gọi object.getWorldPosition(target), nó tự cập nhật matrixWorld trước khi đọc.",
        en: "object.position is local -- to get the world position, call object.getWorldPosition(target), which updates matrixWorld before reading it.",
      },
      {
        vi: "newParent.worldToLocal(vector) chính là bước nghịch đảo matrixWorld mà attach() thật sự dùng -- đừng tự viết lại phép nhân ma trận nghịch đảo.",
        en: "newParent.worldToLocal(vector) IS the matrixWorld-inversion step real attach() uses -- don't hand-roll the matrix inversion yourself.",
      },
    ],
    checklist: [
      {
        vi: "object.parent === newParent sau khi hàm chạy xong",
        en: "object.parent === newParent after the function runs",
      },
      {
        vi: "World position đo lại bằng getWorldPosition sau khi reparent khớp với world position TRƯỚC khi gọi hàm (sai số nhỏ do dấu phẩy động là chấp nhận được)",
        en: "World position re-measured with getWorldPosition after reparenting matches the world position BEFORE the call (small floating-point error is acceptable)",
      },
      {
        vi: "object.position (local) thay đổi giá trị bất cứ khi nào newParent không ở transform identity",
        en: "object.position (local) changes value whenever newParent isn't at the identity transform",
      },
    ],
  },
];
