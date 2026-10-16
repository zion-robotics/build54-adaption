import { motion, useScroll, useMotionValueEvent, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Eyebrow } from "@/components/brand";
import { PhoneFrame, PhoneScreen } from "@/components/PhoneScreens";
import { ScrollReveal } from "@/components/motion";
import { cn } from "@/lib/utils";

const steps = [
  { t: "Say it your way", d: "Type what's wrong in English or Pidgin. Add a photo if it helps. No forms, no medical words needed." },
  { t: "Get an intake card", d: "CareBridge organises your words into a clear summary with an urgency colour and how many minutes your visit should take." },
  { t: "A doctor replies", d: "A real doctor reviews and edits every case. Nothing reaches you without their reply." },
  { t: "Book your exact slot", d: "Pick a time sized to your need. A grace period countdown keeps your place while you travel." },
];

export function StepsScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start center", "end center"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(3, Math.max(0, Math.floor(v * 4)))));
  const line = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="how" className="scroll-mt-28 bg-offwhite py-24 md:py-32" aria-labelledby="how-title">
      <div className="container-page">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>How it works</Eyebrow>
          <h2 id="how-title" className="text-display mt-5 text-balance">From "I no feel fine" to a booked slot in minutes.</h2>
        </ScrollReveal>

        {/* Desktop: pinned phone */}
        <div ref={ref} className="relative mt-20 hidden gap-16 md:grid md:grid-cols-2">
          <div className="relative">
            <div className="sticky top-[22vh] flex justify-center">
              <div className="absolute inset-10 -z-10 rounded-full bg-primary-glow/25 blur-3xl" />
              <PhoneFrame>
                <PhoneScreen step={active} />
              </PhoneFrame>
            </div>
          </div>
          <ol className="relative">
            <div className="absolute left-5 top-0 h-full w-px bg-border" />
            <motion.div className="absolute left-5 top-0 h-full w-px origin-top bg-primary" style={{ scaleY: line }} />
            {steps.map((s, i) => (
              <li key={s.t} className="relative flex min-h-[70vh] items-center pl-16">
                <span
                  className={cn(
                    "absolute left-0 grid h-10 w-10 place-items-center rounded-full border text-sm font-bold transition-colors duration-500",
                    i <= active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground",
                  )}
                >
                  {i + 1}
                </span>
                <div className={cn("transition-opacity duration-500", i === active ? "opacity-100" : "opacity-35")}>
                  <h3 className="text-3xl font-extrabold lg:text-4xl">{s.t}</h3>
                  <p className="text-lead mt-4 max-w-md text-muted-foreground">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Mobile: stacked reveal cards */}
        <ol className="mt-12 space-y-6 md:hidden">
          {steps.map((s, i) => (
            <ScrollReveal as="li" key={s.t} className="rounded-3xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span>
                <h3 className="text-xl font-extrabold">{s.t}</h3>
              </div>
              <p className="mt-3 text-muted-foreground">{s.d}</p>
              <div className="mt-5 h-[380px] overflow-hidden rounded-2xl bg-tint p-4">
                <PhoneFrame className="max-w-[240px] -mb-24">
                  <PhoneScreen step={i} />
                </PhoneFrame>
              </div>
            </ScrollReveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
