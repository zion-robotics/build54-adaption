import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { StepsScroll } from "@/components/StepsScroll";
import { AudienceSplits, ComparisonCards, EmergencyBand, FinalCta, Footer, ProblemBand, ProofTeaser } from "@/components/Sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareBridge — Know your clinic time before you travel" },
      { name: "description", content: "Describe symptoms in English or Pidgin, get a doctor-reviewed reply, and book a clinic slot sized to your need." },
      { property: "og:title", content: "CareBridge — Know your clinic time before you travel" },
      { property: "og:description", content: "Doctor-reviewed triage and right-sized clinic bookings for Africa." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProblemBand />
        <StepsScroll />
        <AudienceSplits />
        <ComparisonCards />
        <EmergencyBand />
        <ProofTeaser />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
