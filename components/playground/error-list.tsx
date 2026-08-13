"use client";

import { useTranslations } from "next-intl";
import { IconCircleCheck } from "@tabler/icons-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type { GlslError } from "@/lib/glsl/parse-error";

export function ErrorList({
  errors,
  compileMs,
  onJump,
}: {
  errors: GlslError[];
  compileMs: number | null;
  onJump: (line: number) => void;
}) {
  const t = useTranslations("playground");

  if (compileMs === null) return null;

  if (errors.length === 0) {
    return (
      <Badge variant="secondary" className="w-fit" data-testid="compile-ok">
        <IconCircleCheck data-icon="inline-start" />
        {t("compiledIn", { ms: compileMs })}
      </Badge>
    );
  }

  return (
    <Alert variant="destructive" data-testid="compile-errors">
      <AlertTitle>{t("errorsTitle", { count: errors.length })}</AlertTitle>
      <ul className="mt-2 space-y-1 text-sm">
        {errors.map((e, i) => (
          <li key={`${e.line}-${i}`}>
            <button
              type="button"
              className="text-left hover:underline"
              onClick={() => onJump(e.line)}
            >
              <span className="font-mono font-medium tabular-nums">
                {t("line", { line: e.line })}
              </span>
              : {e.message}
            </button>
          </li>
        ))}
      </ul>
    </Alert>
  );
}
