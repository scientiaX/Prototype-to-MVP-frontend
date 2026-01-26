import * as React from "react";
import { cn } from "@/lib/utils";
import { IconLoader } from "@/components/ui/raw-icons";

const buttonVariants = {
  variant: {
    default:
      "bg-[var(--paper)] text-[var(--ink)] border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] hover:translate-x-[-2px] hover:translate-y-[-2px]",
    gradient:
      "bg-[var(--acid-orange)] text-[var(--ink)] border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] hover:translate-x-[-3px] hover:translate-y-[-3px]",
    outline:
      "bg-transparent text-[var(--ink)] border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] hover:bg-[var(--paper)] hover:translate-x-[-2px] hover:translate-y-[-2px]",
    ghost:
      "bg-transparent text-[var(--ink)] border border-transparent hover:border-[var(--ink)] hover:bg-[var(--paper)] hover:translate-x-[-1px] hover:translate-y-[-1px]",
    danger:
      "bg-[var(--acid-magenta)] text-[var(--ink)] border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] hover:translate-x-[-3px] hover:translate-y-[-3px]",
    success:
      "bg-[var(--acid-lime)] text-[var(--ink)] border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] hover:translate-x-[-3px] hover:translate-y-[-3px]"
  },
  size: {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-10 px-4 text-sm gap-2",
    lg: "h-12 px-6 text-base gap-2",
    xl: "h-14 px-8 text-lg gap-2.5",
    icon: "h-10 w-10"
  }
};

const Button = React.forwardRef(({
  className,
  variant = "default",
  size = "md",
  isLoading = false,
  disabled,
  children,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center font-medium select-none transition-all duration-100 [transition-timing-function:steps(4,end)] focus-visible:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-50",
        buttonVariants.variant[variant],
        buttonVariants.size[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <IconLoader className="w-4 h-4 animate-spin" />
          <span className="ml-2">Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };
