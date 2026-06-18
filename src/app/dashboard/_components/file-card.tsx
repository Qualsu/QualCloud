import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { formatRelative } from 'date-fns'
import { useQuery } from "convex/react"
import { Heart } from "lucide-react"
import { useState } from "react"
import { api } from "../../../../convex/_generated/api"
import { FileCardActions } from "./file-actions"
import { FileCardProps } from "@/config/types/components.types"
import { typeIcons } from "@/config/const/components.const"
import { links } from "@/config/routing/links.route"
import { Id } from "../../../../convex/_generated/dataModel"
import { useUser } from "@clerk/nextjs"
import { addToFavorites, removeFromFavorites } from "@/app/api/files"
import { toast } from "@/lib/toast"
import { FilePreview } from "./file-preview"
import { FilePreviewModal } from "@/components/modal/file-preview-modal"
import { formatExpiresIn, isFileExpired } from "./file-helpers"

function getFileTimeDisplay(file: FileCardProps["file"], shrtl?: boolean): string {
    if (shrtl) {
        const expiresInSeconds = "_expiresInSeconds" in file ? (file._expiresInSeconds as number | null | undefined) ?? null : null;
        return formatExpiresIn(expiresInSeconds);
    }
    return formatRelative(new Date(file._creationTime), new Date());
}

export function FileCardSkeleton() {
    return (
        <div className="surface-panel flex flex-col overflow-hidden rounded-2xl">
            <div className="flex items-start justify-between gap-2 px-5 pt-5 pb-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Skeleton className="h-5 w-5 shrink-0 rounded-md" />
                    <Skeleton className="h-4 w-3/4 rounded-md" />
                </div>
                <Skeleton className="h-6 w-6 shrink-0 rounded-md" />
            </div>

            <div className="flex h-[160px] items-center justify-center px-5 py-2">
                <Skeleton className="h-16 w-16 rounded-xl" />
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.08] px-5 py-3">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                </div>
                <Skeleton className="h-3 w-24 rounded-md" />
            </div>
        </div>
    );
}

export function FileCard({
    file,
    shrtl,
    notter,
    useFilesApi,
    deletedOnly,
    onRefresh,
    onOpenFolder,
}: FileCardProps){
    const { user } = useUser()
    const isFromApi = "_isFromApi" in file && file._isFromApi;
    const isApiSource = shrtl || notter || useFilesApi || isFromApi;
    const isFolder = file.isFolder;
    const userProfile = useQuery(api.users.getUserProfile, !isApiSource ? {
        userId: file.userId
    } : "skip")

    const fileLink = isFolder
        ? ""
        : shrtl
        ? (file.fileUrl ?? links.SHRTL.GET_FILE(file.fileId as string))
        : notter
        ? links.NOTTER.GET_FILE(file.fileId as string)
        : useFilesApi
        ? (file.fileUrl ?? links.FILES.GET_FILE(file.fileId as string))
        : links.KENYCLOUD.GET_FILE(file.fileId as Id<"_storage">);

    const avatar = isFolder
        ? user?.imageUrl
        : shrtl
        ? user?.imageUrl
        : notter
        ? file.avatar
        : useFilesApi
        ? user?.imageUrl
        : userProfile?.image

    const username = isFolder
        ? (file.updatedBy ?? "Папка")
        : shrtl
        ? user?.username
        : notter
        ? file.username
        : useFilesApi
        ? (user?.username ?? user?.fullName ?? "Вы")
        : userProfile?.name

    const displayName = file.displayName?.trim() || file.name?.trim() || "Без названия";
    const canFavorite = useFilesApi && !isFolder && !deletedOnly && !isFileExpired(file);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCardClick = () => {
        if (isFolder) {
            onOpenFolder?.(file.name);
        } else {
            setIsModalOpen(true);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick();
        }
    };

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const promise = file.isFavorited
                ? removeFromFavorites(file._id as string)
                : addToFavorites(file._id as string);
            await toast.promise(promise, {
                loading: file.isFavorited ? "Убираем из избранного…" : "Добавляем в избранное…",
                success: file.isFavorited ? "Убрано из избранного" : "Добавлено в избранное",
                error: "Не удалось обновить избранное",
            });
            onRefresh?.();
        } catch {}
    };

    return (
        <>
        <div
            className="group surface-panel relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_24px_70px_rgba(0,0,0,0.35)] cursor-pointer"
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            <div className="relative flex items-start justify-between gap-2 px-5 pt-5 pb-3">
                <div className="flex items-center gap-2 text-sm text-white/80 font-medium break-all min-w-0">
                    <span className="shrink-0 text-zinc-400">{typeIcons[file.type]}</span>
                    <span className="truncate" title={displayName}>{displayName}</span>
                </div>
                <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {canFavorite && (
                        <button
                            onClick={handleToggleFavorite}
                            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/10 ${
                                file.isFavorited
                                    ? "text-red-500"
                                    : "text-white/40 hover:text-red-500"
                            }`}
                            title={file.isFavorited ? "Убрать из избранного" : "В избранное"}
                            aria-label={file.isFavorited ? "Убрать из избранного" : "В избранное"}
                        >
                            <Heart className={`h-4 w-4 ${file.isFavorited ? "fill-current" : ""}`} />
                        </button>
                    )}
                    <FileCardActions
                        file={file}
                        shrtl={shrtl}
                        notter={notter}
                        useFilesApi={useFilesApi}
                        deletedOnly={deletedOnly}
                        onRefresh={onRefresh}
                        onOpenFolder={onOpenFolder}
                    />
                </div>
            </div>

            <div className="flex h-[160px] items-center justify-center px-5 py-2">
                {isFolder ? (
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-400">
                        {typeIcons.folder}
                    </div>
                ) : (
                    <FilePreview file={file} fileLink={fileLink} />
                )}
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.08] px-5 py-3">
                <div className="flex items-center gap-2 text-white/50 text-xs">
                    <Avatar className="w-6 h-6">
                        <AvatarImage src={avatar} />
                        <AvatarFallback className="text-xs bg-white/10 text-white/60">
                            {userProfile?.name?.charAt(0) ?? "?"}
                        </AvatarFallback>
                    </Avatar>
                    <span>{username}</span>
                </div>
                <div className="text-xs text-white/30">
                    {isFolder
                        ? (file.updatedAt
                            ? formatRelative(new Date(file.updatedAt), new Date())
                            : "")
                        : getFileTimeDisplay(file, shrtl)}
                </div>
            </div>
        </div>
        <FilePreviewModal
            file={file}
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            shrtl={shrtl}
            notter={notter}
            useFilesApi={useFilesApi}
            deletedOnly={deletedOnly}
            onRefresh={onRefresh}
            onOpenFolder={onOpenFolder}
        />
        </>
    )

}