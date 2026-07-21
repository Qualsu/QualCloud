"use client";

import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  ChevronDown,
  ChevronRight,
  Download,
  FileIcon,
  Folder,
  FolderOpen,
  Loader2,
  KeyRound,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { downloadFolder, getFolderById } from "@/app/api/files";
import type { FileDoc } from "@/config/types/components.types";
import { typeIcons } from "@/config/const/components.const";
import { toast } from "@/lib/toast";
import { base64Decode, cn } from "@/lib/utils";
import NotFound from "@/app/not-found";
import { links } from "@/config/routing/links.route";
import { useTranslation } from "@/components/hooks/use-translation";

type TreeNode = {
  file: FileDoc;
  children?: TreeNode[];
  isExpanded: boolean;
  isLoading: boolean;
};

function parseFolderId(raw: string): string | null {
  if (!raw) return null;

  try {
    const decoded = base64Decode(raw);
    if (decoded) {
      const payload = JSON.parse(decoded);
      if (payload?.folderId) return payload.folderId;
    }
  } catch {
  }

  return raw;
}

function getNodeId(file: FileDoc): string {
  return file.folderId || (file.fileId as string) || (file._id as string);
}

function FolderTreeNode({
  node,
  depth,
  onToggle,
  password,
}: {
  node: TreeNode;
  depth: number;
  onToggle: (node: TreeNode) => void;
  password?: string;
}) {
  const isFolder = node.file.isFolder;
  const hasChildren = isFolder && (node.children === undefined || node.children.length > 0);

  const handleClick = () => {
    if (isFolder) {
      onToggle(node);
    }
  };

  const fileLink = isFolder
    ? undefined
    : node.file.fileUrl
    ? `${node.file.fileUrl}${node.file.fileUrl.includes("?") ? "&" : "?"}password=${encodeURIComponent(password || "")}`
    : `${links.FILES.GET_FILE(node.file.fileId as string)}?password=${encodeURIComponent(password || "")}`;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
          isFolder
            ? "cursor-pointer text-white/80 hover:bg-white/[0.04] hover:text-white"
            : "text-white/70"
        )}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        onClick={handleClick}
      >
        {isFolder ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node);
            }}
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded text-white/40 transition-colors hover:text-white",
              !hasChildren && "invisible"
            )}
          >
            {node.isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : node.isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="h-5 w-5 shrink-0" />
        )}

        <span className="shrink-0 text-zinc-400">
          {isFolder ? (
            node.isExpanded ? (
              <FolderOpen className="h-4 w-4" />
            ) : (
              <Folder className="h-4 w-4" />
            )
          ) : (
            typeIcons[node.file.type] ?? <FileIcon className="h-4 w-4" />
          )}
        </span>

        {isFolder || !fileLink ? (
          <span className="truncate" title={node.file.displayName || node.file.name}>
            {node.file.displayName || node.file.name}
          </span>
        ) : (
          <a
            href={fileLink}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate hover:text-white hover:underline"
            title={node.file.displayName || node.file.name}
            onClick={(e) => e.stopPropagation()}
          >
            {node.file.displayName || node.file.name}
          </a>
        )}
      </div>

      {isFolder &&
        node.isExpanded &&
        node.children?.map((child, index) => (
          <FolderTreeNode
            key={`${getNodeId(child.file)}-${index}`}
            node={child}
            depth={depth + 1}
            onToggle={onToggle}
            password={password}
          />
        ))}
    </div>
  );
}

