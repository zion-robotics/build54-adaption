// CareBridge data layer. USE_MOCK keeps the app fully usable without a backend.
export const USE_MOCK = true;

export type Urgency = "red" | "amber" | "green";
export type CaseStatus = "submitted" | "triaged" | "replied" | "booked";

export interface CareCase {
  id: string;
  patientName: string;
  complaint: string;
  language: "English" | "Pidgin";
  urgency: Urgency;
  estMinutes: number;
  status: CaseStatus;
  createdAt: string;
  aiSummary: string;
  doctorReply?: string;
  slot?: { start: string; graceMinutes: number };
}

export interface EmergencyDoctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  facility: string;
  live: boolean;
}

export interface Booking {
  id: string;
  caseId: string;
  clinic: string;
  start: string;
  graceMinutes: number;
}

const wait = (ms = 650) => new Promise((r) => setTimeout(r, ms));
const inMinutes = (m: number) => new Date(Date.now() + m * 60000).toISOString();

const mockCases: CareCase[] = [
  {
    id: "c-1042",
    patientName: "Amaka O.",
    complaint: "My belle dey pain me since yesterday, I don vomit two times.",
    language: "Pidgin",
    urgency: "amber",
    estMinutes: 15,
    status: "booked",
    createdAt: inMinutes(-90),
    aiSummary: "Abdominal pain ~24h with 2 episodes of vomiting. No fever reported. No blood in vomit.",
    doctorReply: "Please come in today. Drink small sips of ORS while you wait.",
    slot: { start: inMinutes(42), graceMinutes: 10 },
  },
  {
    id: "c-1043",
    patientName: "Tunde B.",
    complaint: "Chest pain spreading to my left arm, sweating a lot.",
    language: "English",
    urgency: "red",
    estMinutes: 30,
    status: "triaged",
    createdAt: inMinutes(-6),
    aiSummary: "Acute chest pain radiating to left arm with diaphoresis. Danger signs present.",
  },
  {
    id: "c-1044",
    patientName: "Ngozi E.",
    complaint: "Catarrh and small cough for three days.",
    language: "Pidgin",
    urgency: "green",
    estMinutes: 8,
    status: "replied",
    createdAt: inMinutes(-40),
    aiSummary: "Mild upper respiratory symptoms for 3 days. No breathing difficulty.",
    doctorReply: "Likely a cold. Rest, fluids, and book a short visit if fever starts.",
  },
  {
    id: "c-1045",
    patientName: "Ibrahim S.",
    complaint: "High fever and headache since morning, body weak.",
    language: "English",
    urgency: "amber",
    estMinutes: 20,
    status: "triaged",
    createdAt: inMinutes(-18),
    aiSummary: "Fever with headache and malaise, onset today. Consider malaria screen.",
  },
];

const mockDoctors: EmergencyDoctor[] = [
  { id: "d1", name: "Dr. Funmi Adeyemi", specialty: "Emergency medicine", phone: "+2348000000001", facility: "Lagos Island General", live: true },
  { id: "d2", name: "Dr. Chidi Nwosu", specialty: "General practice", phone: "+2348000000002", facility: "Yaba Community Clinic", live: true },
  { id: "d3", name: "Dr. Aisha Bello", specialty: "Paediatrics", phone: "+2348000000003", facility: "Ikeja Children's Unit", live: false },
];

export async function getMyCases(): Promise<CareCase[]> {
  await wait();
  return mockCases.filter((c) => c.patientName.startsWith("Amaka") || c.id === "c-1044");
}

export async function getDoctorQueue(): Promise<CareCase[]> {
  await wait();
  const order: Record<Urgency, number> = { red: 0, amber: 1, green: 2 };
  return [...mockCases].sort((a, b) => order[a.urgency] - order[b.urgency]);
}

export async function submitComplaint(input: { text: string; photo?: File | null }): Promise<CareCase> {
  await wait(900);
  const c: CareCase = {
    id: `c-${Math.floor(Math.random() * 9000 + 1000)}`,
    patientName: "Amaka O.",
    complaint: input.text,
    language: /dey|wetin|don|abeg|belle/i.test(input.text) ? "Pidgin" : "English",
    urgency: "amber",
    estMinutes: 15,
    status: "submitted",
    createdAt: new Date().toISOString(),
    aiSummary: "Awaiting doctor review.",
  };
  mockCases.unshift(c);
  return c;
}

export async function sendDoctorReply(caseId: string, reply: string, summary: string): Promise<void> {
  await wait(700);
  const c = mockCases.find((x) => x.id === caseId);
  if (c) {
    c.doctorReply = reply;
    c.aiSummary = summary;
    c.status = "replied";
  }
}

export async function getBookings(): Promise<Booking[]> {
  await wait();
  return mockCases
    .filter((c) => c.slot)
    .map((c) => ({ id: `b-${c.id}`, caseId: c.id, clinic: "Yaba Community Clinic", start: c.slot!.start, graceMinutes: c.slot!.graceMinutes }));
}

export async function getEmergencyDoctors(): Promise<EmergencyDoctor[]> {
  await wait(400);
  return mockDoctors;
}

export async function setDoctorAvailability(available: boolean): Promise<boolean> {
  await wait(300);
  return available;
}

export async function getProofResults(): Promise<{ metric: string; value: number | null; target: string }[]> {
  await wait();
  return [
    { metric: "Red cases flagged correctly", value: null, target: "≥ 95%" },
    { metric: "Urgency agreement with doctors", value: null, target: "≥ 85%" },
    { metric: "Minute estimate within ±5 min", value: null, target: "≥ 70%" },
    { metric: "Pidgin intake understood", value: null, target: "≥ 90%" },
  ];
}
