"use client";

import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { FileIcon, Loader2, Upload, X } from "lucide-react";
import { toast } from "@/lib/toast";
import Image from "next/image";

import { uploadFile, uploadMultipleFiles } from "@/app/api/files";
import { getFilesEditor } from "@/lib/files-editor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useFilesRefresh } from "@/components/context/files-refresh-context";
import { FolderTree } from "@/app/dashboard/_components/folder-tree";
import { FILE_SIZE_LABELS } from "@/config/const/files.const";

interface UploadFile {
  id: string;
  file: File;
}

interface UploadDialogProps {
  children?: React.ReactNode;
  account_id?: string;
  folder?: string | null;
  onUploadComplete?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialFiles?: File[];
  autoStart?: boolean;
}

export function UploadDialog({
  children,
  account_id: accountIdProp,
  folder: folderProp,
  onUploadComplete,
  open,
  onOpenChange,
  initialFiles,
  autoStart = false,
}: UploadDialogProps) {
  const { user } = useUser();
  const { refreshFiles } = useFilesRefresh();
  const isOpenControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(open ?? false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [folder, setFolder] = useState<string>(folderProp ?? "/");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<Record<string, string>>({});

  const isOpen = isOpenControlled ? open : internalOpen;

  const setIsOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isOpenControlled) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isOpenControlled, onOpenChange]
  );

  const account_id = accountIdProp ?? user?.id;
  const editor = getFilesEditor(user);

  useEffect(() => {
    return () => {
      Object.values(previewUrlsRef.current).forEach(URL.revokeObjectURL);
      previewUrlsRef.current = {};
    };
  }, []);

  const addFiles = useCallback((incoming: File[] | FileList | null) => {
    if (!incoming) return;

    const array = Array.isArray(incoming) ? incoming : Array.from(incoming);
    if (array.length === 0) return;

    const newFiles: UploadFile[] = array.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      file,
    }));

    newFiles.forEach((item) => {
      if (item.file.type.startsWith("image/")) {
        previewUrlsRef.current[item.id] = URL.createObjectURL(item.file);
      }
    });

    setFiles((current) => [...current, ...newFiles]);
  }, []);

  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      addFiles(initialFiles);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFiles]);

  const removeFile = useCallback((id: string) => {
    setFiles((current) => current.filter((item) => item.id !== id));
    if (previewUrlsRef.current[id]) {
      URL.revokeObjectURL(previewUrlsRef.current[id]);
      delete previewUrlsRef.current[id];
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      addFiles(event.dataTransfer.files);
    },
    [addFiles]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      addFiles(event.target.files);
      event.target.value = "";
    },
    [addFiles]
  );

  const resetUpload = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setFiles([]);
    Object.values(previewUrlsRef.current).forEach(URL.revokeObjectURL);
    previewUrlsRef.current = {};
    setFolder(folderProp ?? "/");
  }, [folderProp]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setIsOpen(nextOpen);
      if (!nextOpen && isOpenControlled) {
        resetUpload();
      }
    },
    [setIsOpen, resetUpload, isOpenControlled]
  );

  const handleUpload = useCallback(async () => {
    if (files.length === 0) {
      toast.error("Выберите файлы для загрузки");
      return;
    }

    if (!account_id) {
      toast.error("Не удалось определить аккаунт");
      return;
    }

    setIsUploading(true);
    setProgress(0);

    const targetFolder = folder === "/" ? null : folder;

    const progressInterval = setInterval(() => {
      setProgress((current) => {
        if (current >= 90) {
          return current;
        }
        return current + 10;
      });
    }, 200);

    try {
      if (files.length === 1) {
        await uploadFile(account_id, files[0].file, targetFolder, editor);
      } else {
        await uploadMultipleFiles(
          account_id,
          files.map((item) => item.file),
          targetFolder,
          editor
        );
      }

      setProgress(100);
      toast.success(
        files.length === 1
          ? `Файл «${files[0].file.name}» успешно загружен`
          : `Успешно загружено ${files.length} файлов`
      );
      handleOpenChange(false);
      refreshFiles();
      onUploadComplete?.();
    } catch {
      toast.error("Не удалось загрузить файлы");
    } finally {
      clearInterval(progressInterval);
      setIsUploading(false);
    }
  }, [files, account_id, folder, handleOpenChange, refreshFiles, onUploadComplete, editor]);

  const handleUploadRef = useRef(handleUpload);
  useEffect(() => {
    handleUploadRef.current = handleUpload;
  }, [handleUpload]);

  useEffect(() => {
    if (autoStart && isOpen && files.length > 0 && !isUploading && account_id) {
      handleUploadRef.current();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, isOpen, files.length, isUploading, account_id]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Б";
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${FILE_SIZE_LABELS[i]}`;
  };

  const getFilePreviewUrl = (id: string) => previewUrlsRef.current[id] || null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-md border-white/10 bg-[#1e1126] text-white sm:rounded-xl">
        <DialogHeader>
          <DialogTitle>Загрузить файлы</DialogTitle>
          <DialogDescription className="text-white/60">
            Выберите файлы или перетащите их в область ниже.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 transition-colors",
              isDragging
                ? "border-purple bg-purple/10"
                : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
              <Upload className="h-6 w-6 text-purple" />
            </div>
            <div className="text-center text-sm text-white/70">
              <span className="font-medium text-white">Нажмите</span> или перетащите файлы сюда
            </div>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleInputChange}
            />
          </div>

          {files.length > 0 && (
            <div className="grid gap-2">
              <Label className="text-sm text-white/80">Выбранные файлы</Label>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-1">
                <div className="flex flex-col gap-1">
                  {files.map((item) => {
                    const preview = getFilePreviewUrl(item.id);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/[0.04]"
                      >
                        {preview ? (
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10">
                            <Image
                              src={preview}
                              alt={item.file.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <FileIcon className="h-5 w-5 shrink-0 text-purple" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-white" title={item.file.name}>
                            {item.file.name}
                          </div>
                          <div className="text-xs text-white/50">{formatSize(item.file.size)}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(item.id)}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                          aria-label="Удалить файл"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label className="text-sm text-white/80">Папка назначения</Label>
            <FolderTree
              account_id={account_id}
              value={folder}
              onChange={setFolder}
            />
          </div>
        </div>

        {isUploading && (
          <div className="grid gap-2">
            <div className="flex justify-between text-xs text-white/70">
              <span>Загрузка...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-purple transition-all duration-200 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => {
              if (isUploading) return;
              handleOpenChange(false);
              setFiles([]);
              setProgress(0);
            }}
            disabled={isUploading}
            className="border-white/10 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            Отмена
          </Button>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading || !account_id}
            className="bg-purple hover:bg-purple/90"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Загрузка...
              </>
            ) : (
              "Загрузить"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
