"use client";

import { Suspense, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { IconRefresh } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  defaultsOf,
  type ControlDef,
  type ControlValues,
} from "./control-schema";
import { DemoContextProvider } from "./demo-context";
import { DemoControls } from "./demo-controls";
import { DemoErrorBoundary } from "./demo-error-boundary";

// Spec §6.1.4 + §7: every interactive demo lives in a Card with a fixed
// AspectRatio, a Skeleton while loading, and a shadcn control panel.
export function Demo({
  title,
  controls = [],
  ratio = 16 / 9,
  children,
}: {
  title: string;
  controls?: ControlDef[];
  ratio?: number;
  children: ReactNode;
}) {
  const t = useTranslations("demo");
  const containerRef = useRef<HTMLDivElement>(null);
  const defaults = useMemo(() => defaultsOf(controls), [controls]);
  const [values, setValues] = useState<ControlValues>(defaults);

  const ctx = useMemo(() => ({ values, containerRef }), [values]);

  return (
    <Card className="mt-8 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {controls.length > 0 && (
          <CardAction>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("reset")}
              onClick={() => setValues(defaults)}
            >
              <IconRefresh />
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          data-demo-container
          className="bg-muted/30 overflow-hidden rounded-lg border"
        >
          <AspectRatio ratio={ratio}>
            <DemoErrorBoundary>
              <Suspense fallback={<Skeleton className="size-full" />}>
                <DemoContextProvider value={ctx}>
                  {children}
                </DemoContextProvider>
              </Suspense>
            </DemoErrorBoundary>
          </AspectRatio>
        </div>
        <DemoControls
          controls={controls}
          values={values}
          onChange={(key, v) => setValues((prev) => ({ ...prev, [key]: v }))}
        />
      </CardContent>
    </Card>
  );
}
