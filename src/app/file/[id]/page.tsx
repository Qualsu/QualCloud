"use client"

import { useMutation } from "convex/react"
import { useEffect, useState } from 'react'
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"

import NotFound from "@/app/not-found"
import { api } from "../../../../convex/_generated/api"
import { Doc, Id } from "../../../../convex/_generated/dataModel"
import Image from "next/image"
import Link from "next/link"
import { links } from "@/config/routing/links.route"

export default function File() {
    const [loading, setLoading] = useState(true)
    const [file, setFile] = useState<Doc<"files">[]>()
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
                const result = await fileLink({ linkId: id })
                setFile(result)
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

    const currentFile = file?.[0]
    const url = links.KENYCLOUD.GET_FILE(currentFile?.fileId as Id<"_storage">)

    return (
        <div className="flex min-h-screen flex-col items-center justify-center m-3">
            <section className="w-full max-w-3xl mx-auto p-6 bg-background/60 border border-border/90 rounded-3xl shadow-[0_16px_80px_-45px_rgba(0,0,0,0.7)]">
            <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="w-full md:w-1/3 flex items-center justify-center bg-muted/5 rounded-2xl">
                    {currentFile?.type === "image" ? (
                        <Image
                            src={url}
                            alt={currentFile?.name || "Файл"}
                            width={200}
                            height={200}
                        />
                    ) : (
                        <div className="text-sm text-muted-foreground">Предпросмотр недоступен</div>
                    )}
                </div>

                <div className="flex-1 flex flex-col justify-between w-full gap-4">
                <div>
                    <h1 className="text-2xl font-semibold truncate">{currentFile?.name || "Файл"}</h1>
                </div>

                <div className="flex items-center gap-3">
                    <Link href={url} download={currentFile?.name} className="inline-block primary-button">
                        Скачать
                    </Link>
                </div>
                </div>
            </div>
            </section>
        </div>
  );
}
