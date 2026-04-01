import { create } from "zustand";
import { persist } from "zustand/middleware";

import { ApiError, authApi, type RegisterPayload } from "@/lib/api/client";
import type { AuthState, User } from "@/lib/types";

interface AuthStore extends AuthState {
  isLoading: boolean;
  authNotice: string | null;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;
  register: (
    payload: RegisterPayload,
  ) => Promise<{ success: boolean; message?: string }>;
  fetchProfile: () => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setSession: (token: string, user: User) => void;
}

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

const createSessionWindow = () => {
  const sessionStartedAt = Date.now();
  return {
    sessionStartedAt,
    sessionExpiresAt: sessionStartedAt + SESSION_TTL_MS,
  };
};

const isSessionExpired = (sessionExpiresAt: number | null) =>
  typeof sessionExpiresAt === "number" && sessionExpiresAt <= Date.now();

const toErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Terjadi kesalahan. Silakan coba lagi.";
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      sessionStartedAt: null,
      sessionExpiresAt: null,
      isLoading: false,
      authNotice: null,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { token, user } = await authApi.login({ email, password });
          const profile = user ?? (await authApi.profile(token));
          const sessionWindow = createSessionWindow();

          set({
            token,
            user: profile,
            isAuthenticated: true,
            ...sessionWindow,
            isLoading: false,
            authNotice: null,
          });

          return { success: true };
        } catch (error) {
          set({ isLoading: false, authNotice: null });
          return {
            success: false,
            message: toErrorMessage(error),
          };
        }
      },

      register: async (payload) => {
        set({ isLoading: true });
        try {
          const { token, user } = await authApi.register(payload);
          const profile = user ?? (await authApi.profile(token));
          const sessionWindow = createSessionWindow();

          set({
            token,
            user: profile,
            isAuthenticated: true,
            ...sessionWindow,
            isLoading: false,
            authNotice: null,
          });

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            message: toErrorMessage(error),
          };
        }
      },

      fetchProfile: async () => {
        const token = get().token;
        if (!token || isSessionExpired(get().sessionExpiresAt)) {
          get().logout();
          return;
        }

        try {
          const profile = await authApi.profile(token);
          set({ user: profile, isAuthenticated: true, authNotice: null });
        } catch (error) {
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            sessionStartedAt: null,
            sessionExpiresAt: null,
            authNotice:
              error instanceof ApiError && error.status === 403
                ? toErrorMessage(error)
                : null,
          });
        }
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          sessionStartedAt: null,
          sessionExpiresAt: null,
          isLoading: false,
          authNotice: null,
        });
      },

      setUser: (user) => {
        set({
          user,
          isAuthenticated: user !== null,
          authNotice: null,
        });
      },

      setSession: (token, user) => {
        const sessionWindow = createSessionWindow();
        set({
          token,
          user,
          isAuthenticated: true,
          ...sessionWindow,
          isLoading: false,
          authNotice: null,
        });
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        sessionStartedAt: state.sessionStartedAt,
        sessionExpiresAt: state.sessionExpiresAt,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }

        if (isSessionExpired(state.sessionExpiresAt)) {
          state.logout();
        }
      },
    },
  ),
);
