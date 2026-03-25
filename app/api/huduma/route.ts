import { NextResponse } from "next/server";

export async function GET() {
  try{
    const res = await fetch("https://appointment.hudumakenya.go.ke/api/hudumastats.php",
      {
        headers: {
          "Authorization": `Bearer 5f4748cff2e1b42ef0ca2287a2d684b8`,
        },
      });
    const text = await res.text();

    // Upstream may return JSON, or occasionally HTML (e.g. upstream error pages).
    // We normalize so the client always receives an object.
    try {
      const parsed = JSON.parse(text) as unknown;
      if (
        parsed &&
        typeof parsed === "object" &&
        "success" in (parsed as Record<string, unknown>)
      ) {
        return NextResponse.json(parsed);
      }
    } catch {
      // fall through to the error response below
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unexpected response from HUDUMA upstream",
      },
      { status: 502 }
    );
  }
  catch(error){
    console.error("[huduma] error:", error);
    return NextResponse.json({ error: "Failed to fetch HUDUMA stats" }, { status: 500 });
  }
}