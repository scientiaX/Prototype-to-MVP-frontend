import * as React from "react";
import { cn } from "@/lib/utils";

const Tabs = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("w-full", className)} {...props} />
));
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-11 items-center justify-center border border-[rgba(91,220,255,0.28)] bg-[rgba(15,20,38,0.7)] p-1.5 text-[var(--ink-2)] rounded-[var(--radius-1)] shadow-[0_10px_24px_rgba(7,10,22,0.55)]",
      className
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap px-3.5 py-2 text-sm font-semibold border border-transparent rounded-[var(--radius-1)] transition-colors duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 hover:text-[var(--ink)] hover:border-[rgba(91,220,255,0.3)] data-[state=active]:text-[var(--ink)] data-[state=active]:bg-[rgba(91,220,255,0.18)] data-[state=active]:border-[rgba(123,107,255,0.6)]",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mt-2 focus-visible:outline-none",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
