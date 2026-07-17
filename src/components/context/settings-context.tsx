"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { isLanguage, type Language } from "@/config/i18n";
import { isPwa } from "@/components/hooks/use-is-pwa";
import {
  COOKIE_REDIRECT_HOME,
  setCookie,
} from "@/lib/pwa-cookies";

const STORAGE_KEY = "qualcloud-settings";

interface SettingsState {
  redirectHomeToDashboard: boolean;
  language: Language;
  timezone: string;
}

const DEFAULT_SETTINGS: SettingsState = {
  redirectHomeToDashboard: true,
  language: "ru",
  timezone: "UTC",
};

function getStoredSettings(): SettingsState {
  const systemTimeZone = typeof window !== "undefined"
    ? (Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC")
    : "UTC";
  const defaultWithSystemTz = { ...DEFAULT_SETTINGS, timezone: systemTimeZone };

  if (typeof window === "undefined") return defaultWithSystemTz;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SettingsState>;
      const settings = { ...defaultWithSystemTz, ...parsed };
      if (!isLanguage(settings.language)) {
        settings.language = defaultWithSystemTz.language;
      }
      return settings;
    }
  } catch {
  }

  return defaultWithSystemTz;
}

interface SettingsContextValue extends SettingsState {
  initialized: boolean;
  setRedirectHomeToDashboard: (value: boolean) => void;
  setLanguage: (value: Language) => void;
  setTimezone: (value: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setSettings(getStoredSettings());
    setInitialized(true);

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      setSettings(getStoredSettings());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (!initialized) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
    }

    setCookie(COOKIE_REDIRECT_HOME, isPwa() ? "true" : String(settings.redirectHomeToDashboard));
  }, [settings, initialized]);

  const setRedirectHomeToDashboard = (value: boolean) => {
    setSettings((prev) => ({ ...prev, redirectHomeToDashboard: value }));
  };

  const setLanguage = (value: Language) => {
    setSettings((prev) => ({ ...prev, language: value }));
  };

  const setTimezone = (value: string) => {
    setSettings((prev) => ({ ...prev, timezone: value }));
  };

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        initialized,
        setRedirectHomeToDashboard,
        setLanguage,
        setTimezone,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }

  return context;
}
