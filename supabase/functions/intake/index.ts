import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const MODEL = "gemma-4-26b-a4b-it";
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const PHOTO_BUCKET = "photos";
const GEMINI_TIMEOUT_MS = 30_000;

const SYSTEM_INSTRUCTION = `You help a doctor prepare for a visit. You give decision support only. Never diagnose. Never tell the patient what drug to take. Use only the guideline passages provided in the examples. If the complaint is not covered, set urgency to amber and add a question for the doctor. If any danger sign is present, set urgency to red. The complaint may be in English or Nigerian Pidgin. Return only JSON with these fields: danger_signs, urgency, visit_type, estimated_minutes, questions_for_doctor, text_from_photo, guideline_source.`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

type Intake = {
  danger_signs: string[];
  urgency: "red" | "amber" | "green";
  visit_type:
    | "in_person_today"
    | "in_person_scheduled"
    | "remote_advice"
    | "needs_more_info";
  estimated_minutes: number;
  questions_for_doctor: string[];
  text_from_photo: string | null;
  guideline_source: string | null;
};

type CaseRow = {
  id: string;
  patient_id: string;
  complaint_text: string;
  photo_path: string | null;
  status: string | null;
};

type ExampleRow = {
  complaint: string;
  guideline_passage: string;
  guideline_source: string;
  intake: unknown;
};

function response(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function errorResponse(message: string, status: number): Response {
  return response({ ok: false, error: message }, status);
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      .test(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function validateIntake(value: unknown): value is Intake {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const intake = value as Record<string, unknown>;
  return isStringArray(intake.danger_signs) &&
    (intake.urgency === "red" || intake.urgency === "amber" ||
      intake.urgency === "green") &&
    (intake.visit_type === "in_person_today" ||
      intake.visit_type === "in_person_scheduled" ||
      intake.visit_type === "remote_advice" ||
      intake.visit_type === "needs_more_info") &&
    typeof intake.estimated_minutes === "number" &&
    Number.isInteger(intake.estimated_minutes) &&
    intake.estimated_minutes > 0 &&
    isStringArray(intake.questions_for_doctor) &&
    (typeof intake.text_from_photo === "string" ||
      intake.text_from_photo === null) &&
    (typeof intake.guideline_source === "string" ||
      intake.guideline_source === null);
}

function stripMarkdownFences(text: string): string {
  return text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
    .trim();
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(index, Math.min(index + chunkSize, bytes.length)),
    );
  }
  return btoa(binary);
}

function mimeTypeForPath(path: string): string {
  const extension = path.split("?")[0].split(".").pop()?.toLowerCase();
  const types: Record<string, string> = {
    avif: "image/avif",
    gif: "image/gif",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };
  return types[extension ?? ""] ?? "application/octet-stream";
}

function modelText(payload: unknown): string | null {
  const candidate = (payload as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: unknown }> } }>;
  })?.candidates?.[0];
  const parts = candidate?.content?.parts;
  if (!Array.isArray(parts)) return null;
  const text = parts.find((part) => typeof part.text === "string")?.text;
  return typeof text === "string" ? text : null;
}

function promptFor(caseRow: CaseRow, examples: ExampleRow[]): string {
  const grounding = examples.map((example, index) =>
    `Grounding example ${index + 1}:
Complaint: ${example.complaint}
Guideline passage: ${example.guideline_passage}
Guideline source: ${example.guideline_source}
Expected JSON: ${JSON.stringify(example.intake)}`
  ).join("\n\n");

  // Gemma does not use a separate systemInstruction field here; system text starts the user content.
  return `${SYSTEM_INSTRUCTION}

${grounding}

Patient complaint:
${caseRow.complaint_text}

Return only the requested JSON object.`;
}

