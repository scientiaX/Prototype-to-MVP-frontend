import * as React from "react";
import { cn } from "@/lib/utils";

const Button = React.forwardRef(({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}, ref) => {

  const baseStyles = "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]";

  const variants = {
    default: "bg-[var(--primary-500)] text-black hover:bg-[var(--primary-600)] focus-visible:ring-[var(--primary-500)]",
    gradient: "text-black hover:shadow-[var(--glow-primary)] hover:-translate-y-0.5",
    outline: "border border-[var(--gray-700)] bg-transparent text-[var(--gray-200)] hover:bg-[var(--gray-800)] hover:border-[var(--gray-600)]",
    ghost: "text-[var(--gray-300)] hover:bg-[var(--gray-800)] hover:text-white",
    destructive: "bg-[var(--danger-500)] text-white hover:bg-[var(--danger-600)] hover:shadow-[0_0_30px_rgba(244,63,94,0.4)]",
    secondary: "bg-[var(--gray-800)] text-[var(--gray-200)] border border-[var(--gray-700)] hover:bg-[var(--gray-700)]"
  };

  const sizes = {
    default: "h-10 px-5 text-sm rounded-lg",
    sm: "h-9 px-4 text-xs rounded-lg",
    lg: "h-12 px-6 text-base rounded-xl",
    xl: "h-14 px-8 text-lg rounded-xl",
    icon: "h-10 w-10 rounded-lg"
  };

  const gradientStyle = variant === "gradient"
    ? { background: 'var(--gradient-fire)' }
    : {};

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      style={gradientStyle}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export { Button };
