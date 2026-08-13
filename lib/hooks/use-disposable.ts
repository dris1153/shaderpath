"use client";

import { useEffect, useState } from "react";

// Mandatory leak guard (spec §8.2): every demo registers GPU objects and
// cleanup callbacks here; unmount disposes everything in reverse order.
// Prefer creating disposables inside effects — under React Strict Mode the
// simulated unmount disposes, and memoized objects would be reused dead.

export interface Disposable {
  dispose: () => void;
}

export function createDisposableRegistry() {
  const objects: Disposable[] = [];
  const fns: (() => void)[] = [];

  return {
    /** Register a Three.js-style disposable; returns it for inline use. */
    register<T extends Disposable>(obj: T): T {
      objects.push(obj);
      return obj;
    },
    /** Register arbitrary cleanup (listeners, RAF cancels, loseContext). */
    registerFn(fn: () => void) {
      fns.push(fn);
    },
    /** Callbacks first (stop loops/listeners), then GPU objects — both LIFO. */
    disposeAll() {
      for (const fn of fns.splice(0).reverse()) {
        try {
          fn();
        } catch {
          // one failing cleanup must not stop the rest
        }
      }
      for (const obj of objects.splice(0).reverse()) {
        try {
          obj.dispose();
        } catch {
          // ignore
        }
      }
    },
    get size() {
      return objects.length + fns.length;
    },
  };
}

export type DisposableRegistry = ReturnType<typeof createDisposableRegistry>;

export function useDisposable(): DisposableRegistry {
  const [registry] = useState(createDisposableRegistry);

  useEffect(() => {
    return () => registry.disposeAll();
  }, [registry]);

  return registry;
}
