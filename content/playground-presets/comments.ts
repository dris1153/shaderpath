import type { Locale } from "@/content/types";

// Preset sources carry `// @key` markers instead of prose so one shader body
// serves both locales — the code can never drift between languages, only the
// comment text does. Keys are global (helpers like fbm are shared by several
// presets); tests/unit/playground-presets.test.ts fails on a missing key.
export const PRESET_COMMENTS: Record<Locale, Record<string, string>> = {
  vi: {
    cosinePalette: "Bảng màu cosine: a + b * cos(2pi * (c*t + d))",
    mouseHalo: "Quầng sáng bám theo con trỏ (uMouse chuẩn hoá 0..1)",
    fourBands: "Bốn dải ngang, mỗi dải vẽ một hàm nhào nặn khác nhau",
    claySmin: "Hoà hai hình như đất sét thay vì cắt góc cứng",
    isolines: "vân đồng mức",
    whichCell: "ô nào",
    posInCell: "vị trí trong ô",
    aspectSpace: "Đo khoảng cách trong không gian đã sửa tỉ lệ khung hình",
    rippleDecay: "Sóng lan ra, tắt dần theo khoảng cách",
    fadeCurve: "fade: bỏ đi thì lộ hình kim cương ở mắt lưới",
    scanNeighbours: "Quét 3x3 ô lân cận: chỉ xét ô của mình sẽ đứt gãy ở biên",
    f2f1Border: "F2 - F1 cho ra viền tế bào",
    quilezWarp: "Kỹ thuật Quilez: dùng noise làm méo chính toạ độ đưa vào noise",
    curlDivFree: "Curl 2D: xoay gradient 90 độ nên phân kỳ luôn bằng 0",
    walkUpstream: "đi ngược dòng vài bước",
    plasmaSum: "Demoscene: cộng vài sóng sin lệch pha rồi map qua bảng màu",
    sceneIsFunction: "Cảnh là một hàm khoảng cách, không có tam giác nào",
    sphereTracing: "Sphere tracing: mỗi bước đi đúng khoảng cách an toàn",
    weldShapes: "hàn hai khối lại như đất sét",
    repeatSpace: "Lặp toạ độ truy vấn: một object, vô hạn bản sao, bộ nhớ O(1)",
    cautiousStep: "bước dè hơn vì mod nói dối gần biên ô",
  },
  en: {
    cosinePalette: "Cosine palette: a + b * cos(2pi * (c*t + d))",
    mouseHalo: "Halo that follows the cursor (uMouse is normalised 0..1)",
    fourBands: "Four horizontal bands, one shaping function each",
    claySmin: "Blend the two shapes like clay instead of a hard corner",
    isolines: "distance isolines",
    whichCell: "which cell",
    posInCell: "position inside the cell",
    aspectSpace: "Measure distance in aspect-corrected space",
    rippleDecay: "Wave spreads outward, damped by distance",
    fadeCurve: "fade: drop it and the grid diamonds show up",
    scanNeighbours: "Scan the 3x3 neighbourhood: own cell only breaks at borders",
    f2f1Border: "F2 - F1 gives the cell border",
    quilezWarp: "Quilez trick: use noise to distort the coordinates fed to noise",
    curlDivFree: "2D curl: rotating the gradient 90 degrees makes divergence zero",
    walkUpstream: "walk a few steps upstream",
    plasmaSum: "Demoscene: sum a few phase-shifted sines, then map to a palette",
    sceneIsFunction: "The scene is a distance function — no triangles at all",
    sphereTracing: "Sphere tracing: every step is the largest safe distance",
    weldShapes: "weld the two masses together like clay",
    repeatSpace: "Repeat the query point: one object, endless copies, O(1) memory",
    cautiousStep: "shorter steps because mod lies near the cell border",
  },
};

const MARKER = /\/\/\s*@(\w+)/g;

/** Swap `// @key` markers for the locale's comment text. */
export function localizeSource(source: string, locale: Locale): string {
  const dict = PRESET_COMMENTS[locale] ?? PRESET_COMMENTS.vi;
  return source.replace(MARKER, (_m, key: string) => `// ${dict[key] ?? key}`);
}

/** Every marker used by any preset source — drives the completeness test. */
export function markersIn(source: string): string[] {
  return [...source.matchAll(MARKER)].map((m) => m[1] ?? "");
}
