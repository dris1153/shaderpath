"use client";

import { Component, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DemoErrorFallback() {
  const t = useTranslations("demo");
  return (
    <div className="flex size-full items-center justify-center p-4">
      <Alert variant="destructive">
        <AlertTitle>{t("errorTitle")}</AlertTitle>
        <AlertDescription>{t("errorDescription")}</AlertDescription>
      </Alert>
    </div>
  );
}

// WebGL init failures and scene render errors land here — never a blank Card (§7)
export class DemoErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return <DemoErrorFallback />;
    return this.props.children;
  }
}
