"use client";

import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { CheckedState } from "@radix-ui/react-checkbox";
import { useQuery } from "convex/react";
import { LayoutGrid, Loader2, PackageOpen, Table as TableIcon, ArrowLeft, Trash2, Clock3 } from "lucide-react";
import type { RowSelectionState } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

import { getAllFiles as getNotterFiles } from "@/app/api/notter";
import { getAllFiles as getShrtlFiles } from "@/app/api/shrtl";
import {
  getAllFiles as getCloudFiles,
  emptyTrash,
  getUserStats,
  moveToTrash,
  moveFolderToTrash,
  restoreFromTrash,
  restoreFolder,
  deleteFilePermanently,
  deleteFolder,
  downloadFolder,
} from "@/app/api/files";
import { useCurrentOrg } from "@/components/hooks/use-current-org";
import {
  fileSortDirectionOptions,
  fileSortOptions,
  fileTypeOptions,
  fileTypeOrder,
} from "@/config/const/components.const";
import type {
  FileDoc,
  FileFilterType,
  FileType,
  FilesBrowserProps,
  FileSortDirection,
  FileSortKey,
} from "@/config/types/components.types";
import { useSearchSuggestions } from "@/components/context/search-suggestions-context";
import { useFilesView } from "@/components/context/files-view-context";
import { formatTimeRemaining } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { useFilesRefresh } from "@/components/context/files-refresh-context";
import { useSyncBackendUser } from "@/components/hooks/use-sync-backend-user";
import { getFilesEditor } from "@/lib/files-editor";
import { links } from "@/config/routing/links.route";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { api } from "../../../../convex/_generated/api";
import { createColumns } from "./columns";
import { CreateFolderDialog } from "@/components/dialog/create-folder-dialog";
import { ConfirmDialog } from "@/components/dialog/confirm-dialog";
import { MoveToFolderDialog } from "@/components/dialog/move-to-folder-dialog";
import { BulkActionsToolbar } from "./bulk-actions-toolbar";
import { FileCard } from "./file-card";
import { DataTable } from "./file-table";
import { FilePreviewModal } from "@/components/modal/file-preview-modal";
import { useTranslation } from "@/components/hooks/use-translation";

export function Placeholder({ message }: { message?: string }) {
  const { t } = useTranslation();
  return (
    <div className="my-12 flex w-full flex-col items-center gap-6 text-zinc-500">
      <PackageOpen className="h-32 w-32" />
      <div className="text-center text-2xl font-bold">
        {message ?? t("files.empty")}
      </div>
    </div>
  );
}

