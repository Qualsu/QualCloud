"use client";

import { useEffect, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Loader2,
} from "lucide-react";

import { getFolders } from "@/app/api/files";
import type { FilesFolderItem } from "@/config/types/api.types";
import { cn } from "@/lib/utils";

interface FolderTreeProps {
  account_id?: string;
  value: string;
  onChange: (path: string) => void;
  disableDescendantsOf?: string;
  disabledPaths?: string[];
}

type ChildrenMap = Record<string, FilesFolderItem[]>;

function normalizePath(path: string): string {
  return path === "/" ? "" : path;
}

function buildPath(parent: string, name: string): string {
  return parent ? `${parent}/${name}` : name;
}

export function FolderTree({
  account_id,
  value,
  onChange,
  disableDescendantsOf,
  disabledPaths,
}: FolderTreeProps) {
  const [childrenMap, setChildrenMap] = useState<ChildrenMap>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<Set<string>>(new Set());

  const selectedPath = normalizePath(value);

  useEffect(() => {
    if (!account_id) return;

    const ensureRootLoaded = async () => {
      await loadChildren("");
    };

    ensureRootLoaded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account_id]);

  useEffect(() => {
    if (!account_id || selectedPath === "") return;

    const expandSelectedPath = async () => {
      const parts = selectedPath.split("/").filter(Boolean);
      let currentPath = "";

      for (const part of parts) {
        currentPath = buildPath(currentPath, part);
        setExpanded((prev) => new Set(prev).add(currentPath));
        await loadChildren(currentPath);
      }
    };

    expandSelectedPath();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account_id, selectedPath]);

  const loadChildren = async (parentPath: string) => {
    if (!account_id || childrenMap[parentPath] !== undefined) return;

    setLoading((prev) => new Set(prev).add(parentPath));
    try {
      const folders = await getFolders(account_id, parentPath || null);
      setChildrenMap((prev) => ({ ...prev, [parentPath]: folders }));
    } catch {
      setChildrenMap((prev) => ({ ...prev, [parentPath]: [] }));
    } finally {
      setLoading((prev) => {
        const next = new Set(prev);
        next.delete(parentPath);
        return next;
      });
    }
  };

  const toggleExpand = async (path: string) => {
    const next = new Set(expanded);
    if (next.has(path)) {
      next.delete(path);
      setExpanded(next);
    } else {
      next.add(path);
      setExpanded(next);
      await loadChildren(path);
    }
  };

  const isSelected = (path: string) => selectedPath === path;

  const disabledSet = new Set(disabledPaths ?? []);
  const isDisabled = (path: string) => {
    if (disabledSet.has(path)) return true;
    if (disableDescendantsOf) {
      if (path === disableDescendantsOf) return true;
      if (path.startsWith(`${disableDescendantsOf}/`)) return true;
    }
    return false;
  };

  const renderNode = (path: string, name: string, depth: number) => {
    const children = childrenMap[path] ?? [];
    const hasChildren = children.length > 0;
    const isExpanded = expanded.has(path);
    const isLoading = loading.has(path);
    const selected = isSelected(path);
    const disabled = isDisabled(path);

    return (
      <div key={path}>
        <div
          className={cn(
            "flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm transition-colors",
            selected
              ? "bg-purple/20 text-white"
              : disabled
              ? "cursor-not-allowed text-white/30"
              : "text-white/70 hover:bg-white/[0.04] hover:text-white"
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          <button
            type="button"
            onClick={() => toggleExpand(path)}
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded text-white/40 transition-colors hover:text-white",
              !hasChildren && !isLoading && "invisible"
            )}
            aria-label={isExpanded ? "Свернуть" : "Развернуть"}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(path === "" ? "/" : path)}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-2 text-left",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            {selected ? (
              <FolderOpen className="h-4 w-4 shrink-0 text-purple" />
            ) : (
              <Folder className="h-4 w-4 shrink-0" />
            )}
            <span className="truncate">{name}</span>
          </button>
        </div>
        {isExpanded &&
          children.map((child) =>
            renderNode(buildPath(path, child.name), child.name, depth + 1)
          )}
        </div>
    );
  };

  return (
    <div className="max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-1">
      {renderNode("", "/", 0)}
    </div>
  );
}
