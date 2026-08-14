import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "splittext-words-vs-chars-vi",
    kind: "concept",
    prompt: {
      vi: `Tiêu đề tiếng Việt \`"Chào bạn"\` được split bằng \`SplitText.create(el, {type: "words"})\`. Không chạy code, cho biết \`split.words\` sẽ chứa bao nhiêu phần tử, và giải thích cơ chế mặc định của SplitText tách "words" dựa trên gì (khoảng trắng hay ranh giới ngữ nghĩa của từ)?

Sau đó, với cùng câu đó nhưng split theo \`"chars"\` — âm tiết \`"Chào"\` có ký tự \`à\` (a có dấu huyền) có bị tách thành hai phần tử riêng (\`a\` và dấu huyền) hay giữ nguyên một phần tử duy nhất? Giải thích bằng khái niệm Unicode precomposed (NFC).`,
      en: `A Vietnamese headline \`"Chào bạn"\` is split with \`SplitText.create(el, {type: "words"})\`. Without running any code, state how many elements \`split.words\` will contain, and explain what SplitText's default word-splitting is actually based on (whitespace, or real semantic word boundaries)?

Then, splitting the same sentence by \`"chars"\` — does the character \`à\` (a with a grave accent) inside \`"Chào"\` get split into two separate elements (\`a\` and the accent mark) or stay a single element? Explain using the Unicode precomposed (NFC) concept.`,
    },
    hints: [
      {
        vi: "words tách theo khoảng trắng (wordDelimiter mặc định) — đếm số cụm ký tự không có dấu cách ở giữa, không cần hiểu ngữ nghĩa tiếng Việt.",
        en: "words split on whitespace (the default wordDelimiter) — count the groups of characters with no space in the middle, no Vietnamese semantics required.",
      },
      {
        vi: "à trong tiếng Việt chuẩn Unicode NFC là một code point duy nhất (U+00E0), không phải \"a\" cộng dấu tổ hợp riêng — trừ khi văn bản gốc chưa chuẩn hoá (dạng NFD).",
        en: "à in standard Vietnamese Unicode NFC is a single code point (U+00E0), not \"a\" plus a separate combining mark — unless the source text is unnormalized (NFD form).",
      },
    ],
    checklist: [
      {
        vi: "Tôi đếm đúng split.words có 2 phần tử (\"Chào\", \"bạn\")",
        en: "I counted split.words correctly as 2 elements (\"Chào\", \"bạn\")",
      },
      {
        vi: "Tôi giải thích được words tách theo khoảng trắng, không theo ngữ nghĩa hay ranh giới từ thật",
        en: "I explained that words split on whitespace, not on semantics or real word boundaries",
      },
      {
        vi: "Tôi giải thích được vì sao \"à\" không bị tách đôi khi split theo chars (precomposed NFC)",
        en: "I explained why \"à\" doesn't get split in half when splitting by chars (precomposed NFC)",
      },
    ],
    solutionCode: `// split.words = ["Chào", "bạn"] — 2 phần tử, vì SplitText mặc định
// cắt theo khoảng trắng (wordDelimiter), không phân tích ngữ nghĩa.
//
// "à" trong "Chào" là U+00E0 (LATIN SMALL LETTER A WITH GRAVE) — một
// code point Unicode DUY NHẤT ở dạng NFC (precomposed). SplitText lặp
// qua chuỗi theo code point, nên "à" luôn nằm trọn trong một <div> ký
// tự, không bao giờ bị cắt thành "a" + dấu huyền riêng — trừ khi input
// gốc đã ở dạng NFD (combining mark tách rời), trường hợp hiếm gặp khi
// gõ tiếng Việt qua bàn phím/OS chuẩn.`,
  },
  {
    id: "splittext-idempotent-reveal",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`createCharReveal(el, stagger)\` dùng SplitText tách \`el\` theo chars và animate reveal (\`yPercent\` 100→0, \`opacity\` 0→1, có stagger). Hàm trả về một cleanup gọi \`split.revert()\` — cleanup này phải AN TOÀN khi bị gọi nhiều lần (ví dụ React Strict Mode gọi cleanup effect hai lần lúc mount) mà không throw lỗi hay revert hai lần.`,
      en: `Write a \`createCharReveal(el, stagger)\` function that uses SplitText to split \`el\` by chars and animate a reveal (\`yPercent\` 100→0, \`opacity\` 0→1, staggered). It returns a cleanup function that calls \`split.revert()\` — that cleanup must be SAFE to call more than once (e.g. React Strict Mode invoking an effect's cleanup twice on mount) without throwing or reverting twice.`,
    },
    starterCode: `import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

function createCharReveal(el: HTMLElement, stagger: number): () => void {
  // TODO 1: tạo split theo chars (aria: "auto")
  // TODO 2: set trạng thái ẩn ban đầu, rồi animate reveal có stagger
  // TODO 3: trả về cleanup — gọi tween.kill() + split.revert(),
  //         an toàn khi bị gọi nhiều lần liên tiếp

  return () => {};
}`,
    solutionCode: `import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

function createCharReveal(el: HTMLElement, stagger: number): () => void {
  const split = SplitText.create(el, { type: "chars", aria: "auto" });

  gsap.set(split.chars, { yPercent: 100, opacity: 0 });
  const tween = gsap.to(split.chars, {
    yPercent: 0,
    opacity: 1,
    duration: 0.6,
    stagger,
    ease: "power3.out",
  });

  let reverted = false;
  return () => {
    if (reverted) return; // idempotent: safe under React Strict Mode's double cleanup
    reverted = true;
    tween.kill();
    split.revert();
  };
}`,
    hints: [
      {
        vi: "gsap.set trước rồi gsap.to sau — set đặt trạng thái ẩn ngay lập tức không animation, to mới animate về đích.",
        en: "gsap.set first, then gsap.to — set applies the hidden state instantly with no animation, to then animates toward the target.",
      },
      {
        vi: "Cleanup an toàn khi gọi 2 lần: dùng một biến boolean cờ, return sớm nếu đã revert rồi.",
        en: "A cleanup safe against double-calls: use a boolean flag, return early if it already reverted.",
      },
    ],
    checklist: [
      {
        vi: "split.chars nhận đúng yPercent 100→0 và opacity 0→1",
        en: "split.chars correctly animates yPercent 100→0 and opacity 0→1",
      },
      {
        vi: "Gọi cleanup() hai lần liên tiếp không throw lỗi và không revert hai lần",
        en: "Calling cleanup() twice in a row doesn't throw and doesn't revert twice",
      },
      {
        vi: "cleanup() gọi cả tween.kill() lẫn split.revert(), không chỉ một trong hai",
        en: "cleanup() calls both tween.kill() and split.revert(), not just one of the two",
      },
    ],
  },
];
