import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Wallet,
  Stethoscope,
  FlaskConical,
  Pill,
  Video,
  HeartPulse,
  ArrowLeft,
} from "lucide-react";

export const Route = createFileRoute("/bmoni")({
  head: () => ({
    meta: [{ title: "Pay with BMoni | CareLink" }],
  }),
  component: BMoniPage,
});

type Step = "select" | "details" | "otp" | "success";

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: React.ComponentType<{ className?: string }>;
};

type Payment = {
  reference: string;
  service: string;
  amount: number;
  date: string;
};

const SERVICES: Service[] = [
  {
    id: "consultation",
    name: "In-person consultation",
    description: "Visit a doctor at any connected hospital or clinic",
    price: 5000,
    icon: Stethoscope,
  },
  {
    id: "online",
    name: "Online consultation",
    description: "Video or chat session with a verified doctor",
    price: 3500,
    icon: Video,
  },
  {
    id: "lab",
    name: "Laboratory tests",
    description: "Full blood count, malaria, glucose and more",
    price: 8000,
    icon: FlaskConical,
  },
  {
    id: "pharmacy",
    name: "Prescription refill",
    description: "Pay for your medication and get it delivered",
    price: 6500,
    icon: Pill,
  },
  {
    id: "plan",
    name: "CareLink Health Plan",
    description: "Monthly plan covering checkups and records access",
    price: 12000,
    icon: HeartPulse,
  },
];

const naira = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);

function BMoniPage() {
  const [step, setStep] = useState<Step>("select");
  const [selected, setSelected] = useState<Service | null>(null);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<Payment | null>(null);
  const [history, setHistory] = useState<Payment[]>([]);

  const reset = () => {
    setStep("select");
    setSelected(null);
    setPhone("");
    setPin("");
    setOtp("");
    setError("");
    setReceipt(null);
  };

  const choose = (service: Service) => {
    setSelected(service);
    setError("");
    setStep("details");
  };

  // Simulated: wait a moment, then run the next step
  const simulate = (next: () => void) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      next();
    }, 1200);
  };

  const submitDetails = () => {
    if (!/^0\d{10}$/.test(phone)) {
      setError("Enter a valid 11-digit BMoni number, e.g. 08012345678.");
      return;
    }
    if (!/^\d{4}$/.test(pin)) {
      setError("Your BMoni PIN must be 4 digits.");
      return;
    }
    setError("");
    setPin(""); // never keep the PIN around
    simulate(() => setStep("otp"));
  };

  const submitOtp = () => {
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code sent to your phone.");
      return;
    }
    if (!selected) return;
    setError("");
    simulate(() => {
      const payment: Payment = {
        reference: "BM-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
        service: selected.name,
        amount: selected.price,
        date: new Date().toLocaleString("en-NG", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      };
      setReceipt(payment);
      setHistory((h) => [payment, ...h]);
      setStep("success");
    });
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>

      <h1 className="mb-1 text-2xl font-bold">Payments</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Pay for CareLink services using your BMoni wallet.
      </p>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Pay with BMoni</CardTitle>
              <CardDescription>
                Pay for CareLink services securely from your BMoni wallet.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* STEP 1: choose a service */}
          {step === "select" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {SERVICES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => choose(s)}
                  className="flex items-start gap-3 rounded-xl border bg-card p-4 text-left transition hover:border-primary hover:shadow-sm"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {s.description}
                    </p>
                    <p className="mt-2 font-semibold text-primary">
                      {naira(s.price)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* STEP 2: BMoni details */}
          {step === "details" && selected && (
            <div className="space-y-4">
              <button
                onClick={reset}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Change service
              </button>

              <div className="flex items-center justify-between rounded-xl bg-muted p-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    You are paying for
                  </p>
                  <p className="font-medium">{selected.name}</p>
                </div>
                <p className="text-xl font-bold">{naira(selected.price)}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bmoni-phone">BMoni number</Label>
                <Input
                  id="bmoni-phone"
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="08012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bmoni-pin">BMoni PIN</Label>
                <Input
                  id="bmoni-pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="••••"
                  autoComplete="off"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                className="w-full"
                onClick={submitDetails}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wallet className="mr-2 h-4 w-4" />
                )}
                Pay {naira(selected.price)}
              </Button>
            </div>
          )}

          {/* STEP 3: OTP */}
          {step === "otp" && selected && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We sent a 6-digit verification code to your BMoni number. Enter
                it to confirm your payment of{" "}
                <span className="font-medium text-foreground">
                  {naira(selected.price)}
                </span>
                . (Demo: any 6 digits will work.)
              </p>

              <div className="space-y-2">
                <Label htmlFor="bmoni-otp">Verification code</Label>
                <Input
                  id="bmoni-otp"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-2">
                <Button variant="outline" onClick={reset} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={submitOtp}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm payment
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: success */}
          {step === "success" && receipt && (
            <div className="space-y-4 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
              <div>
                <p className="text-lg font-semibold">Payment successful</p>
                <p className="text-sm text-muted-foreground">
                  Your payment has been received by CareLink.
                </p>
              </div>

              <div className="space-y-2 rounded-xl bg-muted p-4 text-left text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service</span>
                  <span className="font-medium">{receipt.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">{naira(receipt.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="font-mono font-medium">
                    {receipt.reference}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{receipt.date}</span>
                </div>
              </div>

              <Button className="w-full" onClick={reset}>
                Make another payment
              </Button>
            </div>
          )}

          {/* Recent payments */}
          {history.length > 0 && step !== "success" && (
            <div className="border-t pt-4">
              <p className="mb-2 text-sm font-medium">Recent BMoni payments</p>
              <ul className="space-y-2">
                {history.slice(0, 3).map((p) => (
                  <li
                    key={p.reference}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {p.service}
                      <span className="block text-xs text-muted-foreground">
                        {p.reference} · {p.date}
                      </span>
                    </span>
                    <span className="font-medium">{naira(p.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Demo mode: payments are simulated and no real money moves.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}