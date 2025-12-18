import * as React from "react";
import { cn } from "@/lib/utils";

const Button = React.forwardRef(({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}, ref) => {

  const baseStyles = "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.98]";

  const variants = {
    default: "bg-orange-500 text-black hover:bg-orange-600 focus-visible:ring-orange-500",
    gradient: "bg-gradient-to-r from-orange-500 to-red-600 text-black hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:-translate-y-0.5",
    outline: "border border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800 hover:border-zinc-600",
    ghost: "text-zinc-300 hover:bg-zinc-800 hover:text-white",
    destructive: "bg-red-500 text-white hover:bg-red-600 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]",
    secondary: "bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700"
  };

  const sizes = {
    default: "h-10 px-5 text-sm rounded-lg",
    sm: "h-9 px-4 text-xs rounded-lg",
    lg: "h-12 px-6 text-base rounded-xl",
    xl: "h-14 px-8 text-lg rounded-xl",
    icon: "h-10 w-10 rounded-lg"
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export { Button };
