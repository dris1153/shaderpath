import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Raw shader imports (decision D1)
  turbopack: {
    rules: {
      "*.glsl": { loaders: ["raw-loader"], as: "*.js" },
      "*.vert": { loaders: ["raw-loader"], as: "*.js" },
      "*.frag": { loaders: ["raw-loader"], as: "*.js" },
    },
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vert|frag)$/,
      type: "asset/source",
    });
    return config;
  },
};

// Plugins in string form — required so Turbopack can serialize the MDX config (D2)
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [["remark-gfm"], ["remark-math"]],
    rehypePlugins: [
      ["rehype-katex"],
      ["rehype-slug"],
      [
        "@shikijs/rehype",
        // high-contrast variants: plain github-light/dark fail WCAG AA color-contrast
        // on several token colors (axe color-contrast, serious) — a11y sweep, phase 10.
        {
          themes: {
            light: "github-light-high-contrast",
            dark: "github-dark-high-contrast",
          },
          // Shiki drops the original language-* class; the code block reads it
          // back off the <code> element to label itself. A boolean stays
          // serializable, unlike a transformer function (D2).
          addLanguageClass: true,
        },
      ],
    ],
  },
});

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(withMDX(nextConfig));
