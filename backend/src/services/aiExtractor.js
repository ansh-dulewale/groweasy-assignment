const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// ─── Constants ────────────────────────────────────────────────────────────────

const BATCH_SIZE = 20;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

const ALLOWED_CRM_STATUSES = [
  'GOOD_LEAD_FOLLOW_UP',
  'DID_NOT_CONNECT',
  'BAD_LEAD',
  'SALE_DONE',
];

const ALLOWED_DATA_SOURCES = [
  'leads_on_demand',
  'meridian_tower',
  'eden_park',
  'varah_swamy',
  'sarjapur_plots',
];

// ─── Prompt Builder ───────────────────────────────────────────────────────────

/**
 * Builds the AI prompt for a batch of CSV records.
 * The prompt is carefully engineered to enforce all CRM extraction rules.
 *
 * @param {object[]} records - An array of raw CSV record objects.
 * @param {string[]} headers - The CSV column headers.
 * @returns {string} - The complete prompt string.
 */
const buildPrompt = (records, headers) => {
  return `
You are an expert CRM data extraction assistant for GrowEasy, a real estate company.
Your job is to analyze raw CSV records and intelligently map them to the GrowEasy CRM format.

## CSV COLUMN HEADERS (the raw data uses these column names):
${headers.join(', ')}

## TARGET CRM FIELDS:
- created_at: Lead creation date. MUST be a value parseable by JavaScript's new Date(). If unknown or unparseable, use null.
- name: Full lead name (first + last if separate).
- email: Primary email address only.
- country_code: Country calling code (e.g., +91, +1). Include the '+' sign.
- mobile_without_country_code: Mobile number without country code (digits only).
- company: Company or organization name.
- city: City name.
- state: State or province name.
- country: Country name (not code).
- lead_owner: The sales agent/owner email or name.
- crm_status: MUST be exactly one of: ${ALLOWED_CRM_STATUSES.join(', ')}. Infer intelligently from any status/disposition fields. If truly unclear, use "GOOD_LEAD_FOLLOW_UP".
- crm_note: Free-text field. Compile: remarks, follow-up notes, extra phone numbers, extra emails, any useful info not fitting other fields.
- data_source: MUST be exactly one of: ${ALLOWED_DATA_SOURCES.join(', ')}. Match intelligently based on source/campaign/project name. If no confident match, use null.
- possession_time: Property possession timeline (e.g., "immediate", "6 months", "Q3 2026").
- description: Any additional descriptive information.

## EXTRACTION RULES (follow strictly):
1. SKIP any record that has NEITHER a valid email address NOR a mobile number. Do not include it in output.
2. If multiple emails exist, use the FIRST as the primary "email". Append all extras to "crm_note" like: "Additional emails: extra@example.com".
3. If multiple phone/mobile numbers exist, use the FIRST as the primary mobile. Append all extras to "crm_note" like: "Additional phones: 9999999999".
4. Strip country code from the mobile number for "mobile_without_country_code". Store only digits.
5. crm_status MUST be one of the four allowed values only. Never invent other values.
6. data_source MUST be one of the five allowed values only. If not confidently matched, leave as null.
7. created_at must be a JavaScript Date-parseable string (ISO 8601 preferred). If only a date exists, format as "YYYY-MM-DD". If unparseable, use null.
8. Be intelligent: columns like "Full Name", "Contact Name", "Lead Name" all map to "name". Columns like "Phone", "Cell", "Mobile", "Contact Number" map to mobile fields.
9. For crm_note, combine all relevant notes, remarks, comments, and overflow data into one coherent string.
10. If a field has no data and cannot be inferred, use null (not empty string).

## RAW CSV RECORDS TO PROCESS:
${JSON.stringify(records, null, 2)}

## OUTPUT FORMAT:
Return a single valid JSON object with this exact structure:
{
  "extracted": [
    {
      "created_at": "...",
      "name": "...",
      "email": "...",
      "country_code": "...",
      "mobile_without_country_code": "...",
      "company": "...",
      "city": "...",
      "state": "...",
      "country": "...",
      "lead_owner": "...",
      "crm_status": "...",
      "crm_note": "...",
      "data_source": "...",
      "possession_time": "...",
      "description": "..."
    }
  ],
  "skipped": [
    {
      "reason": "No email or mobile number",
      "raw": { ...original record object... }
    }
  ]
}

IMPORTANT:
- Output ONLY the raw JSON object. No markdown, no code fences, no explanation.
- Every field in extracted records must be present (use null if not available).
- Do NOT fabricate data. Only extract what is reasonably inferable from the raw record.
`;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calls the Gemini API with retry logic for transient failures.
 *
 * @param {string} prompt - The prompt to send.
 * @param {number} attempt - Current attempt number (for recursion).
 * @returns {object} - Parsed JSON response from Gemini.
 */
const callGeminiWithRetry = async (prompt, attempt = 1) => {
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Strip any accidental markdown code fences Gemini might add
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      console.warn(`[AI] Attempt ${attempt} failed, retrying in ${RETRY_DELAY_MS}ms...`, err.message);
      await sleep(RETRY_DELAY_MS * attempt); // exponential-ish backoff
      return callGeminiWithRetry(prompt, attempt + 1);
    }
    throw new Error(`AI extraction failed after ${MAX_RETRIES} attempts: ${err.message}`);
  }
};

// ─── Main Extraction Function ─────────────────────────────────────────────────

/**
 * Processes CSV records in batches through the Gemini AI model.
 * Aggregates results across all batches.
 *
 * @param {object[]} records - All parsed CSV records.
 * @param {string[]} headers - The CSV column headers.
 * @returns {{ extracted: object[], skipped: object[], totalBatches: number }}
 */
const extractCRMData = async (records, headers) => {
  const allExtracted = [];
  const allSkipped = [];

  // Split records into batches
  const batches = [];
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    batches.push(records.slice(i, i + BATCH_SIZE));
  }

  console.log(`[AI] Processing ${records.length} records in ${batches.length} batch(es) of up to ${BATCH_SIZE}`);

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    console.log(`[AI] Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} records)`);

    const prompt = buildPrompt(batch, headers);

    let batchResult;
    try {
      batchResult = await callGeminiWithRetry(prompt);
    } catch (err) {
      console.error(`[AI] Batch ${batchIndex + 1} permanently failed:`, err.message);
      // Mark all records in this batch as skipped
      batch.forEach((record) => {
        allSkipped.push({ reason: `AI processing error: ${err.message}`, raw: record });
      });
      continue;
    }

    if (Array.isArray(batchResult.extracted)) {
      allExtracted.push(...batchResult.extracted);
    }
    if (Array.isArray(batchResult.skipped)) {
      allSkipped.push(...batchResult.skipped);
    }
  }

  return {
    extracted: allExtracted,
    skipped: allSkipped,
    totalBatches: batches.length,
  };
};

module.exports = { extractCRMData };
