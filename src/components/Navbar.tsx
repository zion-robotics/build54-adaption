import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmergencyPill, SafetyBanner, Wordmark } from "@/components/brand";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#how", label: "How it works" },
  { href: "/#patients", label: "For patients" },
  { href: "/#doctors", label: "For doctors" },
  { href: "/proof", label: "Proof" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header className="sticky top-0 z-50">
      <SafetyBanner />
      <div className={cn("glass border-b transition-colors", scrolled ? "border-border" : "border-transparent")}>
        <nav aria-label="Main" className="container-page grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 md:h-[72px] lg:grid-cols-[1fr_auto_1fr]">
          <Wordmark />
          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-end gap-2">
            <EmergencyPill className="hidden sm:inline-flex" />
            <Button asChild className="hidden lg:inline-flex" variant="hero">
              <Link to="/signup">Get started</Link>
            </Button>
            <EmergencyPill className="px-3 sm:hidden" />
            <button
              onClick={() => setOpen(true)}
              className="grid h-11 w-11 place-items-center rounded-full border border-border bg-background lg:hidden"
              aria-label="Open menu"
              aria-expanded={open}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-background lg:hidden"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="container-page flex h-16 items-center justify-between">
              <Wordmark />
              <button onClick={() => setOpen(false)} className="grid h-11 w-11 place-items-center rounded-full border border-border" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="container-page mt-6 flex flex-col">
              {links.map((l, i) => (
                <motion.li key={l.href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i + 0.1 }}>
                  <a href={l.href} onClick={() => setOpen(false)} className="flex min-h-14 items-center border-b border-border text-2xl font-bold tracking-tight">
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="container-page mt-auto flex flex-col gap-3 pb-8">
              <Button asChild size="lg" variant="hero">
                <Link to="/signup" onClick={() => setOpen(false)}>Get started</Link>
              </Button>
              <EmergencyPill size="lg" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
