# CareBridge: Build Guide

Each step has a checkpoint. Do not move on until the checkpoint passes. Never paste secret keys into chat, the repo or Lovable.

## Step 0: repo and secrets

1. Public GitHub repo named carebridge with an MIT LICENSE file (Add file, Create new file, name it LICENSE, choose the MIT template).
2. Add a .gitignore with .env and .env.local before the first commit.
3. Copy the docs from this folder into the repo (README.md at the root, the others in a docs folder).

Checkpoint: the repo sidebar shows MIT license and the repo is public.

## Step 1: Gemini API key

1. Get a key at aistudio.google.com (Get API key).
2. Check the model list for gemma-4-26b-a4b-it and gemma-4-31b-it. Use the exact names shown.
3. Test from a terminal.

```
export GEMINI_API_KEY="paste_your_key_here"

curl "https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent?key=$GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Reply with the word ready."}]}]}'
```

Checkpoint: JSON reply containing "ready". A 404 means the model name is wrong. A 403 or 429 means a key or free tier limit problem.

4. Store the key in Supabase: Edge Functions, Secrets, add GEMINI_API_KEY. The function reads it with Deno.env.get("GEMINI_API_KEY").

Checkpoint: the secret shows in the dashboard and a search of the repo for AIza finds nothing.

## Step 2: Supabase auth settings

1. Authentication, Providers: email on. Turn email confirmation off for the demo.
2. Make sure the app has no screen that lets someone choose the doctor role.
3. Create 2 or 3 doctor users by hand in the dashboard (Authentication, Users, Add user).
4. After the SQL in step 3 runs, set each doctor's profile role to doctor.

Checkpoint: a new patient can sign up and log in. A doctor user exists with role doctor.

## Step 3: tables and RLS

Create the tables in architecture.md section 4. For every table:

```
alter table public.<name> enable row level security;
```

Then add the policies from architecture.md section 5. Notes:
- doctor_contacts gets RLS on and no policies.
- A trigger on auth.users inserts a profiles row with role patient on sign-up.
- Create a private storage bucket for photos with policies scoped to the user's own folder.

Checkpoint: as a patient, selecting from cases returns only your own rows. As a different patient, you see none of them. A direct select on doctor_contacts from the browser returns nothing.

## Step 4: seed data

1. Insert 2 or 3 doctors with display names, working hours for today and tomorrow, and teammates' phone numbers in doctor_contacts.
2. Load the presenters' synthetic examples into examples. Set source to raw. Mark about 30 to 50 rows as holdout. Keep 15 to 25 as grounding examples.
3. Every row needs a guideline_passage and a guideline_source.

Checkpoint: select count(*) from examples shows grounding and holdout rows separately.

## Step 5: intake function

System instruction draft:

```
You help a doctor prepare for a visit. You give decision support only.
Never diagnose. Never tell the patient what drug to take.
Use only the guideline passages provided in the examples. If the complaint is not covered, set urgency to amber and add a question for the doctor.
If any danger sign is present, set urgency to red.
The complaint may be in English or Nigerian Pidgin.
Return only JSON with these fields: danger_signs, urgency, visit_type, estimated_minutes, questions_for_doctor, text_from_photo, guideline_source.
```

The function:
1. Loads grounding examples (is_holdout false).
2. Builds the request: system instruction, examples, complaint, optional photo.
3. Calls the Gemini API with the Gemma 4 model.
4. Parses and validates the JSON. Retries once on failure.
5. Saves intake, urgency and estimated_minutes on the case.

Test with one English complaint and one Pidgin complaint. Try thinking level high and minimal.

Checkpoint: valid JSON for both, with a guideline source and a sensible urgency. Share the function URL and a sample response with the frontend teammate.

## Step 6: emergency-doctors function

1. Public function, no login.
2. Select doctors where is_available is true and last_seen is within 10 minutes, join doctor_contacts with the service role key, return display_name and phone only.

Checkpoint: with no doctor available it returns an empty list. After a doctor turns the switch on and the heartbeat runs, that doctor appears. Ten minutes after the heartbeat stops, the doctor drops off.

## Step 7: scheduler functions

slots
1. First mark bookings past grace_ends_at and still booked as missed and release them.
2. Compute open slots in the doctor's hours, slot length equal to estimated minutes rounded up to 5.
3. Red cases get the earliest free slot first.

book
1. Check the slot is still free.
2. Insert the booking with starts_at, ends_at and grace_ends_at (start plus 5 minutes).
3. Update the case status.

Checkpoint: book a slot, wait past the grace time on a test booking, call slots again, and confirm the booking shows as missed and the slot is open.

## Step 8: front end wiring (frontend teammate)

1. Build every screen on mock data first using the sample JSON.
2. Switch to the real function URLs. Only the Supabase anon key appears in the front end.
3. Role redirect after login. Route guards for /patient and /doctor.
4. Doctor heartbeat: while the switch is on and the page is open, call heartbeat every 60 seconds.
5. If the intake returns urgency red, show the Emergency button in a banner on the patient screen.
6. Safety banner on every page.

Checkpoint: log in as a patient on one device and a doctor on another. The doctor sees the new case. The reply shows on the patient side.

## Step 9: holdout evaluation

1. For each holdout example, call Gemma 4 twice: plain (system instruction only) and grounded (examples added).
2. Save each prediction in eval_runs.
3. Compute urgency accuracy, danger sign recall and the estimated minutes difference for both modes.
4. List the misses.

Checkpoint: a results table with real numbers for both modes. If grounded is not better, report that as it is.

## Step 10: proof page and README

1. Proof page: the results table, the list of misses, the limitations, and the safety notes.
2. State that the holdout set was written by the team, so results are indicative and not clinical evidence.
3. If an Adaption run completed, add the quality score before and after, the recipes used, and the credits spent. If not, leave Adaption out.
4. README must include: problem, solution, setup steps, which Gemma 4 model is called and where, what we built versus used, datasets and tools used, results table, limitations, MIT license.

Checkpoint: a stranger could clone the repo and understand the project from the README.

## Step 11: freeze and submit

1. Run the Supabase Security Advisor and fix what it flags.
2. Search the repo for AIza and the service role key.
3. Test the doctor login and the emergency call on two devices.
4. Load test the intake function with about 20 requests in a row.
5. Freeze at 3:15 PM and tag the repo.
6. Record the backup demo video.
7. Submit on the Organizer HQ portal before 9:00 PM WAT: repo link, live link, demo.
8. Post publicly with a screenshot or video.

Checkpoint: the portal shows the submission as received.

## Quick troubleshooting

- Empty list with no error from Supabase: a missing RLS policy.
- 404 from the Gemini API: wrong model name.
- 429 from the Gemini API: rate limit, slow down or switch model.
- Doctor missing from the emergency page: the switch is off or last_seen is older than 10 minutes.
- Photo upload fails: check the storage bucket policy and the folder path uses the user id.
