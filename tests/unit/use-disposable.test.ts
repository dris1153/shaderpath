import { describe, expect, it, vi } from "vitest";
import { createDisposableRegistry } from "@/lib/hooks/use-disposable";

describe("disposable registry", () => {
  it("disposes callbacks before objects, both in LIFO order", () => {
    const order: string[] = [];
    const reg = createDisposableRegistry();

    reg.register({ dispose: () => order.push("obj-1") });
    reg.register({ dispose: () => order.push("obj-2") });
    reg.registerFn(() => order.push("fn-1"));
    reg.registerFn(() => order.push("fn-2"));

    reg.disposeAll();
    expect(order).toEqual(["fn-2", "fn-1", "obj-2", "obj-1"]);
  });

  it("returns the registered object for inline use", () => {
    const reg = createDisposableRegistry();
    const obj = { dispose: vi.fn() };
    expect(reg.register(obj)).toBe(obj);
  });

  it("isolates failures so one bad dispose cannot leak the rest", () => {
    const reg = createDisposableRegistry();
    const good = vi.fn();
    reg.register({
      dispose: () => {
        throw new Error("boom");
      },
    });
    reg.register({ dispose: good });
    reg.registerFn(() => {
      throw new Error("boom fn");
    });

    expect(() => reg.disposeAll()).not.toThrow();
    expect(good).toHaveBeenCalledOnce();
  });

  it("empties the registry after disposal (idempotent)", () => {
    const reg = createDisposableRegistry();
    const spy = vi.fn();
    reg.register({ dispose: spy });
    reg.disposeAll();
    reg.disposeAll();
    expect(spy).toHaveBeenCalledOnce();
    expect(reg.size).toBe(0);
  });
});
