"use client";

import { useEffect, useState } from "react";
import { Loader2, FolderInput } from "lucide-react";
import { toast } from "react-hot-toast";

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
import { FolderTree } from "./folder-tree";
import type { FileDoc } from "@/config/types/components.types";

interface MoveToFolderDialogProps {
  file: FileDoc;
  currentFolder?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMoved?: () => void;
}

export function MoveToFolderDialog({
  file,
  currentFolder,
  open,
  onOpenChange,
  onMoved,
}: MoveToFolderDialogProps) {
  const [selectedPath, setSelectedPath] = useState<string>(
    currentFolder ?? "/"
  );
  const [isLoading, setIsLoading] = useState(false);
  const isFolder = file.isFolder;

  useEffect(() => {
    if (open) {
      setSelectedPath(currentFolder ?? "/");
      setIsLoading(false);
    }
  }, [open, currentFolder]);

  const handleMove = async () => {
    const targetFolder = selectedPath === "/" ? null : selectedPath;

    if (targetFolder === (file.folder ?? null)) {
      onOpenChange(false);
      return;
    }

    setIsLoading(true);
    try {
      if (isFolder) {
        await moveFolder(file.orgId, file.name, targetFolder);
      } else {
        await moveFile(file._id as string, targetFolder);
      }

      toast.success(
        isFolder ? "Папка перемещена" : "Файл перемещён в папку"
      );
      onOpenChange(false);
      onMoved?.();
    } catch {
      toast.error(
        isFolder
          ? "Не удалось переместить папку"
          : "Не удалось переместить файл"
      );
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
            {isFolder ? "Переместить папку" : "Переместить в папку"}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            {isFolder
              ? "Выберите папку, в которую нужно переместить текущую папку."
              : "Выберите папку назначения для файла."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label className="text-white/80">Папка назначения</Label>
            <FolderTree
              account_id={file.orgId}
              value={selectedPath}
              onChange={setSelectedPath}
              disableDescendantsOf={isFolder ? file.name : undefined}
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
            Отмена
          </Button>
          <Button
            onClick={handleMove}
            disabled={isLoading}
            className="bg-purple hover:bg-purple/90"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Переместить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
