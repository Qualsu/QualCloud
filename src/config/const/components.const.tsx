import { pages } from "../routing/pages.route";
import { Files, Lamp, Link2Icon } from "lucide-react"
import { FileType } from "../types/components.types";
import { ReactNode } from "react";
import Image from "next/image";
import {
    AppWindow,
    ArchiveIcon,
    AudioLinesIcon,
  Boxes,
    Code2Icon,
    DatabaseIcon,
    FileIcon,
    ImageIcon,
    ListIcon,
    PresentationIcon,
  ShieldCheck,
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

export const landingFeatureCards = [
  {
    title: "Единый доступ",
    description: "Файлы всех приложений Qualsu в одном месте",
    icon: <Boxes className="h-8 w-8 text-white" />,
  },
  {
    title: "Архив KenyCloud",
    description: "Если вы пользовались KenyCloud, все ваши файлы сохранены и доступны в QualCloud",
    icon: (
      <Image
        src={images.ICONS.KENYCLOUD}
        width={100}
        height={100}
        alt="KenyCloud icon"
        className="h-8 w-8"
      />
    ),
  },
  {
    title: "Безопасность",
    description: "Файлы защищены и не передаются 3-им лицам",
    icon: <ShieldCheck className="h-8 w-8 text-white" />,
  },
] as const;

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