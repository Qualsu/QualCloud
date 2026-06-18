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
                width={variant === "modal" ? 400 : 200}
                height={variant === "modal" ? 400 : 300}
                className={`rounded-sm object-contain ${
                    variant === "modal"
                        ? "max-h-[300px] max-w-full"
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
                        ? "max-h-[300px] max-w-full"
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
        return (
            <div className="flex flex-col items-center gap-3">
                <div
                    className={`flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-500 ${
                        variant === "modal" ? "h-16 w-16" : "h-12 w-12"
                    }`}
                >
                    {typeIcons[file.type]}
                </div>
                <audio
                    src={fileLink}
                    className={variant === "modal" ? "h-10 w-full max-w-[280px]" : "h-8 w-32"}
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
