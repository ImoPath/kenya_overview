const AUTH_URL = "https://taifacareanalytics.dha.go.ke/api/auth/login";

type AuthResponse = {
  token?: string;
  accessToken?: string;
  access_token?: string;
  data?: { token?: string; accessToken?: string; access_token?: string };
};

function getTokenFromAuthResponse(body: AuthResponse): string | null {
  if (body.token) return body.token;
  if (body.accessToken) return body.accessToken;
  if (body.access_token) return body.access_token;
  if (body.data?.token) return body.data.token;
  if (body.data?.accessToken) return body.data.accessToken;
  if (body.data?.access_token) return body.data.access_token;
  return null;
}

export async function getDhaToken(): Promise<string> {
  const email = process.env.DHA_API_EMAIL;
  const password = process.env.DHA_API_PASSWORD;

  if (!email || !password) {
    throw new Error("DHA_API_EMAIL and DHA_API_PASSWORD must be set.");
  }

  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Auth failed: ${text}`);
  }

  const body = (await res.json()) as AuthResponse;
  const token = getTokenFromAuthResponse(body);
  if (!token) {
    throw new Error("Auth response did not contain a token");
  }
  return token;
}
