"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { typeIcons } from "@/config/const/components.const";
import { pages } from "@/config/routing/pages.route";
import type { FileType } from "@/config/types/components.types";
import {
  Clock3,
  Files,
  HardDrive,
  Heart,
  LayoutGrid,
  Table as TableIcon,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "../_components/file-table";

const storageStats = [
  {
    label: "Занято",
    value: "38.4 ГБ",
    hint: "из 100 ГБ",
    icon: HardDrive,
    href: pages.DASHBOARD.CLOUD,
  },
  {
    label: "Всего файлов",
    value: "1 248",
    hint: "во всех сервисах",
    icon: Files,
    href: pages.DASHBOARD.CLOUD,
  },
  {
    label: "В избранном",
    value: "96",
    hint: "быстрый доступ",
    icon: Heart,
    href: pages.DASHBOARD.FAVORITES,
  },
  {
    label: "Корзина будет очищена",
    value: "через 12 дней",
    hint: "8 файлов ждут удаления",
    icon: Trash2,
    href: pages.DASHBOARD.TRASH,
  },
] as const;

const recentFiles: {
  id: string;
  name: string;
  type: FileType;
  owner: string;
  ownerInitial: string;
  uploadedAt: string;
}[] = [
  {
    id: "1",
    name: "brand-guidelines-2026.pdf",
    type: "txt",
    owner: "Марина",
    ownerInitial: "М",
    uploadedAt: "12 минут назад",
  },
  {
    id: "2",
    name: "hero-banner-v4.png",
    type: "image",
    owner: "Артём",
    ownerInitial: "А",
    uploadedAt: "38 минут назад",
  },
  {
    id: "3",
    name: "sales-report-q2.xlsx",
    type: "table",
    owner: "Ольга",
    ownerInitial: "О",
    uploadedAt: "1 час назад",
  },
  {
    id: "4",
    name: "team-sync-recording.mp4",
    type: "video",
    owner: "Илья",
    ownerInitial: "И",
    uploadedAt: "2 часа назад",
  },
  {
    id: "5",
    name: "api-contract-v2.json",
    type: "programming",
    owner: "Никита",
    ownerInitial: "Н",
    uploadedAt: "сегодня",
  },
  {
    id: "6",
    name: "campaign-assets.zip",
    type: "archive",
    owner: "Саша",
    ownerInitial: "С",
    uploadedAt: "сегодня",
  },
];

const recentColumns: ColumnDef<(typeof recentFiles)[number]>[] = [
  {
    accessorKey: "name",
    header: "Название",
    cell: ({ row }) => (
      <div className="font-medium text-white/80">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "type",
    header: "Тип",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-white/70">
        <span className="shrink-0 text-zinc-400">
          {typeIcons[row.original.type]}
        </span>
        <span className="capitalize">{row.original.type}</span>
      </div>
    ),
  },
  {
    accessorKey: "owner",
    header: "Владелец",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-white/50">
        <Avatar className="h-7 w-7">
          <AvatarImage alt={row.original.owner} />
          <AvatarFallback className="bg-white/10 text-xs text-white/60">
            {row.original.ownerInitial}
          </AvatarFallback>
        </Avatar>
        <span>{row.original.owner}</span>
      </div>
    ),
  },
  {
    accessorKey: "uploadedAt",
    header: "Загружено",
    cell: ({ row }) => (
      <div className="text-white/50">{row.original.uploadedAt}</div>
    ),
  },
];

function StatCard({
  label,
  value,
  hint,
  href,
  icon: Icon,
}: (typeof storageStats)[number]) {
  return (
    <Link
      href={href}
      className="surface-panel group flex min-h-[124px] flex-col justify-between rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="text-sm text-white/55">{label}</div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition-colors group-hover:bg-white/10 group-hover:text-white">
          <Icon size={18} />
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-semibold tracking-tight text-white">{value}</div>
        <div className="text-sm text-white/40">{hint}</div>
      </div>
    </Link>
  );
}

function RecentFileCard({
  name,
  type,
  owner,
  ownerInitial,
  uploadedAt,
}: (typeof recentFiles)[number]) {
  return (
    <div className="group surface-panel relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-24`} />

      <div className="relative flex items-start justify-between gap-2 px-5 pb-3 pt-5">
        <div className="flex min-w-0 items-center gap-2 break-all text-sm font-medium text-white/80">
          <span className="shrink-0 text-zinc-400">{typeIcons[type]}</span>
          <span className="truncate">{name}</span>
        </div>
        <Clock3 size={16} className="shrink-0 text-white/30" />
      </div>

      <div className="flex h-[160px] items-center justify-center px-5 py-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-500">
          {typeIcons[type]}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.08] px-5 py-3">
        <div className="flex items-center gap-2 text-xs text-white/50">
          <Avatar className="h-6 w-6">
            <AvatarImage alt={owner} />
            <AvatarFallback className="bg-white/10 text-xs text-white/60">
              {ownerInitial}
            </AvatarFallback>
          </Avatar>
          <span>{owner}</span>
        </div>
        <div className="text-xs text-white/30">{uploadedAt}</div>
      </div>
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<"grid" | "table">("grid");

  return (
    <div className="space-y-10">
      <section className="space-y-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Главная
          </h1>
          <p className="text-sm text-white/45">
            Обзор
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {storageStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <Tabs
          value={view}
          onValueChange={(value) => setView(value as "grid" | "table")}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-white">
                Недавние файлы
              </h2>
            </div>

            <TabsList className="h-10 gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
              <TabsTrigger
                value="grid"
                className="rounded-lg px-3 py-1.5 text-white/60 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                aria-label="Сетка"
              >
                <LayoutGrid size={16} />
              </TabsTrigger>
              <TabsTrigger
                value="table"
                className="rounded-lg px-3 py-1.5 text-white/60 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                aria-label="Таблица"
              >
                <TableIcon size={16} />
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="grid" className="mt-5">
            <div className="mr-2 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {recentFiles.map((file) => (
                <RecentFileCard key={file.id} {...file} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="table" className="mt-5">
            <DataTable columns={recentColumns} data={recentFiles} />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
