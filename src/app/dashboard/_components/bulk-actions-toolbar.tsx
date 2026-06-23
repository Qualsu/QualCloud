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
import { useTranslation } from "@/components/hooks/use-translation";

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
  const { t } = useTranslation();

  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 shadow-lg shadow-black/10 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
        "animate-in fade-in slide-in-from-top-2 duration-300 fill-mode-both"
      )}
    >
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <span className="text-sm font-medium text-white">
          {t("files.selected")}: {selectedCount}
        </span>

        {!deletedOnly && (
          <Button
            variant="outline"
            size="sm"
            onClick={onMove}
            disabled={isLoading}
            aria-label={t("files.move")}
            className="h-8 gap-1.5 border-white/10 bg-white/5 px-2.5 text-white hover:bg-white/10 hover:text-white sm:px-3"
          >
            <FolderInput className="h-4 w-4" />
            <span className="sm:hidden">{t("files.moveShort")}</span>
            <span className="hidden sm:inline">{t("files.move")}</span>
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          disabled={isLoading || isDownloadDisabled}
          aria-label={t("files.download")}
          className="h-8 gap-1.5 border-white/10 bg-white/5 px-2.5 text-white hover:bg-white/10 hover:text-white sm:px-3"
        >
          <Download className="h-4 w-4" />
            <span>{t("files.download")}</span>
        </Button>

        {deletedOnly ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onRestore}
              disabled={isLoading}
              aria-label={t("files.restore")}
              className="h-8 gap-1.5 border-white/10 bg-white/5 px-2.5 text-white hover:bg-white/10 hover:text-white sm:px-3"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="sm:hidden">{t("files.restoreShort")}</span>
              <span className="hidden sm:inline">{t("files.restore")}</span>
            </Button>
            {canPermanentlyDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDeletePermanently}
                disabled={isLoading}
                aria-label={t("files.deleteForever")}
                className="h-8 gap-1.5 border-red-500/30 bg-red-500/10 px-2.5 text-red-400 hover:bg-red-500/20 hover:text-red-300 sm:px-3"
              >
                <Trash className="h-4 w-4" />
                <span className="sm:hidden">{t("files.deleteForeverShort")}</span>
                <span className="hidden sm:inline">{t("files.deleteForever")}</span>
              </Button>
            )}
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onTrash}
            disabled={isLoading}
            aria-label={t("files.toTrash")}
            className="h-8 gap-1.5 border-red-500/30 bg-red-500/10 px-2.5 text-red-400 hover:bg-red-500/20 hover:text-red-300 sm:px-3"
          >
            <Trash2 className="h-4 w-4" />
            <span>{t("files.toTrash")}</span>
          </Button>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        disabled={isLoading}
        aria-label={t("files.deselect")}
        className="h-8 gap-1.5 self-start px-2.5 text-white/60 hover:bg-white/10 hover:text-white sm:self-auto sm:px-3"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <X className="h-4 w-4" />
        )}
        <span className="sm:hidden">{t("files.deselectShort")}</span>
        <span className="hidden sm:inline">{t("files.deselect")}</span>
      </Button>
    </div>
  );
}