export function FilesBrowser({
  title,
  shrtl,
  notter,
  kenycloud,
  favorites,
  deletedOnly,
  hideWhenNoConvexUser,
}: FilesBrowserProps) {
  const { t, language } = useTranslation();
  const searchParams = useSearchParams();
  const { setSuggestions } = useSearchSuggestions();
  const { orgId, isOrgAdmin } = useCurrentOrg();
  const user = useUser();
  const [type, setType] = useState<FileFilterType>("all");
  const [sort, setSort] = useState<FileSortKey>("date");
  const [typeSort, setTypeSort] = useState<FileSortDirection>("new");
  const [checked, setChecked] = useState<boolean>(false);
  const [view, setView] = useFilesView();
  const { refreshKey, refreshFiles } = useFilesRefresh();
  const [apiFiles, setApiFiles] = useState<FileDoc[] | undefined>(undefined);
  const [isFilesLoading, setIsFilesLoading] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [trashEmptyInSeconds, setTrashEmptyInSeconds] = useState<number | null>(null);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileDoc | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkMoveOpen, setIsBulkMoveOpen] = useState(false);
  const [isBulkTrashOpen, setIsBulkTrashOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const query = searchParams.get("q")?.trim() ?? "";

  useSyncBackendUser(user.user?.id);

  const editor = getFilesEditor(user.user);

  const useFilesApi = !shrtl && !notter && !kenycloud;

  const convexType: Exclude<FileType, "folder" | "all"> | undefined =
    kenycloud && type !== "all" && type !== "folder" ? type : undefined;

  const queryFiles = useQuery(
    api.files.getFiles,
    kenycloud && orgId
      ? {
          orgId,
          type: convexType,
          query,
          favorites,
          deletedOnly,
        }
      : "skip"
  );

  const currentConvexUser = useQuery(
    api.users.getMe,
    !shrtl && !notter && hideWhenNoConvexUser ? {} : "skip"
  );

  const handleCheckedChange = (nextChecked: CheckedState) => {
    if (typeof nextChecked === "boolean") {
      setChecked(nextChecked);
    }
  };

  useEffect(() => {
    if (!orgId) {
      return;
    }

    setIsFilesLoading(true);

    const fetchFiles = async () => {
      try {
        if (shrtl) {
          const files = await getShrtlFiles(orgId);
          setApiFiles(files);
        } else if (notter) {
          const files = await getNotterFiles(orgId);
          setApiFiles(files);
        } else if (useFilesApi) {
          const files = await getCloudFiles(orgId, {
            folder: currentFolder,
            favorite: favorites ?? null,
            deleted: deletedOnly ?? false,
          });
          setApiFiles(files);
        }
      } finally {
        setIsFilesLoading(false);
      }
    };

    fetchFiles();
  }, [shrtl, notter, useFilesApi, orgId, favorites, deletedOnly, refreshKey, currentFolder]);

  useEffect(() => {
    if (!orgId || !deletedOnly) {
      setTrashEmptyInSeconds(null);
      return;
    }

    getUserStats(orgId)
      .then((stats) => setTrashEmptyInSeconds(stats.trash_empty_in_seconds))
      .catch(() => setTrashEmptyInSeconds(null));
  }, [orgId, deletedOnly]);

  const handleEmptyTrash = async () => {
    if (!orgId) return;

    if (!isOrgAdmin) {
      toast.error(t("files.adminOnlyTrash"));
      return;
    }

    setIsClearing(true);
    try {
      await toast.promise(
        emptyTrash(orgId),
        {
          loading: t("files.emptyTrashLoading"),
          success: t("files.emptyTrashSuccess"),
          error: t("files.emptyTrashError"),
        },
      );
      setIsClearDialogOpen(false);
      refreshFiles();
    } finally {
      setIsClearing(false);
    }
  };

  const shouldShowEmptyState =
    Boolean(hideWhenNoConvexUser) && currentConvexUser === null;
  const files = shrtl || notter || useFilesApi ? apiFiles : queryFiles;

  const currentFolderName = currentFolder
    ? currentFolder.split("/").pop()
    : null;

  const enableSelection = useFilesApi;

  const toggleSelection = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  useEffect(() => {
    clearSelection();
  }, [currentFolder, type, sort, typeSort, query]);

  const handleRowClick = (file: FileDoc, e?: React.MouseEvent) => {
    if (enableSelection && (e?.ctrlKey || e?.metaKey)) {
      e?.preventDefault();
      toggleSelection(file._id as string, !selectedIds.has(file._id as string));
      return;
    }

    clearSelection();

    if (file.isFolder) {
      setCurrentFolder(file.name);
    } else {
      setPreviewFile(file);
    }
  };

  const emptyMessage = (() => {
    if (deletedOnly) return t("files.emptyTrashMessage");
    if (favorites) return t("files.emptyFavorites");
    if (query) return t("files.emptySearch");
    if (currentFolderName) return t("files.emptyFolder", { name: currentFolderName });
    return t("files.empty");
  })();
  const isLoading =
    !shouldShowEmptyState &&
    (files === undefined ||
      isFilesLoading ||
      (hideWhenNoConvexUser &&
        !shrtl &&
        !notter &&
        currentConvexUser === undefined));

  const modifiedFiles = useMemo<FileDoc[]>(
    () => (files ?? []).map((file) => ({ ...file, name: file.name ?? "" })),
    [files]
  );

  const filteredFiles = (() => {
    let result = [...modifiedFiles];

    if (query) {
      result = result.filter((file) =>
        file.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (useFilesApi && !favorites) {
      if (currentFolder === null) {
        result = result.filter((file) => !file.folder || file.isFolder);
      } else {
        result = result.filter((file) => file.folder === currentFolder);
      }
    }

    if (shrtl && !checked) {
      result = result.filter((file) => {
        const expiresInSeconds =
          "_expiresInSeconds" in file
            ? ((file._expiresInSeconds as number | null | undefined) ?? null)
            : null;
        return expiresInSeconds !== null;
      });
    }

    if (type !== "all") {
      result = result.filter((file) => file.type === type);
    }

    return result;
  })();

  const autocompleteFiles = filteredFiles;

  const sortedFiles = (() => {
    const sortedByAlphabet = [...filteredFiles].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    const sortedByType = [...filteredFiles].sort(
      (a, b) => fileTypeOrder.indexOf(a.type) - fileTypeOrder.indexOf(b.type)
    );

    const sortedByDate = [...filteredFiles].sort(
      (a, b) =>
        new Date(b._creationTime).valueOf() - new Date(a._creationTime).valueOf()
    );

    let result = sortedByDate;
    if (sort === "alphabet") {
      result = sortedByAlphabet;
    } else if (sort === "types") {
      result = sortedByType;
    }

    if (typeSort === "reverse") {
      result = [...result].reverse();
    }

    return result.sort(
      (a, b) => (Number(b.isFolder) || Number(b.type === "folder")) - (Number(a.isFolder) || Number(a.type === "folder"))
    );
  })();

  const selectedItems = useMemo(
    () => sortedFiles.filter((file) => selectedIds.has(file._id as string)),
    [sortedFiles, selectedIds]
  );

  const rowSelection = useMemo(() => {
    const map: Record<string, boolean> = {};
    selectedIds.forEach((id) => {
      map[id] = true;
    });
    return map;
  }, [selectedIds]);

  const handleRowSelectionChange = (updater: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => {
    const next = typeof updater === "function" ? updater(rowSelection) : updater;

    setSelectedIds(
      new Set(Object.keys(next).filter((key) => next[key]))
    );
  };

  const handleBulkDownload = async () => {
    if (selectedItems.length === 0) return;

    let successCount = 0;
    let failCount = 0;

    for (const item of selectedItems) {
      try {
        if (item.isFolder) {
          const blob = await downloadFolder(
            item.orgId,
            item.name,
            user.user?.id ?? undefined
          );
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${item.displayName || item.name}.zip`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        } else {
          const link = item.fileUrl || links.FILES.GET_FILE(item.fileId as string);
          window.open(link, "_blank");
        }
        successCount++;
      } catch {
        failCount++;
      }
    }

    if (failCount === 0) {
      toast.success(t("files.bulkDownloadStarted", { count: successCount }));
    } else {
      toast.error(t("files.bulkDownloadError", { failed: failCount, total: selectedItems.length }));
    }
  };

  const handleBulkTrash = async () => {
    if (selectedItems.length === 0) return;

    setIsBulkLoading(true);
    try {
      const promises = selectedItems.map((item) =>
        item.isFolder
          ? moveFolderToTrash(item.orgId, item.name, editor)
          : moveToTrash(item._id as string, editor)
      );

      const results = await Promise.allSettled(promises);
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed === 0) {
        toast.success(t("files.bulkTrashSuccess", { count: selectedItems.length }));
        setIsBulkTrashOpen(false);
        clearSelection();
        refreshFiles();
      } else {
        toast.error(
          t("files.bulkTrashError", { failed, total: selectedItems.length })
        );
      }
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkRestore = async () => {
    if (selectedItems.length === 0) return;

    setIsBulkLoading(true);
    try {
      const promises = selectedItems.map((item) =>
        item.isFolder
          ? restoreFolder(item.orgId, item.name, editor)
          : restoreFromTrash(item._id as string, editor)
      );

      const results = await Promise.allSettled(promises);
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed === 0) {
        toast.success(t("files.bulkRestoreSuccess", { count: selectedItems.length }));
        clearSelection();
        refreshFiles();
      } else {
        toast.error(
          t("files.bulkRestoreError", { failed, total: selectedItems.length })
        );
      }
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkDeletePermanently = async () => {
    if (selectedItems.length === 0) return;

    if (!isOrgAdmin) {
      toast.error(
        t("files.adminOnlyDelete")
      );
      return;
    }

    setIsBulkLoading(true);
    try {
      const promises = selectedItems.map((item) =>
        item.isFolder
          ? deleteFolder(item.orgId, item.name, editor)
          : deleteFilePermanently(item._id as string)
      );

      const results = await Promise.allSettled(promises);
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed === 0) {
        toast.success(t("files.bulkDeleteSuccess", { count: selectedItems.length }));
        setIsBulkDeleteOpen(false);
        clearSelection();
        refreshFiles();
      } else {
        toast.error(
          t("files.bulkDeleteError", { failed, total: selectedItems.length })
        );
      }
    } finally {
      setIsBulkLoading(false);
    }
  };

  const fileColumns = useMemo(
    () =>
      createColumns({
        shrtl,
        notter,
        useFilesApi,
        deletedOnly,
        enableSelection,
        onRefresh: refreshFiles,
        onOpenFolder: setCurrentFolder,
        t,
      }),
    [shrtl, notter, useFilesApi, deletedOnly, enableSelection, refreshFiles, t]
  );

  const autocompleteSuggestions = useMemo(
    () =>
      Array.from(new Set(autocompleteFiles.map((file) => file.name.trim()).filter(Boolean)))
        .sort((first, second) => first.localeCompare(second)),
    [autocompleteFiles]
  );

  useEffect(() => {
    setSuggestions((currentSuggestions) => {
      if (
        currentSuggestions.length === autocompleteSuggestions.length &&
        currentSuggestions.every(
          (suggestion, index) => suggestion === autocompleteSuggestions[index]
        )
      ) {
        return currentSuggestions;
      }

      return autocompleteSuggestions;
    });
  }, [autocompleteSuggestions, setSuggestions]);

  useEffect(() => {
    return () => setSuggestions([]);
  }, [setSuggestions]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white">{title}</h1>
      </div>

      <Tabs value={view} onValueChange={(value) => setView(value as "grid" | "table")}>
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end md:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="flex flex-col gap-2">
              <Label htmlFor="type-select" className="text-sm text-white/60">
                {t("files.show")}
              </Label>
              <Select value={type} onValueChange={(newType) => setType(newType as FileFilterType)}>
                <SelectTrigger
                  className="w-[180px] border-white/10 bg-white/5 text-white hover:bg-white/10"
                  id="type-select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#211428] text-white">
                  {fileTypeOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="focus:bg-white/10"
                    >
                      {t(option.key)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="sort-select" className="text-sm text-white/60">
                {t("files.sort")}
              </Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select value={sort} onValueChange={(newSort) => setSort(newSort as FileSortKey)}>
                  <SelectTrigger
                    className="w-[180px] border-white/10 bg-white/5 text-white hover:bg-white/10"
                    id="sort-select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#211428] text-white">
                    {fileSortOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="focus:bg-white/10"
                      >
                        {t(option.key)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={typeSort}
                  onValueChange={(newSort) => setTypeSort(newSort as FileSortDirection)}
                >
                  <SelectTrigger
                    className="w-[160px] border-white/10 bg-white/5 text-white hover:bg-white/10"
                    id="sort-direction-select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#211428] text-white">
                    {fileSortDirectionOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="focus:bg-white/10"
                      >
                        {t(option.key)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {shrtl && (
              <div className="flex items-center gap-2 pb-1">
                <Label htmlFor="expired-checkbox" className="shrink-0 text-sm text-white/60">
                  {t("files.expired")}
                </Label>
                <Checkbox
                  id="expired-checkbox"
                  name="expired-checkbox"
                  checked={checked}
                  onCheckedChange={handleCheckedChange}
                  className="border-white/10 bg-white/5 data-[state=checked]:border-primary data-[state=checked]:bg-primary hover:bg-white/10"
                />
              </div>
            )}

            {deletedOnly && (
              <div className="flex items-center gap-2 pb-1 text-sm text-white/60">
                <Clock3 size={16} className="text-white/40" />
                <span>
                  {t("files.autoCleanup")}{" "}
                  {trashEmptyInSeconds !== null
                    ? formatTimeRemaining(trashEmptyInSeconds, language)
                    : t("common.empty")}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-end justify-end gap-3">
            {deletedOnly && orgId && isOrgAdmin && modifiedFiles.length > 0 && (
              <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
                <AlertDialogTrigger asChild>
                  <button className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300">
                    <Trash2 size={16} />
                    {t("files.emptyTrash")}
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-white/10 bg-[#1e1226] text-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("files.emptyTrashConfirm")}</AlertDialogTitle>
                    <AlertDialogDescription className="text-white/60">
                      {t("files.emptyTrashDescription")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      asChild
                      className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                    >
                      <Button variant="outline" disabled={isClearing}>
                        {t("common.cancel")}
                      </Button>
                    </AlertDialogCancel>
                    <AlertDialogAction
                      asChild
                      className="bg-red-500 text-white hover:bg-red-600"
                    >
                      <Button
                        variant="destructive"
                        onClick={handleEmptyTrash}
                        disabled={isClearing}
                      >
                        {isClearing ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        {t("files.clear")}
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <TabsList className="h-10 gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
              <TabsTrigger
                value="grid"
                className="rounded-lg px-3 py-1.5 text-white/60 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                aria-label={t("dashboard.gridView")}
              >
                <LayoutGrid size={16} />
              </TabsTrigger>
              <TabsTrigger
                value="table"
                className="rounded-lg px-3 py-1.5 text-white/60 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                aria-label={t("dashboard.tableView")}
              >
                <TableIcon size={16} />
              </TabsTrigger>
            </TabsList>
            {!shrtl && !notter && !kenycloud && !favorites && !deletedOnly && (
              <CreateFolderDialog
                account_id={orgId}
                parent={currentFolder ?? null}
                onCreated={refreshFiles}
              />
            )}
          </div>
        </div>

        {enableSelection && (
          <BulkActionsToolbar
            selectedCount={selectedItems.length}
            deletedOnly={deletedOnly}
            canPermanentlyDelete={isOrgAdmin}
            isLoading={isBulkLoading}
            onClear={clearSelection}
            onMove={() => setIsBulkMoveOpen(true)}
            onDownload={handleBulkDownload}
            onTrash={() => setIsBulkTrashOpen(true)}
            onRestore={handleBulkRestore}
            onDeletePermanently={() => setIsBulkDeleteOpen(true)}
          />
        )}

        {currentFolder !== null && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                const parts = currentFolder.split("/");
                const parent = parts.slice(0, -1).join("/") || null;
                setCurrentFolder(parent);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={16} />
              {t("files.back")}
            </button>
            <div className="flex items-center gap-1 text-sm text-white/50">
              <button
                onClick={() => setCurrentFolder(null)}
                className="hover:text-white"
              >
                {t("files.root")}
              </button>
              {currentFolder.split("/").map((part, index, parts) => (
                <span key={index} className="flex items-center gap-1">
                  <span>/</span>
                  <button
                    onClick={() =>
                      setCurrentFolder(parts.slice(0, index + 1).join("/"))
                    }
                    className={
                      index === parts.length - 1
                        ? "truncate text-white"
                        : "truncate hover:text-white"
                    }
                    title={part}
                  >
                    {part}
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-white/50" />
          </div>
        ) : !shouldShowEmptyState ? (
          <>
            <TabsContent value="grid">
              <div className="mr-2 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {sortedFiles.map((file) => (
                  <FileCard
                    key={file._id}
                    file={file}
                    shrtl={shrtl}
                    notter={notter}
                    useFilesApi={useFilesApi}
                    deletedOnly={deletedOnly}
                    onRefresh={refreshFiles}
                    onOpenFolder={setCurrentFolder}
                    selected={selectedIds.has(file._id as string)}
                    onSelect={enableSelection ? toggleSelection : undefined}
                    onClearSelection={enableSelection ? clearSelection : undefined}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="table">
              <DataTable
                columns={fileColumns}
                data={sortedFiles}
                onRowClick={handleRowClick}
                rowSelection={rowSelection}
                onRowSelectionChange={handleRowSelectionChange}
                getRowId={(row) => row._id as string}
              />
            </TabsContent>
          </>
        ) : null}
      </Tabs>

      {!isLoading &&
        view !== "table" &&
        (shouldShowEmptyState || sortedFiles.length === 0) && (
          <Placeholder message={emptyMessage} />
        )}

      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          open={!!previewFile}
          onOpenChange={(open) => {
            if (!open) setPreviewFile(null);
          }}
          shrtl={shrtl}
          notter={notter}
          useFilesApi={useFilesApi}
          deletedOnly={deletedOnly}
          onRefresh={refreshFiles}
          onOpenFolder={setCurrentFolder}
        />
      )}

      {enableSelection && (
        <MoveToFolderDialog
          files={selectedItems}
          open={isBulkMoveOpen}
          onOpenChange={setIsBulkMoveOpen}
          onMoved={() => {
            clearSelection();
            refreshFiles();
          }}
        />
      )}

      {enableSelection && (
        <ConfirmDialog
          open={isBulkTrashOpen}
          onOpenChange={setIsBulkTrashOpen}
          title={t("files.bulkMoveTitle")}
          description={t("files.bulkMoveDescription", { count: selectedItems.length })}
          confirmLabel={t("files.toTrash")}
          cancelLabel={t("common.cancel")}
          onConfirm={handleBulkTrash}
          isLoading={isBulkLoading}
          destructive={false}
        />
      )}

      {enableSelection && (
        <ConfirmDialog
          open={isBulkDeleteOpen}
          onOpenChange={setIsBulkDeleteOpen}
          title={t("files.bulkDeleteTitle")}
          description={t("files.bulkDeleteDescription", { count: selectedItems.length })}
          confirmLabel={t("files.deleteForever")}
          cancelLabel={t("common.cancel")}
          onConfirm={handleBulkDeletePermanently}
          isLoading={isBulkLoading}
          destructive={true}
        />
      )}
    </div>
  );
}
