"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";
import { Loader2, FolderInput } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { moveFile, moveFolder } from "@/app/api/files";
import { FolderTree } from "@/app/dashboard/_components/folder-tree";
import type { FileDoc } from "@/config/types/components.types";
import { useTranslation } from "@/components/hooks/use-translation";

interface MoveToFolderDialogProps {
  file?: FileDoc;
  files?: FileDoc[];
  currentFolder?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMoved?: () => void;
}

export function MoveToFolderDialog({
    file,
    files,
    currentFolder,
    open,
    onOpenChange,
    onMoved,
}: MoveToFolderDialogProps) {
    const { t } = useTranslation();
    const { user } = useUser();
    const editor = getFilesEditor(user);
    const [selectedPath, setSelectedPath] = useState<string>(
        currentFolder ?? "/"
    );
  const [isLoading, setIsLoading] = useState(false);

  const items = useMemo(() => {
    if (files && files.length > 0) return files;
    return file ? [file] : [];
  }, [file, files]);

  const isSingleFolder = items.length === 1 && items[0].isFolder;
  const count = items.length;

  const initialFolder = useMemo(() => {
    if (currentFolder !== undefined) return currentFolder ?? "/";
    const folders = new Set(items.map((item) => item.folder ?? ""));
    if (folders.size === 1) {
      const only = Array.from(folders)[0];
      return only === "" ? "/" : only;
    }
    return "/";
  }, [currentFolder, items]);

  const selectedFolderPaths = useMemo(
    () => items.filter((item) => item.isFolder).map((item) => item.name),
    [items]
  );

  useEffect(() => {
    if (open) {
      setSelectedPath(initialFolder);
      setIsLoading(false);
    }
  }, [open, initialFolder]);

  const handleMove = async () => {
    const targetFolder = selectedPath === "/" ? null : selectedPath;

    setIsLoading(true);
    try {
      const promises = items.map(async (item) => {
      if (item.isFolder) {
        return moveFolder(item.orgId, item.name, targetFolder, editor);
      }
      return moveFile(item._id as string, targetFolder, editor);
    });

    const results = await Promise.allSettled(promises);
    const failed = results.filter((r) => r.status === "rejected").length;

    if (failed === 0) {
      toast.success(
        count === 1
          ? isSingleFolder
            ? t("moveToFolder.folderMoved")
            : t("moveToFolder.fileMoved")
          : t("moveToFolder.multipleMoved", { count })
      );
      onOpenChange(false);
      onMoved?.();
    } else {
      toast.error(
        t("moveToFolder.error", { failed, count })
      );
    }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#1e1126] text-white sm:rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderInput className="h-4 w-4" />
            {count > 1
              ? t("moveToFolder.multipleTitle", { count })
              : isSingleFolder
              ? t("moveToFolder.singleFolderTitle")
              : t("moveToFolder.singleFileTitle")}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            {count > 1
              ? t("moveToFolder.multipleDescription")
              : isSingleFolder
              ? t("moveToFolder.singleFolderDescription")
              : t("moveToFolder.singleFileDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label className="text-white/80">{t("moveToFolder.destination")}</Label>
            <FolderTree
              account_id={items[0]?.orgId}
              value={selectedPath}
              onChange={setSelectedPath}
              disableDescendantsOf={selectedFolderPaths}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="border-white/10 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            {t("moveToFolder.cancel")}
          </Button>
          <Button
            onClick={handleMove}
            disabled={isLoading}
            className="bg-purple hover:bg-purple/90"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {t("moveToFolder.move")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
