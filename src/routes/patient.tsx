import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/patient")({
  head: () => ({
    meta: [
      { title: "Patient · CareBridge" },
      { name: "description", content: "CareBridge patient page." },
      { property: "og:title", content: "Patient · CareBridge" },
      { property: "og:description", content: "CareBridge patient page." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <main className="container-page py-24 text-center">
        <h1 className="text-display">Patient</h1>
        <p className="text-lead mt-4 text-muted-foreground">This screen is coming next.</p>
        <Link to="/" className="mt-8 inline-flex min-h-11 items-center font-semibold text-primary">Back home</Link>
      </main>
    </div>
  );
}
