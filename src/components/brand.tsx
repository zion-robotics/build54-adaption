import { Link } from "@tanstack/react-router";
import { Phone, Siren } from "lucide-react";
import logo from "@/assets/logo-mark.png.asset.json";
import { cn } from "@/lib/utils";
import type { Urgency } from "@/lib/api";

export function Wordmark({ className, light }: { className?: string; light?: boolean }) {
  return (
    <Link to="/" className={cn("inline-flex min-w-0 items-center gap-2.5", className)} aria-label="CareBridge home">
      <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-offwhite shadow-soft ring-1 ring-border">
        <img src={logo.url} alt="" className="h-full w-full object-contain p-0.5" width={36} height={36} />
      </span>
      <span className={cn("truncate text-lg font-extrabold tracking-tight", light ? "text-primary-foreground" : "text-foreground")}>
        Care<span className={light ? "text-primary-glow" : "text-primary"}>Bridge</span>
      </span>
    </Link>
  );
}

export const SAFETY_LINE = "CareBridge is decision support only. It does not diagnose and is not an emergency service.";

export function SafetyBanner() {
  return (
    <div role="note" className="bg-primary-deep text-primary-foreground">
      <p className="container-page py-2 text-center text-xs font-medium leading-snug sm:text-[13px]">{SAFETY_LINE}</p>
    </div>
  );
}

export function EmergencyPill({ className, size = "sm" }: { className?: string; size?: "sm" | "lg" }) {
  return (
    <Link
      to="/emergency"
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-emergency font-bold text-emergency-foreground transition-transform active:scale-95",
        size === "sm" ? "h-11 px-4 text-sm" : "h-16 w-full px-6 text-lg",
        className,
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inset-0 animate-live rounded-full bg-emergency-foreground" />
        <span className="relative h-2 w-2 rounded-full bg-emergency-foreground" />
      </span>
      {size === "lg" ? <Siren className="h-5 w-5" /> : null}
      Emergency
    </Link>
  );
}

export function Call112({ className }: { className?: string }) {
  return (
    <a href="tel:112" className={cn("inline-flex items-center gap-2 font-bold", className)}>
      <Phone className="h-5 w-5" /> Call 112
    </a>
  );
}

const urgencyMap: Record<Urgency, { label: string; cls: string }> = {
  red: { label: "Red · urgent", cls: "bg-urgent-soft text-urgent" },
  amber: { label: "Amber · soon", cls: "bg-moderate-soft text-moderate" },
  green: { label: "Green · routine", cls: "bg-routine-soft text-routine" },
};

export function UrgencyChip({ urgency, className }: { urgency: Urgency; className?: string }) {
  const u = urgencyMap[urgency];
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold", u.cls, className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {u.label}
    </span>
  );
}

export function LiveDot({ on = true }: { on?: boolean }) {
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      {on && <span className="absolute inset-0 animate-live rounded-full bg-routine" />}
      <span className={cn("relative h-2.5 w-2.5 rounded-full", on ? "bg-routine" : "bg-muted-foreground/40")} />
    </span>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border border-primary/15 bg-tint px-3 py-1.5 text-xs font-semibold text-primary", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      {children}
    </span>
  );
}
