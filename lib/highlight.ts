import { codeToHtml } from "shiki";

// Server-side highlight for solution code — same dual themes as the MDX chain.
export async function highlightCode(
  code: string,
  lang: "glsl" | "ts" | "js",
): Promise<string> {
  try {
    return await codeToHtml(code, {
      lang,
      themes: { light: "github-light", dark: "github-dark" },
    });
  } catch {
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `<pre class="shiki"><code>${escaped}</code></pre>`;
  }
}
