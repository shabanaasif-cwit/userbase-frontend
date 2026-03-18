"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "userbase-auth";

export type AuthUser = {
  email: string;
  role: string;
  name?: string;
};

export type AuthSession = {
  user: AuthUser;
  token?: string | null;
  expiresAt?: number | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  role: string;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    adminKey?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getApiBaseUrl(): string {
  if (typeof window === "undefined") return "";
  return (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim();
}

function loadStoredSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession | AuthUser;
    const user = "user" in parsed ? parsed.user : (parsed as AuthUser);
    return user?.email ? user : null;
  } catch {
    return null;
  }
}

function persistSession(
  user: AuthUser,
  token?: string | null,
  expiresAt?: number | null
) {
  try {
    const payload: AuthSession = {
      user,
      token: token ?? null,
      expiresAt: expiresAt ?? null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

function clearStoredSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setUser(loadStoredSession());
    setMounted(true);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      const apiBaseUrl = getApiBaseUrl();
      if (apiBaseUrl) {
        try {
          const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email: email.trim(), password }),
          });
          const data = await response.json();
          if (response.ok && data?.user) {
            const u = data.user as AuthUser;
            setUser(u);
            persistSession(u, data.token ?? null, data.expiresAt ?? null);
            return true;
          }
          if (response.ok && data?.authenticated) {
            const u: AuthUser = {
              email: email.trim().toLowerCase(),
              role: data.role ?? "user",
              name: data.name,
            };
            setUser(u);
            persistSession(u, data.token ?? null, data.expiresAt ?? null);
            return true;
          }
          return false;
        } catch {
          return false;
        }
      }
      // Frontend-only: persist session in localStorage
      if (!email.trim() || !password || password.length < 8) return false;
      const data: AuthUser = {
        email: email.trim().toLowerCase(),
        role: "user",
      };
      setUser(data);
      persistSession(data);
      return true;
    },
    []
  );

  const signup = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      role: string;
      adminKey?: string;
    }): Promise<boolean> => {
      const apiBaseUrl = getApiBaseUrl();
      if (apiBaseUrl) {
        try {
          const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              name: data.name.trim(),
              email: data.email.trim(),
              password: data.password,
              role: data.role || "user",
              adminKey: data.role === "admin" ? data.adminKey : undefined,
            }),
          });
          const resData = await response.json();
          if (response.ok) {
            const u: AuthUser = (resData.user as AuthUser) ?? {
              email: data.email.trim().toLowerCase(),
              role: data.role || "user",
              name: data.name?.trim(),
            };
            setUser(u);
            persistSession(u, resData.token ?? null, resData.expiresAt ?? null);
            return true;
          }
          return false;
        } catch {
          return false;
        }
      }
      // Frontend-only: persist session in localStorage
      if (!data.email?.trim() || !data.role) return false;
      const userData: AuthUser = {
        email: data.email.trim().toLowerCase(),
        role: data.role || "user",
        name: data.name?.trim(),
      };
      setUser(userData);
      persistSession(userData);
      return true;
    },
    []
  );

  const logout = useCallback(async () => {
    const apiBaseUrl = getApiBaseUrl();
    if (apiBaseUrl) {
      try {
        await fetch(`${apiBaseUrl}/api/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
      } catch {
        // ignore
      }
    }
    setUser(null);
    clearStoredSession();
  }, []);

  const value: AuthContextValue = {
    user: mounted ? user : null,
    isAuthenticated: !!user,
    role: user?.role ?? "user",
    login,
    signup,
    logout,
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
  passwordInvalidChars: /[,\[\]\(\)\s]/,
};
