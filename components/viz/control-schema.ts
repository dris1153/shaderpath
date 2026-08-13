// Typed control descriptors → shadcn widgets (spec §6.1.4).
// Values are clamped to the declared ranges before reaching uniforms.

export type ControlDef =
  | {
      kind: "number";
      key: string;
      label: string;
      min: number;
      max: number;
      step: number;
      defaultValue: number;
    }
  | { kind: "boolean"; key: string; label: string; defaultValue: boolean }
  | {
      kind: "select";
      key: string;
      label: string;
      options: { value: string; label: string }[];
      defaultValue: string;
    };

export type ControlValue = number | boolean | string;
export type ControlValues = Record<string, ControlValue>;

export function defaultsOf(controls: ControlDef[]): ControlValues {
  return Object.fromEntries(controls.map((c) => [c.key, c.defaultValue]));
}

export function numberOf(values: ControlValues, key: string, fallback = 0) {
  const v = values[key];
  return typeof v === "number" ? v : fallback;
}

export function booleanOf(values: ControlValues, key: string, fallback = false) {
  const v = values[key];
  return typeof v === "boolean" ? v : fallback;
}

export function stringOf(values: ControlValues, key: string, fallback = "") {
  const v = values[key];
  return typeof v === "string" ? v : fallback;
}
