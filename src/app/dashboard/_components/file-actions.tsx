import {
    Download,
    FileIcon,
    MoreVertical,
    Share2Icon,
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

const copyTextToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    toast.success("Ссылка скопирована")
}

export function FileCardActions({ file, shrtl, notter }: FileCardProps){
    const origin = useOrigin()

    const fileLink = shrtl
        ? links.SHRTL.GET_LINK(file.fileId as string)
        : notter ? links.NOTTER.GET_NOTE(file._id as string)
        : pages.FILE.COPY(origin, file.linkId || "")

    const expired = isFileExpired(file)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white">
                    <MoreVertical size={16} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="border-white/10 bg-[#1e1226] text-white min-w-[180px]">

                {!expired && (
                    <>
                        <DropdownMenuItem className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white" onClick={() => {
                            window.open(fileLink, "_blank")
                        }}>
                            <FileIcon className="w-4 h-4"/> Открыть {notter && 'заметку'}
                        </DropdownMenuItem>
                        
                        {!notter && (
                            <DropdownMenuItem className="flex gap-1 items-center cursor-pointer text-white/70 focus:bg-white/10 focus:text-white" onClick={() => {
                                copyTextToClipboard(fileLink)
                            }}>
                                <Share2Icon className="w-4 h-4"/> Поделиться
                            </DropdownMenuItem>
                        )}
                    </>
                )}
                
                {shrtl && (
                    <>
                        {!expired && <DropdownMenuSeparator className="bg-white/5 h-0.5 my-1"/>}

                        <div className="flex gap-1 items-center cursor-default text-white/70 px-2 py-1.5 text-sm">
                            <Download className="w-4 h-4"/> {file.downloads} скачиваний
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}