export type ConceptId = "attach" | "culling" | "order" | "state";
export type DemoLocale = "vi" | "en";

export const LABELS = {
  vi: {
    title: "Source map: attach / culling / thứ tự vẽ / state cache",
    concept: "Khái niệm",
    concepts: {
      attach: "attach() vs add()",
      culling: "Frustum culling",
      order: "Thứ tự vẽ (opaque/transparent)",
      state: "WebGLState cache",
    },
    attachToggle: "Reparent bằng attach() (thay vì add())",
    cullYaw: "Xoay camera (độ)",
    sortObjects: "renderer.sortObjects",
    stateThrash: "Đổi depthTest mỗi mesh (phá cache)",
    status: {
      attach: (r: number) =>
        `Bán kính quỹ đạo quanh turntable: ${r.toFixed(2)} — attach() giữ world pos (→ 1.00), add() giữ local (→ 3.00)`,
      culling: (drawn: number, total: number) =>
        `renderer.info.render.calls: ${drawn} / ${total} box đã tạo — xoay camera để thấy số này đổi`,
      order: (on: number, total: number) =>
        `renderer.sortObjects = ${on ? "true" : "false"} · ${total} mặt phẳng trong suốt`,
      state: (calls: number, total: number) =>
        `gl.enable/disable THẬT trong frame này: ${calls} (trên ${total} mesh)`,
    },
  },
  en: {
    title: "Source Map: attach / culling / draw order / state cache",
    concept: "Concept",
    concepts: {
      attach: "attach() vs add()",
      culling: "Frustum culling",
      order: "Draw order (opaque/transparent)",
      state: "WebGLState cache",
    },
    attachToggle: "Reparent with attach() (instead of add())",
    cullYaw: "Pan camera (deg)",
    sortObjects: "renderer.sortObjects",
    stateThrash: "Alternate depthTest per mesh (thrash cache)",
    status: {
      attach: (r: number) =>
        `Orbit radius around the turntable: ${r.toFixed(2)} — attach() keeps world pos (-> 1.00), add() keeps local (-> 3.00)`,
      culling: (drawn: number, total: number) =>
        `renderer.info.render.calls: ${drawn} / ${total} boxes created — pan the camera to watch it change`,
      order: (on: number, total: number) =>
        `renderer.sortObjects = ${on ? "true" : "false"} - ${total} transparent planes`,
      state: (calls: number, total: number) =>
        `REAL gl.enable/disable this frame: ${calls} (across ${total} meshes)`,
    },
  },
} as const;
