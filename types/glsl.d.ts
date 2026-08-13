// Raw shader imports (decision D1) — configured in next.config.ts.
declare module "*.glsl" {
  const src: string;
  export default src;
}

declare module "*.vert" {
  const src: string;
  export default src;
}

declare module "*.frag" {
  const src: string;
  export default src;
}
