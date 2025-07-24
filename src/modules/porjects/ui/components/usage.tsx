import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { formatDuration, intervalToDuration } from "date-fns";
import { CrownIcon } from "lucide-react";
import Link from "next/link";

interface Props {
  point: number;
  msBeforeNext: number;
}

export const Usage = ({ point, msBeforeNext }: Props) => {
  const { has } = useAuth();
  const hasProAccess = has?.({ plan: "pro" });

  return (
    <div className=" rounded-t-xl bg-background border border-b-0 p-2.5">
      <div className="flex items-center gap-x-2">
        <div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">Points:</span> {point}{" "}
            {hasProAccess ? "" : "free"} credits remaining
          </p>
          {!hasProAccess && (
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
          )}
        </div>
        {!hasProAccess && (
          <Button asChild size="sm" variant="default" className="ml-auto">
            <Link href="/pricing" className="text-sm">
              <CrownIcon /> Upgrade
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};
