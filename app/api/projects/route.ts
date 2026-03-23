import { NextRequest, NextResponse } from "next/server";
import { pgPool } from "@/lib/postgres";

const BASE_SELECT = `
  SELECT
    project_id,
    name,
    sector,
    ministry,
    implementing_agency,
    progress->>'status' AS status,
    (progress->>'percentage_complete')::numeric AS percentage_complete,
    progress->>'latest_update_summary' AS latest_update,
    (budget->>'allocated_amount_kes')::numeric AS allocated_kes,
    (budget->>'disbursed_amount_kes')::numeric AS disbursed_kes,
    budget->>'source' AS budget_source,
    location->>'county' AS county,
    timeline->>'start_date' AS start_date,
    timeline->>'expected_completion_date' AS expected_completion
  FROM projects
  WHERE (is_public->>'approved')::boolean = true
    AND voided = false
`;

export async function GET(request: NextRequest) {
  const focus = request.nextUrl.searchParams.get("focus")?.toLowerCase() ?? "";

  let sectorClause = "";
  if (focus === "digital") {
    sectorClause = "AND sector ILIKE '%ICT%'";
  } else if (focus === "housing") {
    sectorClause = `
      AND sector ILIKE '%Agriculture%'
      AND name NOT ILIKE '%river%'
      AND name NOT ILIKE '%climate resilience%'
    `;
  } else if (focus === "msme") {
    sectorClause = "AND (sector ILIKE '%GECA%' OR sector ILIKE '%SPCR%')";
  }

  try {
    const result = await pgPool.query(
      BASE_SELECT + sectorClause + " ORDER BY project_id"
    );
    return NextResponse.json({ data: result.rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Request failed", detail: message }, { status: 502 });
  }
}
