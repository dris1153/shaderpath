import { describe, expect, it } from "vitest";
import { activeNavKey } from "@/components/shell/nav-items";

describe("activeNavKey", () => {
  it("maps every route family to its tab", () => {
    expect(activeNavKey("/roadmap")).toBe("learn");
    expect(activeNavKey("/track/math")).toBe("learn");
    expect(activeNavKey("/lesson/vector-basics")).toBe("learn");
    expect(activeNavKey("/review")).toBe("review");
    expect(activeNavKey("/playground")).toBe("playground");
    expect(activeNavKey("/notes")).toBe("you");
    expect(activeNavKey("/settings")).toBe("you");
    expect(activeNavKey("/stats")).toBe("you");
  });

  it("leaves home and look-alike prefixes unmatched", () => {
    expect(activeNavKey("/")).toBeUndefined();
    expect(activeNavKey("/login")).toBeUndefined();
    expect(activeNavKey("/reviewer")).toBeUndefined();
  });
});
