import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-docs-shaderpass",
    type: "article",
    title: "three.js docs — ShaderPass",
    authors: ["Three.js contributors"],
    url: "https://threejs.org/docs/#examples/en/postprocessing/ShaderPass",
    note: {
      vi: "Tài liệu chính thức của chính cái lớp bài này dùng để gộp cả ba hiệu ứng vào một pass — đọc để thấy `textureID`/`uniforms`/`renderToScreen` hoạt động đúng như phần composer chain đã học ở bài EffectComposer.",
      en: "The official docs for the exact class this lesson uses to merge all three effects into one pass — read it to see `textureID`/`uniforms`/`renderToScreen` behave exactly as covered in the EffectComposer lesson's chain.",
    },
  },
  {
    id: "book-of-shaders-random",
    type: "article",
    title: "The Book of Shaders — Chapter 10: Random",
    authors: ["Patricio Gonzalez Vivo", "Jen Lowe"],
    url: "https://thebookofshaders.com/10/",
    note: {
      vi: "Nguồn gốc của hash `fract(sin(dot(...)))` kinh điển và vì sao GPU cần hash thay vì random() thật — Track 7 (hash-functions-on-gpu) đi sâu hơn vào artefact của hash sin và hash đa thức bài này dùng.",
      en: "The origin of the classic `fract(sin(dot(...)))` hash and why GPUs need a hash instead of a real random() — Track 7 (hash-functions-on-gpu) goes deeper into the sin-hash artifacts and the polynomial hash this lesson actually uses.",
    },
  },
  {
    id: "wikipedia-film-grain",
    type: "article",
    title: "Film grain — Wikipedia",
    url: "https://en.wikipedia.org/wiki/Film_grain",
    note: {
      vi: "Giải thích vật lý vì sao grain rõ hơn ở vùng thiếu sáng (mật độ hạt bạc thấp hơn trong vùng phơi sáng thấp) — cơ sở cho việc bài này làm grain mạnh dần theo luminance thấp thay vì đều khắp ảnh.",
      en: "The physical explanation for why grain is more visible in underexposed regions (lower silver-halide crystal density at low exposure) — the basis for this lesson weighting grain strength by low luminance instead of applying it uniformly.",
    },
  },
  {
    id: "wikipedia-vignetting",
    type: "article",
    title: "Vignetting — Wikipedia",
    url: "https://en.wikipedia.org/wiki/Vignetting",
    note: {
      vi: "Nguồn gốc quang học thật của vignette (optical/mechanical/natural vignetting trên ống kính thật) — phân biệt với vignette dựng có chủ đích bằng shader mà bài này viết, vốn chỉ mô phỏng lại hiệu ứng thị giác, không phải hiện tượng quang học.",
      en: "The real optical origin of vignetting (optical/mechanical/natural vignetting on real lenses) — useful to contrast against the deliberately-shader-drawn vignette this lesson writes, which only simulates the visual effect rather than the optical phenomenon.",
    },
  },
  {
    id: "wikipedia-chromatic-aberration",
    type: "article",
    title: "Chromatic aberration — Wikipedia",
    url: "https://en.wikipedia.org/wiki/Chromatic_aberration",
    note: {
      vi: "Vì sao ống kính thật tán sắc các bước sóng khác nhau ở góc khác nhau — nền tảng vật lý cho việc lấy mẫu R/G/B ở ba offset bán kính khác nhau thay vì một offset chung cho cả ba kênh.",
      en: "Why real lenses refract different wavelengths at different angles — the physical basis for sampling R/G/B at three different radial offsets instead of one shared offset for all three channels.",
    },
  },
];
