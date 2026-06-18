"use client";

import { useEffect, useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "@/lib/toast";

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
import { renameFile, renameFolder } from "@/app/api/files";
import type { FileDoc } from "@/config/types/components.types";

interface RenameDialogProps {
  file: FileDoc;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRenamed?: () => void;
}

export function RenameDialog({
  file,
  open,
  onOpenChange,
  onRenamed,
}: RenameDialogProps) {
  const isFolder = file.isFolder;
  const originalName = isFolder
    ? file.displayName ?? file.name ?? ""
    : file.name ?? "";
  const [newName, setNewName] = useState(originalName);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setNewName(originalName);
    }
  }, [open, originalName]);

  const buildFolderPath = (baseName: string): string => {
    if (!file.folder) return baseName;
    return `${file.folder}/${baseName}`;
  };

  const handleRename = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      toast.error(isFolder ? "Введите название папки" : "Введите название файла");
      return;
    }

    const targetName = isFolder ? buildFolderPath(trimmed) : trimmed;

    if (targetName === file.name) {
      onOpenChange(false);
      return;
    }

    setIsLoading(true);
    try {
      const promise = isFolder
        ? renameFolder(file.orgId, file.name, targetName)
        : renameFile(file._id as string, trimmed);

      await toast.promise(promise, {
        loading: isFolder ? "Переименовываем папку…" : "Переименовываем файл…",
        success: isFolder ? "Папка переименована" : "Файл переименован",
        error: isFolder
          ? "Не удалось переименовать папку"
          : "Не удалось переименовать файл",
      });

      onOpenChange(false);
      onRenamed?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#1e1126] text-white sm:rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            {isFolder ? "Переименовать папку" : "Переименовать файл"}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            {isFolder
              ? "Введите новое название для папки."
              : "Введите новое название для файла."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="rename-file-name" className="text-white/80">
              Новое название
            </Label>
            <Input
              id="rename-file-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Новое название файла"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleRename();
                }
              }}
              className="border-white/10 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-purple"
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
            onClick={handleRename}
            disabled={!newName.trim() || isLoading}
            className="bg-purple hover:bg-purple/90"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
