import { pages } from "../routing/pages.route";
import { Files, Lamp, Link2Icon } from "lucide-react"
import { FileType } from "../types/components.types";
import { ReactNode } from "react";
import {
    AppWindow,
    ArchiveIcon,
    AudioLinesIcon,
    Code2Icon,
    DatabaseIcon,
    FileIcon,
    ImageIcon,
    ListIcon,
    PresentationIcon,
    VideoIcon
} from "lucide-react"
import { images } from "../routing/image.route";

export const fileTypeOrder = [
  "image",
  "imageother",
  "table",
  "txt",
  "presentation",
  "pptx",
  "video",
  "audio",
  "programming",
  "exe",
  "db",
  "archive",
] as const;

export const fileTypeOptions = [
  { value: "all", label: "Все" },
  { value: "image", label: "Изображения" },
  { value: "audio", label: "Аудио" },
  { value: "video", label: "Видео" },
  { value: "table", label: "Таблицы" },
  { value: "presentation", label: "Презентации" },
] as const;

export const fileSortOptions = [
  { value: "date", label: "Дате" },
  { value: "alphabet", label: "Алфавиту" },
  { value: "types", label: "Типу файла" },
] as const;

export const fileSortDirectionOptions = [
  { value: "new", label: "Новизне" },
  { value: "reverse", label: "Убыванию" },
] as const;

export const navItems = [
  { href: pages.DASHBOARD.NOTTER, image: images.ICONS.NOTTER, label: "Notter" },
  { href: pages.DASHBOARD.SHRTL, image: images.ICONS.SHRTL, label: "Shrtl" },
  { href: pages.DASHBOARD.KENYCLOUD, image: images.ICONS.KENYCLOUD, label: "KenyCloud" },
]

export const typeIcons: Record<FileType, ReactNode> = {
    image: <ImageIcon />,
    imageother: <ImageIcon />,
    presentation: <PresentationIcon />,
    table: <ListIcon />,
    txt: <FileIcon />,
    audio: <AudioLinesIcon />,
    video: <VideoIcon />,
    exe: <AppWindow />,
    db: <DatabaseIcon />,
    programming: <Code2Icon />,
    pptx: <PresentationIcon />,
    archive: <ArchiveIcon />,
}