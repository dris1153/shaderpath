import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "diagnose-ssr-crash-vs-warning",
    kind: "concept",
    prompt: {
      vi: `Ba đoạn code dưới đây đều nằm trong một Client Component 3D được server-render. Với mỗi đoạn, trả lời: nó làm **sập luôn request phía server** (lỗi 500 ngay khi render), chỉ in **cảnh báo ở dev console** nhưng vẫn chạy tiếp, hay **không có vấn đề gì** khi SSR?

Đoạn A — ở đầu file, ngoài mọi hàm: \`const MAX_DPR = window.devicePixelRatio;\`

Đoạn B — bên trong component: \`React.useLayoutEffect(() => { canvasRef.current!.width = 800; }, []);\`

Đoạn C — bên trong một \`useEffect\`: \`useEffect(() => { const ctx = canvasRef.current!.getContext("webgl2"); }, []);\``,
      en: `The three snippets below all live inside a 3D Client Component that gets server-rendered. For each one, answer: does it **crash the server request outright** (a 500 error right at render time), does it **only log a dev-console warning** but keep running, or is it **completely fine** under SSR?

Snippet A — at the top of the file, outside any function: \`const MAX_DPR = window.devicePixelRatio;\`

Snippet B — inside the component: \`React.useLayoutEffect(() => { canvasRef.current!.width = 800; }, []);\`

Snippet C — inside a \`useEffect\`: \`useEffect(() => { const ctx = canvasRef.current!.getContext("webgl2"); }, []);\``,
    },
    hints: [
      {
        vi: "Module scope chạy ngay lúc import — cả trên server lẫn client, không cần component nào render cả.",
        en: "Module scope runs the instant the module is imported — on both server and client, before any component even renders.",
      },
      {
        vi: "useEffect (kể cả useLayoutEffect) không BAO GIỜ chạy trong lúc React render trên server — nó chỉ được LÊN LỊCH, và lịch đó chỉ thực thi trên trình duyệt sau khi hydrate.",
        en: "useEffect (including useLayoutEffect) NEVER runs during React's server render — it only gets SCHEDULED, and that schedule only executes in the browser after hydration.",
      },
    ],
    checklist: [
      {
        vi: "Tôi xác định đúng: Đoạn A làm sập server (window không tồn tại ở module scope trên Node.js)",
        en: "I correctly identified: Snippet A crashes the server (window doesn't exist at module scope on Node.js)",
      },
      {
        vi: "Tôi xác định đúng: Đoạn B chỉ cảnh báo dev console — effect không chạy trên server, không có gì sập, nhưng React log warning vì component có useLayoutEffect bị SSR",
        en: "I correctly identified: Snippet B only logs a dev-console warning — the effect doesn't run on the server, nothing crashes, but React logs a warning because the component using useLayoutEffect got SSR'd",
      },
      {
        vi: "Tôi xác định đúng: Đoạn C hoàn toàn ổn — nằm trong effect nên chỉ chạy trên client, không đụng gì lúc server render",
        en: "I correctly identified: Snippet C is completely fine — it's inside an effect so it only runs on the client, touching nothing during server render",
      },
    ],
    solutionCode: `// A: SẬP SERVER. "const MAX_DPR = window.devicePixelRatio" chạy ngay khi
// module được import — Node.js không có \`window\`, nên đây là
// "ReferenceError: window is not defined" ngay tại thời điểm import, trước
// khi component kịp render dòng nào. Sửa: đọc devicePixelRatio bên trong
// effect/callback, không phải module scope.

// B: CHỈ CẢNH BÁO. useLayoutEffect không chạy trong lúc server render — React
// chỉ ghi lịch nó cho lần chạy trên client. Component vẫn render ra HTML
// bình thường, KHÔNG sập, nhưng React in cảnh báo dev "useLayoutEffect does
// nothing on the server" vì phát hiện component này bị đưa vào cây SSR.
// (Cách R3F tự tránh cảnh báo này: dùng useIsomorphicLayoutEffect, tự chọn
// useEffect trên server, useLayoutEffect trên client.)

// C: HOÀN TOÀN ỔN. Toàn bộ thân effect chỉ chạy sau khi component đã mount
// thật trên trình duyệt (post-hydration) — không bao giờ chạy trong lúc
// React render trên Node.js, dù nội dung bên trong đụng WebGL trực tiếp.`,
  },
  {
    id: "gate-client-only-quality-badge",
    kind: "code",
    prompt: {
      vi: `Component \`QualityBadge\` bên dưới hiển thị tier chất lượng đọc từ \`localStorage\` (chỉ tồn tại trên client) — bản hiện tại đọc \`localStorage\` ngay trong thân component nên giá trị server render (luôn \`null\`) khác giá trị client render (giá trị lưu thật), gây hydration mismatch. Sửa bằng pattern **mounted-state gate**: lần render đầu trên client phải khớp hệt server, giá trị thật chỉ hiện sau khi \`mounted === true\`.`,
      en: `The \`QualityBadge\` component below reads a quality tier from \`localStorage\` (which only exists on the client) — as written, it reads \`localStorage\` directly in the component body, so the server-rendered value (always \`null\`) differs from the client-rendered value (the real stored one), causing a hydration mismatch. Fix it with the **mounted-state gate** pattern: the client's first render must match the server exactly, with the real value only appearing after \`mounted === true\`.`,
    },
    starterCode: `"use client";

// BUG: reads localStorage directly during render — server always sees
// \`null\`, client sees the real stored tier, React flags a mismatch.
export function QualityBadge() {
  const tier = localStorage.getItem("quality-tier") ?? "auto";
  return <span className="rounded border px-2 py-0.5 text-xs">{tier}</span>;
}`,
    solutionCode: `"use client";

import { useEffect, useState } from "react";

export function QualityBadge() {
  const [mounted, setMounted] = useState(false);
  const [tier, setTier] = useState("auto");

  useEffect(() => {
    setTier(localStorage.getItem("quality-tier") ?? "auto");
    setMounted(true);
  }, []);

  // First client render matches the server exactly (always "auto") — the
  // real stored tier only appears one frame later, after mount.
  return (
    <span className="rounded border px-2 py-0.5 text-xs">
      {mounted ? tier : "auto"}
    </span>
  );
}`,
    hints: [
      {
        vi: "Giá trị JSX trả về ở lần render ĐẦU TIÊN trên client phải giống hệt server — nghĩa là trước khi mounted === true, luôn hiển thị giá trị mặc định 'auto', không phải giá trị đọc từ localStorage.",
        en: "The JSX returned on the client's FIRST render must be identical to the server's — meaning before mounted === true, always show the default 'auto' value, never the value read from localStorage.",
      },
      {
        vi: "localStorage.getItem chỉ được gọi bên trong useEffect (chạy sau mount, chỉ trên client) — không bao giờ trực tiếp trong thân component.",
        en: "localStorage.getItem must only be called inside useEffect (runs after mount, client-only) — never directly in the component body.",
      },
    ],
    checklist: [
      {
        vi: "localStorage không còn được đọc trực tiếp trong thân component",
        en: "localStorage is no longer read directly in the component body",
      },
      {
        vi: "Lần render đầu tiên (mounted === false) luôn hiển thị 'auto', khớp hệt giá trị server render ra",
        en: "The first render (mounted === false) always shows 'auto', identical to what the server rendered",
      },
      {
        vi: "Giá trị tier thật chỉ hiện sau khi useEffect chạy và đặt mounted = true",
        en: "The real tier value only appears after the useEffect runs and sets mounted = true",
      },
    ],
  },
];
