import { NextResponse } from "next/server";
import { pgPool } from "@/lib/postgres";

export async function GET() {
  try {
    const result = await pgPool.query(
      `SELECT
        updated_county,
        updated_gender,
        age_status,
        population_count,
        year
      FROM taifacare_population
      ORDER BY id DESC`
    );
    console.log("[healthcare/population-data] rows:", result.rowCount ?? 0);
    if ((result.rowCount ?? 0) > 0) {
      console.log("[healthcare/population-data] first_row:", result.rows[0]);
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
