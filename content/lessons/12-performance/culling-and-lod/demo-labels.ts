export type DemoLocale = "vi" | "en";

export const LABELS = {
  vi: {
    hint: "Bật frustum culling rồi xoay camera đi chỗ khác: số draw call tụt xuống dù không object nào bị xoá. Chúng vẫn nằm nguyên trong scene, chỉ là không được gửi đi.",
    title: "Chuỗi LOD + frustum culling: dolly qua 7 trạm",
    dolly: "Dolly camera (vị trí Z)",
    wireframe: "Wireframe (lộ mức LOD đang bật)",
    hysteresis: "Hysteresis (chống popping ở biên)",
    overview: "Overview: nêm frustum + trạm bị cắt",
    readout: (drawn: number, culled: number) =>
      `Overview: ${drawn} vẽ · ${culled} bị cắt (frustum)`,
  },
  en: {
    hint: "Turn frustum culling on and point the camera away: the draw call count drops though nothing was deleted. The objects are still in the scene, they are simply not submitted.",
    title: "LOD Chain + Frustum Culling: Dollying Through 7 Stations",
    dolly: "Camera dolly (Z position)",
    wireframe: "Wireframe (exposes the active LOD level)",
    hysteresis: "Hysteresis (fights boundary popping)",
    overview: "Overview: frustum wedge + culled stations",
    readout: (drawn: number, culled: number) =>
      `Overview: ${drawn} drawn · ${culled} culled (frustum)`,
  },
} as const;

export type Labels = (typeof LABELS)[keyof typeof LABELS];
