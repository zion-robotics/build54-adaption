# CareBridge: Architecture

## 1. Overview

Three parts: a web front end, Supabase (database, auth, storage, Edge Functions), and Gemma 4 through the Gemini API. The browser never talks to Gemma directly and never holds a secret key.

```
Browser (Lovable app on Vercel)
  |  anon key + user login (Supabase Auth)
  v
Supabase
  - Auth (email and password)
  - Postgres with Row Level Security (RLS)
  - Storage (private bucket for photos)
  - Edge Functions (server side, hold secrets)
        |
        +--> intake            --> Gemini API --> Gemma 4
        +--> emergency-doctors     (public, returns available doctors only)
        +--> slots                 (offer open slots, release expired ones)
        +--> book                  (create a booking)
        +--> heartbeat             (doctor availability ping)
```

## 2. Routes (front end)

| Route | Access | Purpose |
|---|---|---|
| / | public | Landing page, safety banner, entry points, red Emergency button |
| /emergency | public | Emergency number, available doctors, Call buttons |
| /proof | public | Holdout results and limitations |
| /login, /signup | public | Patient sign up and login. Doctor login uses the same form. |
| /patient | patient | New complaint, replies, booking, my bookings |
| /doctor | doctor | Case queue, case screen, schedule, Available now switch |

After login, a role check on the profiles table sends the user to /patient or /doctor. Front end route guards are for neatness. The database enforces access.

## 3. Authentication

- Supabase Auth with email and password for both roles.
- profiles.role is patient or doctor. Sign-up inserts a patient row. Doctor accounts are created by hand in the Supabase dashboard, and their profile role is set to doctor there.
- Disable email confirmation for the demo so sign-up does not wait for an email.
- Do not add Google login or phone codes today.

## 4. Data model

All tables have RLS enabled.

profiles
- id uuid primary key, references auth.users
- role text, check in (patient, doctor)
- full_name text
- created_at timestamptz

doctors
- id uuid primary key, references profiles
- display_name text
- is_available boolean default false
- last_seen timestamptz

doctor_contacts
- doctor_id uuid primary key, references doctors
- phone text
- No RLS policies at all. Only the service role (inside Edge Functions) can read it.

doctor_hours
- id uuid primary key
- doctor_id uuid references doctors
- weekday int (0 to 6)
- start_time time, end_time time

cases
- id uuid primary key
- patient_id uuid references profiles
- doctor_id uuid references doctors, nullable until assigned
- complaint_text text
- photo_path text, nullable
- intake jsonb, nullable
- urgency text, nullable (red, amber, green)
- estimated_minutes int, nullable
- status text (new, reviewed, replied, booked, closed)
- reply_type text, nullable (advice, more_questions, drug_suggestion, come_in)
- reply_text text, nullable
- created_at timestamptz

bookings
- id uuid primary key
- case_id uuid references cases
- patient_id uuid references profiles
- doctor_id uuid references doctors
- starts_at timestamptz, ends_at timestamptz, grace_ends_at timestamptz
- status text (booked, attended, missed, released)

examples
- id uuid primary key
- language text (en, pcm)
- complaint text
- guideline_passage text
- guideline_source text
- intake jsonb
- source text (raw, adapted)
- is_holdout boolean default false

eval_runs
- id uuid primary key
- mode text (plain, grounded)
- example_id uuid references examples
- predicted jsonb
- created_at timestamptz

## 5. RLS rules in plain words

- profiles: a user reads and updates their own row. Nobody can change their own role.
- doctors: authenticated users can read id and display_name. A doctor can update their own is_available and last_seen. The public cannot read the table.
- doctor_contacts: no policies. Not readable from the browser.
- doctor_hours: authenticated users can read. Only the owning doctor can write.
- cases: a patient reads and inserts their own rows. A doctor reads and updates rows where doctor_id is theirs.
- bookings: a patient reads their own rows. A doctor reads rows where doctor_id is theirs. Writes go through the book function.
- examples and eval_runs: no browser access. The proof page reads a summary through a function or a read-only view of aggregated results.
- Storage bucket for photos: private. A patient can write and read only files under their own user id folder. A doctor reads photos only for cases assigned to them.

Empty list with no error almost always means a missing policy. Run the Supabase Security Advisor before the demo.

## 6. Edge Functions

intake
- Input: case id, complaint text, optional photo path.
- Loads the guideline examples from the examples table.
- Calls Gemma 4 through the Gemini API with a system instruction, the examples, the complaint and the photo.
- Validates the JSON against the schema in section 7, saves it to cases.intake, and sets urgency and estimated_minutes.
- On failure, saves the case without an intake and returns a readable error.

