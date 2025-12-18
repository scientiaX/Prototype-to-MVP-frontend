import * as React from "react";
import { cn } from "@/lib/utils";

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const variants = {
    default: "bg-orange-500 text-black hover:bg-orange-600 hover:shadow-[0_0_20px_rgba(255,107,53,0.5)] font-semibold",
    gradient: "text-black font-semibold shadow-lg hover:shadow-[0_0_25px_rgba(255,107,53,0.6)] hover:scale-105 transition-all duration-300",
    "gradient-secondary": "text-white font-semibold shadow-lg hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] hover:scale-105 transition-all duration-300",
    "gradient-accent": "text-white font-semibold shadow-lg hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:scale-105 transition-all duration-300",
    outline: "border-2 border-zinc-700 bg-transparent hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-200",
    glass: "border border-white/10 text-white font-medium hover:bg-white/10 hover:border-white/20 transition-all duration-200",
    ghost: "hover:bg-zinc-800 transition-colors",
    destructive: "bg-red-500 text-white hover:bg-red-600 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]"
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3 text-xs",
    lg: "h-12 px-8 text-base",
    xl: "h-14 px-10 text-lg",
    icon: "h-10 w-10"
  };

  // Apply gradient background for gradient variants
  const gradientStyle = variant === "gradient"
    ? { background: 'var(--gradient-primary)' }
    : variant === "gradient-secondary"
      ? { background: 'var(--gradient-secondary)' }
      : variant === "gradient-accent"
        ? { background: 'var(--gradient-accent)' }
        : {};

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50 active:scale-95",
        variants[variant],
        sizes[size],
        className
      )}
      style={gradientStyle}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button };
