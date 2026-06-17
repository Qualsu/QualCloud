"use client";

import { useUser, useOrganization } from "@clerk/nextjs";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { typeIcons } from "@/config/const/components.const";
import { pages } from "@/config/routing/pages.route";
import type { FileDoc, FileType } from "@/config/types/components.types";
import {
  Clock3,
  Files,
  HardDrive,
  Heart,
  LayoutGrid,
  Loader2,
  Table as TableIcon,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFilesView } from "../_components/files-view-context";
import { DataTable } from "../_components/file-table";
import { getUserStats, getRecentFiles } from "@/app/api/files";
import { FilesUserStatsResponse } from "@/config/types/api.types";

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 Б";
  const k = 1024;
  const sizes = ["Б", "КБ", "МБ", "ГБ"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "только что";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} мин. назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч. назад`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} д. назад`;
  return "давно";
}

function StatCard({
  label,
  value,
  hint,
  href,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  href: string;
  icon: typeof HardDrive;
}) {
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
  uploadedAt,
}: {
  name: string;
  type: FileType;
  uploadedAt: string;
}) {
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
            <AvatarImage alt="" />
            <AvatarFallback className="bg-white/10 text-xs text-white/60">
              ?
            </AvatarFallback>
          </Avatar>
          <span>Вы</span>
        </div>
        <div className="text-xs text-white/30">{uploadedAt}</div>
      </div>
    </div>
  );
}

const recentColumns: ColumnDef<FileDoc>[] = [
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
    accessorKey: "_creationTime",
    header: "Загружено",
    cell: ({ row }) => (
      <div className="text-white/50">
        {formatTimeAgo(row.original._creationTime)}
      </div>
    ),
  },
];

export default function Home() {
  const [view, setView] = useFilesView();
  const { user, isLoaded: userLoaded } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const [stats, setStats] = useState<FilesUserStatsResponse | null>(null);
  const [recentFiles, setRecentFiles] = useState<FileDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const orgId =
    userLoaded && orgLoaded
      ? (organization?.id ?? user?.id)
      : undefined;

  useEffect(() => {
    if (!orgId) return;

    let cancelled = false;
    setLoading(true);

    Promise.all([getUserStats(orgId), getRecentFiles(orgId)])
      .then(([statsData, recentData]) => {
        if (cancelled) return;
        setStats(statsData);
        setRecentFiles(recentData);
      })
      .catch(() => {
        if (cancelled) return;
        setStats(null);
        setRecentFiles([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orgId]);

  const storageStats = [
    {
      label: "Занято",
      value: stats ? formatSize(stats.total_size) : "—",
      hint: stats?.storage_limit
        ? `из ${formatSize(stats.storage_limit)}`
        : "облачное хранилище",
      icon: HardDrive,
      href: pages.DASHBOARD.CLOUD,
    },
    {
      label: "Всего файлов",
      value: stats ? String(stats.total_files) : "—",
      hint: "во всех папках",
      icon: Files,
      href: pages.DASHBOARD.CLOUD,
    },
    {
      label: "В избранном",
      value: "—",
      hint: "быстрый доступ",
      icon: Heart,
      href: pages.DASHBOARD.FAVORITES,
    },
    {
      label: "Корзина",
      value: "—",
      hint: "удаленные файлы",
      icon: Trash2,
      href: pages.DASHBOARD.TRASH,
    },
  ] as const;

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-white/50" />
      </div>
    );
  }

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
                <RecentFileCard
                  key={file._id}
                  name={file.name}
                  type={file.type}
                  uploadedAt={formatTimeAgo(file._creationTime)}
                />
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
