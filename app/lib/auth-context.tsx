"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { API_BASE, authHeaders, readJsonSafe } from "./api-config";
import { clearReadReminderSession } from "./reminder-read-session";

export type ManagedUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: "active" | "deactivated";
};

type ErrorResponse = { message?: string; error?: string };

function normalizeUserId(raw: unknown): string {
  if (raw == null) return "";
  if (typeof raw === "string") return raw.trim();
  if (typeof raw === "object" && raw !== null) {
    const o = raw as Record<string, unknown>;
    if (typeof o.$oid === "string") return o.$oid.trim();
  }
  const s = String(raw);
  return s === "[object Object]" ? "" : s.trim();
}

/** Map API / DB user shapes to `active` | `deactivated` for the admin UI. */
function deriveUserStatus(u: Record<string, unknown>): "active" | "deactivated" {
  const raw = u.status;
  if (typeof raw === "string") {
    const v = raw.toLowerCase();
    if (v === "deactivated" || v === "inactive" || v === "disabled" || v === "banned") {
      return "deactivated";
    }
    if (v === "active" || v === "enabled") {
      return "active";
    }
  }
  if (typeof u.accountStatus === "string") {
    const v = u.accountStatus.toLowerCase();
    if (v === "deactivated" || v === "inactive" || v === "disabled") {
      return "deactivated";
    }
  }
  if (u.isActive === false || u.active === false) return "deactivated";
  if (u.deactivated === true || u.isDeactivated === true) return "deactivated";
  return "active";
}

function extractUsersList(json: Record<string, unknown> | null): Record<string, unknown>[] {
  if (!json) return [];

  const candidates: unknown[] = [
    json.users,
    json.items,
    json.results,
    json.docs,
    json.data,
  ];

  if (Array.isArray(json)) {
    return json.filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object"
    );
  }

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter(
        (item): item is Record<string, unknown> =>
          Boolean(item) && typeof item === "object"
      );
    }

    if (candidate && typeof candidate === "object") {
      const nested = candidate as Record<string, unknown>;
      const nestedList =
        nested.users ??
        nested.items ??
        nested.results ??
        nested.docs ??
        nested.data;

      if (Array.isArray(nestedList)) {
        return nestedList.filter(
          (item): item is Record<string, unknown> =>
            Boolean(item) && typeof item === "object"
        );
      }
    }
  }

  return [];
}

