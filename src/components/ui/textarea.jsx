import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full nx-sharp border border-[rgba(231,234,240,0.18)] bg-[rgba(231,234,240,0.02)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-3)] focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[rgba(174,182,194,0.9)] focus-visible:bg-[rgba(231,234,240,0.03)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };
