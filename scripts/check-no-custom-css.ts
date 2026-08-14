import fs from "node:fs";
import path from "node:path";

// §7/§11.7 gate: the only authored CSS file in this repo is app/globals.css.
// Vendored node_modules stylesheets (e.g. katex/dist/katex.min.css, D7) are
// exempt — only relative imports that resolve to something other than
// globals.css are violations.

const ROOT = process.cwd();
const SCAN_DIRS = ["app", "components", "lib", "content"];
const GLOBALS_CSS = path.resolve(ROOT, "app", "globals.css");

// Bare `import "x.css"` or `import Foo (as Bar)? from "x.css"` — the only
// shapes CSS imports take in this codebase (ESM only, no require()).
const CSS_IMPORT_RE = /import\s+(?:[^'"]+?\s+from\s+)?["']([^"']+\.css)["']/g;

function walk(dir: string, onFile: (file: string) => void) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, onFile);
    else if (entry.isFile()) onFile(full);
  }
}

const errors: string[] = [];

for (const dir of SCAN_DIRS) {
  walk(path.join(ROOT, dir), (file) => {
    if (file.endsWith(".css")) {
      if (path.resolve(file) !== GLOBALS_CSS) {
        errors.push(`custom CSS file: ${path.relative(ROOT, file)}`);
      }
      return;
    }
    if (!/\.tsx?$/.test(file)) return;

    const src = fs.readFileSync(file, "utf8");
    CSS_IMPORT_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = CSS_IMPORT_RE.exec(src))) {
      const specifier = m[1]!;
      if (!specifier.startsWith(".")) continue; // bare/package import — vendored, exempt (D7)
      const resolved = path.resolve(path.dirname(file), specifier);
      if (resolved !== GLOBALS_CSS) {
        errors.push(
          `${path.relative(ROOT, file)}: imports "${specifier}" (not app/globals.css)`,
        );
      }
    }
  });
}

if (errors.length > 0) {
  console.error("check:css failed — custom CSS constraint violated (spec §7/§11.7):\n");
  for (const e of errors) console.error(`  - ${e}`);
  console.error(`\n${errors.length} violation(s).`);
  process.exit(1);
}

console.log("check:css: OK — no CSS besides app/globals.css (vendored imports exempt)");
