"use client";

import { useUser, useOrganization } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import { pages } from "@/config/routing/pages.route";
import type { FileDoc } from "@/config/types/components.types";
import {
  Files,
  HardDrive,
  Heart,
  LayoutGrid,
  Loader2,
  PackageOpen,
  Table as TableIcon,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFilesView } from "@/components/context/files-view-context";
import { DataTable } from "../_components/file-table";
import { FileCard } from "../_components/file-card";
import { Placeholder } from "../_components/file-browser";
import { createColumns } from "../_components/columns";
import { getUserStats, getRecentFiles } from "@/app/api/files";
import { FilesUserStatsResponse } from "@/config/types/api.types";
import { formatTimeRemaining } from "@/lib/utils";
import { FILE_SIZE_LABELS } from "@/config/const/files.const";

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 Б";
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${FILE_SIZE_LABELS[i]}`;
}

function formatDays(days: number): string {
  return `${parseFloat(days.toFixed(1))} д.`;
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

  const refreshRecentFiles = useCallback(() => {
    if (!orgId) return Promise.resolve();
    return getRecentFiles(orgId).then(setRecentFiles);
  }, [orgId]);

  const recentColumns = createColumns({
    useFilesApi: true,
    onRefresh: refreshRecentFiles,
  });

  const occupiedSize =
    (stats?.used_size ?? 0) + (stats?.trash_size ?? 0);

  const storageStats = [
    {
      label: "Занято",
      value: stats ? formatSize(occupiedSize) : "—",
      hint: stats?.limit_size
        ? `из ${formatSize(stats.limit_size)} (${
            parseFloat(((occupiedSize / stats.limit_size) * 100).toFixed(1))
          }%), корзина ${formatSize(stats.trash_size ?? 0)}`
        : `облачное хранилище, корзина ${formatSize(
            stats?.trash_size ?? 0
          )}`,
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
      value: stats ? String(stats.total_favorites) : "—",
      hint: "быстрый доступ",
      icon: Heart,
      href: pages.DASHBOARD.FAVORITES,
    },
    {
      label: "Корзина",
      value: stats ? formatTimeRemaining(stats.trash_empty_in_seconds) : "—",
      hint: "до автоочистки",
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
            {recentFiles.length === 0 ? (
              <Placeholder message="Недавних файлов нет" />
            ) : (
              <div className="mr-2 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {recentFiles.map((file) => (
                  <FileCard
                    key={file._id}
                    file={file}
                    useFilesApi
                    onRefresh={refreshRecentFiles}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="table" className="mt-5">
            <DataTable columns={recentColumns} data={recentFiles} />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
