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
const ADMIN_EMAILS_KEY = "userbase-admin-emails";
const REGISTERED_USERS_KEY = "userbase-registered-users";

type RegisteredUser = {
  email: string;
  password: string;
  name?: string;
  role?: string;
};

function getRegisteredUsers(): RegisteredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RegisteredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function addRegisteredUser(
  email: string,
  password: string,
  name?: string,
  role?: string
) {
  try {
    const lower = email.trim().toLowerCase();
    if (!lower || !password) return;
    const users = getRegisteredUsers();
    if (users.some((u) => u.email.toLowerCase() === lower)) return;
    localStorage.setItem(
      REGISTERED_USERS_KEY,
      JSON.stringify([
        ...users,
        { email: lower, password, name: name?.trim(), role },
      ])
    );
  } catch {
    // ignore
  }
}

function updateRegisteredUserName(email: string, name: string) {
  try {
    const lower = email.trim().toLowerCase();
    const trimmedName = name?.trim();
    if (!lower || !trimmedName) return;
    const users = getRegisteredUsers();
    const updated = users.map((u) =>
      u.email === lower ? { ...u, name: trimmedName } : u
    );
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

function getAdminEmails(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ADMIN_EMAILS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.map((e) => e.toLowerCase()) : [];
  } catch {
    return [];
  }
}

function addAdminEmail(email: string) {
  try {
    const emails = getAdminEmails();
    const lower = email.trim().toLowerCase();
    if (lower && !emails.includes(lower)) {
      localStorage.setItem(ADMIN_EMAILS_KEY, JSON.stringify([...emails, lower]));
    }
  } catch {
    // ignore
  }
}

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
  /** True after session has been read from localStorage (avoids redirecting before hydration) */
  isReady: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    adminKey?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateName: (name: string) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

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
    let loaded = loadStoredSession();
    if (loaded && !loaded.name) {
      const registered = getRegisteredUsers().find(
        (u) => u.email === loaded!.email
      );
      if (registered?.name) {
        loaded = { ...loaded, name: registered.name };
        persistSession(loaded);
      }
    }
    setUser(loaded);
    setMounted(true);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      if (!email.trim() || !password || password.length < 8) return false;
      const lowerEmail = email.trim().toLowerCase();
      const registered = getRegisteredUsers();
      const match = registered.find(
        (u) => u.email === lowerEmail && u.password === password
      );
      if (!match) return false;
      const adminEmails = getAdminEmails();
      const role = adminEmails.includes(lowerEmail) ? ROLES.ADMIN : ROLES.USER;
      const data: AuthUser = {
        email: lowerEmail,
        role,
        name: match.name ?? undefined,
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
    }): Promise<{ success: boolean; error?: string }> => {
      if (!data.email?.trim() || !data.role) {
        return { success: false, error: "Signup failed. Please try again." };
      }
      const lowerEmail = data.email.trim().toLowerCase();
      const existing = getRegisteredUsers().some((u) => u.email === lowerEmail);
      if (existing) {
        return { success: false, error: "This email is already registered." };
      }
      const role = data.role === ROLES.ADMIN ? ROLES.ADMIN : ROLES.USER;
      const userData: AuthUser = {
        email: lowerEmail,
        role,
        name: data.name?.trim(),
      };
      addRegisteredUser(
        userData.email,
        data.password,
        userData.name,
        role
      );
      if (role === ROLES.ADMIN) {
        addAdminEmail(userData.email);
      }
      setUser(userData);
      persistSession(userData);
      return { success: true };
    },
    []
  );

  const logout = useCallback(async () => {
    setUser(null);
    clearStoredSession();
  }, []);

  const updateName = useCallback((name: string) => {
    const trimmed = name?.trim();
    if (!trimmed) return;
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, name: trimmed };
      persistSession(updated);
      updateRegisteredUserName(prev.email, trimmed);
      return updated;
    });
  }, []);

  const value: AuthContextValue = {
    user: mounted ? user : null,
    isAuthenticated: !!user,
    role: user?.role ?? "user",
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

/** Role-based access (UI only): normalize and check role from auth context / token payload */
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
} as const;

export function isAdmin(role: string | undefined | null): boolean {
  return role?.toLowerCase() === ROLES.ADMIN;
}
