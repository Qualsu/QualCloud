import {
    Download,
    FileIcon,
    FolderOpen,
    Heart,
    MoreVertical,
    RotateCcw,
    Share2Icon,
    Star,
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
import toast from "react-hot-toast"
import { links } from "@/config/routing/links.route"
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu"
import { isFileExpired } from "./file-card"
import {
    addToFavorites,
    removeFromFavorites,
    moveToTrash,
    restoreFromTrash,
    deleteFilePermanently,
    downloadFile,
    deleteFolder,
} from "@/app/api/files"

const copyTextToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    toast.success("Ссылка скопирована")
}

function triggerDownload(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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
    const origin = useOrigin()
    const isFolder = file.isFolder;

    const fileLink = shrtl
        ? links.SHRTL.GET_LINK(file.fileId as string)
        : notter
        ? links.NOTTER.GET_NOTE(file.noteId || (file._id as string))
        : useFilesApi
        ? (file.fileUrl || "")
        : pages.FILE.COPY(origin, file.linkId || "")

    const expired = isFileExpired(file)

    const handleToggleFavorite = async () => {
        try {
            if (file.isFavorited) {
                await removeFromFavorites(file._id as string);
                toast.success("Убрано из избранного");
            } else {
                await addToFavorites(file._id as string);
                toast.success("Добавлено в избранное");
            }
            onRefresh?.();
        } catch {
            toast.error("Не удалось обновить избранное");
        }
    };

    const handleMoveToTrash = async () => {
        try {
            await moveToTrash(file._id as string);
            toast.success("Перемещено в корзину");
            onRefresh?.();
        } catch {
            toast.error("Не удалось переместить в корзину");
        }
    };

    const handleRestore = async () => {
        try {
            await restoreFromTrash(file._id as string);
            toast.success("Файл восстановлен");
            onRefresh?.();
        } catch {
            toast.error("Не удалось восстановить файл");
        }
    };

    const handleDeletePermanently = async () => {
        try {
            await deleteFilePermanently(file._id as string);
            toast.success("Файл удален");
            onRefresh?.();
        } catch {
            toast.error("Не удалось удалить файл");
        }
    };

    const handleDownload = async () => {
        try {
            const blob = await downloadFile(file._id as string);
            triggerDownload(blob, file.name);
        } catch {
            toast.error("Не удалось скачать файл");
        }
    };

    const handleDeleteFolder = async () => {
        try {
            await deleteFolder(file.orgId, file.name);
            toast.success(`Папка «${file.name}» удалена`);
            onRefresh?.();
        } catch {
            toast.error("Не удалось удалить папку");
        }
    };

    return (
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
                        <DropdownMenuSeparator className="bg-white/5 h-0.5 my-1" />
                        <DropdownMenuItem
                            className="flex gap-1 items-center cursor-pointer text-red-400 focus:bg-white/10 focus:text-red-400"
                            onClick={handleDeleteFolder}
                        >
                            <Trash2 className="w-4 h-4" /> Удалить папку
                        </DropdownMenuItem>
                    </>
                ) : (
                    <>
                        {!expired && fileLink && (
                            <>
                                <DropdownMenuItem className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white" onClick={() => {
                                    window.open(fileLink, "_blank")
                                }}>
                                    <FileIcon className="w-4 h-4" /> Открыть {notter && 'заметку'}
                                </DropdownMenuItem>

                                {!notter && (
                                    <DropdownMenuItem className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white" onClick={() => {
                                        copyTextToClipboard(fileLink)
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
                                                <Star className="w-4 h-4" /> В избранное
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
                                        <DropdownMenuItem
                                            className="flex gap-1 items-center cursor-pointer text-red-400 focus:bg-white/10 focus:text-red-400"
                                            onClick={handleDeletePermanently}
                                        >
                                            <Trash className="w-4 h-4" /> Удалить навсегда
                                        </DropdownMenuItem>
                                    </>
                                ) : (
                                    <>
                                        {!expired && fileLink && <DropdownMenuSeparator className="bg-white/5 h-0.5 my-1" />}
                                        <DropdownMenuItem
                                            className="flex gap-1 items-center cursor-pointer text-red-400 focus:bg-white/10 focus:text-red-400"
                                            onClick={handleMoveToTrash}
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
    )
}
