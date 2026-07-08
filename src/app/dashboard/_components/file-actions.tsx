"use client";

import {
    Copy,
    Download,
    ExternalLink,
    FileIcon,
    FolderInput,
    FolderOpen,
    Globe,
    Heart,
    Lock,
    Loader2,
    MoreVertical,
    Pencil,
    RotateCcw,
    Share2Icon,
    Trash,
    Trash2,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { pages } from "@/config/routing/pages.route";
import type { FileCardProps } from "@/config/types/components.types";
import { useOrigin } from "../../../components/hooks/use-origin";
import { getFilesEditor } from "@/lib/files-editor";
import { toast } from "@/lib/toast";

import { useState } from "react";
import { links } from "@/config/routing/links.route";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { isFileExpired } from "./file-helpers";
import { useUser } from "@clerk/nextjs";
import { RenameDialog } from "@/components/dialog/rename-dialog";
import { MoveToFolderDialog } from "@/components/dialog/move-to-folder-dialog";
import { ConfirmDialog } from "@/components/dialog/confirm-dialog";
import { useCurrentOrg } from "@/components/hooks/use-current-org";
import { useTranslation } from "@/components/hooks/use-translation";
import {
    addToFavorites,
    removeFromFavorites,
    moveToTrash,
    moveFolderToTrash,
    restoreFromTrash,
    restoreFolder,
    deleteFilePermanently,
    deleteFolder,
    updateFilePublic,
    updateFolderPublic,
    downloadFolder,
} from "@/app/api/files";

export function FileCardActions({
    file,
    shrtl,
    notter,
    useFilesApi,
    deletedOnly,
    onRefresh,
    onOpenFolder,
}: FileCardProps) {
    const { t } = useTranslation();
    const { user } = useUser();
    const { isOrgAdmin } = useCurrentOrg();
    const origin = useOrigin();
    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [isMoveOpen, setIsMoveOpen] = useState(false);
    const [isTrashConfirmOpen, setIsTrashConfirmOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isFolderTrashConfirmOpen, setIsFolderTrashConfirmOpen] = useState(false);
    const [isFolderDeleteConfirmOpen, setIsFolderDeleteConfirmOpen] = useState(false);
    const [isConfirmLoading, setIsConfirmLoading] = useState(false);
    const [isPublicLoading, setIsPublicLoading] = useState(false);
    const [isArchiveLoading, setIsArchiveLoading] = useState(false);
    const isFolder = file.isFolder;
    const editor = getFilesEditor(user);
    const canPermanentlyDelete = isOrgAdmin;

    const openLink = shrtl
        ? links.SHRTL.GET_LINK(file.fileId as string)
        : notter
        ? links.NOTTER.GET_NOTE(file.noteId || (file._id as string))
        : useFilesApi
        ? pages.FILE.BY_ID(file.fileId as string)
        : pages.FILE.COPY(origin, file.linkId || "");

    const downloadLink = useFilesApi
        ? (file.fileUrl || links.FILES.GET_FILE(file.fileId as string))
        : undefined;

    const shareLink = useFilesApi
        ? pages.FILE.COPY(origin, file.linkId || (file._id as string))
        : openLink;

    const expired = isFileExpired(file);

    const handleToggleFavorite = async () => {
        try {
            const promise = file.isFavorited
                ? removeFromFavorites(file._id as string, editor)
                : addToFavorites(file._id as string, editor);
            await toast.promise(promise, {
                loading: file.isFavorited ? t("filePreview.removeFromFavorites") + "…" : t("filePreview.addToFavorites") + "…",
                success: file.isFavorited ? t("filePreview.favoriteRemoved") : t("filePreview.favoriteAdded"),
                error: t("filePreview.favoriteError"),
            });
            onRefresh?.();
        } catch {}
    };

    const handleMoveToTrash = async () => {
        setIsConfirmLoading(true);
        try {
            await toast.promise(
                moveToTrash(file._id as string, editor),
                {
                    loading: t("filePreview.trashMoved") + "…",
                    success: t("filePreview.trashMoved"),
                    error: t("filePreview.trashError"),
                },
            );
            setIsTrashConfirmOpen(false);
            onRefresh?.();
        } catch {} finally {
            setIsConfirmLoading(false);
        }
    };

    const handleRestore = async () => {
        try {
            await toast.promise(
                restoreFromTrash(file._id as string, editor),
                {
                    loading: t("filePreview.restored") + "…",
                    success: t("filePreview.restored"),
                    error: t("filePreview.restoreError"),
                },
            );
            onRefresh?.();
        } catch {}
    };

    const handleDeletePermanently = async () => {
        if (!canPermanentlyDelete) {
            toast.error(t("files.adminOnlyDelete"));
            return;
        }

        setIsConfirmLoading(true);
        try {
            await toast.promise(
                deleteFilePermanently(file._id as string),
                {
                    loading: t("filePreview.deleted") + "…",
                    success: t("filePreview.deleted"),
                    error: t("filePreview.deleteError"),
                },
            );
            setIsDeleteConfirmOpen(false);
            onRefresh?.();
        } catch {} finally {
            setIsConfirmLoading(false);
        }
    };

    const handleDownload = () => {
        if (!downloadLink) {
            toast.error(t("fileActions.downloadUnavailable"));
            return;
        }
        window.open(downloadLink, "_blank");
    };

    const handleTogglePublic = async () => {
        if (isPublicLoading) return;
        setIsPublicLoading(true);
        try {
            const next = !file.isPublic;
            const promise = isFolder
                ? updateFolderPublic(
                    file.orgId,
                    next,
                    editor,
                    file.folderId ? { folder_id: file.folderId } : { name: file.name }
                  )
                : updateFilePublic(file.fileId as string, next, editor);
            await toast.promise(
                promise,
                {
                    loading: next ? t("filePreview.loadingPublic") : t("filePreview.loadingPrivate"),
                    success: next ? t("filePreview.publicOpened") : t("filePreview.publicClosed"),
                    error: t("filePreview.publicError"),
                },
            );
            onRefresh?.();
        } catch {} finally {
            setIsPublicLoading(false);
        }
    };

    const handleDownloadFolderArchive = async () => {
        if (!isFolder || isArchiveLoading) return;
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

    const folderShareLink = isFolder && file.folderId
        ? pages.FOLDER.COPY(origin, file.folderId)
        : "";

    const folderDisplayName = file.displayName ?? file.name;

    const handleMoveFolderToTrash = async () => {
        setIsConfirmLoading(true);
        try {
            await toast.promise(
                moveFolderToTrash(file.orgId, file.name, editor),
                {
                    loading: t("filePreview.folderMovedToTrash", { name: folderDisplayName }) + "…",
                    success: t("filePreview.folderMovedToTrash", { name: folderDisplayName }),
                    error: t("filePreview.folderTrashedError"),
                },
            );
            setIsFolderTrashConfirmOpen(false);
            onRefresh?.();
        } catch {} finally {
            setIsConfirmLoading(false);
        }
    };

    const handleRestoreFolder = async () => {
        try {
            await toast.promise(
                restoreFolder(file.orgId, file.name, editor),
                {
                    loading: t("filePreview.folderRestored", { name: folderDisplayName }) + "…",
                    success: t("filePreview.folderRestored", { name: folderDisplayName }),
                    error: t("filePreview.folderRestoreError"),
                },
            );
            onRefresh?.();
        } catch {}
    };

    const handleDeleteFolder = async () => {
        if (!canPermanentlyDelete) {
            toast.error(t("files.adminOnlyFolderDelete"));
            return;
        }

        setIsConfirmLoading(true);
        try {
            await toast.promise(
                deleteFolder(file.orgId, file.name, editor),
                {
                    loading: t("filePreview.folderDeleted", { name: folderDisplayName }) + "…",
                    success: t("filePreview.folderDeleted", { name: folderDisplayName }),
                    error: t("filePreview.folderDeleteError"),
                },
            );
            setIsFolderDeleteConfirmOpen(false);
            onRefresh?.();
        } catch {} finally {
            setIsConfirmLoading(false);
        }
    };

    const handleCopyFolderPath = async () => {
        try {
            await navigator.clipboard.writeText(file.name);
            toast.success(t("fileActions.copyFolderPath"));
        } catch {
            toast.error(t("fileActions.copyError"));
        }
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(shareLink);
            toast.success(t("fileActions.copyLink"));
        } catch {}
    };

    const handleShareFolder = async () => {
        try {
            await navigator.clipboard.writeText(folderShareLink);
            toast.success(t("fileActions.copyLink"));
        } catch {}
    };

    return (
        <>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white">
                    <MoreVertical size={16} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="border-white/10 bg-[#1e1226] text-white min-w-[180px]">
                {isFolder ? (
                    <>
                        {file.isPublic && (
                            <DropdownMenuItem
                                className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                onClick={() => onOpenFolder?.(file.name)}
                            >
                                <FolderOpen className="w-4 h-4" /> {t("fileActions.open")}
                            </DropdownMenuItem>
                        )}
                        {deletedOnly ? (
                            <>
                                <DropdownMenuItem
                                    className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                    onClick={handleDownloadFolderArchive}
                                    disabled={isArchiveLoading}
                                >
                                    {isArchiveLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Download className="w-4 h-4" />
                                    )}
                                    {t("filePreview.downloadArchive")}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/5 h-0.5 my-1" />
                                <DropdownMenuItem
                                    className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                    onClick={handleRestoreFolder}
                                >
                                    <RotateCcw className="w-4 h-4" /> {t("filePreview.restore")}
                                </DropdownMenuItem>
                                {canPermanentlyDelete && (
                                    <DropdownMenuItem
                                        className="flex gap-1 items-center cursor-pointer text-red-400 focus:bg-white/10 focus:text-red-400"
                                        onClick={() => setIsFolderDeleteConfirmOpen(true)}
                                    >
                                        <Trash className="w-4 h-4" /> {t("filePreview.deleteForever")}
                                    </DropdownMenuItem>
                                )}
                            </>
                        ) : (
                            <>
                                <DropdownMenuItem
                                    className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                    onClick={() => setIsRenameOpen(true)}
                                >
                                    <Pencil className="w-4 h-4" /> {t("fileActions.rename")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                    onClick={() => setIsMoveOpen(true)}
                                >
                                    <FolderInput className="w-4 h-4" /> {t("fileActions.moveToFolder")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                    onClick={handleCopyFolderPath}
                                >
                                    <Copy className="w-4 h-4" /> {t("fileActions.copyPath")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                    onClick={handleDownloadFolderArchive}
                                    disabled={isArchiveLoading}
                                >
                                    {isArchiveLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Download className="w-4 h-4" />
                                    )}
                                    {t("filePreview.downloadArchive")}
                                </DropdownMenuItem>
                                {useFilesApi && (
                                    <>
                                        {file.isPublic && (
                                            <DropdownMenuItem
                                                className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                                onClick={handleShareFolder}
                                            >
                                                <Share2Icon className="w-4 h-4" /> {t("fileActions.share")}
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem
                                            className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                            onClick={handleTogglePublic}
                                            disabled={isPublicLoading}
                                        >
                                            {file.isPublic ? (
                                                <>
                                                    <Lock className="w-4 h-4" /> {t("fileActions.makePrivateFolder")}
                                                </>
                                            ) : (
                                                <>
                                                    <Globe className="w-4 h-4" /> {t("fileActions.makePublicFolder")}
                                                </>
                                            )}
                                        </DropdownMenuItem>
                                    </>
                                )}
                                {useFilesApi && (
                                    <>
                                        <DropdownMenuSeparator className="bg-white/5 h-0.5 my-1" />
                                        <DropdownMenuItem
                                            className="flex gap-1 items-center cursor-pointer text-red-400 focus:bg-white/10 focus:text-red-400"
                                            onClick={() => setIsFolderTrashConfirmOpen(true)}
                                        >
                                            <Trash2 className="w-4 h-4" /> {t("files.toTrash")}
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </>
                        )}
                    </>
                ) : (
                    <>
                        {notter && !expired && openLink && (
                            <DropdownMenuItem
                                className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                onClick={() => window.open(openLink, "_blank")}
                            >
                                <ExternalLink className="w-4 h-4" /> {t("fileActions.openNote")}
                            </DropdownMenuItem>
                        )}

                        {!notter && !expired && openLink && file.isPublic && (
                            <>
                                <DropdownMenuItem
                                    className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                    onClick={() => window.open(openLink, "_blank")}
                                >
                                    <FileIcon className="w-4 h-4" /> {t("fileActions.open")}
                                </DropdownMenuItem>

                                {(!useFilesApi || file.isPublic) && (
                                    <DropdownMenuItem
                                        className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                        onClick={handleShare}
                                    >
                                        <Share2Icon className="w-4 h-4" /> {t("fileActions.share")}
                                    </DropdownMenuItem>
                                )}
                            </>
                        )}

                        {!notter && !expired && !deletedOnly && (
                            <DropdownMenuItem
                                className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                onClick={handleTogglePublic}
                                disabled={isPublicLoading}
                            >
                                {file.isPublic ? (
                                    <>
                                        <Lock className="w-4 h-4" /> {t("fileActions.makePrivate")}
                                    </>
                                ) : (
                                    <>
                                        <Globe className="w-4 h-4" /> {t("fileActions.makePublic")}
                                    </>
                                )}
                            </DropdownMenuItem>
                        )}

                        {useFilesApi && (
                            <>
                                {!expired && !deletedOnly && (
                                    <DropdownMenuItem
                                        className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                        onClick={handleToggleFavorite}
                                    >
                                        {file.isFavorited ? (
                                            <>
                                                <Heart className="w-4 h-4" /> {t("fileActions.removeFromFavorites")}
                                            </>
                                        ) : (
                                            <>
                                                <Heart className="w-4 h-4" /> {t("fileActions.addToFavorites")}
                                            </>
                                        )}
                                    </DropdownMenuItem>
                                )}

                                {!expired && !deletedOnly && (
                                    <DropdownMenuItem
                                        className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                        onClick={() => setIsRenameOpen(true)}
                                    >
                                        <Pencil className="w-4 h-4" /> {t("fileActions.rename")}
                                    </DropdownMenuItem>
                                )}

                                {!expired && !deletedOnly && (
                                    <DropdownMenuItem
                                        className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                        onClick={() => setIsMoveOpen(true)}
                                    >
                                        <FolderInput className="w-4 h-4" /> {t("fileActions.moveToFolder")}
                                    </DropdownMenuItem>
                                )}

                                <DropdownMenuItem
                                    className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                    onClick={handleDownload}
                                >
                                    <Download className="w-4 h-4" /> {t("filePreview.download")}
                                </DropdownMenuItem>

                                {deletedOnly ? (
                                    <>
                                        <DropdownMenuSeparator className="bg-white/5 h-0.5 my-1" />
                                        <DropdownMenuItem
                                            className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                            onClick={handleRestore}
                                        >
                                            <RotateCcw className="w-4 h-4" /> {t("filePreview.restore")}
                                        </DropdownMenuItem>
                                        {canPermanentlyDelete && (
                                            <DropdownMenuItem
                                                className="flex gap-1 items-center cursor-pointer text-red-400 focus:bg-white/10 focus:text-red-400"
                                                onClick={() => setIsDeleteConfirmOpen(true)}
                                            >
                                                <Trash className="w-4 h-4" /> {t("filePreview.deleteForever")}
                                            </DropdownMenuItem>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {!expired && openLink && file.isPublic && <DropdownMenuSeparator className="bg-white/5 h-0.5 my-1" />}
                                        <DropdownMenuItem
                                            className="flex gap-1 items-center cursor-pointer text-red-400 focus:bg-white/10 focus:text-red-400"
                                            onClick={() => setIsTrashConfirmOpen(true)}
                                        >
                                            <Trash2 className="w-4 h-4" /> {t("files.toTrash")}
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </>
                        )}

                        {shrtl && (
                            <>
                                {!expired && <DropdownMenuSeparator className="bg-white/5 h-0.5 my-1" />}

                                <div className="flex gap-1 items-center cursor-default text-white/70 px-2 py-1.5 text-sm">
                                    <Download className="w-4 h-4" /> {t("fileActions.downloadsCount", { count: file.downloads ?? 0 })}
                                </div>
                            </>
                        )}
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>

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

        <ConfirmDialog
            open={isFolderTrashConfirmOpen}
            onOpenChange={setIsFolderTrashConfirmOpen}
            title={t("fileActions.moveFolderToTrashTitle")}
            description={t("fileActions.moveFolderToTrashDescription", { name: file.name })}
            confirmLabel={t("files.toTrash")}
            cancelLabel={t("common.cancel")}
            onConfirm={handleMoveFolderToTrash}
            isLoading={isConfirmLoading}
            destructive={false}
        />

        <ConfirmDialog
            open={isFolderDeleteConfirmOpen}
            onOpenChange={setIsFolderDeleteConfirmOpen}
            title={t("fileActions.deleteFolderForeverTitle")}
            description={t("fileActions.deleteFolderForeverDescription", { name: file.name })}
            confirmLabel={t("filePreview.deleteForever")}
            cancelLabel={t("common.cancel")}
            onConfirm={handleDeleteFolder}
            isLoading={isConfirmLoading}
            destructive={true}
        />
        </>
    );
}
