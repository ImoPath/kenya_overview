import { NextRequest, NextResponse } from "next/server";
import { pgPool } from "@/lib/postgres";

type MetricCardRow = {
  pillar_code: string;
  pillar_name: string;
  section_id: number;
  section_code: string;
  section_title: string;
  category: string;
  metric_id: number;
  metric_name: string;
  metric_group: string;
  unit: string;
  change_type: string;
  direction: string;
  percent_value: number | string | null;
  baseline_label: string | null;
  baseline_value: string | null;
  current_label: string | null;
  current_value: string | null;
  delta_label: string | null;
  delta_value: string | null;
  delta_note: string | null;
};

export async function GET(request: NextRequest) {
  const pillar = request.nextUrl.searchParams.get("pillar")?.trim() || "Agriculture";

  try {
    const result = await pgPool.query<MetricCardRow>(
      `
        SELECT
          pillar_code,
          pillar_name,
          section_id,
          section_code,
          section_title,
          category,
          metric_id,
          metric_name,
          metric_group,
          unit,
          change_type,
          direction,
          percent_value,
          baseline_label,
          baseline_value,
          current_label,
          current_value,
          delta_label,
          delta_value,
          delta_note
        FROM beta.vw_metric_cards
        WHERE pillar_name = $1
        ORDER BY section_id ASC, metric_id ASC
      `,
      [pillar]
    );

    const metrics = result.rows.map((row) => ({
      ...row,
      percent_value:
        row.percent_value === null
          ? null
          : typeof row.percent_value === "number"
            ? row.percent_value
            : Number(row.percent_value),
    }));

    return NextResponse.json({
      pillar,
      count: metrics.length,
      metrics,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to load metric cards", detail },
      { status: 502 }
    );
  }
}
