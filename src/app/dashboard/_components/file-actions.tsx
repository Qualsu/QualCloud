import {
    Copy,
    Download,
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
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { pages } from "@/config/routing/pages.route"
import type { FileCardProps } from "@/config/types/components.types"
import { useOrigin } from "../../../components/hooks/use-origin"
import { getFilesEditor } from "@/lib/files-editor"
import { toast } from "@/lib/toast"

import { useState } from "react"
import { links } from "@/config/routing/links.route"
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu"
import { isFileExpired } from "./file-helpers"
import { useUser } from "@clerk/nextjs"
import { RenameDialog } from "@/components/dialog/rename-dialog"
import { MoveToFolderDialog } from "@/components/dialog/move-to-folder-dialog"
import { ConfirmDialog } from "@/components/dialog/confirm-dialog"
import { useCurrentOrg } from "@/components/hooks/use-current-org"
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
} from "@/app/api/files"

const copyTextToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    toast.success("Ссылка скопирована")
}

export function FileCardActions({
    file,
    shrtl,
    notter,
    useFilesApi,
    deletedOnly,
    onRefresh,
    onOpenFolder,
}: FileCardProps) {
    const { user } = useUser();
    const { isOrgAdmin } = useCurrentOrg();
    const origin = useOrigin()
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
        : pages.FILE.COPY(origin, file.linkId || "")

    const downloadLink = useFilesApi
        ? (file.fileUrl || links.FILES.GET_FILE(file.fileId as string))
        : undefined

    const shareLink = useFilesApi
        ? pages.FILE.COPY(origin, file.linkId || (file._id as string))
        : openLink

    const expired = isFileExpired(file)

    const handleToggleFavorite = async () => {
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
            await toast.promise(
                moveToTrash(file._id as string, editor),
                {
                    loading: "Перемещаем в корзину…",
                    success: "Перемещено в корзину",
                    error: "Не удалось переместить в корзину",
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
                    loading: "Восстанавливаем…",
                    success: "Файл восстановлен",
                    error: "Не удалось восстановить файл",
                },
            );
            onRefresh?.();
        } catch {}
    };

    const handleDeletePermanently = async () => {
        if (!canPermanentlyDelete) {
            toast.error("Безвозвратное удаление может выполнить только администратор организации");
            return;
        }

        setIsConfirmLoading(true);
        try {
            await toast.promise(
                deleteFilePermanently(file._id as string),
                {
                    loading: "Удаляем…",
                    success: "Файл удален",
                    error: "Не удалось удалить файл",
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
            toast.error("Ссылка для скачивания недоступна");
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
                    loading: next ? "Открываем публичный доступ…" : "Закрываем публичный доступ…",
                    success: next ? "Публичный доступ открыт" : "Публичный доступ закрыт",
                    error: "Не удалось изменить публичный доступ",
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
            toast.success("Архив скачан");
        } catch {
            toast.error("Не удалось скачать архив");
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
                    loading: "Перемещаем папку в корзину…",
                    success: `Папка «${folderDisplayName}» перемещена в корзину`,
                    error: "Не удалось переместить папку в корзину",
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
                    loading: "Восстанавливаем папку…",
                    success: `Папка «${folderDisplayName}» восстановлена`,
                    error: "Не удалось восстановить папку",
                },
            );
            onRefresh?.();
        } catch {}
    };

    const handleDeleteFolder = async () => {
        if (!canPermanentlyDelete) {
            toast.error("Удаление папки может выполнить только администратор организации");
            return;
        }

        setIsConfirmLoading(true);
        try {
            await toast.promise(
                deleteFolder(file.orgId, file.name, editor),
                {
                    loading: "Удаляем папку…",
                    success: `Папка «${folderDisplayName}» удалена`,
                    error: "Не удалось удалить папку",
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
            toast.success("Путь к папке скопирован");
        } catch {
            toast.error("Не удалось скопировать путь");
        }
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
                        <DropdownMenuItem
                            className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                            onClick={() => onOpenFolder?.(file.name)}
                        >
                            <FolderOpen className="w-4 h-4" /> Открыть
                        </DropdownMenuItem>
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
                                    Скачать архивом
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/5 h-0.5 my-1" />
                                <DropdownMenuItem
                                    className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                    onClick={handleRestoreFolder}
                                >
                                    <RotateCcw className="w-4 h-4" /> Восстановить
                                </DropdownMenuItem>
                                {canPermanentlyDelete && (
                                    <DropdownMenuItem
                                        className="flex gap-1 items-center cursor-pointer text-red-400 focus:bg-white/10 focus:text-red-400"
                                        onClick={() => setIsFolderDeleteConfirmOpen(true)}
                                    >
                                        <Trash className="w-4 h-4" /> Удалить навсегда
                                    </DropdownMenuItem>
                                )}
                            </>
                        ) : (
                            <>
                                <DropdownMenuItem
                                    className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                    onClick={() => setIsRenameOpen(true)}
                                >
                                    <Pencil className="w-4 h-4" /> Переименовать
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                    onClick={() => setIsMoveOpen(true)}
                                >
                                    <FolderInput className="w-4 h-4" /> Переместить в папку
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                    onClick={handleCopyFolderPath}
                                >
                                    <Copy className="w-4 h-4" /> Копировать путь
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
                                    Скачать архивом
                                </DropdownMenuItem>
                                {useFilesApi && (
                                    <>
                                        {file.isPublic && (
                                            <DropdownMenuItem
                                                className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                                onClick={() => copyTextToClipboard(folderShareLink)}
                                            >
                                                <Share2Icon className="w-4 h-4" /> Поделиться
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem
                                            className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                            onClick={handleTogglePublic}
                                            disabled={isPublicLoading}
                                        >
                                            {file.isPublic ? (
                                                <>
                                                    <Lock className="w-4 h-4" /> Сделать приватной
                                                </>
                                            ) : (
                                                <>
                                                    <Globe className="w-4 h-4" /> Сделать публичной
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
                                            <Trash2 className="w-4 h-4" /> В корзину
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </>
                        )}
                    </>
                ) : (
                    <>
                        {!expired && openLink && (
                            <>
                                <DropdownMenuItem className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white" onClick={() => {
                                    window.open(openLink, "_blank")
                                }}>
                                    <FileIcon className="w-4 h-4" /> Открыть {notter && 'заметку'}
                                </DropdownMenuItem>

                                {(!useFilesApi || file.isPublic) && !notter && (
                                    <DropdownMenuItem className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white" onClick={() => {
                                        copyTextToClipboard(shareLink)
                                    }}>
                                        <Share2Icon className="w-4 h-4" /> Поделиться
                                    </DropdownMenuItem>
                                )}
                            </>
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
                                                <Heart className="w-4 h-4" /> Убрать из избранного
                                            </>
                                        ) : (
                                            <>
                                                <Heart className="w-4 h-4" /> В избранное
                                            </>
                                        )}
                                    </DropdownMenuItem>
                                )}

                                {!expired && !deletedOnly && (
                                    <DropdownMenuItem
                                        className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                        onClick={() => setIsRenameOpen(true)}
                                    >
                                        <Pencil className="w-4 h-4" /> Переименовать
                                    </DropdownMenuItem>
                                )}

                                {!expired && !deletedOnly && (
                                    <DropdownMenuItem
                                        className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                        onClick={() => setIsMoveOpen(true)}
                                    >
                                        <FolderInput className="w-4 h-4" /> Переместить в папку
                                    </DropdownMenuItem>
                                )}

                                {!expired && !deletedOnly && (
                                    <DropdownMenuItem
                                        className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                        onClick={handleTogglePublic}
                                        disabled={isPublicLoading}
                                    >
                                        {file.isPublic ? (
                                            <>
                                                <Lock className="w-4 h-4" /> Сделать приватным
                                            </>
                                        ) : (
                                            <>
                                                <Globe className="w-4 h-4" /> Сделать публичным
                                            </>
                                        )}
                                    </DropdownMenuItem>
                                )}

                                <DropdownMenuItem
                                    className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                    onClick={handleDownload}
                                >
                                    <Download className="w-4 h-4" /> Скачать
                                </DropdownMenuItem>

                                {deletedOnly ? (
                                    <>
                                        <DropdownMenuSeparator className="bg-white/5 h-0.5 my-1" />
                                        <DropdownMenuItem
                                            className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white"
                                            onClick={handleRestore}
                                        >
                                            <RotateCcw className="w-4 h-4" /> Восстановить
                                        </DropdownMenuItem>
                                        {canPermanentlyDelete && (
                                            <DropdownMenuItem
                                                className="flex gap-1 items-center cursor-pointer text-red-400 focus:bg-white/10 focus:text-red-400"
                                                onClick={() => setIsDeleteConfirmOpen(true)}
                                            >
                                                <Trash className="w-4 h-4" /> Удалить навсегда
                                            </DropdownMenuItem>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {!expired && openLink && <DropdownMenuSeparator className="bg-white/5 h-0.5 my-1" />}
                                        <DropdownMenuItem
                                            className="flex gap-1 items-center cursor-pointer text-red-400 focus:bg-white/10 focus:text-red-400"
                                            onClick={() => setIsTrashConfirmOpen(true)}
                                        >
                                            <Trash2 className="w-4 h-4" /> В корзину
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </>
                        )}

                        {shrtl && (
                            <>
                                {!expired && <DropdownMenuSeparator className="bg-white/5 h-0.5 my-1" />}

                                <div className="flex gap-1 items-center cursor-default text-white/70 px-2 py-1.5 text-sm">
                                    <Download className="w-4 h-4" /> {file.downloads} скачиваний
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

        <ConfirmDialog
            open={isFolderTrashConfirmOpen}
            onOpenChange={setIsFolderTrashConfirmOpen}
            title="Переместить папку в корзину"
            description={`Вы уверены, что хотите переместить папку «${file.name}» в корзину? Её можно будет восстановить позже.`}
            confirmLabel="В корзину"
            cancelLabel="Отмена"
            onConfirm={handleMoveFolderToTrash}
            isLoading={isConfirmLoading}
            destructive={false}
        />

        <ConfirmDialog
            open={isFolderDeleteConfirmOpen}
            onOpenChange={setIsFolderDeleteConfirmOpen}
            title="Удалить папку навсегда"
            description={`Вы уверены, что хотите безвозвратно удалить папку «${file.name}» и всё её содержимое? Это действие нельзя отменить.`}
            confirmLabel="Удалить"
            cancelLabel="Отмена"
            onConfirm={handleDeleteFolder}
            isLoading={isConfirmLoading}
            destructive={true}
        />
        </>
    )
}
