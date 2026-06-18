"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { formatRelative } from "date-fns";
import {
    Download,
    ExternalLink,
    FolderInput,
    Heart,
    Pencil,
    RotateCcw,
    Share2Icon,
    Trash,
    Trash2,
} from "lucide-react";
import { useState } from "react";

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
    moveToTrash,
    removeFromFavorites,
    restoreFromTrash,
} from "@/app/api/files";
import { toast } from "@/lib/toast";

import { FilePreview } from "@/app/dashboard/_components/file-preview";
import { RenameDialog } from "@/components/dialog/rename-dialog";
import { MoveToFolderDialog } from "@/components/dialog/move-to-folder-dialog";
import { ConfirmDialog } from "@/components/dialog/confirm-dialog";
import { formatExpiresIn, formatSize, getFileFormatDisplay, isFileExpired } from "@/app/dashboard/_components/file-helpers";

const copyTextToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Ссылка скопирована");
};

interface FilePreviewModalProps {
    file: FileDoc;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    shrtl?: boolean;
    notter?: boolean;
    useFilesApi?: boolean;
    deletedOnly?: boolean;
    onRefresh?: () => void;
    onOpenFolder?: (folderName: string) => void;
}

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
}: FilePreviewModalProps) {
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

    const fileLink = isFolder
        ? ""
        : shrtl
        ? file.fileUrl ?? links.SHRTL.GET_FILE(file.fileId as string)
        : notter
        ? links.NOTTER.GET_FILE(file.fileId as string)
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
        ? links.NOTTER.GET_FILE(file.fileId as string)
        : links.KENYCLOUD.GET_FILE(file.fileId as Id<"_storage">);

    const shareLink = isFolder
        ? ""
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
        username = getLastEditorDisplayName(file.lastEditorUsername, user);
    } else {
        avatar = userProfile?.image;
        username = userProfile?.name;
    }

    const displayName = file.displayName?.trim() || file.name?.trim() || "Без названия";

    const dateDisplay = isFolder
        ? file.updatedAt
            ? formatRelative(new Date(file.updatedAt), new Date())
            : "—"
        : shrtl
        ? formatExpiresIn(
              "_expiresInSeconds" in file
                  ? ((file._expiresInSeconds as number | null | undefined) ?? null)
                  : null
          )
        : formatRelative(new Date(file._creationTime), new Date());

    const canFavorite = useFilesApi && !isFolder && !deletedOnly && !expired;
    const canRename =
        (useFilesApi || isFolder) && !deletedOnly && (!isFolder ? !expired : true);
    const canMove =
        (useFilesApi || isFolder) && !deletedOnly && (!isFolder ? !expired : true);
    const canShare = !isFolder && !expired && Boolean(shareLink) && !notter && !deletedOnly;
    const canTrash = useFilesApi && !isFolder;
    const canDownload = !isFolder && Boolean(downloadLink);
    const canOpen = !isFolder && !expired && Boolean(openLink);

    const handleOpen = () => {
        if (openLink) window.open(openLink, "_blank");
    };

    const handleDownload = () => {
        if (downloadLink) window.open(downloadLink, "_blank");
    };

    const handleShare = () => {
        if (shareLink) copyTextToClipboard(shareLink);
    };

    const handleToggleFavorite = async () => {
        if (!canFavorite) return;
        try {
            const promise = file.isFavorited
                ? removeFromFavorites(file._id as string, editor)
                : addToFavorites(file._id as string, editor);
            await toast.promise(promise, {
                loading: file.isFavorited ? "Убираем из избранного…" : "Добавляем в избранное…",
                success: file.isFavorited ? "Убрано из избранного" : "Добавлено в избранное",
                error: "Не удалось обновить избранное",
            });
            onRefresh?.();
        } catch {}
    };

    const handleMoveToTrash = async () => {
        setIsConfirmLoading(true);
        try {
            await toast.promise(moveToTrash(file._id as string, editor), {
                loading: "Перемещаем в корзину…",
                success: "Перемещено в корзину",
                error: "Не удалось переместить в корзину",
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
                loading: "Восстанавливаем…",
                success: "Файл восстановлен",
                error: "Не удалось восстановить файл",
            });
            onRefresh?.();
            onOpenChange(false);
        } catch {}
    };

    const handleDeletePermanently = async () => {
        if (!canPermanentlyDelete) {
            toast.error("Безвозвратное удаление может выполнить только администратор организации");
            return;
        }

        setIsConfirmLoading(true);
        try {
            await toast.promise(deleteFilePermanently(file._id as string), {
                loading: "Удаляем…",
                success: "Файл удален",
                error: "Не удалось удалить файл",
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
            toast.error("Удаление папки может выполнить только администратор организации");
            return;
        }

        try {
            await toast.promise(deleteFolder(file.orgId, file.name, editor), {
                loading: "Удаляем папку…",
                success: `Папка «${folderDisplayName}» удалена`,
                error: "Не удалось удалить папку",
            });
            onRefresh?.();
            onOpenChange(false);
        } catch {}
    };

    const openLabel = notter ? "Открыть заметку" : shrtl ? "Открыть ссылку" : "Открыть файл";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[95vh] w-[calc(100%-1rem)] max-w-4xl overflow-hidden border-white/10 bg-[#1e1226] p-0 text-white sm:w-full sm:max-h-[90vh]">
                <div className="flex max-h-[95vh] flex-col overflow-hidden sm:max-h-[90vh] md:flex-row">
                    <div className="relative flex min-h-[180px] flex-1 items-center justify-center overflow-hidden bg-white/[0.03] p-4 sm:min-h-[240px] md:min-h-[420px] md:p-6">
                        {canFavorite && (
                            <button
                                onClick={handleToggleFavorite}
                                className={`absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/30 backdrop-blur-sm transition-colors hover:bg-black/50 ${
                                    file.isFavorited
                                        ? "text-red-500"
                                        : "text-white/60 hover:text-red-500"
                                }`}
                                title={file.isFavorited ? "Убрать из избранного" : "В избранное"}
                                aria-label={
                                    file.isFavorited ? "Убрать из избранного" : "В избранное"
                                }
                            >
                                <Heart
                                    className={`h-5 w-5 ${file.isFavorited ? "fill-current" : ""}`}
                                />
                            </button>
                        )}

                        {canShare && (
                            <button
                                onClick={handleShare}
                                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-white/60 backdrop-blur-sm transition-colors hover:bg-black/50 hover:text-white"
                                title="Поделиться"
                                aria-label="Поделиться"
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
                                    <DialogTitle className="break-all text-lg font-semibold leading-snug sm:text-xl">
                                        {displayName}
                                    </DialogTitle>
                                    {canRename && (
                                        <button
                                            onClick={() => setIsRenameOpen(true)}
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                                            title="Переименовать"
                                            aria-label="Переименовать"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {!isFolder && typeof file.fileSize === "number" && (
                                <p className="text-sm text-white/50">
                                    Размер: {formatSize(file.fileSize)}
                                </p>
                            )}
                        </DialogHeader>

                        <div className="space-y-3 text-sm text-white/60">
                            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                                <span className="text-white/40">Тип:</span>
                                <span className="text-white/80">
                                    {getFileFormatDisplay(file.name, file.type, file.isFolder)}
                                </span>
                            </div>

                            {(file.folder !== undefined || canMove) && (
                                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                                    <span className="shrink-0 text-white/40">Расположение:</span>
                                    <span className="truncate text-white/80">
                                        {file.folder ? `/${file.folder}` : "/"}
                                    </span>
                                    {canMove && (
                                        <button
                                            onClick={() => setIsMoveOpen(true)}
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                                            title="Переместить в папку"
                                            aria-label="Переместить в папку"
                                        >
                                            <FolderInput className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                                <span className="text-white/40">
                                    {isFolder || !shrtl ? "Дата:" : "Срок:"}
                                </span>
                                <span className="text-white/80">{dateDisplay}</span>
                            </div>

                            {shrtl && !isFolder && (
                                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                                    <span className="text-white/40">Скачиваний:</span>
                                    <span className="text-white/80">{file.downloads ?? 0}</span>
                                </div>
                            )}

                            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                                <span className="text-white/40">Пользователь:</span>
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
                            {canOpen && (
                                <button
                                    onClick={handleOpen}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple px-4 py-2 text-sm font-medium md:py-2.5 text-white transition-colors hover:bg-purple/90"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    {openLabel}
                                </button>
                            )}

                            {canDownload && (
                                <button
                                    onClick={handleDownload}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium md:py-2.5 text-white transition-colors hover:bg-white/10"
                                >
                                    <Download className="h-4 w-4" />
                                    Скачать
                                </button>
                            )}

                            {canTrash && !deletedOnly && (
                                <button
                                    onClick={() => setIsTrashConfirmOpen(true)}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium md:py-2.5 text-red-400 transition-colors hover:bg-red-500/20"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Удалить
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
                                                Удалить папку
                                            </button>
                                        )
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleRestore}
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium md:py-2.5 text-white transition-colors hover:bg-white/10"
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                                Восстановить
                                            </button>
                                            {canPermanentlyDelete && (
                                                <button
                                                    onClick={() => setIsDeleteConfirmOpen(true)}
                                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium md:py-2.5 text-red-400 transition-colors hover:bg-red-500/20"
                                                >
                                                    <Trash className="h-4 w-4" />
                                                    Удалить навсегда
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
                title="Переместить в корзину"
                description={`Вы уверены, что хотите переместить «${file.name}» в корзину? Файл можно будет восстановить позже.`}
                confirmLabel="В корзину"
                cancelLabel="Отмена"
                onConfirm={handleMoveToTrash}
                isLoading={isConfirmLoading}
                destructive={false}
            />

            <ConfirmDialog
                open={isDeleteConfirmOpen}
                onOpenChange={setIsDeleteConfirmOpen}
                title="Удалить навсегда"
                description={`Вы уверены, что хотите безвозвратно удалить «${file.name}»? Это действие нельзя отменить.`}
                confirmLabel="Удалить"
                cancelLabel="Отмена"
                onConfirm={handleDeletePermanently}
                isLoading={isConfirmLoading}
                destructive={true}
            />
        </Dialog>
    );
}
