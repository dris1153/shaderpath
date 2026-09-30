import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import { resolveCue, type Timing } from "./timing";

export const TimingContext = createContext<Timing | null>(null);
export const SceneContext = createContext<{ id: string; from: number } | null>(null);

export function useTiming(): Timing {
  const timing = useContext(TimingContext);
  if (!timing) throw new Error("useTiming outside a lesson video");
  return timing;
}

export function useScene(): { id: string; from: number } {
  const scene = useContext(SceneContext);
  if (!scene) throw new Error("useScene outside a scene");
  return scene;
}

// The only clock a scene may read: frames since the narration reached the
// {name} marker in this scene (negative before it).
export function useCue(name: string): number {
  return resolveCue(useTiming(), useScene(), name, useCurrentFrame());
}
