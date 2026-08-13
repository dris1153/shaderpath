import {
  IconAlertTriangle,
  IconBulb,
  IconInfoCircle,
} from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type CalloutVariant = "info" | "tip" | "mistake";

const ICONS: Record<CalloutVariant, typeof IconInfoCircle> = {
  info: IconInfoCircle,
  tip: IconBulb,
  mistake: IconAlertTriangle,
};

// `mistake` hosts the mandatory "Lỗi hay gặp" / "Common mistakes" block (spec §10).
export function Callout({
  variant = "info",
  title,
  children,
}: {
  variant?: CalloutVariant;
  title: string;
  children: React.ReactNode;
}) {
  const Icon = ICONS[variant];
  return (
    <Alert className="mt-6" variant={variant === "mistake" ? "destructive" : "default"}>
      <Icon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
