"use client";

import { useCallback } from "react";
import type { ShaderMaterial } from "three";

/**
 * Hands a uniforms object to a ShaderMaterial *by reference*.
 *
 * R3F does not keep the object passed as the `uniforms` prop. Its applyProps
 * copies each entry into the material's own map — `uniforms[name] = {...uniform}`
 * — so a component that mutates its own object in useFrame is writing somewhere
 * the shader never reads, and the frame silently freezes. Assigning through a
 * ref defeats the copy and leaves every existing mutation working unchanged.
 *
 * Use INSTEAD of the `uniforms` prop, never alongside it: the prop would copy
 * on every applyProps pass and overwrite this.
 */
export function useSharedUniforms(uniforms: ShaderMaterial["uniforms"]) {
  return useCallback(
    (material: ShaderMaterial | null) => {
      if (material) material.uniforms = uniforms;
    },
    [uniforms],
  );
}
