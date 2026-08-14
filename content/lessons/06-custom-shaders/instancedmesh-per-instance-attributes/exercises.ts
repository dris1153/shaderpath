import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "draw-call-count-and-selection",
    kind: "concept",
    prompt: {
      vi: `Một scene có $3000$ viên đá giống hệt nhau — cùng geometry, cùng material. Vẽ bằng $3000$ \`THREE.Mesh\` riêng biệt tốn bao nhiêu draw call mỗi frame, so với vẽ bằng một \`InstancedMesh(geometry, material, 3000)\`?

Sau đó: người chơi chọn $5$ trong số $3000$ viên đá đó (target), cần đổi màu $5$ viên được chọn sang đỏ MỖI FRAME khi selection thay đổi, trong khi $2995$ viên còn lại giữ nguyên. Nêu cách làm việc này mà KHÔNG làm tăng số draw call đã tính ở trên, và giải thích tại sao cách bạn chọn không cần thêm draw call nào.`,
      en: `A scene has $3000$ identical rocks — same geometry, same material. Drawing them as $3000$ separate \`THREE.Mesh\` objects costs how many draw calls per frame, versus drawing them as a single \`InstancedMesh(geometry, material, 3000)\`?

Then: the player selects $5$ of those $3000$ rocks as targets, and the selected $5$ need to turn red EVERY FRAME the selection changes, while the other $2995$ stay unchanged. Describe how to do this WITHOUT increasing the draw call count above, and explain why your approach needs zero extra draw calls.`,
    },
    hints: [
      {
        vi: "Draw call đếm theo SỐ LẦN gọi gl.draw*, không theo số vertex hay số object logic bên trong một lệnh instanced.",
        en: "Draw calls count the NUMBER OF gl.draw* CALLS, not the vertex count or the logical object count packed inside one instanced call.",
      },
      {
        vi: "instanceColor là một buffer — sửa 5 phần tử trong buffer đó rồi báo needsUpdate vẫn là thao tác trên DỮ LIỆU, không phải thêm một lệnh vẽ mới.",
        en: "instanceColor is just a buffer — editing 5 entries in that buffer and flagging needsUpdate is still a DATA operation, not an extra draw command.",
      },
    ],
    checklist: [
      {
        vi: "Tôi nêu đúng: 3000 Mesh riêng = 3000 draw call/frame; InstancedMesh = 1 draw call/frame",
        en: "I correctly stated: 3000 separate Meshes = 3000 draw calls/frame; InstancedMesh = 1 draw call/frame",
      },
      {
        vi: "Tôi đề xuất dùng setColorAt cho đúng 5 index được chọn, rồi instanceColor.needsUpdate = true",
        en: "I proposed using setColorAt on exactly the 5 selected indices, then instanceColor.needsUpdate = true",
      },
      {
        vi: "Tôi giải thích được vì sao đây vẫn là 1 draw call: cùng một lệnh gl.drawElementsInstanced đọc buffer màu đã cập nhật, không có lệnh vẽ nào được thêm vào",
        en: "I explained why this stays 1 draw call: the same gl.drawElementsInstanced call reads the now-updated color buffer — no new draw command is added",
      },
    ],
    solutionCode: `function highlightSelected(mesh, selectedIndices, normalColor, hitColor) {
  const color = new THREE.Color();
  for (let i = 0; i < mesh.count; i++) {
    const isSelected = selectedIndices.includes(i);
    mesh.setColorAt(i, isSelected ? hitColor : normalColor);
  }
  mesh.instanceColor.needsUpdate = true; // still the same 1 InstancedMesh, 1 draw call
}`,
    solutionNote: {
      vi: `3000 \`THREE.Mesh\` riêng → 3000 draw call mỗi frame. \`InstancedMesh(...,3000)\` → 1 draw call mỗi frame (toàn bộ 3000 bản sao).

Đổi màu 5 viên được target mà KHÔNG thêm draw call, như đoạn code bên dưới: \`setColorAt\` chỉ ghi lại dữ liệu trong \`instanceColor\` buffer đã tồn tại sẵn. Draw call vẫn là \`gl.drawElementsInstanced(..., 3000)\` y hệt trước đó — GPU đọc buffer màu MỚI trong CÙNG một lệnh vẽ, không lệnh nào được thêm.`,
      en: `3000 separate \`THREE.Mesh\` objects → 3000 draw calls per frame. \`InstancedMesh(...,3000)\` → 1 draw call per frame (all 3000 copies at once).

Recoloring the 5 targeted rocks WITHOUT adding a draw call, as in the code below: \`setColorAt\` just writes data into the already-existing \`instanceColor\` buffer. The draw call is still the same \`gl.drawElementsInstanced(..., 3000)\` as before — the GPU reads the NEW color buffer within that SAME draw command, no extra command added.`,
    },
  },
  {
    id: "build-field-of-boxes",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`buildFieldOfBoxes(count, spread)\` trả về một \`THREE.InstancedMesh\` gồm \`count\` hộp \`0.2 \\times 0.2 \\times 0.2\`, mỗi hộp đặt tại vị trí ngẫu nhiên trong khối lập phương cạnh \`spread\` quanh gốc toạ độ (mỗi trục $x, y, z \\in [-spread/2, spread/2]$). Dùng đúng pattern \`Object3D\` dummy + \`setMatrixAt\` + \`needsUpdate\`.`,
      en: `Write a \`buildFieldOfBoxes(count, spread)\` function returning a \`THREE.InstancedMesh\` of \`count\` \`0.2 \\times 0.2 \\times 0.2\` boxes, each placed at a random position inside a cube of side \`spread\` centered on the origin (each axis $x, y, z \\in [-spread/2, spread/2]$). Use the correct \`Object3D\` dummy + \`setMatrixAt\` + \`needsUpdate\` pattern.`,
    },
    starterCode: `import * as THREE from "three";

function buildFieldOfBoxes(count: number, spread: number): THREE.InstancedMesh {
  const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const material = new THREE.MeshStandardMaterial();
  const mesh = new THREE.InstancedMesh(geometry, material, count);

  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    // TODO: randomize dummy.position on x/y/z within [-spread/2, spread/2]
    // TODO: call dummy.updateMatrix(), then mesh.setMatrixAt(i, dummy.matrix)
  }
  // TODO: tell Three the instanceMatrix buffer changed (once, outside the loop)

  return mesh;
}`,
    solutionCode: `import * as THREE from "three";

function buildFieldOfBoxes(count: number, spread: number): THREE.InstancedMesh {
  const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const material = new THREE.MeshStandardMaterial();
  const mesh = new THREE.InstancedMesh(geometry, material, count);

  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    dummy.position.set(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread,
    );
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;

  return mesh;
}`,
    hints: [
      {
        vi: "InstancedMesh không tự tính transform cho bạn — mỗi setMatrixAt chỉ ghi vào một buffer thô, GPU chưa biết buffer đổi cho tới khi bạn báo needsUpdate.",
        en: "InstancedMesh doesn't compute transforms for you — each setMatrixAt just writes into a raw buffer; the GPU doesn't know the buffer changed until you flag needsUpdate.",
      },
      {
        vi: "dummy.updateMatrix() phải gọi TRƯỚC setMatrixAt — setMatrixAt đọc dummy.matrix, nó không tự gọi updateMatrix cho bạn.",
        en: "dummy.updateMatrix() must be called BEFORE setMatrixAt — setMatrixAt reads dummy.matrix, it does not call updateMatrix for you.",
      },
    ],
    checklist: [
      {
        vi: "Vòng lặp gọi setMatrixAt đúng count lần, mỗi lần với vị trí random trong khoảng spread trên cả 3 trục",
        en: "The loop calls setMatrixAt exactly count times, each with a random position within spread on all 3 axes",
      },
      {
        vi: "instanceMatrix.needsUpdate được set true đúng MỘT LẦN sau vòng lặp, không phải bên trong vòng lặp",
        en: "instanceMatrix.needsUpdate is set true exactly ONCE after the loop, not inside the loop",
      },
      {
        vi: "Hàm trả về một InstancedMesh có thể add thẳng vào scene mà không cần thêm bước nào khác",
        en: "The function returns an InstancedMesh that can be added straight to a scene with no further steps",
      },
    ],
  },
];
