import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, Camera, Clock, Send, Stethoscope } from "lucide-react";
import { UrgencyChip } from "@/components/brand";
import { cn } from "@/lib/utils";

function Bubble({ me, children }: { me?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn("max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug", me ? "ml-auto rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted text-foreground")}>
      {children}
    </div>
  );
}

const screens = [
  // 1. Complaint in Pidgin
  () => (
    <div className="flex h-full flex-col">
      <p className="text-xs font-semibold text-muted-foreground">New complaint</p>
      <h4 className="mt-1 text-lg font-extrabold">Wetin dey worry you?</h4>
      <div className="mt-4 flex-1 space-y-2">
        <Bubble me>My belle dey pain me since yesterday, I don vomit two times.</Bubble>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-border bg-background p-1.5 pl-4">
        <span className="flex-1 text-[13px] text-muted-foreground">Type in English or Pidgin…</span>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-muted"><Camera className="h-4 w-4" /></span>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground"><Send className="h-4 w-4" /></span>
      </div>
    </div>
  ),
  // 2. Intake card
  () => (
    <div className="flex h-full flex-col">
      <Bubble me>My belle dey pain me since yesterday…</Bubble>
      <div className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-bold">Intake summary</p>
          <UrgencyChip urgency="amber" />
        </div>
        <p className="mt-2 text-[13px] text-muted-foreground">Abdominal pain ~24h, 2 episodes of vomiting. No fever reported.</p>
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-tint p-3">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-[13px] font-semibold">Estimated visit</span>
          <span className="ml-auto text-xl font-extrabold text-primary">15 min</span>
        </div>
      </div>
      <p className="mt-auto text-center text-[11px] text-muted-foreground">Waiting for a doctor to review</p>
    </div>
  ),
  // 3. Doctor reply
  () => (
    <div className="flex h-full flex-col gap-3">
      <Bubble me>My belle dey pain me since yesterday…</Bubble>
      <div className="flex items-start gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-primary text-primary-foreground"><Stethoscope className="h-4 w-4" /></span>
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-muted-foreground">Dr. Chidi · reviewed</p>
          <Bubble>Please come in today. Drink small sips of ORS while you wait. If you see blood, use Emergency.</Bubble>
        </div>
      </div>
      <div className="mt-auto rounded-2xl bg-primary p-3 text-center text-[13px] font-bold text-primary-foreground">Book a 15-min slot</div>
    </div>
  ),
  // 4. Booked + grace countdown
  () => (
    <div className="flex h-full flex-col items-center text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-routine-soft text-routine"><CalendarCheck className="h-6 w-6" /></span>
      <h4 className="mt-3 text-lg font-extrabold">You're booked</h4>
      <p className="text-[13px] text-muted-foreground">Yaba Community Clinic · Today 2:40 PM</p>
      <div className="relative mt-5 h-32 w-32">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r="52" stroke="var(--color-muted)" strokeWidth="10" fill="none" />
          <motion.circle
            cx="60" cy="60" r="52" stroke="var(--color-primary)" strokeWidth="10" fill="none" strokeLinecap="round"
            strokeDasharray={327} initial={{ strokeDashoffset: 0 }} animate={{ strokeDashoffset: 327 * 0.3 }} transition={{ duration: 1.4, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-content-center">
          <p className="text-2xl font-extrabold">07:12</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Grace period</p>
        </div>
      </div>
      <p className="mt-auto text-[11px] text-muted-foreground">Arrive within 10 min of your slot to keep it</p>
    </div>
  ),
];

export function PhoneFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative mx-auto aspect-[9/18.5] w-full max-w-[300px] rounded-[2.75rem] border-[10px] border-foreground bg-foreground shadow-float", className)}>
      <div className="absolute left-1/2 top-2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-foreground" />
      <div className="h-full w-full overflow-hidden rounded-[2.1rem] bg-background px-4 pb-5 pt-11">{children}</div>
    </div>
  );
}

export function PhoneScreen({ step }: { step: number }) {
  const S = screens[step] ?? screens[0]!;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        className="h-full"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.35 }}
      >
        <S />
      </motion.div>
    </AnimatePresence>
  );
}