export default function FolderPageClient() {
  const { t } = useTranslation();
  const { user, isLoaded } = useUser();
  const params = useParams();

  const rawFolderId = Array.isArray(params?.folderId)
    ? params.folderId[0]
    : (params?.folderId ?? "");
  const folderId = parseFolderId(rawFolderId);

  const [tree, setTree] = useState<TreeNode[]>([]);
  const [folderPath, setFolderPath] = useState<string>("");
  const [accountId, setAccountId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const requesterId = user?.id;

  const loadChildrenByFolderId = useCallback(
    async (id: string): Promise<FileDoc[]> => {
      const data = await getFolderById(id, requesterId, password);
      return [...(data.folders ?? []), ...(data.files ?? [])];
    },
    [requesterId, password]
  );

  const fetchFolderData = useCallback(async (pw?: string) => {
    if (!folderId) {
      setLoading(false);
      return;
    }

    if (pw) {
      setSubmitting(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await getFolderById(folderId, requesterId, pw);
      setAccountId(data.account_id ?? "");
      setFolderPath(data.folder?.name ?? "");
      const items = [...(data.folders ?? []), ...(data.files ?? [])];
      setTree(
        items.map((file) => ({
          file,
          isExpanded: false,
          isLoading: false,
        }))
      );
      setIsPasswordRequired(false);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setIsPasswordRequired(true);
        if (pw) {
          setPasswordError(t("errors.incorrectPassword") || "Неверный пароль");
        }
      } else {
        const message = err instanceof Error ? err.message : t("files.folderLoadError");
        setError(message);
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  }, [folderId, requesterId, t]);

  useEffect(() => {
    fetchFolderData();
  }, [fetchFolderData]);

  const updateNode = (
    nodes: TreeNode[],
    targetId: string,
    patch: Partial<TreeNode>
  ): TreeNode[] => {
    return nodes.map((n) => {
      if (getNodeId(n.file) === targetId) {
        return { ...n, ...patch };
      }
      if (n.children) {
        return { ...n, children: updateNode(n.children, targetId, patch) };
      }
      return n;
    });
  };

  const handleToggle = async (node: TreeNode) => {
    if (!node.file.isFolder || node.isLoading) return;

    const nextExpanded = !node.isExpanded;
    const nodeId = getNodeId(node.file);

    setTree((prev) =>
      updateNode(prev, nodeId, { isExpanded: nextExpanded, isLoading: nextExpanded })
    );

    if (nextExpanded && node.children === undefined) {
      try {
        const children = node.file.folderId
          ? await loadChildrenByFolderId(node.file.folderId)
          : [];
        setTree((prev) =>
          updateNode(prev, nodeId, {
            children: children.map((file) => ({
              file,
              isExpanded: false,
              isLoading: false,
            })),
            isLoading: false,
          })
        );
      } catch {
        setTree((prev) => updateNode(prev, nodeId, { isExpanded: false, isLoading: false }));
      }
    }
  };

  const handleDownloadArchive = async () => {
    if (!accountId || !folderPath || isDownloading) return;
    setIsDownloading(true);
    try {
      const blob = await downloadFolder(accountId, folderPath, requesterId, password);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${folderPath.split("/").pop() || "folder"}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(t("filePreview.archiveDownloaded"));
    } catch {
      toast.error(t("filePreview.archiveError"));
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-white">
        <Loader2 className="h-10 w-10 animate-spin text-white/50" />
        <p className="mt-4 text-sm text-white/50">{t("files.folderLoading")}</p>
      </div>
    );
  }

  if (isPasswordRequired) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center m-3">
        <section className="w-full max-w-md mx-auto p-6 bg-background/60 border border-border/90 rounded-3xl shadow-[0_16px_80px_-45px_rgba(0,0,0,0.7)] text-white text-center">
          <KeyRound className="h-12 w-12 text-purple mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Требуется пароль</h2>
          <p className="text-sm text-white/60 mb-6">Эта папка защищена паролем. Пожалуйста, введите его для доступа к содержимому.</p>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            fetchFolderData(password);
          }} className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              placeholder="Введите пароль"
              className="border-white/10 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-purple text-center"
            />
            {passwordError && (
              <p className="text-xs text-red-400">{passwordError}</p>
            )}
            <Button type="submit" disabled={submitting} className="w-full bg-purple hover:bg-purple/90">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Подтвердить"}
            </Button>
          </form>
        </section>
      </div>
    );
  }

  if (!folderId || !folderPath || error) {
    return <NotFound />;
  }

  const folderName = folderPath.split("/").pop() || folderPath;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <section className="w-full max-w-4xl rounded-3xl border border-white/10 bg-[#1e1226]/80 p-6 shadow-[0_16px_80px_-45px_rgba(0,0,0,0.7)] sm:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-400">
                <FolderOpen className="h-6 w-6" />
              </div>
              <div>
                <h1 className="truncate text-2xl font-semibold tracking-tight text-white" title={folderName}>
                  {folderName}
                </h1>
                <p className="truncate text-sm text-white/50" title={folderPath}>{folderPath}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadArchive}
            disabled={isDownloading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {t("files.downloadArchive")}
          </button>
        </div>

        <div className="space-y-1">
          {tree.length === 0 ? (
            <div className="py-12 text-center text-white/40">{t("files.folderEmptyInTrash")}</div>
          ) : (
            tree.map((node, index) => (
              <FolderTreeNode
                key={`${getNodeId(node.file)}-${index}`}
                node={node}
                depth={0}
                onToggle={handleToggle}
                password={password}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
