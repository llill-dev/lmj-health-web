import { useSyncExternalStore } from "react";
import { get, post } from "@/lib/api";
import { authApi } from "@/lib/auth/client";
import { buildDeletionSessionFromLogin } from "@/lib/auth/accountDeletionSession";
import {
  clearAuthSession,
  persistAuthSession,
  readStoredAuthSession,
  type AuthSessionUser,
  type AuthTokenPair,
} from "@/lib/auth/session";
import type { LoginRequest, AuthError, LoginResponse } from "@/lib/auth/types";
import { resolveLoginIdentifier } from "@/lib/phone/normalizeAuthPhone";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  phone: string;
  role: "patient" | "secretary" | "data-entry" | "doctor" | "admin";
  name?: string;
  verified: boolean;
}

interface PendingVerification {
  userId: string;
  role: User["role"];
  email: string;
  phone: string;
  channel: "email" | "whatsapp";
}

const PENDING_VERIFICATION_KEY = "pendingSignupVerification";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  refreshExpiresAt: string | null;
  isAuthenticated: boolean;
  pendingVerification: PendingVerification | null;
  // Platform / general settings
  platformName: string;
  primaryEmail: string;
  phone: string;
  region: string;
  lang: "ar" | "en";
  // Actions
  loadGeneralSettings: () => Promise<void>;
  saveGeneralSettings: (payload: {
    platformName: string;
    primaryEmail: string;
    phone: string;
    region: string;
    lang?: "ar" | "en";
  }) => Promise<void>;
  login: (
    identifier: string,
    password: string,
    clientType?: "web" | "patient_mobile" | "doctor_mobile",
  ) => Promise<LoginResponse>;
  applySession: (pair: AuthTokenPair, user: AuthSessionUser) => void;
  register: (
    email: string,
    password: string,
    role: "jobseeker" | "company" | "doctor",
  ) => Promise<void>;
  setPendingVerification: (df: PendingVerification | null) => void;
  logout: (options?: {
    skipRemoteRevoke?: boolean;
    scope?: "current" | "all";
  }) => Promise<void>;
}

type Listener = () => void;

export class AuthFlowError extends Error {
  readonly code: string;
  readonly authError?: AuthError;

  constructor(authError: AuthError) {
    super(authError.message);
    this.name = "AuthFlowError";
    this.code = authError.code;
    this.authError = authError;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// localStorage helpers (used only for non-sensitive settings)
// ─────────────────────────────────────────────────────────────────────────────

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readPersistedGeneralSettings(): Partial<AuthState> | null {
  try {
    const saved = safeJsonParse<{
      platformName?: string;
      primaryEmail?: string;
      phone?: string;
      region?: string;
      lang?: "ar" | "en";
    }>(localStorage.getItem("generalSettings"));

    if (!saved) return null;
    return {
      platformName: saved.platformName ?? "LMJ Health",
      primaryEmail: saved.primaryEmail ?? "",
      phone: saved.phone ?? "",
      region: saved.region ?? "",
      lang: saved.lang ?? "ar",
    } as Partial<AuthState>;
  } catch {
    return null;
  }
}

function writePersistedGeneralSettings(payload: {
  platformName: string;
  primaryEmail: string;
  phone: string;
  region: string;
  lang?: "ar" | "en";
}) {
  try {
    localStorage.setItem("generalSettings", JSON.stringify(payload));
  } catch {}
}

function readPendingVerification(): PendingVerification | null {
  if (typeof window === "undefined") return null;
  let parsed: PendingVerification | null = null;
  try {
    parsed = safeJsonParse<PendingVerification>(
      sessionStorage.getItem(PENDING_VERIFICATION_KEY),
    );
  } catch {
    return null;
  }

  if (
    !parsed?.userId ||
    !parsed.role ||
    !parsed.email ||
    !parsed.phone ||
    !["email", "whatsapp"].includes(parsed.channel)
  ) {
    return null;
  }

  return parsed;
}

function writePendingVerification(payload: PendingVerification | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!payload) {
      sessionStorage.removeItem(PENDING_VERIFICATION_KEY);
      return;
    }
    sessionStorage.setItem(PENDING_VERIFICATION_KEY, JSON.stringify(payload));
  } catch {}
}

function mapRole(role: string): User["role"] {
  return (role === "data_entry" ? "data-entry" : role) as User["role"];
}

function buildUserFromSession(user: AuthSessionUser, verified = true): User {
  return {
    id: user.userId,
    email: user.email ?? "",
    phone: user.phone ?? "",
    role: mapRole(user.role),
    name: user.fullName,
    verified,
  };
}

