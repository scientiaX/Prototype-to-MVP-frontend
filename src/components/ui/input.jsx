import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full nx-sharp border border-[rgba(91,220,255,0.25)] bg-[rgba(15,20,38,0.7)] px-4 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-3)] shadow-[0_10px_24px_rgba(7,10,22,0.55)] focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[rgba(123,107,255,0.6)] focus-visible:bg-[rgba(20,26,46,0.85)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };
