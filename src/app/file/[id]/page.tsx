"use client"

import { useMutation } from "convex/react"
import { useEffect, useState } from 'react'
import { useParams } from "next/navigation"
import { Loader2, FileIcon } from "lucide-react"

import NotFound from "@/app/not-found"
import { getFileInfo } from "@/app/api/files"
import { getMimeType } from "@/app/api/utils/get-mime"
import { api } from "../../../../convex/_generated/api"
import { Doc, Id } from "../../../../convex/_generated/dataModel"
import Image from "next/image"
import Link from "next/link"
import { links } from "@/config/routing/links.route"
import { FileType } from "@/config/types/components.types"
import { FilesFileResponse } from "@/config/types/api.types"

type ConvexFile = Doc<"files">;
type ApiFile = FilesFileResponse;

type FileView = {
  name: string;
  type: FileType;
  url: string;
  size?: number;
  isConvex: boolean;
};

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 Б";
  const k = 1024;
  const sizes = ["Б", "КБ", "МБ", "ГБ"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function File() {
    const [loading, setLoading] = useState(true)
    const [file, setFile] = useState<FileView | null>(null)
    const [found, setFound] = useState(true)
    const fileLink = useMutation(api.files.getFile)
    const params = useParams()
    const id = Array.isArray(params?.id) ? params.id[0] : (params?.id ?? "")

    useEffect(() => {
        const fetchLink = async () => {
            if (!id) {
                setFound(false)
                setLoading(false)
                return
            }

            try {
                const convexResult = await fileLink({ linkId: id })
                const convexFile = convexResult?.[0]

                if (convexFile) {
                    setFile({
                        name: convexFile.name,
                        type: convexFile.type,
                        url: links.KENYCLOUD.GET_FILE(convexFile.fileId as Id<"_storage">),
                        isConvex: true,
                    })
                    setFound(true)
                    setLoading(false)
                    return
                }
            } catch {
                // ignore convex error and try API files
            }

            try {
                const apiFile: ApiFile = await getFileInfo(id)

                if (apiFile && apiFile.file_id) {
                    setFile({
                        name: apiFile.file_name,
                        type: getMimeType(apiFile.file_type),
                        url: apiFile.file_url || links.FILES.GET_FILE(apiFile.file_id),
                        size: apiFile.file_size,
                        isConvex: false,
                    })
                    setFound(true)
                    setLoading(false)
                    return
                }
            } catch {
                setFound(false)
            } finally {
                setLoading(false)
            }
        }

        fetchLink()
    }, [fileLink, id])

    if (!found) {
        return <NotFound />
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin"/>
            </div>
        )
    }

    if (!file) {
        return <NotFound />
    }

    const isImage = file.type === "image" || file.type === "imageother"

    return (
        <div className="flex min-h-screen flex-col items-center justify-center m-3">
            <section className="w-full max-w-3xl mx-auto p-6 bg-background/60 border border-border/90 rounded-3xl shadow-[0_16px_80px_-45px_rgba(0,0,0,0.7)]">
            <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="w-full md:w-1/3 flex items-center justify-center bg-muted/5 rounded-2xl min-h-[200px]">
                    {isImage ? (
                        <Image
                            src={file.url}
                            alt={file.name}
                            width={200}
                            height={200}
                            unoptimized
                            className="rounded-2xl object-contain"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <FileIcon className="h-16 w-16" />
                            <span className="text-sm">Предпросмотр недоступен</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 flex flex-col justify-between w-full gap-4">
                <div>
                    <h1 className="text-2xl font-semibold truncate">{file.name}</h1>
                    {typeof file.size === "number" && (
                        <p className="mt-1 text-sm text-white/50">{formatSize(file.size)}</p>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <Link href={file.url} download={file.name} className="inline-block primary-button">
                        Скачать
                    </Link>
                </div>
                </div>
            </div>
            </section>
        </div>
  );
}
