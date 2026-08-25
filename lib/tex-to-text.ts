// Plain-text rendering of inline TeX for places that cannot host KaTeX
// (mind-map node labels, generated pitfall text). Shared by
// scripts/gen-lesson-registry.ts and lib/mind-map.ts so the two never drift.

const SYMBOLS: Record<string, string> = {
  theta: "θ",
  omega: "ω",
  phi: "φ",
  varphi: "φ",
  pi: "π",
  alpha: "α",
  beta: "β",
  gamma: "γ",
  lambda: "λ",
  psi: "ψ",
  epsilon: "ε",
  varepsilon: "ε",
  delta: "δ",
  Delta: "Δ",
  sigma: "σ",
  mu: "μ",
  tau: "τ",
  rho: "ρ",
  eta: "η",
  nabla: "∇",
  partial: "∂",
  infty: "∞",
  cdot: " · ",
  times: " × ",
  to: " → ",
  rightarrow: " → ",
  le: " ≤ ",
  ge: " ≥ ",
  ne: " ≠ ",
  approx: " ≈ ",
  pm: " ± ",
  sqrt: "√",
};

// Wrappers whose command adds nothing in plain text; their argument survives
// via brace stripping.
const DROP = new Set([
  "text",
  "mathrm",
  "mathbf",
  "mathit",
  "operatorname",
  "vec",
  "hat",
  "left",
  "right",
]);

export function texToText(tex: string): string {
  return tex
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "$1/$2")
    .replace(/\\\|/g, "|")
    .replace(/\\([a-zA-Z]+)/g, (_, cmd: string) => {
      const symbol = SYMBOLS[cmd];
      if (symbol !== undefined) return symbol;
      if (DROP.has(cmd)) return "";
      return `${cmd} `;
    })
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Replaces every inline `$...$` span in prose with its plain-text form. */
export function stripInlineMath(text: string): string {
  return text.replace(/\$([^$]*)\$/g, (_, inner: string) => texToText(inner));
}