function buildUserFromCookie(): User | null {
  const { user } = readStoredAuthSession();
  if (!user) return null;
  return buildUserFromSession({
    userId: user.userId,
    role: user.role,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    actorIds: user.actorIds,
    patientPublicId: user.patientPublicId,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Initial state
// ─────────────────────────────────────────────────────────────────────────────

let state: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  refreshExpiresAt: null,
  isAuthenticated: false,
  pendingVerification: null,
  platformName: "LMJ Health",
  primaryEmail: "",
  phone: "",
  region: "",
  lang: "ar",

  loadGeneralSettings: async () => {
    const persisted = readPersistedGeneralSettings();
    if (persisted) {
      setState(persisted);
      return;
    }
  },

  saveGeneralSettings: async (payload) => {
    setState({
      platformName: payload.platformName,
      lang: payload.lang || "ar",
    });
    writePersistedGeneralSettings(payload);
  },

  applySession: (pair, sessionUser) => {
    const mappedUser = buildUserFromSession(
      sessionUser,
      sessionUser.accountStatus === "active" || !sessionUser.accountStatus,
    );

    persistAuthSession(pair, sessionUser);

    setState({
      user: mappedUser,
      accessToken: pair.accessToken,
      refreshToken: pair.refreshToken,
      refreshExpiresAt: pair.refreshExpiresAt ?? null,
      isAuthenticated: true,
      pendingVerification: null,
    });
    writePendingVerification(null);

    try {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("userRole");
    } catch {}
  },

  login: async (
    identifier: string,
    password: string,
    clientType: "web" | "patient_mobile" | "doctor_mobile" = "web",
  ) => {
    const loginRequest: LoginRequest = {
      ...resolveLoginIdentifier(identifier),
      password,
      clientType,
    };

    const result = await authApi.login(loginRequest);

    if ("error" in result) {
      throw new AuthFlowError(result.error);
    }

    const { data } = result;

    const deletionSession = buildDeletionSessionFromLogin({
      accountDeletionStatus: data.accountDeletionStatus,
      requestedAt: data.requestedAt ?? null,
      recoverUntil: data.recoverUntil ?? null,
    });

    state.applySession(
      {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        refreshExpiresAt: data.refreshExpiresAt,
      },
      {
        userId: data.userId,
        role: data.role,
        fullName: data.fullName,
        email: data.email ?? "",
        phone: data.phone ?? "",
        actorIds: data.actorIds,
        patientPublicId: data.patientPublicId,
        accountStatus: data.accountStatus,
        accountDeletionStatus: deletionSession.accountDeletionStatus,
        deletionRequestedAt: deletionSession.deletionRequestedAt,
        deletionRecoverUntil: deletionSession.deletionRecoverUntil,
      },
    );

    return data;
  },

  register: async () => {},

  setPendingVerification: (payload) => {
    writePendingVerification(payload);
    setState({ pendingVerification: payload });
  },

  logout: async (options?: {
    skipRemoteRevoke?: boolean;
    scope?: "current" | "all";
  }) => {
    const accessToken = state.accessToken;
    const scope = options?.scope ?? "all";

    if (accessToken && !options?.skipRemoteRevoke) {
      try {
        if (scope === "current") {
          await authApi.logout(accessToken);
        } else {
          await authApi.logoutAll(accessToken);
        }
      } catch (err) {
        console.warn("Logout API failed — continuing local logout:", err);
      }
    }

    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      refreshExpiresAt: null,
      isAuthenticated: false,
      pendingVerification: null,
    });

    clearAuthSession();

    try {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("userRole");
      sessionStorage.removeItem(PENDING_VERIFICATION_KEY);
    } catch {}
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Store internals
// ─────────────────────────────────────────────────────────────────────────────

const listeners = new Set<Listener>();

function setState(patch: Partial<AuthState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function initFromCookies() {
  if (typeof window === "undefined") return;

  const stored = readStoredAuthSession();
  const user = buildUserFromCookie();
  const settings = readPersistedGeneralSettings();
  const pendingVerification = readPendingVerification();

  if (stored.accessToken) {
    state = {
      ...state,
      accessToken: stored.accessToken,
      refreshToken: stored.refreshToken,
      refreshExpiresAt: stored.refreshExpiresAt,
      isAuthenticated: true,
      ...(user ? { user } : {}),
    };
  }

  if (settings) {
    state = { ...state, ...settings };
  }

  if (pendingVerification && !stored.accessToken) {
    state = { ...state, pendingVerification };
  }
}

initFromCookies();

// ─────────────────────────────────────────────────────────────────────────────
// Public hook
// ─────────────────────────────────────────────────────────────────────────────

type StoreHook = {
  <T>(selector: (s: AuthState) => T): T;
  (): AuthState;
  getState: () => AuthState;
  setState: (patch: Partial<AuthState>) => void;
  subscribe: (listener: Listener) => () => void;
};

export const useAuthStore: StoreHook = ((
  selector?: (s: AuthState) => unknown,
) => {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => (selector ? selector(state) : state),
    () => (selector ? selector(state) : state),
  );
}) as StoreHook;

useAuthStore.getState = () => state;
useAuthStore.setState = (patch) => setState(patch);
useAuthStore.subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Backward-compatible alias for Bearer token reads. */
export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}
