"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FileIcon, Loader2, Upload, X, FolderPlus } from "lucide-react";
import { toast } from "@/lib/toast";
import Image from "next/image";

import { uploadFile, uploadMultipleFiles, createFolder } from "@/app/api/files";
import { getFilesFromDataTransferItems } from "@/lib/upload-utils";
import { getFilesEditor } from "@/lib/files-editor";
import { useCurrentOrg } from "@/components/hooks/use-current-org";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useUploadProgress } from "@/components/context/upload-progress-context";
import { pages } from "@/config/routing/pages.route";
import { FolderTree } from "@/app/dashboard/_components/folder-tree";
import { FILE_SIZE_LABELS } from "@/config/const/files.const";
import { useTranslation } from "@/components/hooks/use-translation";

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
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const currentOrg = useCurrentOrg();
  const { refreshFiles, currentFolder, setCurrentFolder } = useFilesRefresh();
  const isOpenControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(open ?? false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [folder, setFolder] = useState<string>(folderProp ?? currentFolder ?? "/");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolderLoading, setIsCreatingFolderLoading] = useState(false);
  const [treeRefreshTrigger, setTreeRefreshTrigger] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<Record<string, string>>({});
  const uploadTrackIdRef = useRef<string | null>(null);
  const dialogClosedDuringUpload = useRef(false);
  const { registerUpload, updateProgress, completeUpload, failUpload, showUploadToast } =
    useUploadProgress();

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

  const account_id = accountIdProp ?? currentOrg.orgId;
  const editor = getFilesEditor(user);

  useEffect(() => {
    return () => {
      Object.values(previewUrlsRef.current).forEach(URL.revokeObjectURL);
      previewUrlsRef.current = {};
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__qualcloud_upload_dialog_open = !!isOpen;
    }
    if (isOpen) {
      router.prefetch(pages.DASHBOARD.CLOUD);
    }
    return () => {
      if (typeof window !== "undefined") {
        (window as any).__qualcloud_upload_dialog_open = false;
      }
    };
  }, [isOpen, router]);

  useEffect(() => {
    if (!isUploading) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isUploading]);

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
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const droppedFiles = await getFilesFromDataTransferItems(event.dataTransfer.items);
      addFiles(droppedFiles);
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
    setFolder(folderProp ?? currentFolder ?? "/");
    setIsCreatingFolder(false);
    setNewFolderName("");
  }, [folderProp, currentFolder]);

  const handleInlineCreateFolder = useCallback(async () => {
    const trimmed = newFolderName.trim();
    if (!trimmed || !account_id) return;

    setIsCreatingFolderLoading(true);
    const parentPath = folder === "/" ? null : folder;
    try {
      await toast.promise(
        createFolder(account_id, trimmed, parentPath, editor),
        {
          loading: t("createFolder.loading"),
          success: t("createFolder.success", { name: trimmed }),
          error: (err: any) => {
            if (err?.response?.status === 409) {
              return t("createFolder.alreadyExists") || "Папка с таким названием уже существует";
            }
            const detail = err?.response?.data?.detail || err?.response?.data?.message || err?.response?.data?.error;
            if (detail && typeof detail === "string") {
              const lowerDetail = detail.toLowerCase();
              if (lowerDetail.includes("already exists") || lowerDetail.includes("already exist") || lowerDetail.includes("exists")) {
                return t("createFolder.alreadyExists") || "Папка с таким названием уже существует";
              }
              return detail;
            }
            return t("createFolder.error");
          }
        }
      );
      const newPath = parentPath ? `${parentPath}/${trimmed}` : trimmed;
      setFolder(newPath);
      setNewFolderName("");
      setIsCreatingFolder(false);
      setTreeRefreshTrigger((prev) => prev + 1);
    } catch {
      // handled by toast
    } finally {
      setIsCreatingFolderLoading(false);
    }
  }, [newFolderName, account_id, folder, editor, t]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setIsOpen(nextOpen);
      if (!nextOpen) {
        if (uploadTrackIdRef.current !== null) {
          dialogClosedDuringUpload.current = true;
          showUploadToast(uploadTrackIdRef.current);
        } else {
          resetUpload();
        }
      }
    },
    [setIsOpen, resetUpload, showUploadToast]
  );

  const handleUpload = useCallback(async () => {
    if (files.length === 0) {
      toast.error(t("upload.noFiles"));
      return;
    }

    if (!account_id) {
      toast.error(t("upload.noAccount"));
      return;
    }

    const trackId = registerUpload(files.map((f) => f.file.name));
    uploadTrackIdRef.current = trackId;

    setIsUploading(true);
    setProgress(0);

    const targetFolder = folder === "/" ? null : folder;

    const progressInterval = setInterval(() => {
      setProgress((current) => {
        const next = current >= 90 ? current : current + 10;
        updateProgress(trackId, next);
        return next;
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
      updateProgress(trackId, 100);
      completeUpload(trackId);
      if (!dialogClosedDuringUpload.current) {
        toast.success(
          files.length === 1
            ? t("upload.singleSuccess", { name: files[0].file.name })
            : t("upload.multipleSuccess", { count: files.length })
        );
      }
      setFiles([]);
      Object.values(previewUrlsRef.current).forEach(URL.revokeObjectURL);
      previewUrlsRef.current = {};
      handleOpenChange(false);
      setCurrentFolder(folder === "/" ? null : folder);
      if (pathname !== pages.DASHBOARD.CLOUD) {
        router.push(pages.DASHBOARD.CLOUD);
      }
      refreshFiles();
      onUploadComplete?.();
    } catch {
      if (!dialogClosedDuringUpload.current) {
        toast.error(t("upload.error"));
      }
      failUpload(trackId, t("upload.error"));
    } finally {
      clearInterval(progressInterval);
      setIsUploading(false);
      uploadTrackIdRef.current = null;
      dialogClosedDuringUpload.current = false;
    }
  }, [files, account_id, folder, handleOpenChange, refreshFiles, setCurrentFolder, router, pathname, onUploadComplete, editor, registerUpload, updateProgress, completeUpload, failUpload, t]);

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

  const getSizeLabel = (label: (typeof FILE_SIZE_LABELS)[number]) => {
    switch (label) {
      case "Б": return t("units.b");
      case "КБ": return t("units.kb");
      case "МБ": return t("units.mb");
      case "ГБ": return t("units.gb");
      case "ТБ": return t("units.tb");
      default: return label;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return `0 ${t("units.b")}`;
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${getSizeLabel(FILE_SIZE_LABELS[i])}`;
  };

  const getFilePreviewUrl = (id: string) => previewUrlsRef.current[id] || null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-md border-white/10 bg-[#1e1126] text-white sm:rounded-xl">
        <DialogHeader>
          <DialogTitle>{t("upload.title")}</DialogTitle>
          <DialogDescription className="text-white/60">
            {t("upload.description")}
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
              {t("upload.clickOrDrop", { click: t("upload.click") })}
            </div>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleInputChange}
            />
            <input
              ref={folderInputRef}
              type="file"
              multiple
              // @ts-expect-error - webkitdirectory is standard but often missing in TS React types
              webkitdirectory=""
              className="hidden"
              onChange={handleInputChange}
            />
          </div>

          {files.length > 0 && (
            <div className="grid gap-2">
              <Label className="text-sm text-white/80">{t("upload.selectedFiles")}</Label>
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
                          aria-label={t("upload.removeFile")}
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
            <div className="flex items-center justify-between">
              <Label className="text-sm text-white/80">{t("upload.destinationFolder")}</Label>
              {!isCreatingFolder && (
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-xs text-purple hover:text-purple/80"
                  onClick={() => setIsCreatingFolder(true)}
                >
                  <FolderPlus className="mr-1 h-3.5 w-3.5" />
                  {t("createFolder.create")}
                </Button>
              )}
            </div>

            {isCreatingFolder && (
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2">
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder={t("createFolder.placeholder") || "e.g. Documents"}
                  className="h-8 flex-1 border-white/10 bg-white/5 text-xs text-white placeholder:text-white/40 focus-visible:ring-purple"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      handleInlineCreateFolder();
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsCreatingFolder(false);
                      setNewFolderName("");
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInlineCreateFolder();
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  disabled={isCreatingFolderLoading || !newFolderName.trim()}
                  className="h-8 bg-purple hover:bg-purple/90 px-3 text-xs"
                >
                  {isCreatingFolderLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    t("createFolder.create")
                  )}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCreatingFolder(false);
                    setNewFolderName("");
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  disabled={isCreatingFolderLoading}
                  className="h-8 border-white/10 bg-transparent text-xs text-white hover:bg-white/10"
                >
                  {t("createFolder.cancel")}
                </Button>
              </div>
            )}

            <FolderTree
              refreshTrigger={treeRefreshTrigger}
              account_id={account_id}
              value={folder}
              onChange={setFolder}
            />
          </div>
        </div>

        {isUploading && (
          <div className="grid gap-2">
            <div className="flex justify-between text-xs text-white/70">
              <span>{t("upload.uploading")}</span>
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
            {t("upload.cancel")}
          </Button>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading || !account_id}
            className="bg-purple hover:bg-purple/90"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("upload.uploading")}
              </>
            ) : (
              t("upload.upload")
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
