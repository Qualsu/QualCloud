"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface FilesRefreshContextValue {
  refreshKey: number;
  refreshFiles: () => void;
  currentFolder: string | null;
  setCurrentFolder: (folder: string | null) => void;
}

const FilesRefreshContext = createContext<FilesRefreshContextValue | null>(
  null
);

export function FilesRefreshProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  const refreshFiles = () => {
    setRefreshKey((key) => key + 1);
  };

  return (
    <FilesRefreshContext.Provider value={{ refreshKey, refreshFiles, currentFolder, setCurrentFolder }}>
      {children}
    </FilesRefreshContext.Provider>
  );
}

export function useFilesRefresh() {
  const context = useContext(FilesRefreshContext);

  if (!context) {
    throw new Error(
      "useFilesRefresh must be used within FilesRefreshProvider"
    );
  }

  return context;
}
