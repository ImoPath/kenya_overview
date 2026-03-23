import { NextResponse } from "next/server";
import { pgPool } from "@/lib/postgres";

export async function GET() {
  try {
    const [totals, byCounty, byCategory] = await Promise.all([
      pgPool.query(`
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'Operational' THEN 1 ELSE 0 END) AS operational,
          SUM(CASE WHEN status = 'Not Operational' THEN 1 ELSE 0 END) AS not_operational,
          COUNT(DISTINCT county) AS counties
        FROM public_wifi
      `),
      pgPool.query(`
        SELECT
          county,
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'Operational' THEN 1 ELSE 0 END) AS operational
        FROM public_wifi
        WHERE county IS NOT NULL AND county != ''
        GROUP BY county
        ORDER BY total DESC
      `),
      pgPool.query(`
        SELECT categorization AS category, COUNT(*) AS count
        FROM public_wifi
        WHERE categorization IS NOT NULL AND categorization != ''
        GROUP BY categorization
        ORDER BY count DESC
      `),
    ]);

    const t = totals.rows[0];
    return NextResponse.json({
      total: parseInt(t.total),
      operational: parseInt(t.operational),
      not_operational: parseInt(t.not_operational),
      counties: parseInt(t.counties),
      by_county: byCounty.rows.map((r) => ({
        county: r.county as string,
        total: parseInt(r.total as string),
        operational: parseInt(r.operational as string),
      })),
      by_category: byCategory.rows.map((r) => ({
        category: r.category as string,
        count: parseInt(r.count as string),
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Request failed", detail: message }, { status: 502 });
  }
}
