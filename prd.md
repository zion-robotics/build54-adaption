# CareBridge: Product Requirements Document (PRD)

Version: hackathon day, 16 October 2026
Owner: Zion
Status: draft for team confirmation

## 1. Summary

CareBridge lets a patient describe a health complaint before going to a clinic. Gemma 4 prepares a structured intake for the doctor. The doctor replies and, if a visit is needed, the system books a slot sized to the case.

## 2. Problem

Patients wait at clinics with no idea how long it will take. Doctors see people in arrival order, not in order of need. See README.md for the full description.

## 3. Goals and non-goals

Goals
- Reduce guessing about wait time by booking slots sized to each case.
- Put the most urgent cases in front of the doctor first.
- Give patients a way to reach a live doctor in an emergency.
- Show honest evidence of how much the guideline examples help Gemma 4.

Non-goals for today
- Diagnosis of any kind.
- Payments, insurance claims, multi-clinic accounts.
- SMS or WhatsApp notifications.
- In-app video or voice calls. The emergency Call button opens the phone dialer.
- Yoruba and other languages. Today supports English and Pidgin only.
- Any real patient data.

## 4. Users

Patient
- Has a phone, may have patchy data.
- Writes in English or Pidgin, sometimes mixed.
- Wants a time, not a queue.

Doctor
- Short on time, reads quickly.
- Wants the dangerous cases first and wants to stay in control of every reply.

Visitor in an emergency
- Has no account and no time. Needs one tap to useful information.

Judges and investors (secondary audience for the demo)
- Want a clear user, a clear payer and real evidence.

## 5. User stories

Patient
- As a patient, I can sign up and log in with email and password.
- As a patient, I can send a complaint in English or Pidgin and attach a photo.
- As a patient, I can see my doctor's reply.
- As a patient, I can book a slot and see my upcoming and past bookings.
- As a patient, I can see a countdown for my 5 minute grace period.
- As a patient, I can reach the Emergency page from any screen.

Doctor
- As a doctor, I can log in with an account the team created for me.
- As a doctor, I can see incoming cases sorted red, amber, green.
- As a doctor, I can read and edit the Gemma 4 intake before replying.
- As a doctor, I can reply with advice, more questions, a drug suggestion, or "come in".
- As a doctor, I can see my schedule for the day.
- As a doctor, I can switch "Available now" on and off.

Visitor
- As a visitor, I can open the Emergency page without logging in.
- As a visitor, I see the national emergency number first.
- As a visitor, I can tap Call on a doctor who is available now.

## 6. Functional requirements

Authentication
- FR-1: Email and password login through Supabase Auth for patients and doctors.
- FR-2: A profiles table holds the role: patient or doctor. New sign-ups are patients.
- FR-3: Doctor accounts are created by hand in the Supabase dashboard. There is no public path to the doctor role.
- FR-4: After login the user is sent to /patient or /doctor by role.

Complaint and intake
- FR-5: The patient can submit complaint text and an optional photo.
- FR-6: An Edge Function calls Gemma 4 and returns structured JSON with the fields in architecture.md.
- FR-7: The system prompt forbids diagnosis and drug advice to the patient.
- FR-8: The prompt includes guideline examples with sources.
- FR-9: If urgency is red, the patient screen shows the Emergency button in a prominent banner. The AI only suggests this and never tells a patient they are fine.

Doctor review
- FR-10: The doctor sees only cases assigned to them, sorted by urgency.
- FR-11: The doctor can edit any intake field before replying.
- FR-12: A reply has a type (advice, more_questions, drug_suggestion, come_in) and free text.
- FR-13: Nothing reaches the patient until the doctor sends a reply.

Scheduling
- FR-14: Slot length equals estimated minutes rounded up to a 5 minute block.
- FR-15: Slots come from the doctor's working hours and exclude booked slots.
- FR-16: The default is auto-assignment to the next available doctor. Patient-chosen doctor is a stretch goal.
- FR-17: Red cases are offered the earliest free slot.
- FR-18: Each booking has a 5 minute grace period from the start time. After it, an unattended booking is marked missed and its slot is released.
- FR-19: A patient with a missed booking can request a new slot.

Emergency
- FR-20: /emergency needs no login.
- FR-21: The page shows the national emergency number at the top (verify the number before it goes live).
- FR-22: The page lists only doctors with is_available true and a heartbeat in the last 10 minutes.
- FR-23: Each listed doctor has a Call button using a tel: link.
- FR-24: Doctor phone numbers are never readable from the browser except through the emergency function, and only for available doctors.
- FR-25: The page states that CareBridge is not an emergency service.

Proof page
- FR-26: /proof shows holdout results for plain prompt versus grounded prompt, with limitations.

## 7. Non-functional requirements

Security and privacy
- RLS is on for every table.
- Secret keys exist only in Edge Function secrets.
- Photos are stored in a private bucket with owner-only access.
- No real patient data in the database, repo or any third-party tool.

Reliability
- If Gemma 4 fails or times out, the patient sees a clear message and the complaint is still saved for the doctor without an intake.
- If the Gemini API rate limit is hit, the function returns a readable error. Test about 20 requests in a row before the demo.

Performance
- The intake call should feel fast enough for a live demo. Test thinking level high against minimal and pick by accuracy and speed. We have no speed target until we measure.

Language
- English and Pidgin input. A native speaker or the presenters check the Pidgin examples.

## 8. Success measures

Hackathon
- Full flow works end to end on the deployed link: sign up, complaint, intake, doctor reply, booking, emergency call.
- Holdout test completed with real numbers reported.
- Public GitHub repo with MIT license and a complete README.
- Submitted on the Organizer HQ portal before 9:00 PM WAT.

Evaluation metrics on the holdout set
- Urgency accuracy: share of cases where predicted urgency matches the guideline label.
- Danger sign recall: share of labeled danger signs the model found.
- Estimated minutes: how close the estimate is to the labeled value. We define the labeled value ourselves, so we state that in the results.

We set no target numbers in advance. We report what we get.

## 9. Risks

- Adaption credits (about 50) may not cover a run. Mitigation: raw examples go into the same table, and the product works without Adaption.
- Gemini API free tier limits may block the demo. Mitigation: early load test and a backup video.
- Scope is large for about four build hours. Mitigation: the cut list in plan.md and auto-assignment for booking.
- Gemma 4 may misjudge urgency. Mitigation: the doctor reviews every case, the system prompt is strict, and we report misses.
- Public emergency page could expose doctor numbers. Mitigation: function-only access, available doctors only, teammates' phones for the demo.
- The CareBridge name may clash with existing companies. Not a blocker today. Check before any real launch.

## 10. Open questions

- Does the team agree on this scope?
- Will the 20 row Adaption test fit in 50 credits? Unknown until the Summary screen shows the cost.
- Should the patient pick the doctor? Default is no.
- Exact Gemma 4 model name shown in AI Studio for our key.
- Verify the national emergency number before it appears on screen.
