import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // False positive: looking up a module-scope Map of lazy() wrappers is not
    // "creating a component during render" — the wrappers are built once at
    // module load. Scoped to the one demo-host file.
    files: ["components/lesson/lesson-demo-host.tsx"],
    rules: {
      "react-hooks/static-components": "off",
    },
  },
  {
    // Three.js/R3F idiom: uniforms are memoized mutable containers written to
    // from effects/useFrame. The compiler-era immutability rule can't model
    // this; scoped off for demo/viz code only.
    files: ["content/lessons/**/demo.tsx", "components/viz/**"],
    rules: {
      "react-hooks/immutability": "off",
      // Teaching demos count renders via refs on purpose (the technique IS
      // the lesson content); the compiler-era rule can't know that.
      "react-hooks/refs": "off",
    },
  },
]);

export default eslintConfig;
