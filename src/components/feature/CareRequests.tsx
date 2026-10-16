import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';

type Profile = { id: string; full_name: string; specialty?: string | null; hospital?: string | null };

type CareRequest = {
  id: string; patient_id: string; provider_id: string | null; complaint: string; ai_summary: string | null;
  ai_questions: string[]; ai_answers: Record<string, string>; urgency: 'routine' | 'priority' | 'urgent';
  status: string; clinician_response: string | null; clinician_action: string | null; created_at: string;
};

const input = 'w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary';
const primary = 'inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60';

function urgencyClass(urgency: CareRequest['urgency']) {
  return urgency === 'urgent' ? 'bg-destructive-soft text-destructive' : urgency === 'priority' ? 'bg-warning-soft text-warning' : 'bg-accent text-primary';
}

export function PatientCareRequests({ profile }: { profile: Profile }) {
  const [requests, setRequests] = useState<CareRequest[]>([]);
  const [complaint, setComplaint] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [providers, setProviders] = useState<Profile[]>([]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [bmoniUserId, setBmoniUserId] = useState('');
  const [bmoniWalletId, setBmoniWalletId] = useState('');
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  const load = async () => {
    const [requestResult, providersResult] = await Promise.all([
      supabase.from('care_requests').select('*').eq('patient_id', profile.id).order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name, specialty, hospital').eq('role', 'provider').eq('accepting_patients', true),
    ]);
    if (!requestResult.error) setRequests((requestResult.data ?? []) as CareRequest[]);
    if (!providersResult.error) {
      const listed = (providersResult.data ?? []) as Profile[];
      setProviders(listed);
      if (!selectedProvider && listed[0]) setSelectedProvider(listed[0].id);
    }
  };
  useEffect(() => { void load(); }, [profile.id]);

  const beginTriage = async () => {
    setError(null); setNotice(null);
    if (complaint.trim().length < 10) return setError('Please describe your concern in at least 10 characters.');
    setSaving(true);
    try {
      const response = await fetch('/api/triage', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ complaint }) });
      const payload = await response.json() as { questions?: string[]; error?: string };
      if (!response.ok) throw new Error(payload.error ?? 'The triage assistant is unavailable.');
      setQuestions((payload.questions ?? []).slice(0, 4));
      if ((payload.questions ?? []).length === 0) await submitRequest([]);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not start triage.'); }
    finally { setSaving(false); }
  };

  const submitRequest = async (questionsToSave = questions) => {
    if (!selectedProvider) return setError('Choose a clinician first.');
    setSaving(true); setError(null);
    const triage = await fetch('/api/triage', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ complaint, answers }) })
      .then(async (res) => ({ ok: res.ok, payload: await res.json() as { summary?: string; urgency?: CareRequest['urgency']; error?: string } }))
      .catch(() => ({ ok: false, payload: { error: 'Unable to prepare your clinician summary.' } }));
    if (!triage.ok) { setSaving(false); return setError(triage.payload.error ?? 'Unable to prepare your clinician summary.'); }
    const { error: saveError } = await supabase.from('care_requests').insert({ patient_id: profile.id, provider_id: selectedProvider, complaint: complaint.trim(), ai_summary: triage.payload.summary ?? null, ai_questions: questionsToSave, ai_answers: answers, urgency: triage.payload.urgency ?? 'routine' });
    setSaving(false);
    if (saveError) return setError(saveError.message.includes('care_requests') ? 'Care requests are not enabled yet. Apply the supplied database migration first.' : saveError.message);
    setComplaint(''); setQuestions([]); setAnswers({}); setNotice('Sent securely to your clinician for review.'); void load();
  };

  const startSubscription = async () => {
    setPaymentNotice(null);
    const response = await fetch('/api/bmoni/subscribe', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId: bmoniUserId, walletId: bmoniWalletId }) });
    const data = await response.json() as { proposalId?: string; message?: string; error?: string };
    if (!response.ok || !data.proposalId) return setPaymentNotice(data.error ?? 'Unable to start BMONI payment.');
    await supabase.from('care_subscriptions').upsert({ patient_id: profile.id, plan_code: 'carelink-monthly', status: 'pending', provider: 'bmoni', provider_reference: data.proposalId }, { onConflict: 'patient_id' });
    setPaymentNotice(data.message ?? 'Payment proposal created.');
  };
  return <div className="space-y-6">
    <div><h1 className="font-heading text-xl font-bold text-foreground md:text-2xl">Ask for care</h1><p className="mt-0.5 text-sm text-muted-foreground">Share a concern. The CareLink assistant gathers context for your clinician; it does not diagnose or replace emergency care.</p></div>
    <div className="rounded-lg border border-primary/20 bg-accent/45 p-4 text-sm text-foreground"><i className="ri-information-line mr-2 text-primary" />For severe symptoms, chest pain, trouble breathing, stroke signs, or thoughts of self-harm, contact emergency services now — do not wait for a reply here.</div>
    <section className="rounded-lg border border-border bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-heading text-base font-bold">CareLink monthly care</h2><p className="mt-1 text-sm text-muted-foreground">Pay securely from your BMONI smart wallet. You will approve and sign the transfer in BMONI.</p></div><span className="rounded-md bg-accent px-2.5 py-1 text-xs font-semibold text-primary">BMONI</span></div><div className="mt-4 grid gap-3 md:grid-cols-2"><input className={input} placeholder="Your BMONI user ID" value={bmoniUserId} onChange={(e) => setBmoniUserId(e.target.value)} /><input className={input} placeholder="Your BMONI smart-wallet ID" value={bmoniWalletId} onChange={(e) => setBmoniWalletId(e.target.value)} /></div><button type="button" className={`${primary} mt-3`} onClick={() => void startSubscription()} disabled={!bmoniUserId || !bmoniWalletId}>Create BMONI payment</button>{paymentNotice && <p className="mt-3 text-sm text-muted-foreground">{paymentNotice}</p>}</section>
    <form onSubmit={(e: FormEvent) => { e.preventDefault(); void (questions.length ? submitRequest() : beginTriage()); }} className="rounded-lg border border-border bg-card p-5 space-y-4">
      <div><label className="mb-1.5 block text-sm font-semibold">What is bothering you?</label><textarea className={`${input} min-h-28 resize-y`} value={complaint} onChange={(e) => setComplaint(e.target.value)} placeholder="Describe symptoms, when they started, and anything that makes them better or worse." /></div>
      <div><label className="mb-1.5 block text-sm font-semibold">Send to</label><select className={input} value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)}><option value="">Choose a clinician</option>{providers.map((p) => <option key={p.id} value={p.id}>{p.full_name}{p.specialty ? ` — ${p.specialty}` : ''}</option>)}</select></div>
      {questions.length > 0 && <div className="space-y-3 border-t border-border pt-4"><p className="text-sm font-semibold">A few quick questions for your clinician</p>{questions.map((question) => <label key={question} className="block text-sm"><span>{question}</span><input className={`${input} mt-1.5`} value={answers[question] ?? ''} onChange={(e) => setAnswers((previous) => ({ ...previous, [question]: e.target.value }))} required /></label>)}</div>}
      {error && <p className="text-sm text-destructive">{error}</p>}{notice && <p className="text-sm text-success">{notice}</p>}
      <button className={primary} disabled={saving || !selectedProvider}>{saving ? 'Preparing…' : questions.length ? 'Send to clinician' : 'Continue with CareLink assistant'} <i className="ri-arrow-right-line" /></button>
    </form>
    <div className="space-y-3"><h2 className="font-heading text-base font-bold">Your requests</h2>{requests.length === 0 ? <p className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">No care requests yet.</p> : requests.map((request) => <article key={request.id} className="rounded-lg border border-border bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-2"><p className="font-semibold">{request.complaint}</p><span className={`rounded-md px-2 py-1 text-xs font-semibold ${urgencyClass(request.urgency)}`}>{request.urgency}</span></div><p className="mt-2 text-sm text-muted-foreground">{request.ai_summary || 'Awaiting clinician review.'}</p>{request.clinician_response && <div className="mt-3 rounded-md bg-muted p-3 text-sm"><strong>Clinician response:</strong> {request.clinician_response}</div>}<p className="mt-3 text-xs font-medium text-muted-foreground">{request.status.replaceAll('_', ' ')} · {new Date(request.created_at).toLocaleDateString()}</p></article>)}</div>
  </div>;
}

