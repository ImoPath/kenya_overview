import { NextRequest, NextResponse } from "next/server";
import { getDhaToken } from "@/lib/dha-auth";

const REGISTRATION_DATA_URL =
  "https://taifacareanalytics.dha.go.ke/api/data-share/registration-data";

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

  let url: string;

  if (hasLastModified) {
    const trimmed = lastModifiedParam!.trim();
    const d = parseDate(trimmed);
    if (!d) {
      return NextResponse.json(
        { error: "last_modified_date must be a valid ISO 8601 date-time (e.g. 2026-03-12T10:30:32Z)." },
        { status: 400 }
      );
    }
    url = `${REGISTRATION_DATA_URL}?last_modified_date=${encodeURIComponent(d.toISOString())}`;
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
    url = `${REGISTRATION_DATA_URL}?start_date=${yyyyMmDd(start)}&end_date=${yyyyMmDd(end)}`;
  }

  try {
    const token = await getDhaToken();
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const text = await res.text();
      let detail = text || res.statusText;
      try {
        const parsed = JSON.parse(text) as { message?: string; error?: string };
        detail = parsed.message ?? parsed.error ?? detail;
      } catch {
        /* use raw text as detail */
      }
      return NextResponse.json(
        { error: "Registration data request failed", detail },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("must be set") ? 500 : 502;
    return NextResponse.json(
      { error: "Request failed", detail: message },
      { status }
    );
  }
}
