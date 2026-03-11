import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title = "Nothing here yet",
  description,
  action,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border bg-card p-8 text-center", className)}>
      <h2 className="text-lg font-medium">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
