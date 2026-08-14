import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "leva-github-repo",
    type: "repo",
    title: "leva — a GUI, with minimal code and maximum control",
    authors: ["pmndrs"],
    url: "https://github.com/pmndrs/leva",
    note: {
      vi: "Repo chính thức của leva — nguồn của cú pháp useControls, smart input recognition, và danh sách hơn 12 kiểu input có sẵn được nhắc trong bài.",
      en: "leva's official repo — the source for the useControls syntax, smart input recognition, and the 12+ built-in input kinds referenced in this lesson.",
    },
  },
  {
    id: "leva-special-inputs-docs",
    type: "article",
    title: "leva docs — Special Inputs (button, monitor)",
    authors: ["pmndrs"],
    url: "https://github.com/pmndrs/leva/blob/main/docs/getting-started/special-inputs.md",
    note: {
      vi: "Tài liệu chính thức cho input đặc biệt button và monitor — nguồn của ví dụ monitor(fpsRef, { graph, interval }) dùng trong bài.",
      en: "Official docs for the special button and monitor inputs — the source for this lesson's monitor(fpsRef, { graph, interval }) example.",
    },
  },
  {
    id: "leva-controlled-inputs-docs",
    type: "article",
    title: "leva docs — Controlled Inputs (transient get/set)",
    authors: ["pmndrs"],
    url: "https://github.com/pmndrs/leva/blob/main/docs/advanced/controlled-inputs.md",
    note: {
      vi: "Nguồn của ví dụ `const [values, set, get] = useControls(() => ({...}))` — cơ chế transient read được trích gần như nguyên văn trong bài.",
      en: "The source for the `const [values, set, get] = useControls(() => ({...}))` example — the transient-read mechanism quoted almost verbatim in this lesson.",
    },
  },
  {
    id: "leva-configuration-docs",
    type: "article",
    title: "leva docs — Configuration (the hidden prop)",
    authors: ["pmndrs"],
    url: "https://github.com/pmndrs/leva/blob/main/docs/getting-started/configuration.md",
    note: {
      vi: "Nguồn của prop `hidden` trên `<Leva />` — đúng cơ chế được bài này giải thích là chỉ ẩn UI, không tự loại code khỏi bundle production.",
      en: "The source for the `hidden` prop on `<Leva />` — the exact mechanism this lesson explains as UI-only, not a bundle-stripping switch.",
    },
  },
];
