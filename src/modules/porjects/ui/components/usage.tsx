import { Button } from "@/components/ui/button";
import { formatDuration, intervalToDuration } from "date-fns";
import { CrownIcon } from "lucide-react";
import Link from "next/link";

interface Props {
  point: number;
  msBeforeNext: number;
}

export const Usage = ({ point, msBeforeNext }: Props) => {
  return (
    <div className=" rounded-t-xl bg-background border border-b-0 p-2.5">
      <div className="flex items-center gap-x-2">
        <div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">Points:</span> {point} free credits
            remaining
          </p>
          <p className="text-xs text-muted-foreground">
            Reset in{" "}
            {formatDuration(
              intervalToDuration({
                start: new Date(),
                end: new Date(Date.now() + msBeforeNext),
              }),
              { format: ["hours", "minutes", "seconds"] }
            )}
          </p>
        </div>
        <Button asChild size="sm" variant="default" className="ml-auto">
          <Link href="/pricing" className="text-sm">
            <CrownIcon /> Upgrade
          </Link>
        </Button>
      </div>
    </div>
  );
};
