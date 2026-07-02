"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { formatRelative } from "date-fns";
import {
    Download,
    ExternalLink,
    FolderInput,
    Globe,
    Heart,
    Lock,
    Loader2,
    Pencil,
    RotateCcw,
    Share2Icon,
    Trash,
    Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { typeIcons } from "@/config/const/components.const";
import type { FileDoc } from "@/config/types/components.types";
import { useOrigin } from "@/components/hooks/use-origin";
import {
    getFilesEditor,
    getLastEditorDisplayName,
    isClerkUserId,
} from "@/lib/files-editor";
import { useCurrentOrg } from "@/components/hooks/use-current-org";
import { links } from "@/config/routing/links.route";
import { pages } from "@/config/routing/pages.route";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
    addToFavorites,
    deleteFilePermanently,
    deleteFolder,
    downloadFolder,
    moveToTrash,
    removeFromFavorites,
    restoreFromTrash,
    updateFilePublic,
    updateFolderPublic,
} from "@/app/api/files";
import { toast } from "@/lib/toast";

import { FilePreview } from "@/app/dashboard/_components/file-preview";
import { RenameDialog } from "@/components/dialog/rename-dialog";
import { MoveToFolderDialog } from "@/components/dialog/move-to-folder-dialog";
import { ConfirmDialog } from "@/components/dialog/confirm-dialog";
import { formatExpiresIn, formatSize, getFileFormatDisplay, isFileExpired } from "@/app/dashboard/_components/file-helpers";
import { useTranslation } from "@/components/hooks/use-translation";

