"use client";

import { useState } from "react";
import { FolderPlus, Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFolder } from "@/app/api/files";

interface CreateFolderDialogProps {
  account_id?: string;
  parent?: string | null;
  onCreated?: () => void;
}

export function CreateFolderDialog({
  account_id,
  parent,
  onCreated,
}: CreateFolderDialogProps) {
  const [open, setOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    const trimmed = folderName.trim();
    if (!trimmed || !account_id) return;

    setIsLoading(true);
    try {
      await toast.promise(
        createFolder(account_id, trimmed, parent ?? null),
        {
          loading: "Создание папки…",
          success: `Папка «${trimmed}» создана`,
          error: "Не удалось создать папку",
        },
      );
      setFolderName("");
      setOpen(false);
      onCreated?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 gap-2 rounded-xl">
          <FolderPlus size={16} />
          Создать
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-[#1e1126] text-white sm:rounded-xl">
        <DialogHeader>
          <DialogTitle>
            {parent ? `Создать папку в «${parent}»` : "Создать папку"}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            {parent
              ? "Введите название для новой вложенной папки."
              : "Введите название для новой папки."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="folder-name" className="text-white/80">
              Название папки
            </Label>
            <Input
              id="folder-name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Например, Документы"
              className="border-white/10 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-purple"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
            className="border-white/10 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            Отмена
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!folderName.trim() || !account_id || isLoading}
            className="bg-purple hover:bg-purple/90"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Создать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
