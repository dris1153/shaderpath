import { cn } from "@/lib/utils";

type Props = {
  /** 0–100. */
  value: number;
  size?: number;
  stroke?: number;
  /** Accessible text; without it the ring is decorative. */
  label?: string;
  className?: string;
  children?: React.ReactNode;
};

/** Circular progress with optional centred content (a number, an icon). */
export function ProgressRing({ value, size = 48, stroke = 6, label, className, children }: Props) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("relative inline-grid shrink-0 place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-border" />
        {clamped > 0 ? (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference.toFixed(2)}
            strokeDashoffset={(circumference * (1 - clamped / 100)).toFixed(2)}
            className="stroke-primary"
          />
        ) : null}
      </svg>
      {children ? <span className="absolute inset-0 grid place-items-center text-xs font-extrabold">{children}</span> : null}
    </span>
  );
}
