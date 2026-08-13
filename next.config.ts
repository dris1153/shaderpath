import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Native module — must stay out of bundles (spec §8.7, decision D8)
  serverExternalPackages: ["better-sqlite3"],
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
        { themes: { light: "github-light", dark: "github-dark" } },
      ],
    ],
  },
});

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(withMDX(nextConfig));
