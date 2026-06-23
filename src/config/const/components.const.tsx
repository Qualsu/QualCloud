import { pages } from "../routing/pages.route";
import { Cloud, Folder, Heart, House, Trash2, Upload } from "lucide-react"
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
  "folder",
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
  { value: "all", key: "files.filterAll" },
  { value: "folder", key: "files.filterFolders" },
  { value: "image", key: "files.filterImages" },
  { value: "audio", key: "files.filterAudio" },
  { value: "video", key: "files.filterVideo" },
  { value: "table", key: "files.filterTables" },
  { value: "presentation", key: "files.filterPresentations" },
] as const;

export const fileSortOptions = [
  { value: "date", key: "files.sortDate" },
  { value: "alphabet", key: "files.sortAlphabet" },
  { value: "types", key: "files.sortType" },
] as const;

export const fileSortDirectionOptions = [
  { value: "new", key: "files.sortNewFirst" },
  { value: "reverse", key: "files.sortReverse" },
] as const;

export const navItems = [
  { href: pages.DASHBOARD.NOTTER, image: images.ICONS.NOTTER, key: "nav.notter" },
  { href: pages.DASHBOARD.SHRTL, image: images.ICONS.SHRTL, key: "nav.shrtl" },
  { href: pages.DASHBOARD.KENYCLOUD, image: images.ICONS.KENYCLOUD, key: "nav.kenycloud" },
];

export const utilityNavItems = [
  { id: "home", href: pages.DASHBOARD.ROOT, key: "nav.home", icon: House },
  { id: "upload", href: pages.DASHBOARD.ROOT, key: "nav.upload", icon: Upload },
  { id: "cloud", href: pages.DASHBOARD.CLOUD, key: "nav.cloud", icon: Cloud },
  { id: "favorites", href: pages.DASHBOARD.FAVORITES, key: "nav.favorites", icon: Heart },
  { id: "trash", href: pages.DASHBOARD.TRASH, key: "nav.trash", icon: Trash2 },
] as const;

export const typeIcons: Record<FileType, ReactNode> = {
    folder: <Folder />,
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
