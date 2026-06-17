"use client";

import { useState } from "react";
import { FolderPlus } from "lucide-react";
import { toast } from "react-hot-toast";

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

export function CreateFolderDialog() {
  const [open, setOpen] = useState(false);
  const [folderName, setFolderName] = useState("");

  const handleCreate = () => {
    const trimmed = folderName.trim();
    if (!trimmed) return;

    toast.success(`Папка «${trimmed}» создана`);
    setFolderName("");
    setOpen(false);
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
          <DialogTitle>Создать папку</DialogTitle>
          <DialogDescription className="text-white/60">
            Введите название для новой папки.
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
            className="border-white/10 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            Отмена
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!folderName.trim()}
            className="bg-purple hover:bg-purple/90"
          >
            Создать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
