import * as React from "react";
import { cn } from "@/lib/utils";

function BaseIcon({
  className,
  children,
  viewBox = "0 0 24 24",
  title,
  ...props
}) {
  return (
    <svg
      className={cn("inline-block", className)}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : "presentation"}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export function IconLoader({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Loading" {...props}>
      <path
        d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="square"
      />
      <path
        d="M12 3.5v4"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="square"
      />
    </BaseIcon>
  );
}

export function IconArrowRight({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Arrow right" {...props}>
      <path d="M3 12h13" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
      <path d="M14 6l7 6-7 6" stroke="currentColor" strokeWidth="3" strokeLinejoin="miter" />
      <path d="M6 9h4" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
    </BaseIcon>
  );
}

export function IconArrowLeft({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Arrow left" {...props}>
      <path d="M21 12H8" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
      <path d="M10 6L3 12l7 6" stroke="currentColor" strokeWidth="3" strokeLinejoin="miter" />
      <path d="M18 9h-4" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
    </BaseIcon>
  );
}

export function IconChevronRight({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Chevron right" {...props}>
      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="3" strokeLinejoin="miter" />
      <path d="M9 12h2" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
    </BaseIcon>
  );
}

export function IconChevronLeft({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Chevron left" {...props}>
      <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="3" strokeLinejoin="miter" />
      <path d="M15 12h-2" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
    </BaseIcon>
  );
}

export function IconX({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Close" {...props}>
      <path d="M5 5l14 14" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
      <path d="M19 5L5 19" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
    </BaseIcon>
  );
}

export function IconMenu({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Menu" {...props}>
      <path d="M3 6h18" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
      <path d="M3 18h18" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
    </BaseIcon>
  );
}

export function IconHome({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Home" {...props}>
      <path d="M3 11l9-8 9 8" stroke="currentColor" strokeWidth="3" strokeLinejoin="miter" />
      <path d="M6 10v11h12V10" stroke="currentColor" strokeWidth="1" strokeLinejoin="miter" />
      <path d="M10 21v-6h4v6" stroke="currentColor" strokeWidth="3" strokeLinejoin="miter" />
    </BaseIcon>
  );
}

export function IconLogOut({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Log out" {...props}>
      <path d="M10 7V5H4v14h6v-2" stroke="currentColor" strokeWidth="3" strokeLinejoin="miter" />
      <path d="M13 12h8" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
      <path d="M17 8l4 4-4 4" stroke="currentColor" strokeWidth="1" strokeLinejoin="miter" />
    </BaseIcon>
  );
}

export function IconUser({ className, ...props }) {
  return (
    <BaseIcon className={className} title="User" {...props}>
      <path d="M12 12c2.6 0 4.5-2 4.5-4.5S14.6 3 12 3 7.5 5 7.5 7.5 9.4 12 12 12Z" stroke="currentColor" strokeWidth="3" />
      <path d="M4 21c1.6-4 5-6 8-6s6.4 2 8 6" stroke="currentColor" strokeWidth="1" />
      <path d="M9.5 8.5h5" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
    </BaseIcon>
  );
}

export function IconLock({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Lock" {...props}>
      <path d="M7 11V8a5 5 0 0 1 10 0v3" stroke="currentColor" strokeWidth="3" />
      <path d="M6 11h12v10H6V11Z" stroke="currentColor" strokeWidth="3" />
      <path d="M12 15v3" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
    </BaseIcon>
  );
}

export function IconMail({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Mail" {...props}>
      <path d="M3 7h18v12H3V7Z" stroke="currentColor" strokeWidth="3" />
      <path d="M3 8l9 7 9-7" stroke="currentColor" strokeWidth="1" />
      <path d="M6 17h4" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
    </BaseIcon>
  );
}

export function IconPlay({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Play" {...props}>
      <path d="M9 7l10 5-10 5V7Z" fill="currentColor" />
      <path d="M5 5h14v14H5V5Z" stroke="currentColor" strokeWidth="1" />
    </BaseIcon>
  );
}

export function IconSpark({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Spark" {...props}>
      <path d="M12 2l1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="miter" />
      <path d="M5 19l2-2" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
      <path d="M19 19l-2-2" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
    </BaseIcon>
  );
}

export function IconTrophy({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Trophy" {...props}>
      <path d="M7 4h10v4c0 4-2.5 6-5 6s-5-2-5-6V4Z" stroke="currentColor" strokeWidth="3" />
      <path d="M5 5H3v2c0 3 2 5 4 5" stroke="currentColor" strokeWidth="1" />
      <path d="M19 5h2v2c0 3-2 5-4 5" stroke="currentColor" strokeWidth="1" />
      <path d="M9 20h6" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
      <path d="M10 14v4" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
    </BaseIcon>
  );
}

export function IconZap({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Zap" {...props}>
      <path d="M13 2 4 14h7l-1 8 10-13h-7l0-7Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="miter" />
      <path d="M8 14h2" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
    </BaseIcon>
  );
}

export function IconTarget({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Target" {...props}>
      <path d="M12 3a9 9 0 1 0 9 9" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
      <path d="M12 7a5 5 0 1 0 5 5" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
      <path d="M12 12h6" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
    </BaseIcon>
  );
}

export function IconTrendingUp({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Trending up" {...props}>
      <path d="M3 16l6-6 4 4 8-8" stroke="currentColor" strokeWidth="3" strokeLinejoin="miter" />
      <path d="M16 6h5v5" stroke="currentColor" strokeWidth="1" strokeLinejoin="miter" />
      <path d="M3 21h18" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
    </BaseIcon>
  );
}

export function IconShield({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Shield" {...props}>
      <path
        d="M12 3l8 4v6c0 5.2-3.3 8.4-8 9-4.7-.6-8-3.8-8-9V7l8-4Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="miter"
      />
      <path d="M12 7v12" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
      <path d="M9 11h6" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
    </BaseIcon>
  );
}

export function IconUsers({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Users" {...props}>
      <path d="M8 12c2 0 3.5-1.6 3.5-3.5S10 5 8 5 4.5 6.6 4.5 8.5 6 12 8 12Z" stroke="currentColor" strokeWidth="3" />
      <path d="M16.5 11c1.7 0 3-1.3 3-3s-1.3-3-3-3" stroke="currentColor" strokeWidth="1" />
      <path d="M3 21c1.4-3.6 4.3-5 7-5s5.6 1.4 7 5" stroke="currentColor" strokeWidth="3" />
      <path d="M14.5 16c2.3.3 4.1 1.5 5.5 4.9" stroke="currentColor" strokeWidth="1" />
    </BaseIcon>
  );
}

export function IconClock({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Clock" {...props}>
      <path d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9Z" stroke="currentColor" strokeWidth="3" />
      <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1" strokeLinejoin="miter" />
      <path d="M12 5v1" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
    </BaseIcon>
  );
}

export function IconSwords({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Swords" {...props}>
      <path d="M4 20l7-7" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
      <path d="M6 22l-4-4" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
      <path d="M20 4l-7 7" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
      <path d="M22 6l-4-4" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
      <path d="M8 4l12 12" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
    </BaseIcon>
  );
}

export function IconMessage({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Message" {...props}>
      <path d="M4 5h16v11H8l-4 3V5Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="miter" />
      <path d="M7 9h10" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
      <path d="M7 12h6" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
    </BaseIcon>
  );
}

export function IconCalendar({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Calendar" {...props}>
      <path d="M4 6h16v15H4V6Z" stroke="currentColor" strokeWidth="3" />
      <path d="M7 3v4M17 3v4" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
      <path d="M4 10h16" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
      <path d="M7 13h3" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
    </BaseIcon>
  );
}

export function IconBars({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Bars" {...props}>
      <path d="M4 20V10" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
      <path d="M10 20V4" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
      <path d="M16 20V12" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
      <path d="M22 20H2" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
    </BaseIcon>
  );
}

export function IconMedal({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Medal" {...props}>
      <path d="M7 2h10l-2 6H9L7 2Z" stroke="currentColor" strokeWidth="3" />
      <path d="M12 22a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" stroke="currentColor" strokeWidth="3" />
      <path d="M12 13v6" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
    </BaseIcon>
  );
}

export function IconCrown({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Crown" {...props}>
      <path d="M4 9l4 4 4-7 4 7 4-4v9H4V9Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="miter" />
      <path d="M6 18h12" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
      <path d="M7 7l1 1" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
    </BaseIcon>
  );
}

export function IconBrain({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Brain" {...props}>
      <path d="M9 6c0-2 1.8-3 3-3s3 1 3 3c2 0 3 1.6 3 3.2 0 1.2-.6 2.3-1.6 2.9.6.5 1 1.4 1 2.4 0 1.7-1.1 3.5-3.4 3.5-.8 1.1-2.1 1.6-3 1.6s-2.2-.5-3-1.6C6.7 20.9 6 19.2 6 17.6c0-1 .4-1.9 1-2.4C6 14.6 5.4 13.5 5.4 12.3 5.4 10.6 6.6 9 8.6 9" stroke="currentColor" strokeWidth="3" strokeLinejoin="miter" />
      <path d="M12 6v14" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
      <path d="M8.5 11h2M13.5 11h2" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
    </BaseIcon>
  );
}

export function IconWrench({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Wrench" {...props}>
      <path d="M21 7.5a5 5 0 0 1-6.6 4.8L7.2 19.5 4.5 16.8l7.2-7.2A5 5 0 0 1 16.5 3l-2 2 2.5 2.5 2-2Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="miter" />
      <path d="M6.2 18.2l-1.4 1.4" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
    </BaseIcon>
  );
}

export function IconAward({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Award" {...props}>
      <path d="M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" stroke="currentColor" strokeWidth="3" />
      <path d="M9 12l-2 10 5-3 5 3-2-10" stroke="currentColor" strokeWidth="1" strokeLinejoin="miter" />
      <path d="M10 6h4" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
    </BaseIcon>
  );
}

export function IconFlame({ className, ...props }) {
  return (
    <BaseIcon className={className} title="Flame" {...props}>
      <path d="M12 2c2.5 3 3.5 5.5 2.7 8.2C16.7 11 18 12.7 18 15c0 4-3 7-6 7s-6-3-6-7c0-3.2 2.2-5.6 4.6-7.6.6 1.4.9 2.5.8 3.7" stroke="currentColor" strokeWidth="3" strokeLinejoin="miter" />
      <path d="M12 12c-1.6 1.2-2 2.2-2 3.2 0 1.4 1 2.8 2 2.8s2-1.4 2-2.8c0-1.1-.4-2-2-3.2Z" stroke="currentColor" strokeWidth="1" />
    </BaseIcon>
  );
}
