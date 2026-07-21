"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type FileView = "grid" | "table";

const STORAGE_KEY = "qualcloud-files-view";

function getStoredView(): FileView {
  if (typeof window === "undefined") return "grid";

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "grid" || raw === "table") return raw;
  } catch {
  }

  return "grid";
}

interface FilesViewContextValue {
  view: FileView;
  setView: (view: FileView) => void;
}

const FilesViewContext = createContext<FilesViewContextValue | null>(null);

export function FilesViewProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<FileView>("grid");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setView(getStoredView());
    setInitialized(true);

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;

      const next = event.newValue;
      if (next === "grid" || next === "table") {
        setView(next);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (!initialized) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, view);
    } catch {
    }
  }, [view, initialized]);

  return (
    <FilesViewContext.Provider value={{ view, setView }}>
      {children}
    </FilesViewContext.Provider>
  );
}

export function useFilesView() {
  const context = useContext(FilesViewContext);

  if (!context) {
    throw new Error("useFilesView must be used within FilesViewProvider");
  }

  return [context.view, context.setView] as const;
}
