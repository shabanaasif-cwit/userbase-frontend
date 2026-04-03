export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_URL ??
  "http://localhost:3001";

export async function readJsonSafe<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function authHeaders(accessToken: string | null): HeadersInit {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    h.Authorization = `Bearer ${accessToken}`;
  }
  return h;
}
