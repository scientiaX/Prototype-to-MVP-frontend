import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = {
  variant: {
    default:
      "bg-[rgba(91,220,255,0.08)] text-[var(--ink)] border border-[rgba(91,220,255,0.35)] hover:bg-[rgba(91,220,255,0.14)] hover:border-[rgba(123,107,255,0.45)]",
    gradient:
      "bg-[linear-gradient(135deg,var(--spatial-violet),var(--spatial-cyan))] text-[#05070f] border border-[rgba(6,9,18,0.8)] hover:brightness-110",
    outline:
      "bg-transparent text-[var(--ink)] border border-[rgba(123,107,255,0.3)] hover:bg-[rgba(123,107,255,0.14)] hover:border-[rgba(91,220,255,0.5)]",
    ghost:
      "bg-transparent text-[var(--ink-2)] border border-transparent hover:border-[rgba(91,220,255,0.35)] hover:text-[var(--ink)] hover:bg-[rgba(91,220,255,0.12)]",
    danger:
      "bg-[linear-gradient(135deg,var(--spatial-rose),var(--acid-orange))] text-[#05070f] border border-[rgba(6,9,18,0.8)] hover:brightness-110",
    success:
      "bg-[linear-gradient(135deg,var(--acid-lime),var(--spatial-cyan))] text-[#05070f] border border-[rgba(6,9,18,0.8)] hover:brightness-110"
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
        "inline-flex items-center justify-center font-semibold select-none rounded-[var(--radius-1)] shadow-[0_12px_28px_rgba(7,10,22,0.5)] transition-all duration-150 focus-visible:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-50",
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
