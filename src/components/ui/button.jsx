import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = {
  variant: {
    default: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700",
    gradient: "bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-black font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98]",
    outline: "border border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800/50 hover:border-zinc-600 hover:text-white",
    ghost: "bg-transparent text-zinc-400 hover:bg-zinc-800/50 hover:text-white",
    danger: "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25",
    success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25",
    glass: "bg-zinc-900/50 backdrop-blur-sm text-zinc-300 border border-zinc-800/80 hover:bg-zinc-800/60 hover:border-zinc-700"
  },
  size: {
    sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
    md: "h-10 px-4 text-sm rounded-xl gap-2",
    lg: "h-12 px-6 text-base rounded-xl gap-2",
    xl: "h-14 px-8 text-lg rounded-2xl gap-2.5",
    icon: "h-10 w-10 rounded-xl"
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
        "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50",
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
