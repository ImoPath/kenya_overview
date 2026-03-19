import { NextRequest, NextResponse } from "next/server";
import { pgPool } from "@/lib/postgres";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const countyParam = searchParams.get("county")?.trim();

  try {
    const queryText = `
      SELECT
        frcode,
        transacting_facility,
        licensed_status,
        active_status,
        facilityname,
        address_county,
        facilityagent,
        kephlevel
      FROM taifacare_sha_uptake
      ${countyParam ? "WHERE address_county = $1" : ""}
      ORDER BY id DESC
    `;
    const queryValues = countyParam ? [countyParam] : [];
    const result = await pgPool.query(queryText, queryValues);
    console.log("[healthcare/sha-uptake-data] rows:", result.rowCount ?? 0, {
      county: countyParam ?? null,
    });
    if ((result.rowCount ?? 0) > 0) {
      console.log("[healthcare/sha-uptake-data] first_row:", result.rows[0]);
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
