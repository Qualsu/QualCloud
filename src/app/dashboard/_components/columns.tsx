"use client"

import { ColumnDef } from "@tanstack/react-table"
import { formatRelative } from "date-fns"
import { useQuery } from "convex/react"
import { useUser } from "@clerk/nextjs"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { FileDoc } from "@/config/types/components.types"
import { typeIcons } from "@/config/const/components.const"
import { api } from "../../../../convex/_generated/api"
import { FileCardActions } from "./file-actions"

function formatExpiresIn(seconds: number | null): string {
  if (seconds === null) return "Истек";

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `Осталось: ${days}д ${hours}ч ${minutes}м`;
}

function UserCell({ file, shrtl, notter }: { file: FileDoc; shrtl?: boolean; notter?: boolean }) {
  const { user } = useUser();
  const isFromApi = "_isFromApi" in file && file._isFromApi;
  const userProfile = useQuery(
    api.users.getUserProfile,
    !isFromApi ? { userId: file.userId } : "skip"
  );

  if (file.isFolder) {
    return <div className="text-white/50">—</div>;
  }

  const avatar = shrtl
    ? user?.imageUrl
    : notter
    ? file.avatar
    : userProfile?.image;

  const username = shrtl
    ? user?.username
    : notter
    ? file.username
    : userProfile?.name;

  return (
    <div className="flex items-center gap-2 text-white/50">
      <Avatar className="h-7 w-7">
        <AvatarImage src={avatar} />
        <AvatarFallback className="bg-white/10 text-xs text-white/60">
          {username?.charAt(0) ?? "?"}
        </AvatarFallback>
      </Avatar>
      <span>{username}</span>
    </div>
  );
}

function NameCell({
  file,
  onOpenFolder,
}: {
  file: FileDoc;
  onOpenFolder?: (folderName: string) => void;
}) {
  const displayName = file.name?.trim() || "Без названия";

  if (file.isFolder) {
    return (
      <button
        onClick={() => onOpenFolder?.(file.name)}
        className="flex items-center gap-2 font-medium text-white/80 transition-colors hover:text-white"
        title={displayName}
      >
        <span className="shrink-0 text-yellow-400">{typeIcons.folder}</span>
        <span>{displayName}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 font-medium text-white/80" title={displayName}>
      <span className="shrink-0 text-zinc-400">{typeIcons[file.type]}</span>
      <span>{displayName}</span>
    </div>
  );
}

function TypeCell({ file }: { file: FileDoc }) {
  return (
    <div className="flex items-center gap-2 text-white/70">
      <span className="shrink-0 text-zinc-400">{typeIcons[file.type]}</span>
      <span className="capitalize">{file.isFolder ? "Папка" : file.type}</span>
    </div>
  );
}

function DateCell({ file, shrtl }: { file: FileDoc; shrtl?: boolean }) {
  if (file.isFolder) {
    return <div className="text-white/50">—</div>;
  }

  if (shrtl) {
    const expiresInSeconds =
      "_expiresInSeconds" in file
        ? ((file._expiresInSeconds as number | null | undefined) ?? null)
        : null;
    return <div className="text-white/50">{formatExpiresIn(expiresInSeconds)}</div>;
  }

  return (
    <div className="text-white/50">
      {formatRelative(new Date(file._creationTime), new Date())}
    </div>
  );
}

export function createColumns({
  shrtl,
  notter,
  useFilesApi,
  deletedOnly,
  onRefresh,
  onOpenFolder,
}: {
  shrtl?: boolean;
  notter?: boolean;
  useFilesApi?: boolean;
  deletedOnly?: boolean;
  onRefresh?: () => void;
  onOpenFolder?: (folderName: string) => void;
}): ColumnDef<FileDoc>[] {
  return [
    {
      accessorKey: "name",
      header: "Название",
      cell: ({ row }) => <NameCell file={row.original} onOpenFolder={onOpenFolder} />,
    },
    {
      accessorKey: "type",
      header: "Тип",
      cell: ({ row }) => <TypeCell file={row.original} />,
    },
    {
      accessorKey: "userId",
      header: "Пользователь",
      cell: ({ row }) => (
        <UserCell file={row.original} shrtl={shrtl} notter={notter} />
      ),
    },
    {
      accessorKey: "_creationTime",
      header: shrtl ? "Истекает" : "Загружено",
      cell: ({ row }) => <DateCell file={row.original} shrtl={shrtl} />,
    },
    {
      id: "actions",
      header: "Действия",
      cell: ({ row }) => (
        <FileCardActions
          file={row.original}
          shrtl={shrtl}
          notter={notter}
          useFilesApi={useFilesApi}
          deletedOnly={deletedOnly}
          onRefresh={onRefresh}
          onOpenFolder={onOpenFolder}
        />
      ),
    },
  ];
}