export async function fetchUsersFromAPI(
  accessToken: string | null
): Promise<{
  success: boolean;
  data?: ManagedUser[];
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/api/users`, {
      method: "GET",
      headers: authHeaders(accessToken),
      credentials: "include",
    });

    if (!res.ok) {
      const err = await readJsonSafe<ErrorResponse>(res);
      const msg = err?.message ?? err?.error ?? "Failed to fetch users";
      return { success: false, error: msg };
    }

    // Try to extract users even if the backend wraps paginated results.
    const json = await readJsonSafe<Record<string, unknown>>(res);
    const users = extractUsersList(json);

    const managedUsers: ManagedUser[] = users
      .map((u) => ({
        id: normalizeUserId(
          u._id ?? u.id ?? u.userId ?? (typeof u.user_id === "string" ? u.user_id : undefined)
        ),
        email: String(u.email ?? "").trim().toLowerCase(),
        name:
          u.firstName || u.lastName
            ? `${String(u.firstName ?? "").trim()} ${String(u.lastName ?? "").trim()}`.trim()
            : String(u.name ?? u.email ?? "").trim(),
        role:
          String(u.role ?? "").toLowerCase() === ROLES.ADMIN
            ? ROLES.ADMIN
            : ROLES.USER,
        status: deriveUserStatus(u),
      }))
      .filter((u) => Boolean(u.email));

    return { success: true, data: managedUsers };
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Unknown error";
    return {
      success: false,
      error: `Cannot reach server: ${errorMsg}`,
    };
  }
}

/** Backend: `PATCH /api/users/{userId}` with JSON body (e.g. `{ role }`). */
export async function updateUserRoleAPI(
  accessToken: string | null,
  userIdentifier: string,
  newRole: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userIdentifier?.trim() || !newRole?.trim()) {
      return { success: false, error: "User identifier and role are required" };
    }

    const id = encodeURIComponent(userIdentifier.trim());
    const res = await fetch(`${API_BASE}/api/users/${id}`, {
      method: "PATCH",
      headers: authHeaders(accessToken),
      credentials: "include",
      body: JSON.stringify({ role: newRole }),
    });

    if (!res.ok) {
      const err = await readJsonSafe<ErrorResponse>(res);
      return {
        success: false,
        error: err?.message ?? err?.error ?? "Failed to update user role",
      };
    }

    return { success: true };
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Unknown error";
    return { success: false, error: `Cannot reach server: ${errorMsg}` };
  }
}

/**
 * Persist account status (same intent as role updates from admin).
 * 1) Prefer dedicated routes that flip account state in the DB:
 *    - `PATCH .../deactivate` for deactivated
 *    - `PATCH .../toggle-account` for active
 * 2) If those fail (missing route, method, etc.), fall back to
 *    `PATCH /api/users/{userId}` with `{ status, isActive }` so backends that
 *    only store booleans or accept partial user docs still persist.
 *
 * Note: Calling PATCH with `{ status }` alone can return 200 while the server
 * ignores unknown fields, which made the UI look saved without a DB write.
 */
export async function updateUserStatusAPI(
  accessToken: string | null,
  userIdentifier: string,
  status: "active" | "deactivated"
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userIdentifier?.trim() || !status) {
      return { success: false, error: "User identifier and status are required" };
    }

    const id = encodeURIComponent(userIdentifier.trim());
    const baseUrl = `${API_BASE}/api/users/${id}`;
    const actionUrl =
      status === "deactivated"
        ? `${baseUrl}/deactivate`
        : `${baseUrl}/toggle-account`;

    let res = await fetch(actionUrl, {
      method: "PATCH",
      headers: authHeaders(accessToken),
      credentials: "include",
      body: JSON.stringify({}),
    });

    if (res.ok) {
      return { success: true };
    }

    const actionErr = await readJsonSafe<ErrorResponse>(res);
    const actionMsg =
      actionErr?.message ?? actionErr?.error ?? `HTTP ${res.status}`;

    res = await fetch(baseUrl, {
      method: "PATCH",
      headers: authHeaders(accessToken),
      credentials: "include",
      body: JSON.stringify({
        status,
        isActive: status === "active",
      }),
    });

    if (!res.ok) {
      const err = await readJsonSafe<ErrorResponse>(res);
      return {
        success: false,
        error:
          err?.message ??
          err?.error ??
          actionMsg ??
          "Failed to update user status",
      };
    }

    return { success: true };
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Unknown error";
    return { success: false, error: `Cannot reach server: ${errorMsg}` };
  }
}

export type AuthUser = {
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
};

type AuthLoginResult = { success: boolean; error?: string };

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  role: string;
  accessToken: string | null;
  /** Session restored from API (refresh cookie / me); no localStorage */
  isReady: boolean;
  login: (
    email: string,
    password: string,
    role?: string
  ) => Promise<AuthLoginResult>;
  signup: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
    adminKey?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateName: (name: string) => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mapMeUser(raw: Record<string, unknown>): AuthUser | null {
  const email = String(raw.email ?? "").trim().toLowerCase();
  if (!email) return null;
  const role =
    String(raw.role ?? "").toLowerCase() === ROLES.ADMIN
      ? ROLES.ADMIN
      : ROLES.USER;
  const name =
    [String(raw.firstName ?? "").trim(), String(raw.lastName ?? "").trim()]
      .filter(Boolean)
      .join(" ") || String(raw.name ?? "").trim() || undefined;
  return { email, role, firstName: raw.firstName as string | undefined, lastName: raw.lastName as string | undefined };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          method: "GET",
          headers: authHeaders(null),
          credentials: "include",
        });
        if (cancelled) return;
        if (res.ok) {
          const json =
            (await readJsonSafe<Record<string, unknown>>(res)) ?? {};
          const raw =
            (json.user as Record<string, unknown>) ??
            (json.data as Record<string, unknown>) ??
            json;
          const u = mapMeUser(raw);
          const token =
            typeof json.accessToken === "string"
              ? json.accessToken
              : typeof (raw as { accessToken?: string }).accessToken ===
                  "string"
                ? (raw as { accessToken: string }).accessToken
                : null;
          if (u) {
            setUser(u);
            setAccessToken(token);
          } 
          //Ensures that if the user data is invalid, the state is cleared
          else {
            setUser(null);
            setAccessToken(null);
          }
        } 
        //if the API request fails
        else {
          setUser(null);
          setAccessToken(null);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setAccessToken(null);
        }
      } finally {
        if (!cancelled) setMounted(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string,
      role?: string
    ): Promise<AuthLoginResult> => {
      if (!email.trim() || !password || password.length < 8) {
        return { success: false, error: "Invalid email or password." };
      }

      const lowerEmail = email.trim().toLowerCase();
      const roleForApi =
        role?.trim().toLowerCase() === ROLES.ADMIN ? ROLES.ADMIN : ROLES.USER;

      try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: lowerEmail,
            password,
            role: roleForApi,
          }),
        });

        type LoginResponse = {
          user: {
            email: string;
            role?: string;
            firstName?: string;
            lastName?: string;
          };
          accessToken?: string;
        };

        if (!res.ok) {
          const err = await readJsonSafe<ErrorResponse>(res);
          const msg =
            err?.message ??
            err?.error ??
            "Login failed. Please check your email and password.";
          return { success: false, error: msg };
        }

        const json = await readJsonSafe<LoginResponse>(res);
        const backendUser = json?.user;
        if (!backendUser?.email) {
          return {
            success: false,
            error: "Login failed. Please try again.",
          };
        }

        const roleResolved =
          backendUser.role?.toLowerCase() === ROLES.ADMIN
            ? ROLES.ADMIN
            : ROLES.USER;
        const fullName =
          [backendUser.firstName?.trim(), backendUser.lastName?.trim()]
            .filter(Boolean)
            .join(" ") || undefined;
        const userData: AuthUser = {
          email: backendUser.email.toLowerCase(),
          role: roleResolved,
          firstName: backendUser.firstName as string | undefined,
          lastName: backendUser.lastName as string | undefined,
        };

        const token = json?.accessToken ?? null;
        setUser(userData);
        setAccessToken(token);
        return { success: true };
      } catch {
        return {
          success: false,
          error: "Cannot reach server. Is the API running on " + API_BASE + "?",
        };
      }
    },
    []
  );

  const signup = useCallback(
    async (data: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      confirmPassword: string;
      role: string;
      adminKey?: string;
    }): Promise<{ success: boolean; error?: string }> => {
      if (
        !data.firstName?.trim() ||
        !data.lastName?.trim() ||
        !data.email?.trim() ||
        !data.role
      ) {
        return { success: false, error: "Signup failed. Please try again." };
      }
      //refers to actual data that is transmitted as a part of reuest or reponse
      const payload = {
        firstName: data.firstName?.trim(),
        lastName: data.lastName?.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        confirmPassword: data.confirmPassword,
        role: data.role,
        adminKey: data.adminKey,
      };

      try {
        const res = await fetch(`${API_BASE}/api/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        type SignupResponse = {
          user: {
            email: string;
            role?: string;
            firstName?: string;
            lastName?: string;
          };
          accessToken?: string;
        };

        if (!res.ok) {
          const err = await readJsonSafe<ErrorResponse>(res);
          const msg =
            err?.message ?? err?.error ?? "Signup failed. Please try again.";
          return { success: false, error: msg };
        }

        const json = await readJsonSafe<SignupResponse>(res);
        const backendUser = json?.user;
        if (!backendUser?.email) {
          return { success: false, error: "Signup failed. Please try again." };
        }

        const role =
          backendUser.role?.toLowerCase() === ROLES.ADMIN
            ? ROLES.ADMIN
            : ROLES.USER;
        const fullName =
          [backendUser.firstName?.trim(), backendUser.lastName?.trim()]
            .filter(Boolean)
            .join(" ") || undefined;
        const userData: AuthUser = {
          email: backendUser.email.toLowerCase(),
          role,
          firstName: backendUser.firstName as string | undefined,
          lastName: backendUser.lastName as string | undefined,
        };

        const token = json?.accessToken ?? null;
        setUser(userData);
        setAccessToken(token);
        return { success: true };
      } catch {
        return { success: false, error: "Signup failed. Please try again." };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    const email = user?.email ?? null;
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: authHeaders(accessToken),
        credentials: "include",
      });
    } catch {
      // still clear client state
    }
    clearReadReminderSession(email);
    setUser(null);
    setAccessToken(null);
  }, [accessToken, user?.email]);

  const updateName = useCallback(
    async (name: string) => {
      const trimmed = name?.trim();
      if (!trimmed) return { success: false, error: "Name is required." };
      const parts = trimmed.split(/\s+/);
      const firstName = parts[0] ?? "";
      const lastName = parts.slice(1).join(" ") || "";

      try {
        const res = await fetch(`${API_BASE}/api/users/me`, {
          method: "PATCH",
          headers: authHeaders(accessToken),
          credentials: "include",
          body: JSON.stringify({ firstName, lastName }),
        });

        if (!res.ok) {
          const err = await readJsonSafe<ErrorResponse>(res);
          return {
            success: false,
            error:
              err?.message ?? err?.error ?? "Could not update profile on server.",
          };
        }

        setUser((prev) => {
          if (!prev) return prev;
          return { ...prev, name: trimmed };
        });
        return { success: true };
      } catch {
        return { success: false, error: "Cannot reach server." };
      }
    },
    [accessToken]
  );

  const value: AuthContextValue = {
    user: mounted ? user : null,
    isAuthenticated: !!user,
    role: user?.role ?? "user",
    accessToken: mounted ? accessToken : null,
    isReady: mounted,
    login,
    signup,
    logout,
    updateName,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const authValidation = {
  emailFormat: (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
  passwordMinLength: 8,
  passwordHasSymbol: (password: string) =>
    /[!@#$%^&*(),.?":{}|<>_\-\\[\]/+=~]/.test(password),
  passwordInvalidChars: /[,\[\]\(\)\s`]/,
};


export const ROLES = {
  ADMIN: "admin",
  USER: "user",
} as const;

export function isAdmin(role: string | undefined | null): boolean {
  return role?.toLowerCase() === ROLES.ADMIN;
}
