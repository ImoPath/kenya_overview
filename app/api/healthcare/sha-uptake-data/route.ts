import { NextRequest, NextResponse } from "next/server";
import { getDhaToken } from "@/lib/dha-auth";

const SHA_UPTAKE_DATA_URL =
  "https://taifacareanalytics.dha.go.ke/api/data-share/sha-uptake-data";

function parseDate(s: string): Date | null {
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lastModifiedParam = searchParams.get("last_modified_date")?.trim();

  let url = SHA_UPTAKE_DATA_URL;
  if (lastModifiedParam) {
    const d = parseDate(lastModifiedParam);
    if (!d) {
      return NextResponse.json(
        {
          error:
            "last_modified_date must be a valid ISO 8601 UTC date-time (e.g. 2026-03-12T09:01:32Z).",
        },
        { status: 400 }
      );
    }
    url = `${SHA_UPTAKE_DATA_URL}?last_modified_date=${encodeURIComponent(d.toISOString())}`;
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
        { error: "SHA uptake data request failed", detail },
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