emergency-doctors (public)
- Returns display_name and phone for doctors where is_available is true and last_seen is within 10 minutes.
- Uses the service role key to read doctor_contacts.
- Returns nothing else. No emails, ids or hours.

slots
- Marks any booking past its grace_ends_at and still booked as missed and releases it. This check runs when slots is called, so no background job is needed today.
- Returns open slots for a doctor, sized by estimated_minutes rounded up to 5 minutes, inside doctor_hours, excluding booked slots.
- For red cases, returns the earliest free slot first.

book
- Creates a booking for a case, sets starts_at, ends_at and grace_ends_at (start plus 5 minutes), and updates case status.
- Rejects a slot that was taken in the meantime.

heartbeat
- A logged-in doctor with the switch on pings every 60 seconds. It updates last_seen.

Secrets used by functions: GEMINI_API_KEY and SUPABASE_SERVICE_ROLE_KEY. Both live in Supabase function secrets.

## 7. Intake output schema

Gemma 4 must return only JSON with these fields.

```json
{
  "danger_signs": ["string"],
  "urgency": "red | amber | green",
  "visit_type": "in_person_today | in_person_scheduled | remote_advice | needs_more_info",
  "estimated_minutes": 20,
  "questions_for_doctor": ["string"],
  "text_from_photo": "string or null",
  "guideline_source": "string or null"
}
```

The first six are the agreed fields. guideline_source is a seventh field that supports the rule that every label names its source. Drop it if it hurts accuracy.

The function validates the JSON. If it does not parse or a field is missing, it retries once, then falls back to saving the case without an intake.

## 8. Gemma 4 usage

- Model: gemma-4-31b-it or gemma-4-26b-a4b-it, through the Gemini API. Use the exact name AI Studio shows for our key.
- Text and image in one request. The photo is the multimodal part.
- System instruction: decision support only, never diagnose, never advise the patient on drugs, answer only from the supplied guideline text, return only the JSON schema.
- Grounding: 15 to 25 hand-written English and Pidgin examples, each with a guideline passage and source, are placed in the prompt. This is grounding, not training. The README says so.
- Thinking level: test high against minimal on sample complaints. Choose by accuracy and speed.
- Do not use the Google Search tool. Answers come from the supplied guideline text.

## 9. Adaption, with a fallback

One table, two sources.

- Path A: hand-written examples go through Adaptive Data. Adapted rows are loaded into examples with source set to adapted.
- Path B: the same hand-written examples are loaded straight into examples with source set to raw.
- The intake function does not care which source the rows have.
- If Adaption finishes, show quality score before and after on the proof page. If it does not, say nothing about using it.

Facts we know about Adaption: the app flow needs no API key, a run shows its credit cost on the Summary screen before launch, large jobs can queue for hours and the estimate may not include queue time, and AutoScientist needs at least 1,000 effective rows. AutoScientist is out of scope.

## 10. Evaluation design

- Split the examples into grounding examples (in the prompt) and holdout examples (never in the prompt). Mark holdout rows with is_holdout.
- Run the holdout set twice: plain prompt with the system instruction only, and grounded prompt with the examples added.
- Store each prediction in eval_runs.
- Report urgency accuracy, danger sign recall and the estimated minutes difference, with the misses listed.
- Labels come from the cited guideline text. State plainly that we wrote the holdout set ourselves, so results are indicative and not clinical evidence.

## 11. Security checklist

- Only the Supabase anon key is in the front end.
- GEMINI_API_KEY and SUPABASE_SERVICE_ROLE_KEY are only in function secrets.
- .env is in .gitignore. Search the repo for AIza and for the service role key before the freeze.
- RLS on every table, storage bucket private.
- Doctor sign-up is not possible from the app.
- Demo doctor phones are teammates' phones.
- No real patient data anywhere.

## 12. Failure modes

| What fails | What happens |
|---|---|
| Gemma 4 times out or rate limits | Case is saved without intake, doctor still sees the complaint, patient sees a clear message |
| Adaption run stalls or runs out of credits | Use Path B, no mention of Adaption in the pitch |
| No doctor available on the emergency page | Page shows a message and keeps the emergency number on top |
| Doctor forgets to turn the switch off | last_seen goes stale after 10 minutes and the doctor drops off the list |
| Patient misses the slot | After the 5 minute grace period the slot is released and the patient is offered a new one |
| Live demo network fails | Play the backup demo video recorded after the freeze |
