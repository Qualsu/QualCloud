"use client";

import Image from "next/image";
import { useState } from "react";

import { typeIcons } from "@/config/const/components.const";
import { FileDoc } from "@/config/types/components.types";

import { isFileExpired } from "./file-helpers";

interface FilePreviewProps {
    file: FileDoc;
    fileLink: string;
    variant?: "card" | "modal";
}

export function FilePreview({ file, fileLink, variant = "card" }: FilePreviewProps) {
    const [failed, setFailed] = useState(false);

    const isFolder = file.isFolder;

    if (isFolder || !fileLink || isFileExpired(file) || failed) {
        return (
            <div
                className={`flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-500 ${
                    variant === "modal" ? "h-24 w-24" : "h-16 w-16"
                }`}
            >
                {typeIcons[file.type]}
            </div>
        );
    }

    if (file.type === "image" || file.type === "imageother") {
        return (
            <Image
                alt={file.name}
                width={variant === "modal" ? 800 : 200}
                height={variant === "modal" ? 800 : 300}
                className={`rounded-sm object-contain ${
                    variant === "modal"
                        ? "h-auto max-h-[220px] w-full max-w-full sm:max-h-[300px] md:max-h-[420px]"
                        : "max-h-[150px] max-w-[120px]"
                }`}
                src={fileLink}
                unoptimized
                onError={() => setFailed(true)}
            />
        );
    }

    if (file.type === "video") {
        return (
            <video
                src={fileLink}
                className={`rounded-sm ${
                    variant === "modal"
                        ? "h-auto max-h-[220px] w-full max-w-full sm:max-h-[300px] md:max-h-[420px]"
                        : "max-h-[150px] max-w-[180px]"
                }`}
                preload="metadata"
                controls={variant === "modal"}
                muted
                onError={() => setFailed(true)}
            />
        );
    }

    if (file.type === "audio") {
        if (variant === "card") {
            return (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-500">
                    {typeIcons[file.type]}
                </div>
            );
        }

        return (
            <div className="flex w-full flex-col items-center gap-3 px-4">
                <audio
                    src={fileLink}
                    className="h-12 w-full max-w-md"
                    preload="metadata"
                    controls
                    onError={() => setFailed(true)}
                />
            </div>
        );
    }

    return (
        <div
            className={`flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-500 ${
                variant === "modal" ? "h-24 w-24" : "h-16 w-16"
            }`}
        >
            {typeIcons[file.type]}
        </div>
    );
}
