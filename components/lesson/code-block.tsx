"use client";

import { useRef, useState, type ComponentProps } from "react";
import { useTranslations } from "next-intl";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The frame lives on the wrapper, not on <pre>: the copy button has to sit
// outside the scrolling element or it slides away with the code.
export function CodeBlock({
  className,
  language,
  children,
  ...props
}: ComponentProps<"pre"> & { language?: string }) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const t = useTranslations("lesson");

  const copy = () => {
    void navigator.clipboard
      .writeText(preRef.current?.textContent ?? "")
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  return (
    <div className="group bg-muted relative mt-4 rounded-lg border overflow-hidden">
      {/* Opaque so a long first line scrolls under it cleanly. Hidden from
          assistive tech: the language is decoration, the code is the content. */}
      <div className="absolute top-1.5 right-1.5 flex items-center gap-1.5">
        {language && (
          <span
            aria-hidden
            // bg-background, not bg-muted: muted-foreground on the muted code
            // surface lands at 4.34:1, just under AA for this size.
            className="bg-background text-muted-foreground rounded px-1.5 py-0.5 font-mono text-xs"
          >
            {language}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          aria-label={copied ? t("copiedCode") : t("copyCode")}
          onClick={copy}
          className="bg-background size-7 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
        >
          {copied ? <IconCheck className="text-primary" /> : <IconCopy />}
        </Button>
      </div>
      <pre
        ref={preRef}
        {...props}
        className={cn("code-scroll p-4 text-sm leading-6", className)}
      >
        {children}
      </pre>
    </div>
  );
}
