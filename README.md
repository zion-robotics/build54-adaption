# CareBridge

CareBridge connects a patient to a doctor before the patient travels to the clinic, and books a visit time sized to what the patient needs.

Built for the Build54 Hacktoberfest Hack Day at FUNAAB (Federal University of Agriculture, Abeokuta), 16 October 2026.

Status: hackathon prototype. Decision support only. Synthetic data only. Not a medical device and not an emergency service.

## The problem

People go to a clinic and find a room full of patients waiting for one doctor. Nobody knows how long a consultation will take, so nobody can plan their day. Some patients leave and come back later, and some never come back. Doctors see people in the order they arrived, not in the order of need, so a patient with danger signs can sit behind someone with a mild cold.

The root cause is simple: the clinic has no way to know, before the patient arrives, what the patient needs and how long it will take.

## Who it is for

Primary users
- Patients who attend private clinics and hospitals and lose hours waiting with no fixed time.
- Doctors and clinic staff who want to see the sickest patients first and plan their day.

Buyers (the people who would pay)
- Private clinics and hospital networks.
- HMOs (health maintenance organizations), because shorter waits mean more patients seen per day.

Early adopters we would approach first: small private clinics in Abeokuta and similar cities, where waiting is a daily complaint and there is no booking system.

## The solution

1. The patient creates an account and sends a complaint in English or Pidgin, with an optional photo of an old record or prescription.
2. Gemma 4, called through the Gemini API (application programming interface), turns the complaint into a structured intake for the doctor: danger signs, urgency (red, amber or green), suggested visit type, estimated minutes, questions for the doctor, and any text read from the photo.
3. The doctor reviews and edits the intake and replies: advice, more questions, a drug suggestion, or "come in". Nothing reaches the patient without the doctor.
4. If the patient must come in, the scheduler books a slot sized by the estimated minutes. Urgent cases are offered the earliest slot. There is a 5 minute grace period. If the patient misses it, the slot is released and a new one is offered.
5. Anyone can open the Emergency page without logging in. It shows the national emergency number first, then the doctors who are available right now, each with a Call button.

The estimated minutes field is what ties the AI to the waiting problem. Without it this would only be a calendar.

## Objectives

Product objectives for the hackathon
- A patient can go from complaint to a booked slot in one session.
- A doctor can see cases sorted by urgency and reply to each one.
- The Emergency page works without login and shows only doctors who are live.
- Gemma 4 sits in the middle of the flow, so the product stops working if it is removed.

Evidence objectives
- Measure Gemma 4 with a plain prompt against Gemma 4 with guideline examples on a holdout set the system never saw, and report the real numbers, including misses.

Business objectives (after the hackathon)
- Run a pilot with one clinic.
- Add a new clinic or a new guideline by adding examples, not by rebuilding the product.

## Where each technology sits

- Gemma 4 through the Gemini API: reads the complaint and photo and writes the structured intake. Model: gemma-4-31b-it or gemma-4-26b-a4b-it (use the exact name AI Studio shows).
- Supabase: database, authentication, file storage and Edge Functions (server-side functions that hold the secret keys). Row Level Security (RLS) is on for every table.
- Lovable and Vercel: front end and hosting.
- Adaption (Adaptive Data): optional. We try it on a small dataset with a fallback. See docs/architecture.md. We only claim it in the pitch and README if it actually ran.

## Safety rules

- Decision support only. CareBridge never diagnoses and never advises a patient on drugs. The doctor decides.
- Synthetic data only. No real patient records anywhere.
- Every example label comes from a published guideline, with the source named in the row.
- Secret keys live in Edge Function secrets only.
- A visible banner on every page says CareBridge is decision support and not an emergency service.

## Documents in this folder

- README.md: this file.
- prd.md: product requirements.
- architecture.md: system design, tables, functions, security.
- plan.md: schedule, owners, decision points.
- build.md: build steps with a checkpoint after each one.

## Team

- Zion: backend and data lead.
- Frontend teammate: Lovable screens and deployment.
- Presenter 1: pitch and README writing.
- Presenter 2: demo, backup video and submission.

## License

MIT. See LICENSE.
