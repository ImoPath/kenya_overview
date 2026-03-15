import { NextResponse } from "next/server";
import { getDhaToken } from "@/lib/dha-auth";

const POPULATION_DATA_URL =
  "https://taifacareanalytics.dha.go.ke/api/data-share/kenya-population-data";

export async function GET() {
  try {
    const token = await getDhaToken();
    const dataRes = await fetch(POPULATION_DATA_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!dataRes.ok) {
      const text = await dataRes.text();
      return NextResponse.json(
        { error: "Population data request failed", detail: text },
        { status: 502 }
      );
    }

    const data = await dataRes.json();
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
