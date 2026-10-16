# CareBridge: Plan

Event: Build54 Hacktoberfest Hack Day, FUNAAB, Friday 16 October 2026.
Submission closes 9:00 PM WAT on the Organizer HQ portal.

Clock times follow the official schedule. It was around noon when this file was written, so the first block starts now and everything before it is assumed done or skipped. Shift the times if the real clock is different.

## Fixed times from the event schedule

| Time | Event |
|---|---|
| 12:45 to 1:15 PM | Lunch |
| 1:15 to 3:15 PM | Build Session II |
| 3:15 to 3:30 PM | Final submission and demo prep |
| 3:30 to 4:30 PM | Demonstrations |
| 4:30 to 4:45 PM | Judging |
| 4:45 to 5:00 PM | Awards |

Internal freeze: 3:15 PM. The portal stays open until 9:00 PM, but we submit before the demo.

## Owners

- Zion: backend and data lead.
- Frontend teammate: screens and deployment.
- Presenter 1: pitch, README story sections, 20 synthetic complaints.
- Presenter 2: demo, backup video, submission, public post, 20 synthetic complaints, Adaption 20 row test.

## Phase 0: right now (about 20 minutes)

- Everyone reads README.md and prd.md and says yes or no to the scope in the group chat.
- Public repo has an MIT LICENSE file. Repo renamed to CareBridge.
- Zion: Gemini API key tested with a curl call, stored as a Supabase function secret.
- Zion: Supabase Auth set up (email and password, email confirmation off, public doctor sign-up impossible).
- Presenter 2: 20 row synthetic CSV, uploaded to Adaptive Data, stop at the Summary screen, post the credit cost in the group chat. Do not launch yet. Do not add a payment method.
- Presenters: start writing synthetic complaints with guideline sources.

Checkpoint: scope confirmed, key works, credit cost known.

## Phase 1: until lunch (about 40 minutes)

- Zion: SQL for all tables with RLS, seed 2 or 3 demo doctors and their hours, intake function working with raw examples.
- Zion: share the intake function URL and a sample JSON response with the frontend teammate.
- Frontend: landing page, login and sign-up, role redirect, patient complaint form, doctor case list on mock data.
- Presenters: hand complaint files to Zion before lunch.

Checkpoint: intake function returns valid JSON for one English and one Pidgin complaint.

## Adaption decision point

- If the 20 row test costs more than the 50 credits can cover, go to Path B at once.
- If a launched job is still queued or running at 2:00 PM, go to Path B. Let it keep running. Swap the adapted rows in only if it finishes before 2:30 PM.
- If a job fails twice, go to Path B and email support@adaptionlabs.ai with the dataset ID.
- Never claim Adaption in the pitch or README unless a run completed and was used.

## Phase 2: Build Session II, 1:15 to 2:30 PM

- Zion: emergency-doctors, slots, book and heartbeat functions. Holdout run (plain, then grounded).
- Frontend: doctor case screen with edit and reply, booking screen, my bookings with grace timer, status screen, emergency page on live data.
- Presenter 1: README story sections, pitch draft.
- Presenter 2: demo script, start the proof page content with Zion.

Checkpoint at 2:30 PM: live link works end to end. Sign up, complaint, intake, doctor reply, booking, emergency call, tested on two devices.

## Phase 3: 2:30 to 3:15 PM

- Fix only bugs that break the demo. No new features.
- Run the Supabase Security Advisor. Search the repo for AIza and the service role key.
- Load test the intake function with about 20 requests in a row.
- Fill the proof page with the real holdout numbers.
- Finish the README.

## Freeze at 3:15 PM

- Tag the repo.
- Presenter 2 records the backup demo video straight away.
- Presenters rehearse the pitch once.

## After the demos

- Submit on the Organizer HQ portal before 9:00 PM WAT. Do not wait for the awards.
- Post publicly, tagging @Build54Africa. Tag @adaption_ai only if Adaption was actually used.

Post starter: "At the Build54 Hackathon we built CareBridge to cut clinic waiting. Gemma 4 prepares the case for the doctor and the app books a slot sized to the case. Here is what the demo does: [result]."

## Cut order if time runs short

Cut in this order, from the top.

1. Patient picks a doctor (already a stretch goal, auto-assign instead).
2. Pidgin version of the doctor's reply.
3. Live queue view.
4. Records review on synthetic records.
5. Adaption.
6. Photo upload. Last resort only, because it is the multimodal part of the Gemma entry.

Never cut: RLS, the safety banner, the doctor review step, the emergency page.

## Pitch outline (2 to 3 minutes)

1. The problem in one sentence everyone has lived: waiting with no time.
2. Show a patient complaint in Pidgin turning into an intake with estimated minutes.
3. Show the doctor reply and the booking with the grace timer.
4. Show the Emergency page and a live call to a teammate's phone.
5. Show the proof page: real numbers and what the model got wrong.
6. Who pays: clinics, hospital networks, HMOs. Why it grows: a new clinic or guideline means new examples, not a rebuild. Label any market figures as estimates.
7. What we would do next: a pilot with one clinic.
