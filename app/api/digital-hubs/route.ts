import { NextResponse } from "next/server";
import { pgPool } from "@/lib/postgres";

export async function GET() {
  try {
    const [totals, byCounty] = await Promise.all([
      // Individual named sites only (exclude county summary rows)
      pgPool.query(`
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN status_norm = 'Complete' THEN 1 ELSE 0 END) AS complete,
          SUM(CASE WHEN status_norm = 'Ongoing' THEN 1 ELSE 0 END) AS ongoing
        FROM project_sites
        WHERE project_id = 4
          AND site_name NOT ILIKE 'County summary:%'
      `),
      // County summary rows carry the county-level completion %
      pgPool.query(`
        SELECT
          INITCAP(LOWER(cs.county)) AS county,
          cs.percent_complete,
          cs.status_norm AS county_status,
          COUNT(ind.site_id) AS total_sites,
          SUM(CASE WHEN ind.status_norm = 'Complete' THEN 1 ELSE 0 END) AS sites_complete,
          SUM(CASE WHEN ind.status_norm = 'Ongoing' THEN 1 ELSE 0 END) AS sites_ongoing
        FROM project_sites cs
        LEFT JOIN project_sites ind
          ON ind.project_id = 4
          AND LOWER(ind.county) = LOWER(cs.county)
          AND ind.site_name NOT ILIKE 'County summary:%'
        WHERE cs.project_id = 4
          AND cs.site_name ILIKE 'County summary:%'
        GROUP BY cs.county, cs.percent_complete, cs.status_norm
        ORDER BY cs.percent_complete DESC NULLS LAST
      `),
    ]);

    const t = totals.rows[0];

    return NextResponse.json({
      total: parseInt(t.total),
      complete: parseInt(t.complete),
      ongoing: parseInt(t.ongoing),
      counties: byCounty.rows.length,
      by_county: byCounty.rows.map((r) => ({
        county: r.county as string,
        percent_complete: parseFloat(r.percent_complete),
        county_status: r.county_status as string,
        total_sites: parseInt(r.total_sites),
        sites_complete: parseInt(r.sites_complete),
        sites_ongoing: parseInt(r.sites_ongoing),
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Request failed", detail: message }, { status: 502 });
  }
}
