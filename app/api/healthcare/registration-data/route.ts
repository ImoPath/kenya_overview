import { NextRequest, NextResponse } from "next/server";
import { pgPool } from "@/lib/postgres";

const MAX_DATE_RANGE_DAYS = 92; // ~3 months

function parseDate(s: string): Date | null {
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function yyyyMmDd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDateParam = searchParams.get("start_date");
  const endDateParam = searchParams.get("end_date");
  const lastModifiedParam = searchParams.get("last_modified_date");

  const hasRange = startDateParam && endDateParam;
  const hasLastModified = !!lastModifiedParam?.trim();

  if (hasRange && hasLastModified) {
    return NextResponse.json(
      { error: "Provide either start_date+end_date OR last_modified_date, not both." },
      { status: 400 }
    );
  }

  if (!hasRange && !hasLastModified) {
    return NextResponse.json(
      { error: "Provide either start_date and end_date (YYYY-MM-DD), or last_modified_date (ISO 8601 UTC)." },
      { status: 400 }
    );
  }

  let queryText = `
    SELECT
      name,
      creation,
      age_status,
      updated_gender,
      updated_employment_type,
      updated_county,
      last_modified_date,
      synced_at
    FROM taifacare_registration
  `;
  const queryValues: (string | Date)[] = [];

  if (hasLastModified) {
    const trimmed = lastModifiedParam!.trim();
    const d = parseDate(trimmed);
    if (!d) {
      return NextResponse.json(
        { error: "last_modified_date must be a valid ISO 8601 date-time (e.g. 2026-03-12T10:30:32Z)." },
        { status: 400 }
      );
    }
    queryText += " WHERE last_modified_date >= $1";
    queryValues.push(d.toISOString());
  } else {
    const start = parseDate(startDateParam!);
    const end = parseDate(endDateParam!);
    if (!start || !end) {
      return NextResponse.json(
        { error: "start_date and end_date must be YYYY-MM-DD." },
        { status: 400 }
      );
    }
    if (end < start) {
      return NextResponse.json(
        { error: "end_date cannot be before start_date." },
        { status: 400 }
      );
    }
    const days = (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000);
    if (days > MAX_DATE_RANGE_DAYS) {
      return NextResponse.json(
        { error: `Date range cannot exceed ${MAX_DATE_RANGE_DAYS} days (about 3 months).` },
        { status: 400 }
      );
    }
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (start > today || end > today) {
      return NextResponse.json(
        { error: "Start and end dates cannot be in the future. Use a date range up to today." },
        { status: 400 }
      );
    }
    queryText += " WHERE creation::date BETWEEN $1 AND $2";
    queryValues.push(yyyyMmDd(start), yyyyMmDd(end));
  }
  queryText += " ORDER BY id DESC";

  try {
    const result = await pgPool.query(queryText, queryValues);
    console.log("[healthcare/registration-data] rows:", result.rowCount ?? 0, {
      mode: hasLastModified ? "last_modified" : "date_range",
      start_date: startDateParam,
      end_date: endDateParam,
      last_modified_date: lastModifiedParam,
    });
    if ((result.rowCount ?? 0) > 0) {
      console.log("[healthcare/registration-data] first_row:", result.rows[0]);
    }
    return NextResponse.json({ data: result.rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("must be set") ? 500 : 502;
    return NextResponse.json(
      { error: "Request failed", detail: message },
      { status }
    );
  }
}
