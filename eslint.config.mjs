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
