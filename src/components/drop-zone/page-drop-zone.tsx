"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";

import { UploadDialog } from "@/components/dialog/upload-dialog";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/components/hooks/use-translation";

interface PageDropZoneProps {
  children: React.ReactNode;
}

export function PageDropZone({ children }: PageDropZoneProps) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState<File[] | null>(null);
  const dragCounter = useRef(0);
  const dialogOpenRef = useRef(dialogOpen);

  useEffect(() => {
    dialogOpenRef.current = dialogOpen;
  }, [dialogOpen]);

  const handleDragEnter = useCallback((event: DragEvent) => {
    event.preventDefault();
    if (dialogOpenRef.current) return;
    if (event.dataTransfer?.types.includes("Files")) {
      dragCounter.current += 1;
      setIsDragging(true);
    }
  }, []);

  const handleDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDragLeave = useCallback((event: DragEvent) => {
    event.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((event: DragEvent) => {
    event.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    if (dialogOpenRef.current) return;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      setDroppedFiles(Array.from(files));
      setDialogOpen(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, [handleDragEnter, handleDragOver, handleDragLeave, handleDrop]);

  const handleDialogOpenChange = useCallback((nextOpen: boolean) => {
    setDialogOpen(nextOpen);
    if (!nextOpen) {
      setDroppedFiles(null);
    }
  }, []);

  return (
    <>
      {children}

      {isDragging && (
        <div className="fixed inset-0 z-[100] flex animate-in fade-in items-center justify-center bg-black/80 backdrop-blur-sm duration-200">
          <div
            className={cn(
              "flex h-[min(28rem,80vw)] w-[min(28rem,80vw)] flex-col items-center justify-center rounded-3xl border-4 border-dashed border-purple bg-purple/10 p-8 text-center transition-transform duration-200",
              isDragging && "scale-105"
            )}
          >
            <Upload className="h-24 w-24 text-purple" />
            <p className="mt-6 text-2xl font-semibold text-white">
              {t("upload.dropHere")}
            </p>
            <p className="mt-2 text-sm text-white/60">
              {t("upload.dropHint")}
            </p>
          </div>
        </div>
      )}

      <UploadDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        initialFiles={droppedFiles ?? undefined}
      />
    </>
  );
}
