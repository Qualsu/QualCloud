"use client";

import { useMutation } from "convex/react";
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from "next/navigation";
import { Loader2, FileIcon, AudioLinesIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "@/app/not-found";
import { getFileInfo } from "@/app/api/files";
import { getMimeType } from "@/app/api/utils/get-mime";
import { api } from "../../../../convex/_generated/api";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import Image from "next/image";
import Link from "next/link";
import { links } from "@/config/routing/links.route";
import { FileType } from "@/config/types/components.types";
import { FilesFileResponse } from "@/config/types/api.types";
import { FILE_SIZE_LABELS } from "@/config/const/files.const";
import { useTranslation } from "@/components/hooks/use-translation";

type ConvexFile = Doc<"files">;
type ApiFile = FilesFileResponse;

type FileView = {
  name: string;
  type: FileType;
  url: string;
  size?: number;
  isConvex: boolean;
  isPublic?: boolean;
};

function formatSize(bytes: number, t: (key: string) => string): string {
  if (bytes === 0) return `0 ${t("units.b")}`;
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const label = FILE_SIZE_LABELS[i];
  const unit = label === "Б" ? t("units.b") : label === "КБ" ? t("units.kb") : label === "МБ" ? t("units.mb") : label === "ГБ" ? t("units.gb") : t("units.tb");
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${unit}`;
}

export default function File() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState<FileView | null>(null);
    const [found, setFound] = useState(true);
    const fileLink = useMutation(api.files.getFile);
    const params = useParams();
    const searchParams = useSearchParams();
    const id = Array.isArray(params?.id) ? params.id[0] : (params?.id ?? "");
    const accountId = searchParams.get("account_id") || undefined;

    useEffect(() => {
        const fetchLink = async () => {
            if (!id) {
                setFound(false);
                setLoading(false);
                return;
            }

            try {
                const convexResult = await fileLink({ linkId: id });
                const convexFile = convexResult?.[0];

                if (convexFile) {
                    setFile({
                        name: convexFile.name,
                        type: convexFile.type,
                        url: links.KENYCLOUD.GET_FILE(convexFile.fileId as Id<"_storage">),
                        isConvex: true,
                    });
                    setFound(true);
                    setLoading(false);
                    return;
                }
            } catch {
                // ignore convex error and try API files
            }

            try {
                const apiFile: ApiFile = await getFileInfo(id, accountId);

                if (apiFile && apiFile.file_id) {
                    const downloadUrl =
                        apiFile.file_url ||
                        `${links.FILES.GET_FILE(apiFile.file_id)}${
                            accountId ? `?account_id=${encodeURIComponent(accountId)}` : ""
                        }`;
                    setFile({
                        name: apiFile.file_name,
                        type: getMimeType(apiFile.file_type),
                        url: downloadUrl,
                        size: apiFile.file_size,
                        isConvex: false,
                        isPublic: apiFile.is_public,
                    });
                    setFound(true);
                    setLoading(false);
                    return;
                }
            } catch {
                setFound(false);
            } finally {
                setLoading(false);
            }
        }

        fetchLink();
    }, [fileLink, id, accountId]);

    if (!found) {
        return <NotFound />
    }

    const renderPreview = () => {
        if (loading || !file) {
            return <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        }

        if (file.type === "image" || file.type === "imageother") {
            return (
                <Image
                    src={file.url}
                    alt={file.name}
                    width={200}
                    height={200}
                    unoptimized
                    className="rounded-2xl object-contain"
                />
            )
        }

        if (file.type === "video") {
            return (
                <video
                    src={file.url}
                    controls
                    preload="metadata"
                    className="max-h-[300px] w-full max-w-full rounded-2xl"
                />
            )
        }

        if (file.type === "audio") {
            return (
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <AudioLinesIcon className="h-16 w-16" />
                    <span className="text-sm">{t("fileTypes.audio")}</span>
                </div>
            )
        }

        return (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <FileIcon className="h-16 w-16" />
                <span className="text-sm">{t("fileTypes.noPreview")}</span>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center m-3">
            <section className="w-full max-w-3xl mx-auto p-6 bg-background/60 border border-border/90 rounded-3xl shadow-[0_16px_80px_-45px_rgba(0,0,0,0.7)]">
                <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="w-full md:w-1/3 flex items-center justify-center bg-muted/5 rounded-2xl min-h-[200px]">
                        {renderPreview()}
                    </div>

                    <div className="flex-1 flex flex-col justify-between w-full gap-4">
                        {loading || !file ? (
                            <div className="flex flex-col gap-3">
                                <Skeleton className="h-8 w-3/4" />
                                <Skeleton className="h-4 w-1/3" />
                            </div>
                        ) : (
                            <>
                                <div className="w-full">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="truncate text-2xl font-semibold" title={file.name}>{file.name}</h1>
                                    </div>
                                    {typeof file.size === "number" && (
                                        <p className="mt-1 text-sm text-white/50">{formatSize(file.size, t)}</p>
                                    )}
                                    {file.type === "audio" && (
                                        <audio
                                            src={file.url}
                                            controls
                                            preload="metadata"
                                            className="mt-4 w-full"
                                        />
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <Link href={file.url} download={file.name} className="inline-block primary-button">
                                        {t("filePreview.download")}
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
