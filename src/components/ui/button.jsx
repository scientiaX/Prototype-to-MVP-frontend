import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = {
  variant: {
    default:
      "bg-[rgba(231,234,240,0.04)] text-[var(--ink)] border border-[var(--acid-cyan)] hover:bg-[rgba(231,234,240,0.06)] hover:border-[rgba(231,234,240,0.28)]",
    gradient:
      "bg-[var(--acid-lime)] text-[#0b0b0c] border border-[rgba(11,11,12,0.78)] hover:bg-[#2fcf74]",
    outline:
      "bg-transparent text-[var(--ink)] border border-[rgba(231,234,240,0.18)] hover:bg-[rgba(231,234,240,0.04)] hover:border-[rgba(231,234,240,0.34)]",
    ghost:
      "bg-transparent text-[var(--ink-2)] border border-transparent hover:border-[rgba(231,234,240,0.18)] hover:text-[var(--ink)] hover:bg-[rgba(231,234,240,0.04)]",
    danger:
      "bg-[var(--acid-orange)] text-[#0b0b0c] border border-[rgba(11,11,12,0.78)] hover:bg-[#ff5c2b]",
    success:
      "bg-[var(--acid-lime)] text-[#0b0b0c] border border-[rgba(11,11,12,0.78)] hover:bg-[#2fcf74]"
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
        "inline-flex items-center justify-center font-medium select-none rounded-none transition-all duration-150 focus-visible:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-50",
        buttonVariants.variant[variant],
        buttonVariants.size[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
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
