import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "water-f0-grazing-angle",
    kind: "concept",
    prompt: {
      vi: `Nước có chiết suất $n \\approx 1.33$. Dùng đúng công thức trong bài, $F_0 = \\left(\\frac{n_1 - n_2}{n_1 + n_2}\\right)^2$ với không khí $n_1 = 1$, tính $F_0$ của nước.

$F_0$ này rất nhỏ — vậy tại sao mặt hồ vẫn phản chiếu RÕ RỆT bầu trời khi nhìn gần như song song mặt nước (góc xiên gần $90°$), dù nhìn thẳng xuống gần như không thấy phản chiếu gì?`,
      en: `Water has an index of refraction $n \\approx 1.33$. Using the exact formula from this lesson, $F_0 = \\left(\\frac{n_1 - n_2}{n_1 + n_2}\\right)^2$ with air's $n_1 = 1$, compute water's $F_0$.

That $F_0$ is tiny — so why does a lake still reflect the sky clearly at a near-grazing viewing angle (close to $90°$), while looking straight down shows almost no reflection at all?`,
    },
    hints: [
      {
        vi: "Thay số: F0 = ((1.33 - 1) / (1.33 + 1))^2 = (0.33/2.33)^2. Giữ đủ chữ số thập phân trước khi làm tròn.",
        en: "Substitute: F0 = ((1.33 - 1) / (1.33 + 1))^2 = (0.33/2.33)^2. Keep the decimals before rounding.",
      },
      {
        vi: "F0 chỉ là phản xạ tại góc nhìn VUÔNG GÓC (0°). Xấp xỉ Schlick cho biết phản xạ tiến dần về 1.0 khi góc nhìn tiến về 90°, bất kể F0 ban đầu thấp cỡ nào — đây chính là hiệu ứng Fresnel, không phải một tính chất phụ.",
        en: "F0 is only the reflectance at a STRAIGHT-ON (0°) angle. The Schlick approximation shows reflectance climbing toward 1.0 as the angle approaches 90°, regardless of how low F0 starts — that climb IS the Fresnel effect, not a side detail.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính được F0 của nước ≈ 0.02",
        en: "I computed water's F0 ≈ 0.02",
      },
      {
        vi: "Tôi giải thích được F0 chỉ áp dụng ở góc 0°, không phải mọi góc",
        en: "I can explain that F0 only applies at 0°, not at every angle",
      },
      {
        vi: "Tôi liên hệ được với xấp xỉ Schlick: phản xạ tiến về 1.0 ở góc xiên bất kể F0 thấp",
        en: "I connected this to the Schlick approximation: reflectance climbs toward 1.0 at grazing angles regardless of a low F0",
      },
    ],
    solutionCode: `// F0 = ((1.33 - 1) / (1.33 + 1))^2 = (0.33 / 2.33)^2 ≈ (0.1416)^2 ≈ 0.02

// F0 = 0.02 is the reflectance ONLY at a 0° (straight-down) viewing angle.
// The Schlick approximation, F(theta) = F0 + (1 - F0) * (1 - cos(theta))^5,
// shows the SECOND term dominating as theta -> 90°: (1 - cos(theta))^5 -> 1,
// so F(theta) -> F0 + (1 - F0) * 1 = 1, regardless of how small F0 started.
// That's exactly why a lake reflects almost nothing looking straight down
// (theta ≈ 0°, F ≈ F0 ≈ 0.02) but mirrors the sky at a grazing angle
// (theta ≈ 90°, F ≈ 1.0) — the SAME F0, just evaluated at a different angle.`,
  },
  {
    id: "diagnose-plastic-checklist",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`diagnosePlastic\` áp dụng đúng bảy nguyên nhân trong bài lên một \`MaterialReport\`, trả về mảng các mã nguyên nhân đang vi phạm (\`"roughness"\`, \`"albedo"\`, \`"metalness"\`, \`"ibl"\`, \`"ao"\`, \`"normal"\`, \`"tonemap"\`), theo đúng thứ tự triage ánh sáng → vật liệu → map đã học.`,
      en: `Write a \`diagnosePlastic\` function applying this lesson's exact seven causes to a \`MaterialReport\`, returning an array of the violated cause codes (\`"roughness"\`, \`"albedo"\`, \`"metalness"\`, \`"ibl"\`, \`"ao"\`, \`"normal"\`, \`"tonemap"\`), in the exact lighting → material → maps triage order this lesson teaches.`,
    },
    starterCode: `interface MaterialReport {
  roughness: number;           // 0..1
  hasRoughnessVariation: boolean;
  albedoLuminance: number;     // 0..1, approximate perceived brightness
  metalness: number;           // 0..1
  hasEnvironment: boolean;
  hasAO: boolean;
  normalScale: number;         // 0 = map has no effect
  toneMappingEnabled: boolean;
}

function diagnosePlastic(report: MaterialReport): string[] {
  const causes: string[] = [];

  // TODO 1 (lighting): no environment -> "ibl"
  // TODO 2 (lighting): tone mapping disabled -> "tonemap"
  // TODO 3 (material): metalness strictly between 0 and 1 (not 0, not 1) -> "metalness"
  // TODO 4 (material): albedoLuminance < 0.02 (too dark, near-black) -> "albedo"
  // TODO 5 (maps): roughness < 0.08 AND no variation map -> "roughness"
  // TODO 6 (maps): normalScale === 0 -> "normal"
  // TODO 7 (maps): no AO -> "ao"

  return causes;
}`,
    solutionCode: `interface MaterialReport {
  roughness: number;
  hasRoughnessVariation: boolean;
  albedoLuminance: number;
  metalness: number;
  hasEnvironment: boolean;
  hasAO: boolean;
  normalScale: number;
  toneMappingEnabled: boolean;
}

function diagnosePlastic(report: MaterialReport): string[] {
  const causes: string[] = [];

  // Lighting first — nothing below matters if these are wrong.
  if (!report.hasEnvironment) causes.push("ibl");
  if (!report.toneMappingEnabled) causes.push("tonemap");

  // Base material next.
  if (report.metalness > 0 && report.metalness < 1) causes.push("metalness");
  if (report.albedoLuminance < 0.02) causes.push("albedo");

  // Detail maps last.
  if (report.roughness < 0.08 && !report.hasRoughnessVariation) causes.push("roughness");
  if (report.normalScale === 0) causes.push("normal");
  if (!report.hasAO) causes.push("ao");

  return causes;
}`,
    hints: [
      {
        vi: "Giữ đúng thứ tự push vào mảng — bài kiểm tra thứ tự triage, không chỉ nội dung: ibl/tonemap trước, rồi metalness/albedo, rồi roughness/normal/ao.",
        en: "Keep the push order matching triage order — this checks the ORDER, not just the contents: ibl/tonemap first, then metalness/albedo, then roughness/normal/ao.",
      },
      {
        vi: "Điều kiện metalness \"sai\" là NGHIÊM NGẶT giữa 0 và 1 — metalness=0 (điện môi thật) và metalness=1 (kim loại thật) đều HỢP LỆ, không phải nguyên nhân.",
        en: "The metalness \"wrong\" condition is STRICTLY between 0 and 1 — metalness=0 (a real dielectric) and metalness=1 (a real metal) are both VALID, not a cause.",
      },
    ],
    checklist: [
      {
        vi: "diagnosePlastic trả về mảng rỗng cho một report đã đúng mọi thứ",
        en: "diagnosePlastic returns an empty array for a report that's already correct everywhere",
      },
      {
        vi: "metalness=0 và metalness=1 KHÔNG bị gắn cờ \"metalness\", chỉ giá trị giữa chừng mới bị",
        en: "metalness=0 and metalness=1 are NOT flagged as \"metalness\", only in-between values are",
      },
      {
        vi: "Thứ tự các mã nguyên nhân trả về đúng triage: ibl/tonemap trước metalness/albedo trước roughness/normal/ao",
        en: "The returned cause codes follow the triage order: ibl/tonemap before metalness/albedo before roughness/normal/ao",
      },
    ],
  },
];
