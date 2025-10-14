/* eslint-disable @typescript-eslint/no-var-requires */
// app/api/admin/upload/route.ts

import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import OpenAI from "openai";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
// Dynamic import to avoid ESM/CJS interop issues in Next.js server runtime
let pdfParse: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  pdfParse = require("pdf-parse");
} catch {
  // no-op; will throw at callsite if unavailable
}

export const runtime = "nodejs";

/**
 * Keep the schema permissive so the model isn’t forced to supply every field.
 * We only require the fields we absolutely need to connect rows downstream.
 */
// ---- EXACT schema for public.staging_results_v2 ----
const RowSchema = {
  type: "object",
  properties: {
    // required
    meet_name:   { type: "string" },
    start_date:  { type: "string", description: "YYYY-MM-DD" },

    // optional meet metadata
    end_date:    { type: "string", nullable: true, description: "YYYY-MM-DD" },
    city:        { type: "string", nullable: true },
    state_code:  { type: "string", nullable: true },
    course:      { type: "string", nullable: true },           // SC/LC or text
    location:    { type: "string", nullable: true },

    // event
    event_number:{ type: "integer", nullable: true },
    stroke:      { type: "string", nullable: true },
    distance:    { type: "string", nullable: true },           // TEXT in table
    gender:      { type: "string", nullable: true },
    age_years:   { type: "string", nullable: true },           // TEXT in table

    // swimmer
    given_name:        { type: "string", nullable: true },
    family_name:       { type: "string", nullable: true },
    swimmer_full_name: { type: "string", nullable: true },
    club_name:         { type: "string", nullable: true },

    // heat/lane/etc. (all TEXT in table)
    round:     { type: "string", nullable: true },
    heat:      { type: "string", nullable: true },
    lane:      { type: "string", nullable: true },
    place:     { type: "string", nullable: true },
    status:    { type: "string", nullable: true },

    // times
    time_text: { type: "string", nullable: true },
    time_ms:   { type: "string", nullable: true },             // TEXT in table

    // raced date
    raced_at:  { type: "string", nullable: true, description: "YYYY-MM-DD" },

    // optional label the uploader can set; imported_at is DB default
    ingest_label: { type: "string", nullable: true }
  },
  required: [
    "meet_name", "start_date", "end_date", "city", "state_code", "course", "location",
    "event_number", "stroke", "distance", "gender", "age_years",
    "given_name", "family_name", "swimmer_full_name", "club_name",
    "round", "heat", "lane", "place", "status",
    "time_text", "time_ms", "raced_at", "ingest_label"
  ],
  additionalProperties: false
} as const;

/** Responses API needs an object at the top level */
const EnvelopeSchema = {
  name: "MeetRowsEnvelope",
  schema: {
    type: "object",
    properties: {
      rows: { type: "array", items: RowSchema },
    },
    required: ["rows"],
    additionalProperties: false,
  },
} as const;

async function ensureBucketExists(bucket: string) {
  const { data: list, error } = await supabaseAdmin.storage.listBuckets();
  if (error) throw Object.assign(new Error(error.message), { stage: "bucket-list" });
  const exists = list?.some((b) => b.name === bucket);
  if (!exists) {
    const { error: createErr } = await supabaseAdmin.storage.createBucket(bucket, {
      public: false,
      fileSizeLimit: 50 * 1024 * 1024, // 50MB
    });
    if (createErr) throw Object.assign(new Error(createErr.message), { stage: "bucket-create" });
  }
}

export async function POST(req: Request) {
  try {
    // 1) Parse form
    const form = await req.formData();
    const pdf        = form.get("pdf") as File | null;
    const meet_name  = String(form.get("meet_name")  || "");
    const start_date = String(form.get("start_date") || "");
    const end_date   = String(form.get("end_date")   || "");
    const location   = String(form.get("location")   || "");
    const course     = String(form.get("course")     || "");

    if (!pdf || !meet_name || !start_date) {
      return NextResponse.json(
        { stage: "validate", error: "Missing required fields (pdf, meet_name, start_date)" },
        { status: 400 }
      );
    }

    // 2) Upload to Storage (private bucket + signed URL)
    const bucket = "meet-pdfs";
    try {
      await ensureBucketExists(bucket);
    } catch (e: any) {
      console.error(e);
      return NextResponse.json({ stage: e.stage || "bucket", error: e.message }, { status: 500 });
    }

    const bytes = Buffer.from(await pdf.arrayBuffer());
    const key = `${Date.now()}_${pdf.name.replace(/\s+/g, "_")}`;
    
    // Extract text from PDF for AI processing
    let pdfText: string;
    try {
      const pdfData = await pdfParse(bytes);
      pdfText = pdfData.text;
      console.log(`Extracted ${pdfText.length} characters from PDF`);
    } catch (e: any) {
      console.error("PDF text extraction failed:", e);
      return NextResponse.json({ stage: "pdf-extract", error: e?.message || "PDF text extraction failed" }, { status: 500 });
    }

    // Still upload to storage for reference
    const { error: upErr } = await supabaseAdmin.storage.from(bucket).upload(key, bytes, {
      contentType: "application/pdf",
      upsert: false,
    });
    if (upErr) {
      console.error(upErr);
      return NextResponse.json({ stage: "upload", error: upErr.message }, { status: 500 });
    }

    // 3) Call OpenAI
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ stage: "openai", error: "OPENAI_API_KEY missing" }, { status: 500 });
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
You are given swim meet data (entry list or results). Extract ALL rows from the data as a JSON array.

For each row:
- Meet-level fields may be constant: meet_name, start_date, end_date?, location?, course?
- Event spec: distance_m (number from event like 50m|100m), stroke in {Freestyle,Backstroke,Breaststroke,Butterfly,Medley},
  gender in {Male,Female}, age_years (integer).
