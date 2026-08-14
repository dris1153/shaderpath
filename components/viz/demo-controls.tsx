"use client";

import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ControlDef, ControlValues } from "./control-schema";

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

function ControlRow({
  control,
  value,
  onChange,
}: {
  control: ControlDef;
  value: ControlValues[string];
  onChange: (v: ControlValues[string]) => void;
}) {
  const id = `demo-control-${control.key}`;
  // Slider's real interactive element is an internal native <input>; its
  // accessible name comes from aria-labelledby forwarded through Root's
  // context, NOT from a plain htmlFor/id pair (id lands on the wrapper div).
  const labelId = `${id}-label`;

  switch (control.kind) {
    case "number":
      return (
        <div className="flex items-center gap-3">
          <label id={labelId} className="w-28 shrink-0 text-sm">
            {control.label}
          </label>
          <Slider
            id={id}
            aria-labelledby={labelId}
            min={control.min}
            max={control.max}
            step={control.step}
            // Array form (not a bare number): components/ui/slider.tsx derives its
            // thumb count from `value`'s shape, and a scalar falls back to
            // [min, max] — silently rendering 2 overlapping thumbs (found via the
            // a11y sweep's keyboard-nav test: `getByRole("slider")` matched 2 nodes).
            value={[typeof value === "number" ? value : control.defaultValue]}
            onValueChange={(v) => {
              const n = Array.isArray(v) ? v[0] : v;
              if (typeof n === "number") {
                onChange(clamp(n, control.min, control.max));
              }
            }}
            className="flex-1"
          />
          <span className="text-muted-foreground w-12 shrink-0 text-right text-xs tabular-nums">
            {typeof value === "number" ? value.toFixed(2) : value}
          </span>
        </div>
      );
    case "boolean":
      return (
        <div className="flex items-center gap-3">
          <label id={labelId} className="w-28 shrink-0 text-sm">
            {control.label}
          </label>
          <Switch
            id={id}
            aria-labelledby={labelId}
            checked={typeof value === "boolean" ? value : control.defaultValue}
            onCheckedChange={(checked) => onChange(checked)}
          />
        </div>
      );
    case "select":
      return (
        <div className="flex items-center gap-3">
          <label htmlFor={id} className="w-28 shrink-0 text-sm">
            {control.label}
          </label>
          <Select
            value={typeof value === "string" ? value : control.defaultValue}
            onValueChange={(v) => {
              if (typeof v === "string") onChange(v);
            }}
          >
            <SelectTrigger id={id} size="sm" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {control.options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
  }
}

export function DemoControls({
  controls,
  values,
  onChange,
}: {
  controls: ControlDef[];
  values: ControlValues;
  onChange: (key: string, v: ControlValues[string]) => void;
}) {
  if (controls.length === 0) return null;
  return (
    <div className="mt-4 flex flex-col gap-3">
      {controls.map((c) => (
        <ControlRow
          key={c.key}
          control={c}
          value={values[c.key] ?? c.defaultValue}
          onChange={(v) => onChange(c.key, v)}
        />
      ))}
    </div>
  );
}
