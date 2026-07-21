"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Loader2, Globe, Lock, KeyRound, CalendarDays, RefreshCw, Copy, Check } from "lucide-react";
import { toast } from "@/lib/toast";
import { getFilesEditor } from "@/lib/files-editor";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateFilePublic, updateFolderPublic } from "@/app/api/files";
import type { FileDoc } from "@/config/types/components.types";
import { useTranslation } from "@/components/hooks/use-translation";
import { useOrigin } from "@/components/hooks/use-origin";
import { pages } from "@/config/routing/pages.route";

interface AccessDialogProps {
  file: FileDoc;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

function formatToDatetimeLocal(isoString?: string | null): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";

    const pad = (n: number) => n.toString().padStart(2, "0");
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());

    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  } catch {
    return "";
  }
}

export function AccessDialog({
  file,
  open,
  onOpenChange,
  onUpdated,
}: AccessDialogProps) {
  const { t } = useTranslation();
  const { user } = useUser();
  const origin = useOrigin();
  const editor = getFilesEditor(user);

  const [currentFile, setCurrentFile] = useState<FileDoc>(file);
  const [isPublic, setIsPublic] = useState(file.isPublic);
  const [password, setPassword] = useState(file.password ?? "");
  const [expiresAt, setExpiresAt] = useState(formatToDatetimeLocal(file.expiresAt));
  
  const [isLoading, setIsLoading] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setCurrentFile(file);
      setIsPublic(file.isPublic);
      setPassword(file.password ?? "");
      setExpiresAt(formatToDatetimeLocal(file.expiresAt));
    }
  }, [open, file]);

  const isFolder = currentFile.isFolder;

  // Build the share link based on the current file state (which updates when rotated)
  const getShareLink = () => {
    if (isFolder) {
      return currentFile.folderId ? pages.FOLDER.COPY(origin, currentFile.folderId) : "";
    }
    return currentFile.fileId ? pages.FILE.COPY(origin, currentFile.fileId as string) : "";
  };

  const shareLink = getShareLink();

  const handleCopyLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success(t("fileActions.copyLink"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("fileActions.copyError"));
    }
  };

  const handleSave = async (rotate = false) => {
    setIsLoading(true);
    if (rotate) {
      setIsRotating(true);
    }

    try {
      const formattedExpiry = expiresAt ? new Date(expiresAt).toISOString() : null;
      const targetPassword = password.trim() || null;

      let result: any;

      if (isFolder) {
        result = await updateFolderPublic(
          currentFile.orgId,
          isPublic,
          editor,
          currentFile.folderId ? { folder_id: currentFile.folderId } : { name: currentFile.name },
          targetPassword,
          formattedExpiry,
          rotate
        );
      } else {
        result = await updateFilePublic(
          currentFile.fileId as string,
          isPublic,
          editor,
          targetPassword,
          formattedExpiry,
          rotate
        );
      }

      // Update local file representation
      if (result) {
        let updatedFile: FileDoc;
        if (isFolder) {
          updatedFile = {
            ...currentFile,
            isPublic: result.is_public,
            folderId: result.folder_id,
            password: result.password,
            expiresAt: result.expires_at,
          };
        } else {
          updatedFile = {
            ...currentFile,
            isPublic: result.is_public,
            fileId: result.file_id,
            password: result.password,
            expiresAt: result.expires_at,
          };
        }
        setCurrentFile(updatedFile);
      }

      toast.success(t("filePreview.publicOpened"));
      
      if (!rotate) {
        onOpenChange(false);
      }
      
      onUpdated?.();
    } catch (err) {
      toast.error(t("filePreview.publicError"));
    } finally {
      setIsLoading(false);
      setIsRotating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#1e1126] text-white sm:rounded-xl max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-purple" />
            {t("fileActions.changeAccess")}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            {isFolder ? t("rename.folderDescription") : t("rename.fileDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Public / Private Toggle */}
          <div className="flex items-center justify-between rounded-xl bg-white/5 p-4 border border-white/5">
            <div className="space-y-0.5">
              <Label className="text-white font-medium text-sm">
                {t("filePreview.access")}
              </Label>
              <p className="text-xs text-white/50">
                {isPublic ? t("filePreview.public") : t("filePreview.private")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={isPublic ? "default" : "outline"}
                className={isPublic ? "bg-purple hover:bg-purple/90 text-white" : "border-white/10 text-white hover:bg-white/5"}
                onClick={() => setIsPublic(true)}
              >
                <Globe className="mr-1.5 h-4 w-4" /> {t("filePreview.public")}
              </Button>
              <Button
                type="button"
                variant={!isPublic ? "default" : "outline"}
                className={!isPublic ? "bg-purple hover:bg-purple/90 text-white" : "border-white/10 text-white hover:bg-white/5"}
                onClick={() => {
                  setIsPublic(false);
                  setPassword("");
                  setExpiresAt("");
                }}
              >
                <Lock className="mr-1.5 h-4 w-4" /> {t("filePreview.private")}
              </Button>
            </div>
          </div>

          {/* Conditional settings for Public access */}
          {isPublic && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Password configuration */}
              <div className="grid gap-1.5">
                <Label htmlFor="access-password" className="text-white/80 flex items-center gap-1.5">
                  <KeyRound className="h-4 w-4 text-purple" />
                  Пароль (необязательно)
                </Label>
                <Input
                  id="access-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Задайте пароль для доступа"
                  disabled={isLoading}
                  className="border-white/10 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-purple"
                />
              </div>

              {/* Expiry datetime configuration */}
              <div className="grid gap-1.5">
                <Label htmlFor="access-expires" className="text-white/80 flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-purple" />
                  Доступ открыт до (необязательно)
                </Label>
                <Input
                  id="access-expires"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  disabled={isLoading}
                  className="border-white/10 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-purple [color-scheme:dark]"
                />
              </div>

              {/* Share link and Regenerate section */}
              {shareLink && (
                <div className="space-y-2 rounded-xl bg-white/5 p-3 border border-white/5">
                  <Label className="text-xs text-white/50">Ссылка для доступа</Label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={shareLink}
                      className="border-white/10 bg-black/20 text-white/80 text-xs focus-visible:ring-transparent"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={handleCopyLink}
                      className="border-white/10 hover:bg-white/10 text-white bg-transparent shrink-0"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => handleSave(true)}
                      disabled={isLoading}
                      title="Перегенерировать ID доступа"
                      className="border-white/10 hover:bg-white/10 text-white bg-transparent shrink-0"
                    >
                      {isRotating ? (
                        <Loader2 className="h-4 w-4 animate-spin text-purple" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="border-white/10 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            {t("rename.cancel")}
          </Button>
          <Button
            onClick={() => handleSave(false)}
            disabled={isLoading}
            className="bg-purple hover:bg-purple/90 text-white"
          >
            {isLoading && !isRotating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {t("rename.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