- Swimmer: given_name, family_name, club_name?
- Result: round? (Timed Final/Heat/Semi/Final), heat?, lane?, place?, status?, time_text? (e.g. 00:35.880), time_ms? (milliseconds),
  raced_at? (YYYY-MM-DD if present).

IMPORTANT: Extract ALL rows from the data, not just a sample. Look through the entire content for every swimmer/result entry.

Normalise:
- stroke → one of Freestyle/Backstroke/Breaststroke/Butterfly/Medley
- gender → Male/Female
- age_years → integer
- distance_m → integer (e.g., "100m" → 100)
If you cannot compute time_ms, set it to null and provide time_text.

Return a JSON object: { "rows": [ ... ] } matching the provided schema exactly.

SWIM MEET DATA:
${pdfText.slice(0, 8000)}  // Limit to first 8000 chars to avoid token limits
`;

    let resp: any;
    try {
      resp = await openai.responses.create({
        model: "gpt-4o-mini",
        input: [
          {
            role: "user",
            content: [{ type: "input_text", text: prompt }],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: EnvelopeSchema.name,
            schema: EnvelopeSchema.schema,
          },
        } as any,
      } as any);
    } catch (e: any) {
      console.error("OpenAI call failed:", e);
      return NextResponse.json({ stage: "openai", error: e?.message || "OpenAI request failed" }, { status: 502 });
    }

    // Responses API: get the JSON text from output_text
    const jsonText =
      resp?.output_text ??
      (resp?.output?.[0]?.type === "output_text" ? resp?.output?.[0]?.text : null);

    console.log("OpenAI response structure:", {
      hasOutputText: !!resp?.output_text,
      hasOutput: !!resp?.output,
      outputLength: resp?.output?.length,
      jsonTextLength: jsonText?.length
    });

    if (!jsonText) {
      console.error("OpenAI response (truncated):", JSON.stringify(resp).slice(0, 800));
      return NextResponse.json({ stage: "openai-parse", error: "Model did not return JSON text" }, { status: 502 });
    }

    console.log("JSON text from OpenAI:", jsonText.slice(0, 500));

    let rows: any[] = [];
    try {
      const parsed = JSON.parse(jsonText);
      console.log("Parsed JSON structure:", {
        hasRows: !!parsed?.rows,
        rowsIsArray: Array.isArray(parsed?.rows),
        rowsLength: parsed?.rows?.length,
        parsedKeys: Object.keys(parsed || {})
      });
      
      const extracted = parsed?.rows;
      if (!Array.isArray(extracted)) throw new Error("Envelope missing array 'rows'");
      rows = extracted;
      
      console.log(`Successfully extracted ${rows.length} rows from PDF`);
    } catch (e: any) {
      console.error("Bad JSON:", jsonText.slice(0, 800));
      return NextResponse.json({ stage: "json-parse", error: `Bad JSON from model: ${e.message}` }, { status: 502 });
    }

    // 4) Stage rows → staging_results_v2
    // IMPORTANT: your table uses `city` (not `location`) and `distance` (text).
    const staged = rows.map((r) => ({
      // meet - use form inputs as fallbacks
      meet_name:  r.meet_name ?? meet_name,
      start_date: r.start_date ?? start_date,
      end_date:   r.end_date ?? (end_date || null),
      city:       r.city ?? (location || null),  // Use form location as city fallback
      state_code: r.state_code ?? null,
      course:     r.course ?? (course || null),
      // Note: location column exists in staging_results_v2 but may not exist in meets_v2
      location:   r.location ?? (location || null),  // Use form location as fallback
    
      // event
      event_number: r.event_number ?? null,
      stroke:       r.stroke ?? null,
      distance:     r.distance ?? null,     // TEXT
      gender:       r.gender ?? null,
      age_years:    r.age_years ?? null,    // TEXT
    
      // swimmer
      given_name:        r.given_name ?? null,
      family_name:       r.family_name ?? null,
      swimmer_full_name: r.swimmer_full_name ?? null,
      club_name:         r.club_name ?? null,
    
      // race details
      round:     r.round ?? null,
      heat:      r.heat ?? null,            // TEXT
      lane:      r.lane ?? null,            // TEXT
      place:     r.place ?? null,           // TEXT
      status:    r.status ?? null,
    
      time_text: r.time_text ?? null,
      time_ms:   r.time_ms ?? null,         // TEXT
      raced_at:  r.raced_at ?? null,
    
      // optional label if you want to tag this ingest
      ingest_label: r.ingest_label ?? null,
    }));

    let inserted = 0;
    const CHUNK = 400;
    for (let i = 0; i < staged.length; i += CHUNK) {
      const slice = staged.slice(i, i + CHUNK);
      const { error } = await supabaseAdmin.from("staging_results_v2").insert(slice);
      if (error) {
        console.error(error);
        return NextResponse.json({ stage: "staging-insert", error: error.message }, { status: 500 });
      }
      inserted += slice.length;
    }

    // 5) Promote to v2 tables (run your SQL function)
    const { error: fnErr } = await supabaseAdmin.rpc("fn_upsert_meet_from_staging_v2", {
      p_meet_name: meet_name,
      p_start_date: start_date,
    });

    if (fnErr) {
      console.error(fnErr);
      return NextResponse.json(
        { stage: "promote", message: "Staged, upsert failed (run manually)", rows: inserted, error: fnErr.message },
        { status: 207 }
      );
    }

    return NextResponse.json({ stage: "done", message: "Staged & upserted", rows: inserted });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ stage: "unexpected", error: err?.message || "Unexpected error" }, { status: 500 });
  }
}