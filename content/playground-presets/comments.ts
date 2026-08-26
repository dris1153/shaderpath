import { pick, type Locale, type Localized} from "@/content/types";

// Preset sources carry `// @key` markers instead of prose so one shader body
// serves both locales — the code can never drift between languages, only the
// comment text does. Keys are global (helpers like fbm are shared by several
// presets); tests/unit/playground-presets.test.ts fails on a missing key.
export const PRESET_COMMENTS: Localized<Record<string, string>> = {
  vi: {
    rdChannels: "Hai chất khuếch tán, cất trong hai kênh: A ở đỏ, B ở lục",
    rdCoarse: "Lấy mẫu thưa hơn một texel để hoa văn to lên, dễ nhìn hơn",
    rdSeedEverywhere: "Gieo B khắp mặt phẳng: chờ một đốm lan ra thì quá lâu",
    rdEquations: "Gray-Scott: A bị B ăn, f bơm A vào, k rút B ra",
    rdMousePoke: "Rê chuột để bơm thêm B và xem hoa văn mọc lại từ đó",
    lifeCellGrid: "Một ô 6x6 pixel, không thì ô chỉ bằng một pixel và không nhìn ra gì",
    lifeStateChannel: "Đọc trạng thái từ kênh lục: nó chỉ nhận đúng 0 hoặc 1",
    lifeSeedDensity: "Khoảng 38% ô sống lúc đầu",
    lifeRule: "Luật B3/S23: sinh khi có đúng 3 hàng xóm, sống tiếp khi có 2 hoặc 3",
    lifeReseed: "Rắc thêm vài ô sống để bàn cờ không chết cứng thành tĩnh vật",
    trailSeedRings: "Gieo bằng vân tròn để có sẵn hình trước khi ai chạm chuột",
    trailAdvect: "Lấy mẫu lệch đi một chút mỗi frame: cả bức tranh trôi theo dòng",
    trailDecay: "Nhân 0.985 mỗi frame — vệt cũ mờ dần thay vì đọng lại mãi",
    waveSeedDrops: "Gieo sẵn một giọt và một gợn sóng",
    waveTwoTimeSteps: "Phương trình sóng cần hai mốc thời gian: kênh đỏ là hiện tại, lục là frame trước",
    waveDecode: "Bốn hàng xóm được lưu ở dạng 0..1, giải mã về -1..1 trước khi cộng",
    waveEquation: "Trung bình hàng xóm trừ đi mốc trước — đó là toàn bộ phương trình sóng",
    waveDamping: "Không có suy giảm thì sóng dội mãi và mặt nước thành nhiễu",
    waveDrip: "Nhỏ giọt ngẫu nhiên theo thời gian, cộng thêm giọt tại con trỏ",
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
    rdChannels: "Two diffusing chemicals kept in two channels: A in red, B in green",
    rdCoarse: "Sampling wider than one texel to grow the pattern to a readable size",
    rdSeedEverywhere: "Seed B across the whole plane: waiting for one blob to spread takes too long",
    rdEquations: "Gray-Scott: B eats A, f feeds A in, k drains B away",
    rdMousePoke: "Drag the pointer to inject more B and watch the pattern regrow from it",
    lifeCellGrid: "One cell per 6x6 pixels, or a cell is a single pixel and reads as noise",
    lifeStateChannel: "Read state from green: it only ever holds exactly 0 or 1",
    lifeSeedDensity: "About 38% of cells start alive",
    lifeRule: "B3/S23: born on exactly 3 neighbours, survives on 2 or 3",
    lifeReseed: "Sprinkle in live cells so the board cannot settle into a still life",
    trailSeedRings: "Seeded with rings so there is something to see before anyone touches the mouse",
    trailAdvect: "Sample slightly offset each frame and the whole picture drifts along a flow",
    trailDecay: "Times 0.985 per frame — old strokes fade instead of piling up forever",
    waveSeedDrops: "Seeded with one drop and one ring",
    waveTwoTimeSteps: "The wave equation needs two moments in time: red is now, green is the frame before",
    waveDecode: "The four neighbours are stored as 0..1; decode to -1..1 before summing",
    waveEquation: "Neighbour average minus the earlier moment — that is the whole wave equation",
    waveDamping: "Without damping the waves reflect forever and the surface turns to noise",
    waveDrip: "Random drips over time, plus one at the pointer",
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
  const dict = pick(PRESET_COMMENTS, locale);
  return source.replace(MARKER, (_m, key: string) => `// ${dict[key] ?? key}`);
}

/** Every marker used by any preset source — drives the completeness test. */
export function markersIn(source: string): string[] {
  return [...source.matchAll(MARKER)].map((m) => m[1] ?? "");
}
