import { NextResponse } from "next/server";
import { pgPool } from "@/lib/postgres";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  try {
    const [regResult, facResult, facLevels] = await Promise.all([
      pgPool.query(
        `
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
        WHERE INITCAP(LOWER(updated_county)) = $1
        `,
        [name]
      ),
      pgPool.query(
        `
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN active_status = 'Active' THEN 1 ELSE 0 END) AS active,
          SUM(CASE WHEN active_status = 'In-Active' THEN 1 ELSE 0 END) AS inactive,
          SUM(CASE WHEN licensed_status = 'Licensed' THEN 1 ELSE 0 END) AS licensed,
          SUM(CASE WHEN licensed_status = 'Non-Licensed' THEN 1 ELSE 0 END) AS unlicensed
        FROM taifacare_sha_uptake
        WHERE INITCAP(LOWER(address_county)) = $1
        `,
        [name]
      ),
      pgPool.query(
        `
        SELECT kephlevel AS level, COUNT(*) AS count
        FROM taifacare_sha_uptake
        WHERE INITCAP(LOWER(address_county)) = $1
          AND kephlevel IS NOT NULL
        GROUP BY kephlevel
        ORDER BY kephlevel
        `,
        [name]
      ),
    ]);

    const r = regResult.rows[0];
    const f = facResult.rows[0];

    return NextResponse.json({
      county: name,
      registrations: {
        total: parseInt(r.total),
        by_gender: { male: parseInt(r.male), female: parseInt(r.female) },
        by_age: { below_18: parseInt(r.below_18), above_18: parseInt(r.above_18) },
        by_employment: {
          employed: parseInt(r.employed),
          self_employed: parseInt(r.self_employed),
          unemployed: parseInt(r.unemployed),
          sponsored: parseInt(r.sponsored),
        },
      },
      facilities: {
        total: parseInt(f.total),
        active: parseInt(f.active),
        inactive: parseInt(f.inactive),
        licensed: parseInt(f.licensed),
        unlicensed: parseInt(f.unlicensed),
        by_level: facLevels.rows.map((row) => ({
          level: row.level as string,
          count: parseInt(row.count as string),
        })),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Request failed", detail: message }, { status: 502 });
  }
}
