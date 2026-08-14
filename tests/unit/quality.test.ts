import { describe, expect, it } from "vitest";
import {
  averageFrameDelta,
  classifyDeviceMemory,
  classifyFrameTime,
  classifyRenderer,
  combineTiers,
  DEFAULT_TIER,
} from "@/lib/quality";

describe("quality tier pure helpers", () => {
  it("classifies GPU renderer strings", () => {
    expect(classifyRenderer("ANGLE (NVIDIA, NVIDIA GeForce RTX 3080 Direct3D11 vs_5_0)")).toBe(
      "high",
    );
    expect(classifyRenderer("ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0)")).toBe(
      "medium",
    );
    expect(classifyRenderer("Google SwiftShader")).toBe("low");
    expect(classifyRenderer(null)).toBeNull();
    expect(classifyRenderer("Some Unrecognized Renderer")).toBeNull();
  });

  it("classifies device memory in GB", () => {
    expect(classifyDeviceMemory(2)).toBe("low");
    expect(classifyDeviceMemory(4)).toBe("medium");
    expect(classifyDeviceMemory(8)).toBe("high");
    expect(classifyDeviceMemory(undefined)).toBeNull();
  });

  it("classifies average frame time against the 60fps budget", () => {
    expect(classifyFrameTime(10)).toBe("high");
    expect(classifyFrameTime(25)).toBe("medium");
    expect(classifyFrameTime(50)).toBe("low");
  });

  it("combines signals to the worst tier, defaulting when every signal is unknown", () => {
    expect(combineTiers(["high", "medium", null])).toBe("medium");
    expect(combineTiers(["high", "high"])).toBe("high");
    expect(combineTiers(["low", "high"])).toBe("low");
    expect(combineTiers([null, null])).toBe(DEFAULT_TIER);
  });

  it("averages the deltas between consecutive rAF timestamps", () => {
    expect(averageFrameDelta([0, 16, 32, 48])).toBe(16);
    expect(averageFrameDelta([0])).toBe(0);
    expect(averageFrameDelta([])).toBe(0);
  });
});