export function ProviderCareInbox({ profile }: { profile: Profile }) {
  const [requests, setRequests] = useState<CareRequest[]>([]); const [reply, setReply] = useState<Record<string, string>>({}); const [action, setAction] = useState<Record<string, string>>({}); const [slots, setSlots] = useState<Record<string, { date: string; time: string }>>({}); const [error, setError] = useState<string | null>(null);
  const load = async () => { const result = await supabase.from('care_requests').select('*').eq('provider_id', profile.id).order('created_at'); if (result.error) setError(result.error.message.includes('care_requests') ? 'Apply the CareLink care-request migration to activate this inbox.' : result.error.message); else setRequests((result.data ?? []) as CareRequest[]); };
  useEffect(() => { void load(); }, [profile.id]);
  const respond = async (request: CareRequest) => {
    const clinicianAction = action[request.id] || 'ask_questions';
    let appointmentId: string | null = null;
    if (clinicianAction === 'physical_exam') {
      const slot = slots[request.id];
      if (!slot?.date || !slot.time) return setError('Choose an available examination date and time.');
      const clash = await supabase.from('appointments').select('id').eq('provider_id', profile.id).eq('date', slot.date).eq('time', slot.time).neq('status', 'cancelled').maybeSingle();
      if (clash.data) return setError('That time is no longer available. Please choose another slot.');
      const start = new Date(`${slot.date}T${slot.time}:00`);
      const { data: appointment, error: appointmentError } = await supabase.from('appointments').insert({ patient_id: request.patient_id, provider_id: profile.id, doctor_name: profile.full_name, specialty: profile.specialty ?? 'Healthcare Provider', clinic: profile.hospital ?? 'CareLink clinic', type: 'In-person', date: slot.date, time: start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), status: 'upcoming', reason: 'Physical examination requested after CareLink review', check_in_deadline: new Date(start.getTime() + 5 * 60_000).toISOString() }).select('id').single();
      if (appointmentError) return setError(appointmentError.message);
      appointmentId = appointment.id;
    }
    const { error: updateError } = await supabase.from('care_requests').update({ clinician_response: reply[request.id] ?? '', clinician_action: clinicianAction, status: clinicianAction === 'physical_exam' ? 'appointment_required' : 'clinician_reviewed', appointment_id: appointmentId, updated_at: new Date().toISOString() }).eq('id', request.id);
    if (updateError) setError(updateError.message); else { setError(null); void load(); }
  };
  return <div className="space-y-5"><div><h1 className="font-heading text-xl font-bold md:text-2xl">Care request inbox</h1><p className="mt-0.5 text-sm text-muted-foreground">Review AI-prepared context, then make the clinical decision yourself.</p></div>{error && <p className="rounded-md bg-destructive-soft p-3 text-sm text-destructive">{error}</p>}{requests.length === 0 && !error && <p className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">No care requests assigned to you.</p>}{requests.map((request) => <article key={request.id} className="rounded-lg border border-border bg-card p-5 space-y-3"><div className="flex justify-between gap-3"><div><p className="font-semibold">Patient request</p><p className="mt-1 text-sm text-muted-foreground">{request.complaint}</p></div><span className={`h-fit rounded-md px-2 py-1 text-xs font-semibold ${urgencyClass(request.urgency)}`}>{request.urgency}</span></div>{request.ai_summary && <div className="rounded-md bg-accent/50 p-3 text-sm"><strong>AI context:</strong> {request.ai_summary}</div>}{Object.entries(request.ai_answers ?? {}).length > 0 && <div className="text-sm">{Object.entries(request.ai_answers).map(([q,a]) => <p key={q} className="mb-1"><span className="text-muted-foreground">{q}</span> {a}</p>)}</div>}{!request.clinician_response ? <div className="space-y-3"><div className="grid gap-3 md:grid-cols-[1fr_190px]"><textarea className={`${input} min-h-20`} placeholder="Your response to the patient" value={reply[request.id] ?? ''} onChange={(e) => setReply((all) => ({ ...all, [request.id]: e.target.value }))}/><select className={input} value={action[request.id] ?? 'ask_questions'} onChange={(e) => setAction((all) => ({ ...all, [request.id]: e.target.value }))}><option value="ask_questions">Ask more questions</option><option value="self_care">Self-care guidance</option><option value="medication">Medication advice</option><option value="physical_exam">Physical examination</option><option value="emergency_referral">Emergency referral</option></select></div>{(action[request.id] ?? 'ask_questions') === 'physical_exam' && <div className="grid gap-3 rounded-md bg-accent/40 p-3 md:grid-cols-2"><label className="text-sm font-medium">Available date<input type="date" className={`${input} mt-1`} value={slots[request.id]?.date ?? ''} onChange={(e) => setSlots((all) => ({ ...all, [request.id]: { date: e.target.value, time: all[request.id]?.time ?? '' } }))} /></label><label className="text-sm font-medium">Available time<input type="time" className={`${input} mt-1`} value={slots[request.id]?.time ?? ''} onChange={(e) => setSlots((all) => ({ ...all, [request.id]: { date: all[request.id]?.date ?? '', time: e.target.value } }))} /></label><p className="text-xs text-muted-foreground md:col-span-2">The appointment has a five-minute check-in grace period. If missed, it is marked for rescheduling.</p></div>}<button className={primary} disabled={!(reply[request.id] ?? '').trim()} onClick={() => void respond(request)}>Send response</button></div> : <div className="rounded-md bg-muted p-3 text-sm"><strong>Your response:</strong> {request.clinician_response}</div>}</article>)}</div>;
}
