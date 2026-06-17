"use client";

import { useCallback, useRef, useState } from "react";
import { FileIcon, Upload, X } from "lucide-react";
import { toast } from "react-hot-toast";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface UploadFile {
  id: string;
  file: File;
}

const folders = [{ value: "/", label: "/" }] as const;

export function UploadDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [folder, setFolder] = useState<string>("/");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;

    const newFiles: UploadFile[] = Array.from(incoming).map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      file,
    }));

    setFiles((current) => [...current, ...newFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((current) => current.filter((item) => item.id !== id));
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
    setFolder("/");
  }, []);

  const handleUpload = useCallback(() => {
    if (files.length === 0) {
      toast.error("Выберите файлы для загрузки");
      return;
    }

    setIsUploading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          clearInterval(interval);
          return 100;
        }
        return current + 10;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);

      setTimeout(() => {
        toast.success(
          files.length === 1
            ? `Файл «${files[0].file.name}» успешно загружен`
            : `Успешно загружено ${files.length} файлов`
        );
        setOpen(false);
        resetUpload();
      }, 400);
    }, 2400);
  }, [files, resetUpload]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Б";
    const k = 1024;
    const sizes = ["Б", "КБ", "МБ", "ГБ"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
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
                  {files.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/[0.04]"
                    >
                      <FileIcon className="h-4 w-4 shrink-0 text-purple" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm text-white">{item.file.name}</div>
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
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="upload-folder" className="text-sm text-white/80">
              Папка назначения
            </Label>
            <Select value={folder} onValueChange={setFolder}>
              <SelectTrigger
                id="upload-folder"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#211428] text-white">
                {folders.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="focus:bg-white/10"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              setOpen(false);
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
            disabled={files.length === 0 || isUploading}
            className="bg-purple hover:bg-purple/90"
          >
            {isUploading ? "Загрузка..." : "Загрузить"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
