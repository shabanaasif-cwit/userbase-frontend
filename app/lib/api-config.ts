export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_URL ??
  "http://localhost:3001";

const API_REACHABILITY_TIMEOUT_MS = 8000;

/** True if the API accepts a connection (any HTTP response counts). */
export async function isApiReachable(): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_REACHABILITY_TIMEOUT_MS);
  try {
    await fetch(`${API_BASE}/api/auth/me`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

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

export async function fetchWithAuthRetry(
  input: RequestInfo | URL,
  accessToken: string | null,
  init?: RequestInit
): Promise<Response> {
  const firstResponse = await fetch(input, {
    ...init,
    headers: authHeaders(accessToken),
    credentials: "include",
  });

  if (firstResponse.status !== 401 || !accessToken) {
    return firstResponse;
  }

  return fetch(input, {
    ...init,
    headers: authHeaders(null),
    credentials: "include",
  });
}
