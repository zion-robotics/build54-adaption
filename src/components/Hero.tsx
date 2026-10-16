import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock, ShieldCheck, Siren } from "lucide-react";
import heroImg from "@/assets/hero-mockup.jpg";
import { Button } from "@/components/ui/button";
import { Eyebrow, UrgencyChip } from "@/components/brand";
import { ParallaxLayer, useSectionScroll } from "@/components/motion";

export function Hero() {
  const { ref, progress } = useSectionScroll();
  const reduce = useReducedMotion();
  const fade = (d: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: d, ease: [0.2, 0.8, 0.2, 1] as const } };

  return (
    <section ref={ref} className="relative isolate overflow-hidden bg-gradient-hero">
      {/* Parallax background layers */}
      <ParallaxLayer progress={progress} speed={0.1} className="pointer-events-none absolute inset-0 -z-10 bg-grid" />
      <ParallaxLayer progress={progress} speed={0.35} className="pointer-events-none absolute -left-32 top-10 -z-10 h-[28rem] w-[28rem] rounded-full bg-primary-glow/30 blur-3xl" />
      <ParallaxLayer progress={progress} speed={0.2} className="pointer-events-none absolute -right-40 top-40 -z-10 h-[34rem] w-[34rem] rounded-full bg-primary/20 blur-3xl" />
      <ParallaxLayer progress={progress} speed={0.5} className="pointer-events-none absolute bottom-0 left-1/3 -z-10 h-72 w-72 rounded-full bg-accent blur-3xl" />
      <ParallaxLayer progress={progress} speed={0.15} className="pointer-events-none absolute inset-x-0 top-[58%] -z-10 opacity-40">
        <svg viewBox="0 0 1440 120" className="w-full" fill="none" aria-hidden>
          <path
            className="animate-heartbeat"
            d="M0 60 H520 L560 60 L585 18 L615 104 L640 40 L660 60 H900 L925 60 L945 30 L965 88 L985 60 H1440"
            stroke="var(--color-primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </ParallaxLayer>

      <div className="container-page grid items-center gap-12 pb-20 pt-12 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pb-32">
        <ParallaxLayer progress={progress} speed={-0.05} className="relative">
          <motion.div {...fade(0)}>
            <Eyebrow>Smarter clinic visits for Africa</Eyebrow>
          </motion.div>
          <motion.h1 {...fade(0.08)} className="text-hero mt-6 text-balance">
            Know your time <span className="text-gradient">before you travel</span> to the clinic.
          </motion.h1>
          <motion.p {...fade(0.16)} className="text-lead mt-6 max-w-xl text-muted-foreground">
            Describe what's wrong in English or Pidgin. A doctor reviews it, and you book a slot sized to your need — not a whole day in a queue.
          </motion.p>
          <motion.div {...fade(0.24)} className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" variant="hero">
              <Link to="/signup">
                Get started <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#how">Learn more</a>
            </Button>
          </motion.div>
          <motion.div {...fade(0.32)} className="mt-4">
            <Button asChild size="xl" variant="emergency" className="w-full sm:w-auto">
              <Link to="/emergency">
                <Siren className="!size-5" /> Emergency? Get help now
              </Link>
            </Button>
          </motion.div>
          <motion.ul {...fade(0.4)} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Every case reviewed by a doctor</li>
            <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Estimated minutes, up front</li>
          </motion.ul>
        </ParallaxLayer>

        <ParallaxLayer progress={progress} speed={0.12} className="relative">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative"
          >
            <div className="absolute inset-6 -z-10 rounded-[3rem] bg-gradient-primary opacity-25 blur-3xl" />
            <img
              src={heroImg}
              alt="CareBridge patient app on a phone showing an intake card with a 12 minute estimate, in front of the doctor's patient queue dashboard"
              width={1024}
              height={1024}
              fetchPriority="high"
              className="w-full rounded-[2rem] shadow-float"
            />
          </motion.div>
          <ParallaxLayer progress={progress} speed={-0.15} className="absolute -bottom-6 left-2 sm:-left-6">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 pr-5 shadow-card">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-tint text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Your slot · Yaba Clinic</p>
                <p className="text-sm font-bold">Today, 2:40 PM · 15 min</p>
              </div>
            </div>
          </ParallaxLayer>
          <ParallaxLayer progress={progress} speed={-0.25} className="absolute -top-4 right-2 hidden sm:block">
            <div className="rounded-2xl border border-border bg-card p-3 shadow-card">
              <UrgencyChip urgency="red" />
              <p className="mt-2 text-xs font-semibold">Seen first · 3 min</p>
            </div>
          </ParallaxLayer>
        </ParallaxLayer>
      </div>
    </section>
  );
}
