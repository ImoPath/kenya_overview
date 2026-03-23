import { NextResponse } from "next/server";
import { pgPool } from "@/lib/postgres";

export async function GET() {
  try {
    const [regStats, regByCounty, facStats, facByLevel, facByCounty, syncState] = await Promise.all([
      pgPool.query(`
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN updated_gender = 'MALE' THEN 1 ELSE 0 END) AS male,
          SUM(CASE WHEN updated_gender = 'FEMALE' THEN 1 ELSE 0 END) AS female,
          SUM(CASE WHEN age_status = 'BELOW 18' THEN 1 ELSE 0 END) AS below_18,
          SUM(CASE WHEN age_status = 'ABOVE 18' THEN 1 ELSE 0 END) AS above_18,
          SUM(CASE WHEN updated_employment_type = 'EMPLOYED' THEN 1 ELSE 0 END) AS employed,
          SUM(CASE WHEN updated_employment_type = 'SELF EMPLOYED' THEN 1 ELSE 0 END) AS self_employed,
          SUM(CASE WHEN updated_employment_type = 'UN EMPLOYED' THEN 1 ELSE 0 END) AS unemployed,
          SUM(CASE WHEN updated_employment_type = 'SPONSORED' THEN 1 ELSE 0 END) AS sponsored
        FROM taifacare_registration
      `),
      pgPool.query(`
        SELECT
          INITCAP(LOWER(updated_county)) AS county,
          COUNT(*) AS count
        FROM taifacare_registration
        WHERE updated_county IS NOT NULL
          AND updated_county != ''
          AND updated_county != 'NOT SPECIFIED'
        GROUP BY LOWER(updated_county)
        ORDER BY count DESC
      `),
      pgPool.query(`
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN active_status = 'Active' THEN 1 ELSE 0 END) AS active,
          SUM(CASE WHEN active_status = 'In-Active' THEN 1 ELSE 0 END) AS inactive,
          SUM(CASE WHEN licensed_status = 'Licensed' THEN 1 ELSE 0 END) AS licensed,
          SUM(CASE WHEN licensed_status = 'Non-Licensed' THEN 1 ELSE 0 END) AS unlicensed
        FROM taifacare_sha_uptake
      `),
      pgPool.query(`
        SELECT kephlevel AS level, COUNT(*) AS count
        FROM taifacare_sha_uptake
        WHERE kephlevel IS NOT NULL
        GROUP BY kephlevel
        ORDER BY kephlevel
      `),
      pgPool.query(`
        SELECT
          INITCAP(LOWER(address_county)) AS county,
          COUNT(*) AS count
        FROM taifacare_sha_uptake
        WHERE address_county IS NOT NULL AND address_county != ''
        GROUP BY LOWER(address_county)
        ORDER BY count DESC
      `),
      pgPool.query(`
        SELECT dataset_name, last_synced_modified_at, last_full_sync_at
        FROM taifacare_sync_state
      `),
    ]);

    const reg = regStats.rows[0];
    const fac = facStats.rows[0];

    return NextResponse.json({
      registrations: {
        total: parseInt(reg.total),
        by_gender: { male: parseInt(reg.male), female: parseInt(reg.female) },
        by_age: { below_18: parseInt(reg.below_18), above_18: parseInt(reg.above_18) },
        by_employment: {
          employed: parseInt(reg.employed),
          self_employed: parseInt(reg.self_employed),
          unemployed: parseInt(reg.unemployed),
          sponsored: parseInt(reg.sponsored),
        },
        by_county: regByCounty.rows.map((r) => ({
          county: r.county as string,
          count: parseInt(r.count as string),
        })),
      },
      facilities: {
        total: parseInt(fac.total),
        active: parseInt(fac.active),
        inactive: parseInt(fac.inactive),
        licensed: parseInt(fac.licensed),
        unlicensed: parseInt(fac.unlicensed),
        by_level: facByLevel.rows.map((r) => ({
          level: r.level as string,
          count: parseInt(r.count as string),
        })),
        by_county: facByCounty.rows.map((r) => ({
          county: r.county as string,
          count: parseInt(r.count as string),
        })),
      },
      last_synced: syncState.rows,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Request failed", detail: message }, { status: 502 });
  }
}
