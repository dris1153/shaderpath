export type DemoLocale = "vi" | "en";

export const LABELS = {
  vi: {
    title: "Chuỗi LOD + frustum culling: dolly qua 7 trạm",
    dolly: "Dolly camera (vị trí Z)",
    wireframe: "Wireframe (lộ mức LOD đang bật)",
    hysteresis: "Hysteresis (chống popping ở biên)",
    overview: "Overview: nêm frustum + trạm bị cắt",
    readout: (drawn: number, culled: number) =>
      `Overview: ${drawn} vẽ · ${culled} bị cắt (frustum)`,
  },
  en: {
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
