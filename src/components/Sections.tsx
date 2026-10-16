import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Minus, Phone } from "lucide-react";
import patientImg from "@/assets/patient.jpg";
import doctorImg from "@/assets/doctor.jpg";
import { Button } from "@/components/ui/button";
import { Eyebrow, SAFETY_LINE, UrgencyChip, Wordmark } from "@/components/brand";
import { ScrollReveal, Stagger, StaggerItem } from "@/components/motion";
import { cn } from "@/lib/utils";

export function ProblemBand() {
  return (
    <section className="py-24 md:py-32" aria-labelledby="problem-title">
      <div className="container-page grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <ScrollReveal>
          <Eyebrow>The problem</Eyebrow>
          <h2 id="problem-title" className="text-display mt-5 text-balance">
            You wait because nobody knows <span className="text-muted-foreground">how long you will take.</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="text-lead text-muted-foreground">
            Most clinics see people in arrival order. A mild cold takes the same place in line as chest pain, and danger signs sit quietly behind routine visits — for hours.
          </p>
        </ScrollReveal>
      </div>
      <Stagger className="container-page mt-14 grid gap-4 sm:grid-cols-3">
        {[
          { k: "Arrival order", v: "Who came first, not who needs care first", u: "green" as const },
          { k: "No time estimate", v: "Every visit treated as the same length", u: "amber" as const },
          { k: "Hidden danger", v: "Urgent signs wait behind routine visits", u: "red" as const },
        ].map((x) => (
          <StaggerItem key={x.k} className="lift rounded-3xl border border-border bg-card p-6 shadow-soft">
            <UrgencyChip urgency={x.u} />
            <h3 className="mt-5 text-xl font-bold">{x.k}</h3>
            <p className="mt-2 text-muted-foreground">{x.v}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function Split({
  id, eyebrow, title, img, alt, items, reverse,
}: { id: string; eyebrow: string; title: string; img: string; alt: string; items: string[]; reverse?: boolean }) {
  return (
    <section id={id} className="scroll-mt-28 py-16 md:py-24" aria-labelledby={`${id}-title`}>
      <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <ScrollReveal className={cn("relative", reverse && "lg:order-2")}>
          <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-tint" />
          <img src={img} alt={alt} loading="lazy" width={1152} height={1152} className="aspect-[4/3.6] w-full rounded-[2rem] object-cover shadow-card" />
        </ScrollReveal>
        <div>
          <ScrollReveal>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 id={`${id}-title`} className="text-display mt-5 text-balance">{title}</h2>
          </ScrollReveal>
          <Stagger className="mt-8 space-y-3">
            {items.map((t) => (
              <StaggerItem key={t} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="h-4 w-4" /></span>
                <span className="pt-0.5 font-medium">{t}</span>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

export function AudienceSplits() {
  return (
    <>
      <Split
        id="patients"
        eyebrow="For patients"
        title="Care that starts from your sofa."
        img={patientImg}
        alt="A smiling woman at home describing her symptoms on her phone"
        items={["Describe it in English or Pidgin", "Attach a photo if it helps", "See your doctor's reply in the app", "Book a time that fits your day"]}
      />
      <Split
        id="doctors"
        reverse
        eyebrow="For doctors"
        title="A queue that sorts itself. You stay in charge."
        img={doctorImg}
        alt="A doctor reviewing patient cases on a tablet in a bright clinic"
        items={["Cases sorted red, amber, green", "Edit the AI intake before you reply", "You stay in control of every decision", "Nothing reaches the patient without your reply"]}
      />
    </>
  );
}

const compare = [
  { name: "Paper queue & walk-in", tag: "Manual", feats: [false, false, true, false, true] },
  { name: "Booking app without triage", tag: "Calendar only", feats: [false, false, false, false, false] },
  { name: "CareBridge", tag: "Most connected", feats: [true, true, true, true, true], hi: true },
];
const featNames = ["Estimated minutes per visit", "Urgent cases first", "Doctor reviews every case", "Live emergency doctors", "Works in English and Pidgin"];

export function ComparisonCards() {
  return (
    <section className="bg-tint py-24 md:py-32" aria-labelledby="compare-title">
      <div className="container-page">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <Eyebrow className="bg-background">Old way vs CareBridge</Eyebrow>
          <h2 id="compare-title" className="text-display mt-5 text-balance">Not another calendar. A smarter front door.</h2>
        </ScrollReveal>
        <Stagger className="mt-14 grid gap-5 lg:grid-cols-3 lg:items-center">
          {compare.map((c) => (
            <StaggerItem
              key={c.name}
              className={cn(
                "lift relative rounded-3xl bg-card p-7 shadow-card",
                c.hi ? "border-2 border-primary lg:scale-[1.04] lg:py-10" : "border border-border",
              )}
            >
              {c.hi && <span className="absolute -top-3.5 left-7 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">Recommended</span>}
              <p className={cn("text-xs font-bold uppercase tracking-wider", c.hi ? "text-primary" : "text-muted-foreground")}>{c.tag}</p>
              <h3 className="mt-2 text-2xl font-extrabold">{c.name}</h3>
              <ul className="mt-6 space-y-3.5">
                {featNames.map((f, i) => (
                  <li key={f} className={cn("flex items-center gap-3 text-[15px]", !c.feats[i] && "text-muted-foreground")}>
                    {c.feats[i] ? (
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="h-3.5 w-3.5" /></span>
                    ) : (
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-muted"><Minus className="h-3.5 w-3.5" /></span>
                    )}
                    {f}
                  </li>
                ))}
              </ul>
              {c.hi && (
                <Button asChild className="mt-8 w-full" size="lg">
                  <Link to="/signup">Get started <ArrowRight /></Link>
                </Button>
              )}
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function EmergencyBand() {
  return (
    <section className="bg-emergency-soft py-20 md:py-24" aria-labelledby="em-title">
      <ScrollReveal className="container-page grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-emergency">In danger right now?</p>
          <h2 id="em-title" className="text-display mt-3 text-emergency">Call 112.</h2>
          <p className="text-lead mt-3 max-w-xl font-semibold text-foreground">CareBridge is not an emergency service.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
          <Button asChild size="xl" variant="emergency">
            <a href="tel:112"><Phone className="!size-5" /> Call 112</a>
          </Button>
          <Button asChild size="xl" variant="outline" className="border-emergency/30 text-emergency">
            <Link to="/emergency">See live emergency doctors</Link>
          </Button>
        </div>
      </ScrollReveal>
    </section>
  );
}

export function ProofTeaser() {
  return (
    <section className="py-24 md:py-32" aria-labelledby="proof-title">
      <div className="container-page">
        <ScrollReveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow>Proof</Eyebrow>
            <h2 id="proof-title" className="text-display mt-5 max-w-xl text-balance">Measured honestly. Published openly.</h2>
          </div>
          <Button asChild variant="outline"><Link to="/proof">See the full results <ArrowRight /></Link></Button>
        </ScrollReveal>
        <Stagger className="mt-12 grid gap-4 sm:grid-cols-3">
          {["Red cases flagged correctly", "Urgency agreement with doctors", "Minute estimates within ±5 min"].map((l) => (
            <StaggerItem key={l} className="lift rounded-3xl border border-border bg-card p-7 shadow-soft">
              <p className="text-6xl font-extrabold tracking-tighter text-gradient">TBD</p>
              <p className="mt-4 font-medium text-muted-foreground">{l}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="pb-24">
      <ScrollReveal className="container-page">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-cta px-6 py-16 text-center text-primary-foreground shadow-float md:px-16 md:py-24">
          <div className="absolute inset-0 bg-grid opacity-40" />
          <div className="relative">
            <h2 className="text-display mx-auto max-w-3xl text-balance">Stop guessing. Know your time before you go.</h2>
            <p className="text-lead mx-auto mt-5 max-w-xl opacity-85">Free for patients. Built with doctors in Lagos.</p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90">
                <Link to="/signup">Get started <ArrowRight /></Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link to="/login">I already have an account</Link>
              </Button>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

export function Footer() {
  const cols = [
    { t: "Patients", l: [["New complaint", "/patient"], ["Emergency", "/emergency"], ["Sign up", "/signup"]] },
    { t: "Doctors", l: [["Case queue", "/doctor"], ["Proof", "/proof"], ["Log in", "/login"]] },
    { t: "Legal", l: [["Privacy (coming soon)", "/"], ["Terms (coming soon)", "/"], ["Data use (coming soon)", "/"]] },
  ] as const;
  return (
    <footer className="border-t border-border bg-offwhite">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">Doctor-reviewed triage and right-sized clinic bookings for Africa.</p>
        </div>
        {cols.map((c) => (
          <nav key={c.t} aria-label={c.t}>
            <p className="text-sm font-bold">{c.t}</p>
            <ul className="mt-4 space-y-1">
              {c.l.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="inline-flex min-h-11 items-center text-sm text-muted-foreground hover:text-foreground">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-border">
        <p className="container-page py-6 text-xs text-muted-foreground">{SAFETY_LINE} © {new Date().getFullYear()} CareBridge.</p>
      </div>
    </footer>
  );
}
