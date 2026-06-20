"use client";

import {
  Download,
  FolderInput,
  Loader2,
  RotateCcw,
  Trash,
  Trash2,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BulkActionsToolbarProps {
  selectedCount: number;
  deletedOnly?: boolean;
  canPermanentlyDelete?: boolean;
  isLoading?: boolean;
  isDownloadDisabled?: boolean;
  onClear: () => void;
  onMove: () => void;
  onDownload: () => void;
  onTrash: () => void;
  onRestore: () => void;
  onDeletePermanently: () => void;
}

export function BulkActionsToolbar({
  selectedCount,
  deletedOnly,
  canPermanentlyDelete,
  isLoading,
  isDownloadDisabled,
  onClear,
  onMove,
  onDownload,
  onTrash,
  onRestore,
  onDeletePermanently,
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 shadow-lg shadow-black/10",
        "animate-in fade-in slide-in-from-top-2 duration-300 fill-mode-both"
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-white">
          Выбрано: {selectedCount}
        </span>

        {!deletedOnly && (
          <Button
            variant="outline"
            size="sm"
            onClick={onMove}
            disabled={isLoading}
            className="h-8 gap-1.5 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            <FolderInput className="h-4 w-4" />
            Переместить
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          disabled={isLoading || isDownloadDisabled}
          className="h-8 gap-1.5 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
        >
          <Download className="h-4 w-4" />
          Скачать
        </Button>

        {deletedOnly ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onRestore}
              disabled={isLoading}
              className="h-8 gap-1.5 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
              Восстановить
            </Button>
            {canPermanentlyDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDeletePermanently}
                disabled={isLoading}
                className="h-8 gap-1.5 border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
              >
                <Trash className="h-4 w-4" />
                Удалить навсегда
              </Button>
            )}
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onTrash}
            disabled={isLoading}
            className="h-8 gap-1.5 border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
            В корзину
          </Button>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        disabled={isLoading}
        className="h-8 gap-1.5 text-white/60 hover:bg-white/10 hover:text-white"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <X className="h-4 w-4" />
        )}
        Снять выделение
      </Button>
    </div>
  );
}
