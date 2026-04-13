import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { formatRelative } from 'date-fns'
import { useQuery } from "convex/react"
import Image from "next/image"
import { api } from "../../../../convex/_generated/api"
import { FileCardActions } from "./file-actions"
import { FileCardProps } from "@/config/types/components.types"
import { typeIcons } from "@/config/const/components.const"
import { links } from "@/config/routing/links.route"
import { Id } from "../../../../convex/_generated/dataModel"
import { useUser } from "@clerk/nextjs"

function formatExpiresIn(seconds: number | null): string {
    if (seconds === null) return "Истек";
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `Осталось: ${days}д ${hours}ч ${minutes}м`;
}

export function isFileExpired(file: FileCardProps["file"]): boolean {
    const isFromApi = "_isFromApi" in file && file._isFromApi;
    if (!isFromApi) return false;
    
    const expiresInSeconds = "_expiresInSeconds" in file ? (file._expiresInSeconds as number | null | undefined) ?? null : null;
    return expiresInSeconds === null || expiresInSeconds <= 0;
}

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

export function FileCard({ file, shrtl, notter }: FileCardProps){
    const { user } = useUser()
    const isFromApi = "_isFromApi" in file && file._isFromApi;
    const userProfile = useQuery(api.users.getUserProfile, !isFromApi ? {
        userId: file.userId
    } : "skip")

    const fileLink = shrtl 
        ? links.SHRTL.GET_FILE(file.fileId as string) 
        : notter ? links.NOTTER.GET_FILE(file.fileId as string)
        : links.KENYCLOUD.GET_FILE(file.fileId as Id<"_storage">);

    const avatar = shrtl 
        ? user?.imageUrl 
        : notter ? file.avatar
        : userProfile?.image

    const username = shrtl 
        ? user?.username 
        : notter ? file.username
        : userProfile?.name
        
    return (
        <div className="group surface-panel relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
            <div className="relative flex items-start justify-between gap-2 px-5 pt-5 pb-3">
                <div className="flex items-center gap-2 text-sm text-white/80 font-medium break-all min-w-0">
                    <span className="shrink-0 text-zinc-400">{typeIcons[file.type]}</span>
                    <span className="truncate">{file.name}</span>
                </div>
                <div className="shrink-0">
                    <FileCardActions file={file} shrtl={shrtl} notter={notter}/>
                </div>
            </div>

            <div className="flex h-[160px] items-center justify-center px-5 py-2">
                {file.type === "image" && !isFileExpired(file) ? (
                    <Image
                        alt={file.name}
                        width={200}
                        height={300}
                        className="max-w-[120px] max-h-[150px] rounded-sm object-contain"
                        src={fileLink}
                    />
                ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-500">
                        {typeIcons[file.type]}
                    </div>
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
                    {getFileTimeDisplay(file, shrtl)}
                </div>
            </div>
        </div>
    )

}