async function callGemini(
  prompt: string,
  image: { data: string; mimeType: string } | null,
  apiKey: string,
): Promise<unknown> {
  const parts: Array<Record<string, unknown>> = [{ text: prompt }];
  if (image) parts.push({ inlineData: image });

  // TODO: Confirm the exact Gemini thinking-level request field before enabling THINKING_LEVEL.
  const thinkingLevel = Deno.env.get("THINKING_LEVEL");
  void thinkingLevel;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  try {
    const result = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({ contents: [{ role: "user", parts }] }),
      signal: controller.signal,
    });
    if (result.status === 429) {
      throw new Error("GEMINI_RATE_LIMIT");
    }
    if (!result.ok) {
      console.log("Gemini request failed", result.status);
      throw new Error("GEMINI_REQUEST_FAILED");
    }
    return await result.json();
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("GEMINI_TIMEOUT");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return response({ ok: true });
  if (request.method !== "POST") {
    return errorResponse("Only POST requests are supported.", 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiKey) {
    return errorResponse("Server is missing GEMINI_API_KEY", 500);
  }
  if (!supabaseUrl || !serviceRoleKey) {
    console.log("Required server configuration is missing");
    return errorResponse("The intake service is not configured.", 500);
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return errorResponse("Authorization header is required.", 401);
  }
  const token = authorization.slice("Bearer ".length).trim();
  if (!token) return errorResponse("Authorization token is required.", 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON.", 400);
  }
  const caseId = (body as { case_id?: unknown })?.case_id;
  if (!isUuid(caseId)) return errorResponse("case_id must be a valid UUID.", 400);

  const serviceClient = createClient(supabaseUrl, serviceRoleKey);
  let patientId: string | null = null;
  if (token !== serviceRoleKey) {
    const callerClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? serviceRoleKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data, error } = await callerClient.auth.getUser();
    if (error || !data.user) return errorResponse("Invalid authentication token.", 401);
    patientId = data.user.id;
  }

  const { data: caseRow, error: caseError } = await serviceClient
    .from("cases")
    .select("id, patient_id, complaint_text, photo_path, status")
    .eq("id", caseId)
    .maybeSingle<CaseRow>();
  if (caseError) {
    console.log("Case lookup failed", caseError.code);
    return errorResponse("Could not load the case.", 500);
  }
  if (!caseRow) return errorResponse("Case not found.", 404);
  if (patientId && caseRow.patient_id !== patientId) {
    return errorResponse("You are not allowed to access this case.", 403);
  }
  console.log("Intake started", caseId);

  const { data: examples, error: examplesError } = await serviceClient
    .from("examples")
    .select("complaint, guideline_passage, guideline_source, intake")
    .eq("is_holdout", false);
  if (examplesError) {
    console.log("Grounding example lookup failed", examplesError.code);
    return errorResponse("Could not load grounding examples.", 500);
  }

  let image: { data: string; mimeType: string } | null = null;
  if (caseRow.photo_path) {
    const { data: file, error: downloadError } = await serviceClient.storage
      .from(PHOTO_BUCKET)
      .download(caseRow.photo_path);
    if (downloadError || !file) {
      console.log("Photo download failed", caseId);
      return errorResponse("Could not load the case photo.", 502);
    }
    image = {
      data: bytesToBase64(new Uint8Array(await file.arrayBuffer())),
      mimeType: mimeTypeForPath(caseRow.photo_path),
    };
    console.log("Case photo attached", caseId, image.mimeType);
  }

  const prompt = promptFor(caseRow, (examples ?? []) as ExampleRow[]);
  let intake: Intake | null = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const payload = await callGemini(prompt, image, geminiKey);
      const text = modelText(payload);
      if (!text) throw new Error("MODEL_RESPONSE_NOT_TEXT");
      const parsed = JSON.parse(stripMarkdownFences(text));
      if (!validateIntake(parsed)) throw new Error("MODEL_RESPONSE_INVALID");
      intake = parsed;
      break;
    } catch (error) {
      if (error instanceof Error &&
        ["GEMINI_RATE_LIMIT", "GEMINI_TIMEOUT"].includes(error.message)) {
        console.log("Gemini temporarily unavailable", error.message);
        return errorResponse(
          error.message === "GEMINI_RATE_LIMIT"
            ? "The intake model is rate-limited. Please try again shortly."
            : "The intake model timed out. Please try again shortly.",
          503,
        );
      }
      console.log("Gemini response validation failed", attempt);
      if (attempt === 2) {
        return errorResponse("The intake model returned invalid JSON twice.", 502);
      }
    }
  }

  if (!intake) return errorResponse("The intake could not be created.", 502);
  const update: Record<string, unknown> = {
    intake,
    urgency: intake.urgency,
    estimated_minutes: intake.estimated_minutes,
  };
  if (caseRow.status === null) update.status = "new";

  const { error: updateError } = await serviceClient.from("cases").update(update)
    .eq("id", caseId);
  if (updateError) {
    console.log("Case update failed", updateError.code);
    return errorResponse("Could not save the intake.", 500);
  }
  console.log("Intake saved", caseId, intake.urgency);
  return response({ ok: true, intake });
});
