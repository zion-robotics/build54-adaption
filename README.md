# CareLink Health Connect

Now, I want you to take a very good look at this design. I want you to replicate it EXACTLY but the content should be for this website instead:

Project Idea: CareLink

CareLink is a digital healthcare ecosystem that connects patients, hospitals, clinics, laboratories, pharmacies, doctors, and insurance providers on one secure platform.

Patients will have a digital health profile where they can access their medical history, test results, prescriptions, appointments, and other health records. With the patient's permission, authorized healthcare providers can access relevant medical information, making diagnosis and treatment faster and more efficient.

Healthcare providers can manage patients, create digital medical records, issue prescriptions, upload laboratory results, schedule appointments, and conduct online consultations.

The platform will focus on solving the problem of fragmented healthcare information, where patient records are scattered across different hospitals and providers. Our goal is to create a more connected, accessible, and efficient healthcare system, especially for Nigeria and Africa.

Tagline: Connecting healthcare. Improving lives.

I want the EXACT SAME DESIGN as the image with no difference at all. Give me something good. This is for making the homepage of the website.
Use the other doctor image as the image on the right. Make it good. Ignore the 1k+ Your courses at the bottom left. I want the exact same font, color design and stuff

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e087a797-d654-43c0-89c7-967f3213f200).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Product objectives

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

## Test the intake function

Put the local Supabase values in `.env` using the names in `.env.example`, including
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. The service-role key must stay local
and must not be committed or pasted into chat.

Run the helper from the repository root. It loads the values automatically and uses
the demo case ID by default:

```bash
./scripts/test-intake.sh
```

To test a different case:

```bash
./scripts/test-intake.sh <case-id>
```

The helper fails clearly if `.env` or either required Supabase value is missing.

## Team

- Zion: backend and data lead.
- Frontend teammate: Lovable screens and deployment.
- Presenter 1: pitch and README writing.
- Presenter 2: demo, backup video and submission.

## License

MIT. See LICENSE.
