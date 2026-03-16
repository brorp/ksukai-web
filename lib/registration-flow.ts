"use client";

export type RegistrationAuthSource = "email" | "google";

export interface PendingRegistration {
  registrationToken: string;
  email: string;
  source: RegistrationAuthSource;
  name?: string;
  pictureUrl?: string | null;
  expiresAt?: string;
}

const STORAGE_KEY = "pending-registration";

export const savePendingRegistration = (value: PendingRegistration): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
};

export const getPendingRegistration = (): PendingRegistration | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PendingRegistration;
    if (!parsed.registrationToken || !parsed.email || !parsed.source) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const clearPendingRegistration = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(STORAGE_KEY);
};
