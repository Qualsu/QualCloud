"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "qualcloud-settings";

interface SettingsState {
  redirectHomeToDashboard: boolean;
}

const DEFAULT_SETTINGS: SettingsState = {
  redirectHomeToDashboard: true,
};

function getStoredSettings(): SettingsState {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SettingsState>;
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    // localStorage может быть недоступен или данные повреждены
  }

  return DEFAULT_SETTINGS;
}

interface SettingsContextValue extends SettingsState {
  initialized: boolean;
  setRedirectHomeToDashboard: (value: boolean) => void;
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
      // игнорируем ошибки записи
    }
  }, [settings, initialized]);

  const setRedirectHomeToDashboard = (value: boolean) => {
    setSettings((prev) => ({ ...prev, redirectHomeToDashboard: value }));
  };

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        initialized,
        setRedirectHomeToDashboard,
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
