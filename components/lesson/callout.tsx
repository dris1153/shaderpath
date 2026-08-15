import {
  IconAlertTriangle,
  IconBulb,
  IconInfoCircle,
} from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type CalloutVariant = "info" | "tip" | "mistake";

const ICONS: Record<CalloutVariant, typeof IconInfoCircle> = {
  info: IconInfoCircle,
  tip: IconBulb,
  mistake: IconAlertTriangle,
};

// shadcn's destructive Alert paints its whole description in the destructive
// colour, which suits a one-line error but not the ~200-word pitfalls block every
// lesson ends with: when everything is red, red stops meaning anything. Keep the
// signal on the icon and title, hand the body back to the normal text colour, and
// let the bold mistake names carry the accent so they read as scan anchors.
const MISTAKE_BODY = [
  "px-4 py-3.5",
  "*:data-[slot=alert-description]:text-foreground",
  // Only the leading bold — the mistake's name — is an anchor. <strong> also
  // marks mid-sentence emphasis, and colouring that too puts two red spots in
  // one item, which is the crowding this restyle set out to remove.
  "[&_li>strong:first-child]:text-destructive",
  "[&_ol]:mt-3 [&_ol]:space-y-3 [&_li]:leading-7",
].join(" ");

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
  const isMistake = variant === "mistake";
  return (
    <Alert
      className={cn("mt-6", isMistake && MISTAKE_BODY)}
      variant={isMistake ? "destructive" : "default"}
    >
      <Icon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
