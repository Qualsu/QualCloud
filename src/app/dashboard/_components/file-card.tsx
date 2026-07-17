"use client";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatRelative } from 'date-fns';
import { useSettings } from "@/components/context/settings-context";
import { formatRelativeZoned } from "@/lib/timezones";
import { useQuery } from "convex/react";
import { Globe, Heart, Lock } from "lucide-react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { FileCardActions } from "./file-actions";
import { FileCardProps } from "@/config/types/components.types";
import { typeIcons } from "@/config/const/components.const";
import { links } from "@/config/routing/links.route";
import { Id } from "../../../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { addToFavorites, removeFromFavorites } from "@/app/api/files";
import { getFilesEditor, getLastEditorDisplayName, isClerkUserId } from "@/lib/files-editor";
import { toast } from "@/lib/toast";
import { FilePreview } from "./file-preview";
import { FilePreviewModal } from "@/components/modal/file-preview-modal";
import { formatExpiresIn, isFileExpired } from "./file-helpers";
import { useTranslation } from "@/components/hooks/use-translation";
import { normalizeFileUrl } from "@/lib/file-url";
import { useDragSource, useDropTarget } from "@/components/hooks/use-drag-drop";

function getFileTimeDisplay(
    file: FileCardProps["file"],
    timezone: string,
    language: "ru" | "en",
    timeFormat: "12h" | "24h",
    shrtl?: boolean,
    t?: (key: string, params?: Record<string, string | number>) => string
): string {
    if (shrtl) {
        const expiresInSeconds = "_expiresInSeconds" in file ? (file._expiresInSeconds as number | null | undefined) ?? null : null;
        return formatExpiresIn(expiresInSeconds, t ?? ((key) => key));
    }
    return formatRelativeZoned(file._creationTime, timezone, language, timeFormat);
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
    selected,
    onSelect,
    onClearSelection,
    allFiles = [],
    selectedFiles = [],
    onDropOnFolder,
    enableDragDrop = false,
}: FileCardProps) {
    const { t } = useTranslation();
    const { user } = useUser();
    const { timezone, language, timeFormat } = useSettings();
    const isFromApi = "_isFromApi" in file && file._isFromApi;
    const isApiSource = shrtl || notter || useFilesApi || isFromApi;
    const isFolder = file.isFolder;
    const userProfile = useQuery(api.users.getUserProfile, !isApiSource ? {
        userId: file.userId
    } : "skip");

    const fileLink = isFolder
        ? ""
        : shrtl
        ? (file.fileUrl ?? links.SHRTL.GET_FILE(file.fileId as string))
        : notter
        ? (normalizeFileUrl(file.fileUrl) ?? "")
        : useFilesApi
        ? (file.fileUrl ?? links.FILES.GET_FILE(file.fileId as string))
        : links.KENYCLOUD.GET_FILE(file.fileId as Id<"_storage">);

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
    const canFavorite = useFilesApi && !isFolder && !deletedOnly && !isFileExpired(file);

    const { isDragging, dragProps } = useDragSource(
        file,
        selectedFiles,
        enableDragDrop
    );

    const { isOver, dropProps } = useDropTarget(
        file,
        allFiles,
        onDropOnFolder ?? (() => {}),
        enableDragDrop && !!onDropOnFolder
    );
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCardClick = (e?: React.MouseEvent<HTMLDivElement>) => {
        if (onSelect && (e?.ctrlKey || e?.metaKey)) {
            e?.preventDefault();
            onSelect(file._id as string, !selected);
            return;
        }

        onClearSelection?.();

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
            const editor = getFilesEditor(user);
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

    return (
        <>
        <div
            className={cn(
                "group surface-panel relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_24px_70px_rgba(0,0,0,0.35)] cursor-pointer",
                selected
                    ? "border-purple/40 bg-purple/[0.06]"
                    : "border-transparent",
                isDragging && "opacity-40 scale-95",
                isOver && "border-purple/60 bg-purple/[0.12] ring-2 ring-purple/40 scale-[1.02] shadow-[0_0_30px_rgba(139,92,246,0.2)]"
            )}
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            {...dragProps}
            {...dropProps}
        >
            <div className="relative flex items-start justify-between gap-2 px-5 pt-5 pb-3">
                <div className="flex items-center gap-2 text-sm text-white/80 font-medium break-all min-w-0">
                    {onSelect && (
                        <div
                            className={cn(
                                "shrink-0 transition-opacity",
                                selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            )}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Checkbox
                                checked={selected}
                                onCheckedChange={(value) =>
                                    onSelect(file._id as string, value === true)
                                }
                                aria-label={selected ? t("files.deselect") : t("columns.selectRow")}
                                className="border-white/10 bg-white/5 data-[state=checked]:border-primary data-[state=checked]:bg-primary hover:bg-white/10"
                            />
                        </div>
                    )}
                    <span className="shrink-0 text-zinc-400">{typeIcons[file.type]}</span>
                    <span className="truncate" title={displayName}>{displayName}</span>
                    {useFilesApi && !(file.isFolder && deletedOnly) && (
                        <>
                            {file.isPublic ? (
                                <span title={t("fileTypes.public")}>
                                    <Globe className="h-3.5 w-3.5 shrink-0 text-green-400" />
                                </span>
                            ) : file.isFolder ? (
                                <span title={t("fileTypes.privateFolder")}>
                                    <Lock className="h-3.5 w-3.5 shrink-0 text-white/40" />
                                </span>
                            ) : null}
                        </>
                    )}
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
                            title={file.isFavorited ? t("filePreview.removeFromFavorites") : t("filePreview.addToFavorites")}
                            aria-label={file.isFavorited ? t("filePreview.removeFromFavorites") : t("filePreview.addToFavorites")}
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
                        {username?.charAt(0) ?? "?"}
                    </AvatarFallback>
                    </Avatar>
                    <span>{username}</span>
                </div>
                 <div className="text-xs text-white/30">
                    {isFolder
                        ? (file.updatedAt
                            ? formatRelativeZoned(file.updatedAt, timezone, language, timeFormat)
                            : "")
                        : getFileTimeDisplay(file, timezone, language, timeFormat, shrtl, t)}
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
    );

}
