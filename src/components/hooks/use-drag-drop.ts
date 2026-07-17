"use client";

import { useCallback, useRef, useState } from "react";
import type { FileDoc } from "@/config/types/components.types";

export interface DragDropPayload {
  files: FileDoc[];
}

const DRAG_DATA_TYPE = "application/x-qualcloud-files";

/**
 * Serializes a drag payload into the DataTransfer.
 * We also set text/plain for a visual drag label.
 */
export function setDragPayload(
  dataTransfer: DataTransfer,
  payload: DragDropPayload
) {
  dataTransfer.setData(
    DRAG_DATA_TYPE,
    JSON.stringify({ ids: payload.files.map((f) => f._id) })
  );
  const names = payload.files.map((f) => f.displayName || f.name);
  dataTransfer.setData("text/plain", names.join(", "));
  dataTransfer.effectAllowed = "move";
}

/**
 * Reads the drag payload IDs from DataTransfer.
 */
export function getDragPayloadIds(
  dataTransfer: DataTransfer
): string[] | null {
  const raw = dataTransfer.getData(DRAG_DATA_TYPE);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed.ids ?? null;
  } catch {
    return null;
  }
}

/**
 * Checks if a DataTransfer has our custom drag type.
 */
export function hasDragPayload(dataTransfer: DataTransfer): boolean {
  return dataTransfer.types.includes(DRAG_DATA_TYPE);
}

/**
 * Hook that provides drag source handlers for a file/folder card.
 */
export function useDragSource(
  file: FileDoc,
  selectedFiles: FileDoc[],
  enabled: boolean
) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (!enabled) {
        e.preventDefault();
        return;
      }

      const draggedFiles =
        selectedFiles.length > 0 &&
        selectedFiles.some((f) => f._id === file._id)
          ? selectedFiles
          : [file];

      setDragPayload(e.dataTransfer, { files: draggedFiles });
      setIsDragging(true);

      const cardStyle = "padding: 6px 12px; background: rgba(139,92,246,0.9); color: #fff; border-radius: 8px; font-size: 13px; font-weight: 500; box-shadow: 0 4px 12px rgba(0,0,0,0.25); backdrop-filter: blur(8px); white-space: nowrap;";

      const ghost = document.createElement("div");
      ghost.className = "qualcloud-drag-ghost";

      if (draggedFiles.length > 1) {
        const maxVisible = 10;
        const visibleFiles = draggedFiles.slice(0, maxVisible);
        const remaining = draggedFiles.length - maxVisible;
        const items = visibleFiles.map((f) => {
          const name = f.displayName || f.name;
          return `<div style="${cardStyle}">${name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>`;
        });
        if (remaining > 0) {
          items.push(`<div style="${cardStyle} font-style: italic; opacity: 0.9;">+ ${remaining}</div>`);
        }
        ghost.innerHTML = items.join("");
      } else {
        const name = file.displayName || file.name;
        ghost.innerHTML = `<div style="${cardStyle}">${name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>`;
      }
      ghost.style.cssText =
        "position:fixed;top:-1000px;left:-1000px;pointer-events:none;z-index:99999;display:flex;flex-direction:column;gap:6px;";
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, 20);

      requestAnimationFrame(() => {
        document.body.removeChild(ghost);
      });
    },
    [enabled, file, selectedFiles]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    isDragging,
    dragProps: enabled
      ? {
          draggable: true,
          onDragStart: handleDragStart,
          onDragEnd: handleDragEnd,
        }
      : {},
  };
}

/**
 * Hook that provides drop target handlers for a folder card/row.
 */
export function useDropTarget(
  folder: FileDoc,
  allFiles: FileDoc[],
  onDrop: (draggedFiles: FileDoc[], targetFolder: FileDoc) => void,
  enabled: boolean
) {
  const [isOver, setIsOver] = useState(false);
  const enterCountRef = useRef(0);

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      if (!enabled || !folder.isFolder) return;
      if (!hasDragPayload(e.dataTransfer)) return;

      e.preventDefault();
      e.stopPropagation();
      enterCountRef.current++;
      setIsOver(true);
    },
    [enabled, folder.isFolder]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!enabled || !folder.isFolder) return;
      if (!hasDragPayload(e.dataTransfer)) return;

      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";
    },
    [enabled, folder.isFolder]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      if (!enabled || !folder.isFolder) return;

      e.stopPropagation();
      enterCountRef.current--;
      if (enterCountRef.current <= 0) {
        enterCountRef.current = 0;
        setIsOver(false);
      }
    },
    [enabled, folder.isFolder]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (!enabled || !folder.isFolder) return;

      e.preventDefault();
      e.stopPropagation();
      enterCountRef.current = 0;
      setIsOver(false);

      const ids = getDragPayloadIds(e.dataTransfer);
      if (!ids || ids.length === 0) return;

      // Don't allow dropping a folder onto itself
      if (ids.includes(folder._id as string)) return;

      const draggedFiles = ids
        .map((id) => allFiles.find((f) => f._id === id))
        .filter(Boolean) as FileDoc[];

      if (draggedFiles.length === 0) return;

      // Don't allow dropping a folder into its own descendant
      const hasSelfDescendant = draggedFiles.some(
        (f) => f.isFolder && folder.name.startsWith(f.name + "/")
      );
      if (hasSelfDescendant) return;

      onDrop(draggedFiles, folder);
    },
    [enabled, folder, allFiles, onDrop]
  );

  return {
    isOver,
    dropProps:
      enabled && folder.isFolder
        ? {
            onDragEnter: handleDragEnter,
            onDragOver: handleDragOver,
            onDragLeave: handleDragLeave,
            onDrop: handleDrop,
          }
        : {},
  };
}
