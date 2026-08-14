import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "diagnose-acne-vs-peter-panning",
    kind: "concept",
    prompt: {
      vi: `Bạn bật shadow cho một \`DirectionalLight\` chiếu vào một quả cầu đặt trên mặt sàn. Với \`shadow.bias = 0\`, mặt sáng của quả cầu xuất hiện các sọc nhiễu lấm tấm dù không có vật cản nào khác trong scene. Bạn tăng \`bias\` lên \`0.02\` để sửa — sọc nhiễu biến mất, nhưng giờ bóng đổ của quả cầu xuống sàn lại tách rời khỏi điểm tiếp xúc thật, lơ lửng cách chân quả cầu vài centimet.

Giải thích cơ chế gây ra CẢ HAI hiện tượng này bằng đúng một nguyên nhân gốc (không dùng hai lý do khác nhau cho hai hiện tượng), rồi đề xuất một hướng sửa tốt hơn là chỉ tăng/giảm \`bias\` tuỳ tiện.`,
      en: `You enable shadows for a \`DirectionalLight\` shining on a sphere sitting on a ground plane. With \`shadow.bias = 0\`, the sphere's lit side shows speckled noise stripes even though nothing else in the scene occludes it. You raise \`bias\` to \`0.02\` to fix it — the noise disappears, but now the sphere's shadow on the ground detaches from the real contact point, floating a few centimeters away from the sphere's base.

Explain the mechanism behind BOTH symptoms using exactly one root cause (not two separate reasons for the two symptoms), then propose a better fix than blindly raising or lowering \`bias\`.`,
    },
    hints: [
      {
        vi: "Cả hai đều xuất phát từ việc shadow map lưu một giá trị depth cho mỗi texel, đại diện cho một VÙNG bề mặt chứ không phải một điểm — nghĩ về bias di chuyển ngưỡng so sánh depth theo hướng nào.",
        en: "Both trace back to the shadow map storing one depth value per texel, representing an AREA of surface, not a point — think about which direction bias shifts the comparison threshold.",
      },
      {
        vi: "normalBias dịch điểm lấy mẫu theo pháp tuyến thay vì dịch giá trị depth trực tiếp — nghĩ tại sao cách đó ít gây peter-panning hơn ở cùng mức 'sửa acne'.",
        en: "normalBias shifts the sample point along the normal instead of shifting the depth value directly — think about why that causes less peter-panning at the same level of acne fix.",
      },
    ],
    checklist: [
      {
        vi: "Giải thích được acne và peter-panning là hai đầu đối lập của cùng một trục: bias quá nhỏ (hoặc 0) gây acne, bias quá lớn gây peter-panning",
        en: "Explains acne and peter-panning as opposite ends of the same axis: bias too small (or 0) causes acne, bias too large causes peter-panning",
      },
      {
        vi: "Nêu đúng cơ chế gốc: shadow map lưu một depth cho mỗi texel đại diện cho cả một vùng bề mặt, gây so sánh sai ở góc nghiêng",
        en: "States the correct root cause: the shadow map stores one depth per texel representing a whole patch of surface, causing bad comparisons at grazing angles",
      },
      {
        vi: "Đề xuất normalBias hoặc tăng bias từng bước nhỏ, thay vì một bước nhảy lớn tuỳ tiện",
        en: "Proposes normalBias, or small incremental bias steps, instead of one large arbitrary jump",
      },
    ],
    solutionNote: {
      vi: `Cùng một nguyên nhân gốc: shadow map lưu 1 depth/texel, đại diện cho một VÙNG bề mặt, không phải một điểm.

\`bias = 0\` → so sánh depth quá "khắt khe": sai số nội suy/góc nghiêng giữa depth thật và depth đã lưu bị đọc thành tự-che-chính-mình → acne. \`bias = 0.02\` quá lớn → điểm tiếp xúc THẬT giữa quả cầu và sàn cũng bị đẩy qua ngưỡng "không bị che" → bóng tách khỏi chân quả cầu → peter-panning.

Hướng sửa tốt hơn: tăng bias dần từng bước nhỏ (0.001 → 0.002 → ...) và dừng lại ngay khi acne vừa biến mất — không tăng thêm "cho chắc". Hoặc ưu tiên \`normalBias\`: dịch điểm lấy mẫu theo pháp tuyến bề mặt thay vì dịch depth, giảm acne ở bề mặt cong mà giữ điểm tiếp xúc gần đúng vị trí.`,
      en: `Both trace back to the same root cause: the shadow map stores one depth value per texel, representing an AREA of surface, not a point.

\`bias = 0\` → the depth comparison is too "strict": interpolation/grazing-angle error between the real depth and the stored depth gets read as self-occlusion → acne. \`bias = 0.02\` is too large → the REAL contact point between the sphere and the ground also gets pushed past the "not occluded" threshold → the shadow detaches from the sphere's base → peter-panning.

A better fix: raise bias in small increments (0.001 → 0.002 → ...) and stop the moment the acne disappears — don't add extra "just to be safe." Or prefer \`normalBias\`: it shifts the sample point along the surface normal instead of shifting depth, reducing acne on curved surfaces while keeping the contact point close to its real position.`,
    },
  },
  {
    id: "wire-up-shadow-casting-scene",
    kind: "code",
    prompt: {
      vi: `Hoàn thiện đoạn code TypeScript bên dưới cho một scene Three.js đã có sẵn \`renderer\`, \`scene\`, một \`DirectionalLight\` tên \`sun\`, một \`Mesh\` hình cầu tên \`sphere\` và một \`Mesh\` mặt phẳng tên \`ground\` — sao cho quả cầu đổ đúng bóng xuống mặt sàn. Yêu cầu: bật đủ pipeline shadow (renderer + hai mesh), đặt \`shadow.mapSize\` ở 1024, và cấu hình frustum của shadow camera đủ rộng để phủ một vùng bán kính khoảng 6 đơn vị quanh gốc toạ độ.`,
      en: `Complete the TypeScript snippet below for a Three.js scene that already has a \`renderer\`, \`scene\`, a \`DirectionalLight\` named \`sun\`, a sphere \`Mesh\` named \`sphere\`, and a plane \`Mesh\` named \`ground\` — so the sphere casts a correct shadow onto the ground. Requirements: enable the full shadow pipeline (renderer + both meshes), set \`shadow.mapSize\` to 1024, and size the shadow camera's frustum wide enough to cover a roughly 6-unit radius around the origin.`,
    },
    starterCode: `const renderer = new THREE.WebGLRenderer({ canvas });
const scene = new THREE.Scene();
const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(5, 8, 3);
scene.add(sun, sun.target);

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 24),
  new THREE.MeshStandardMaterial({ color: 0xff6644 }),
);
sphere.position.y = 1;
scene.add(sphere);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x888888 }),
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// TODO: enable the shadow map on the renderer
// TODO: tell sun and sphere they cast shadows
// TODO: tell ground it receives shadows
// TODO: configure sun.shadow.camera's mapSize and frustum, then update its matrix`,
    solutionCode: `renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

sun.castShadow = true;
sphere.castShadow = true;
ground.receiveShadow = true;

sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -6;
sun.shadow.camera.right = 6;
sun.shadow.camera.top = 6;
sun.shadow.camera.bottom = -6;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 20;
sun.shadow.camera.updateProjectionMatrix();`,
    hints: [
      {
        vi: "Bốn cờ (renderer.shadowMap.enabled, light.castShadow, mesh.castShadow, mesh.receiveShadow) độc lập nhau — thiếu một cờ là đủ để không có bóng nào hiện ra.",
        en: "The four flags (renderer.shadowMap.enabled, light.castShadow, mesh.castShadow, mesh.receiveShadow) are independent — missing just one is enough for no shadow to appear.",
      },
      {
        vi: "Sau khi đổi left/right/top/bottom/near/far của shadow camera, phải gọi updateProjectionMatrix() để áp dụng thay đổi.",
        en: "After changing left/right/top/bottom/near/far on the shadow camera, call updateProjectionMatrix() to apply the change.",
      },
    ],
    checklist: [
      {
        vi: "renderer.shadowMap.enabled đã được đặt thành true",
        en: "renderer.shadowMap.enabled is set to true",
      },
      {
        vi: "sun.castShadow và sphere.castShadow đều true, ground.receiveShadow là true",
        en: "sun.castShadow and sphere.castShadow are both true, and ground.receiveShadow is true",
      },
      {
        vi: "shadow.camera có left/right/top/bottom phủ được bán kính ~6 đơn vị và đã gọi updateProjectionMatrix()",
        en: "shadow.camera's left/right/top/bottom cover a ~6-unit radius and updateProjectionMatrix() has been called",
      },
    ],
  },
];