export function FilePreviewModal({
    file,
    open,
    onOpenChange,
    shrtl,
    notter,
    useFilesApi,
    deletedOnly,
    onRefresh,
    onOpenFolder,
}: {
    file: FileDoc;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    shrtl?: boolean;
    notter?: boolean;
    useFilesApi?: boolean;
    deletedOnly?: boolean;
    onRefresh?: () => void;
    onOpenFolder?: (folderName: string) => void;
}) {
    const { t } = useTranslation();
    const { user } = useUser();
    const { isOrgAdmin } = useCurrentOrg();
    const editor = getFilesEditor(user);
    const origin = useOrigin();
    const isFromApi = "_isFromApi" in file && file._isFromApi;
    const isApiSource = shrtl || notter || useFilesApi || isFromApi;
    const isFolder = file.isFolder;
    const expired = isFileExpired(file);
    const canPermanentlyDelete = isOrgAdmin;

    const userProfile = useQuery(
        api.users.getUserProfile,
        !isApiSource ? { userId: file.userId } : "skip"
    );

    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [isMoveOpen, setIsMoveOpen] = useState(false);
    const [isTrashConfirmOpen, setIsTrashConfirmOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isConfirmLoading, setIsConfirmLoading] = useState(false);
    const [isPublic, setIsPublic] = useState(file.isPublic ?? false);
    const [isPublicLoading, setIsPublicLoading] = useState(false);
    const [isArchiveLoading, setIsArchiveLoading] = useState(false);
    const [isFavorited, setIsFavorited] = useState(file.isFavorited ?? false);
    const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

    useEffect(() => {
        setIsPublic(file.isPublic ?? false);
    }, [file.isPublic]);

    useEffect(() => {
        setIsFavorited(file.isFavorited ?? false);
    }, [file.isFavorited]);

    const fileLink = isFolder
        ? ""
        : shrtl
        ? file.fileUrl ?? links.SHRTL.GET_FILE(file.fileId as string)
        : notter
        ? (file.fileUrl ?? "")
        : useFilesApi
        ? file.fileUrl ?? links.FILES.GET_FILE(file.fileId as string)
        : links.KENYCLOUD.GET_FILE(file.fileId as Id<"_storage">);

    const openLink = isFolder
        ? ""
        : shrtl
        ? links.SHRTL.GET_LINK(file.fileId as string)
        : notter
        ? links.NOTTER.GET_NOTE(file.noteId || (file._id as string))
        : useFilesApi
        ? pages.FILE.BY_ID(file.fileId as string)
        : pages.FILE.COPY(origin, file.linkId || "");

    const downloadLink = isFolder
        ? ""
        : useFilesApi
        ? file.fileUrl || links.FILES.GET_FILE(file.fileId as string)
        : shrtl
        ? file.fileUrl || links.SHRTL.GET_FILE(file.fileId as string)
        : notter
        ? (file.fileUrl ?? "")
        : links.KENYCLOUD.GET_FILE(file.fileId as Id<"_storage">);

    const shareLink = isFolder && file.folderId
        ? pages.FOLDER.COPY(origin, file.folderId)
        : useFilesApi
        ? pages.FILE.COPY(origin, file.linkId || (file._id as string))
        : openLink;

    let avatar: string | undefined;
    let username: string | undefined;

    if (shrtl) {
        avatar = user?.imageUrl ?? undefined;
        username = user?.username ?? undefined;
    } else if (notter) {
        avatar = file.avatar;
        username = file.username;
    } else if (useFilesApi || isFolder) {
        const lastEditorIsRawId = isClerkUserId(file.lastEditorUsername);
        avatar =
            file.lastEditorAvatar ??
            (lastEditorIsRawId ? user?.imageUrl : undefined) ??
            user?.imageUrl ??
            undefined;
        username = getLastEditorDisplayName(file.lastEditorUsername, user, {
            user: t("common.user"),
            you: t("common.you"),
        });
    } else {
        avatar = userProfile?.image;
        username = userProfile?.name;
    }

    const displayName = file.displayName?.trim() || file.name?.trim() || t("filePreview.noName");

    const dateDisplay = isFolder
        ? file.updatedAt
            ? formatRelative(new Date(file.updatedAt), new Date())
            : t("common.empty")
        : shrtl
        ? formatExpiresIn(
              "_expiresInSeconds" in file
                  ? ((file._expiresInSeconds as number | null | undefined) ?? null)
                  : null,
              t
          )
        : formatRelative(new Date(file._creationTime), new Date());

    const canFavorite = useFilesApi && !isFolder && !deletedOnly && !expired;
    const canRename =
        (useFilesApi || isFolder) && !deletedOnly && (!isFolder ? !expired : true);
    const canMove =
        (useFilesApi || isFolder) && !deletedOnly && (!isFolder ? !expired : true);
    const canShare = !expired && Boolean(shareLink) && !notter && !deletedOnly && (!useFilesApi || isPublic);
    const canTrash = useFilesApi && !isFolder;
    const canDownload = !isFolder && Boolean(downloadLink) && !expired;
    const canOpen = !isFolder && !expired && Boolean(openLink) && (isPublic || notter);
    const canTogglePublic = useFilesApi && !deletedOnly && !expired;
    const canDownloadFolder = isFolder && useFilesApi;

    const handleOpen = () => {
        if (openLink) window.open(openLink, "_blank");
    };

    const handleDownload = () => {
        if (downloadLink) window.open(downloadLink, "_blank");
    };

    const handleShare = () => {
        if (shareLink) {
            navigator.clipboard.writeText(shareLink).then(() => {
                toast.success(t("fileActions.copyLink"));
            });
        }
    };

    const handleTogglePublic = async () => {
        if (!canTogglePublic || isPublicLoading) return;
        setIsPublicLoading(true);
        try {
            const next = !isPublic;
            const promise = isFolder
                ? updateFolderPublic(
                    file.orgId,
                    next,
                    editor,
                    file.folderId ? { folder_id: file.folderId } : { name: file.name }
                  )
                : updateFilePublic(file.fileId as string, next, editor);
            await toast.promise(promise, {
                loading: next ? t("filePreview.loadingPublic") : t("filePreview.loadingPrivate"),
                success: next ? t("filePreview.publicOpened") : t("filePreview.publicClosed"),
                error: t("filePreview.publicError"),
            });
            setIsPublic(next);
            onRefresh?.();
        } catch {} finally {
            setIsPublicLoading(false);
        }
    };

    const handleDownloadFolderArchive = async () => {
        if (!canDownloadFolder || isArchiveLoading) return;
        setIsArchiveLoading(true);
        try {
            const blob = await downloadFolder(file.orgId, file.name, user?.id ?? undefined);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${file.displayName || file.name}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success(t("filePreview.archiveDownloaded"));
        } catch {
            toast.error(t("filePreview.archiveError"));
        } finally {
            setIsArchiveLoading(false);
        }
    };

    const handleToggleFavorite = async () => {
        if (!canFavorite || isFavoriteLoading) return;
        setIsFavoriteLoading(true);
        try {
            const next = !isFavorited;
            const promise = next
                ? addToFavorites(file._id as string, editor)
                : removeFromFavorites(file._id as string, editor);
            await toast.promise(promise, {
                loading: next ? t("filePreview.addToFavorites") + "…" : t("filePreview.removeFromFavorites") + "…",
                success: next ? t("filePreview.favoriteAdded") : t("filePreview.favoriteRemoved"),
                error: t("filePreview.favoriteError"),
            });
            setIsFavorited(next);
            onRefresh?.();
        } catch {} finally {
            setIsFavoriteLoading(false);
        }
    };

    const handleMoveToTrash = async () => {
        setIsConfirmLoading(true);
        try {
            await toast.promise(moveToTrash(file._id as string, editor), {
                loading: t("filePreview.trashMoved") + "…",
                success: t("filePreview.trashMoved"),
                error: t("filePreview.trashError"),
            });
            setIsTrashConfirmOpen(false);
            onRefresh?.();
            onOpenChange(false);
        } catch {} finally {
            setIsConfirmLoading(false);
        }
    };

    const handleRestore = async () => {
        try {
            await toast.promise(restoreFromTrash(file._id as string, editor), {
                loading: t("filePreview.restored") + "…",
                success: t("filePreview.restored"),
                error: t("filePreview.restoreError"),
            });
            onRefresh?.();
            onOpenChange(false);
        } catch {}
    };

    const handleDeletePermanently = async () => {
        if (!canPermanentlyDelete) {
            toast.error(t("files.adminOnlyDelete"));
            return;
        }

        setIsConfirmLoading(true);
        try {
            await toast.promise(deleteFilePermanently(file._id as string), {
                loading: t("filePreview.deleted") + "…",
                success: t("filePreview.deleted"),
                error: t("filePreview.deleteError"),
            });
            setIsDeleteConfirmOpen(false);
            onRefresh?.();
            onOpenChange(false);
        } catch {} finally {
            setIsConfirmLoading(false);
        }
    };

    const folderDisplayName = file.displayName ?? file.name;

    const handleDeleteFolder = async () => {
        if (!canPermanentlyDelete) {
            toast.error(t("files.adminOnlyFolderDelete"));
            return;
        }

        try {
            await toast.promise(deleteFolder(file.orgId, file.name, editor), {
                loading: t("filePreview.folderDeleted", { name: folderDisplayName }) + "…",
                success: t("filePreview.folderDeleted", { name: folderDisplayName }),
                error: t("filePreview.folderDeleteError"),
            });
            onRefresh?.();
            onOpenChange(false);
        } catch {}
    };

    const openLabel = notter ? t("fileActions.openNote") : shrtl ? t("fileActions.openLink") : t("fileActions.openFile");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[95vh] w-[calc(100%-1rem)] max-w-4xl overflow-hidden border-white/10 bg-[#1e1226] p-0 text-white sm:w-full sm:max-h-[90vh]">
                <div className="flex max-h-[95vh] flex-col overflow-hidden sm:max-h-[90vh] md:flex-row">
                    <div className="relative flex min-h-[180px] flex-1 items-center justify-center overflow-hidden bg-white/[0.03] p-4 sm:min-h-[240px] md:min-h-[420px] md:p-6">
                        {canFavorite && (
                            <button
                                onClick={handleToggleFavorite}
                                disabled={isFavoriteLoading}
                                className={`absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/30 backdrop-blur-sm transition-colors hover:bg-black/50 disabled:opacity-50 disabled:cursor-not-allowed ${
                                    isFavorited
                                        ? "text-red-500"
                                        : "text-white/60 hover:text-red-500"
                                }`}
                                title={isFavorited ? t("filePreview.removeFromFavorites") : t("filePreview.addToFavorites")}
                                aria-label={
                                    isFavorited ? t("filePreview.removeFromFavorites") : t("filePreview.addToFavorites")
                                }
                            >
                                <Heart
                                    className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`}
                                />
                            </button>
                        )}

                        {canShare && (
                            <button
                                onClick={handleShare}
                                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-white/60 backdrop-blur-sm transition-colors hover:bg-black/50 hover:text-white"
                                title={t("filePreview.share")}
                                aria-label={t("filePreview.share")}
                            >
                                <Share2Icon className="h-4 w-4" />
                            </button>
                        )}

                        {isFolder ? (
                            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-400">
                                {typeIcons.folder}
                            </div>
                        ) : (
                            <FilePreview file={file} fileLink={fileLink} variant="modal" />
                        )}
                    </div>

                    <div className="flex w-full flex-col gap-4 overflow-y-auto border-t border-white/10 p-4 sm:gap-5 md:w-[380px] md:border-l md:border-t-0 md:p-6">
                        <DialogHeader className="space-y-3 text-left">
                            <div className="flex items-center gap-2">
                                <span className="flex h-4 w-4 shrink-0 items-center justify-center text-zinc-400 [&_svg]:h-4 [&_svg]:w-4">
                                    {typeIcons[file.type]}
                                </span>
                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                    <DialogTitle className="truncate text-lg font-semibold leading-snug sm:text-xl" title={displayName}>
                                        {displayName}
                                    </DialogTitle>
                                    {canRename && (
                                        <button
                                            onClick={() => setIsRenameOpen(true)}
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                                            title={t("fileActions.rename")}
                                            aria-label={t("fileActions.rename")}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {!isFolder && typeof file.fileSize === "number" && (
                                <p className="text-sm text-white/50">
                                    {t("filePreview.size")}: {formatSize(file.fileSize)}
                                </p>
                            )}
                        </DialogHeader>

                        <div className="space-y-3 text-sm text-white/60">
                            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                                <span className="text-white/40">{t("filePreview.type")}:</span>
                                <span className="text-white/80">
                                    {getFileFormatDisplay(
                                      file.name,
                                      file.type,
                                      file.isFolder,
                                      t,
                                      file.contentType
                                    )}
                                </span>
                            </div>

                            {useFilesApi && (
                                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                                    <span className="text-white/40">{t("filePreview.access")}:</span>
                                    <span className="flex items-center gap-1.5 text-white/80">
                                        {isPublic ? (
                                            <>
                                                <Globe className="h-3.5 w-3.5" />
                                                {t("filePreview.public")}
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="h-3.5 w-3.5" />
                                                {t("filePreview.private")}
                                            </>
                                        )}
                                    </span>
                                </div>
                            )}

                            {(file.folder !== undefined || canMove) && (
                                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                                    <span className="shrink-0 text-white/40">{t("filePreview.location")}:</span>
                                    <span className="truncate text-white/80">
                                        {file.folder ? t("filePreview.folderLocation", { path: file.folder }) : "/"}
                                    </span>
                                    {canMove && (
                                        <button
                                            onClick={() => setIsMoveOpen(true)}
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                                            title={t("fileActions.moveToFolder")}
                                            aria-label={t("fileActions.moveToFolder")}
                                        >
                                            <FolderInput className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                                <span className="text-white/40">
                                    {isFolder || !shrtl ? t("filePreview.date") : t("filePreview.expires")}:
                                </span>
                                <span className="text-white/80">{dateDisplay}</span>
                            </div>

                            {shrtl && !isFolder && (
                                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                                    <span className="text-white/40">{t("filePreview.downloads")}:</span>
                                    <span className="text-white/80">{file.downloads ?? 0}</span>
                                </div>
                            )}

                            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                                <span className="text-white/40">{t("filePreview.user")}:</span>
                                <div className="flex items-center gap-2 text-white/80">
                                    <Avatar className="h-5 w-5">
                                        <AvatarImage src={avatar} />
                                        <AvatarFallback className="bg-white/10 text-[10px] text-white/60">
                                            {username?.charAt(0) ?? "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="truncate">{username}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto flex flex-col gap-3 pt-4">
                            {canTogglePublic ? (
                                <div className="flex w-full gap-2">
                                    <button
                                        onClick={handleTogglePublic}
                                        disabled={isPublicLoading}
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple/90 disabled:opacity-50 disabled:cursor-not-allowed md:py-2.5"
                                    >
                                        {isPublic ? (
                                            <>
                                                <Lock className="h-4 w-4" />
                                                {t("filePreview.makePrivate")}
                                            </>
                                        ) : (
                                            <>
                                                <Globe className="h-4 w-4" />
                                                {t("filePreview.makePublic")}
                                            </>
                                        )}
                                    </button>
                                    {isPublic && canOpen && (
                                        <button
                                            onClick={handleOpen}
                                            className="inline-flex aspect-square h-auto items-center justify-center rounded-xl bg-purple px-3 text-white transition-colors hover:bg-purple/90"
                                            title={openLabel}
                                            aria-label={openLabel}
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ) : (
                                canOpen && (
                                    <button
                                        onClick={handleOpen}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple/90 md:py-2.5"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        {openLabel}
                                    </button>
                                )
                            )}

                            {canDownload && (
                                <button
                                    onClick={handleDownload}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium md:py-2.5 text-white transition-colors hover:bg-white/10"
                                >
                                    <Download className="h-4 w-4" />
                                    {t("filePreview.download")}
                                </button>
                            )}

                            {canDownloadFolder && (
                                <button
                                    onClick={handleDownloadFolderArchive}
                                    disabled={isArchiveLoading}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium md:py-2.5 text-white transition-colors hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isArchiveLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Download className="h-4 w-4" />
                                    )}
                                    {t("filePreview.downloadArchive")}
                                </button>
                            )}

                            {canTrash && !deletedOnly && (
                                <button
                                    onClick={() => setIsTrashConfirmOpen(true)}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium md:py-2.5 text-red-400 transition-colors hover:bg-red-500/20"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    {t("filePreview.delete")}
                                </button>
                            )}

                            {(isFolder || deletedOnly) && (
                                <div className="flex flex-col gap-3 border-t border-white/10 pt-3">
                                    {isFolder ? (
                                        canPermanentlyDelete && (
                                            <button
                                                onClick={handleDeleteFolder}
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium md:py-2.5 text-red-400 transition-colors hover:bg-red-500/20"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                {t("filePreview.deleteFolder")}
                                            </button>
                                        )
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleRestore}
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium md:py-2.5 text-white transition-colors hover:bg-white/10"
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                                {t("filePreview.restore")}
                                            </button>
                                            {canPermanentlyDelete && (
                                                <button
                                                    onClick={() => setIsDeleteConfirmOpen(true)}
                                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium md:py-2.5 text-red-400 transition-colors hover:bg-red-500/20"
                                                >
                                                    <Trash className="h-4 w-4" />
                                                    {t("filePreview.deleteForever")}
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>

            <RenameDialog
                file={file}
                open={isRenameOpen}
                onOpenChange={setIsRenameOpen}
                onRenamed={onRefresh}
            />
            <MoveToFolderDialog
                file={file}
                currentFolder={file.folder ?? null}
                open={isMoveOpen}
                onOpenChange={setIsMoveOpen}
                onMoved={onRefresh}
            />

            <ConfirmDialog
                open={isTrashConfirmOpen}
                onOpenChange={setIsTrashConfirmOpen}
                title={t("fileActions.moveToTrashTitle")}
                description={t("fileActions.moveToTrashDescription", { name: file.name })}
                confirmLabel={t("files.toTrash")}
                cancelLabel={t("common.cancel")}
                onConfirm={handleMoveToTrash}
                isLoading={isConfirmLoading}
                destructive={false}
            />

            <ConfirmDialog
                open={isDeleteConfirmOpen}
                onOpenChange={setIsDeleteConfirmOpen}
                title={t("fileActions.deleteForeverTitle")}
                description={t("fileActions.deleteForeverDescription", { name: file.name })}
                confirmLabel={t("filePreview.deleteForever")}
                cancelLabel={t("common.cancel")}
                onConfirm={handleDeletePermanently}
                isLoading={isConfirmLoading}
                destructive={true}
            />
        </Dialog>
    );
}
