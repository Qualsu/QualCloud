"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslation } from "@/components/hooks/use-translation";

interface UploadItem {
  id: string;
  fileNames: string[];
  progress: number;
  status: "uploading" | "completed" | "error";
  errorMessage?: string;
  leaving: boolean;
  visible: boolean;
}

interface UploadProgressContextValue {
  registerUpload: (fileNames: string[]) => string;
  updateProgress: (id: string, progress: number) => void;
  completeUpload: (id: string) => void;
  failUpload: (id: string, message: string) => void;
  showUploadToast: (id: string) => void;
}

const UploadProgressContext = createContext<UploadProgressContextValue | null>(
  null
);

export function useUploadProgress() {
  const context = useContext(UploadProgressContext);
  if (!context) {
    throw new Error(
      "useUploadProgress must be used within UploadProgressProvider"
    );
  }
  return context;
}

const AUTO_HIDE_DELAY = 1500;

function UploadToastItem({
  upload,
  onDismiss,
}: {
  upload: UploadItem;
  onDismiss: (id: string) => void;
}) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (upload.status === "completed" || upload.status === "error") {
      const timer = setTimeout(() => onDismiss(upload.id), AUTO_HIDE_DELAY);
      return () => clearTimeout(timer);
    }
  }, [upload.status, upload.id, onDismiss]);

  return (
    <div
      className={[
        "rounded-xl border border-white/10 bg-[#281c28]/95 px-4 py-3 shadow-lg backdrop-blur-xl",
        "transition-all duration-500 ease-out",
        mounted && !upload.leaving
          ? "translate-y-0 opacity-100"
          : "translate-y-3 opacity-0",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        {upload.status === "uploading" && (
          <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-purple" />
        )}
        {upload.status === "completed" && (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
        )}
        {upload.status === "error" && (
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-medium text-white">
              {upload.fileNames.length === 1
                ? upload.fileNames[0]
                : t("upload.filesCount", { count: upload.fileNames.length })}
            </span>
            <button
              type="button"
              onClick={() => onDismiss(upload.id)}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-white/40 transition-colors hover:text-white"
              aria-label={t("upload.close")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          {upload.status === "uploading" && (
            <div className="mt-2">
              <div className="flex items-center justify-between gap-2 text-xs text-white/50">
                <span>{t("upload.uploading")}</span>
                <span>{upload.progress}%</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-purple transition-all duration-300 ease-out"
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
            </div>
          )}
          {upload.status === "completed" && (
            <div className="mt-1 text-xs text-green-400">
              {t("upload.progressCompleted")}
            </div>
          )}
          {upload.status === "error" && (
            <div className="mt-1 text-xs text-red-400">
              {upload.errorMessage || t("upload.progressError")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function animateOut(
  setUploads: React.Dispatch<React.SetStateAction<UploadItem[]>>,
  id: string
) {
  setUploads((prev) =>
    prev.map((u) => (u.id === id ? { ...u, leaving: true } : u))
  );
  setTimeout(() => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  }, 500);
}

export function UploadProgressProvider({ children }: { children: ReactNode }) {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const idCounter = useRef(0);

  const registerUpload = useCallback((fileNames: string[]) => {
    const id = `upload-${++idCounter.current}`;
    setUploads((prev) => [
      ...prev,
      {
        id,
        fileNames,
        progress: 0,
        status: "uploading",
        leaving: false,
        visible: false,
      },
    ]);
    return id;
  }, []);

  const showUploadToast = useCallback((id: string) => {
    setUploads((prev) =>
      prev.map((u) => (u.id === id ? { ...u, visible: true } : u))
    );
  }, []);

  const updateProgress = useCallback((id: string, progress: number) => {
    setUploads((prev) =>
      prev.map((u) => (u.id === id ? { ...u, progress } : u))
    );
  }, []);

  const completeUpload = useCallback((id: string) => {
    setUploads((prev) => {
      const item = prev.find((u) => u.id === id);
      if (!item) return prev;
      if (!item.visible) {
        return prev.filter((u) => u.id !== id);
      }
      return prev.map((u) =>
        u.id === id
          ? { ...u, progress: 100, status: "completed", leaving: false }
          : u
      );
    });
  }, []);

  const failUpload = useCallback((id: string, message: string) => {
    setUploads((prev) => {
      const item = prev.find((u) => u.id === id);
      if (!item) return prev;
      if (!item.visible) {
        return prev.filter((u) => u.id !== id);
      }
      return prev.map((u) =>
        u.id === id
          ? { ...u, status: "error", errorMessage: message, leaving: false }
          : u
      );
    });
  }, []);

  const dismissUpload = useCallback((id: string) => {
    animateOut(setUploads, id);
  }, []);

  return (
    <UploadProgressContext.Provider
      value={{
        registerUpload,
        updateProgress,
        completeUpload,
        failUpload,
        showUploadToast,
      }}
    >
      {children}
      {uploads.some((u) => u.visible || u.leaving) && (
        <div className="fixed bottom-4 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
          {uploads
            .filter((u) => u.visible || u.leaving)
            .map((upload) => (
              <UploadToastItem
                key={upload.id}
                upload={upload}
                onDismiss={dismissUpload}
              />
            ))}
        </div>
      )}
    </UploadProgressContext.Provider>
  );
}
