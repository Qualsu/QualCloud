"use client"

import { ColumnDef } from "@tanstack/react-table"
import { formatRelative } from "date-fns"
import { useQuery } from "convex/react"
import { useUser } from "@clerk/nextjs"
import { Globe, Lock } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import type { FileDoc } from "@/config/types/components.types"
import { typeIcons } from "@/config/const/components.const"
import { api } from "../../../../convex/_generated/api"
import { FileCardActions } from "./file-actions"
import {
  formatExpiresIn,
  getFileFormatDisplay,
} from "./file-helpers"
import {
  getLastEditorDisplayName,
  isClerkUserId,
} from "@/lib/files-editor"

function UserCell({
  file,
  shrtl,
  notter,
  useFilesApi,
}: {
  file: FileDoc;
  shrtl?: boolean;
  notter?: boolean;
  useFilesApi?: boolean;
}) {
  const { user } = useUser();
  const isFromApi = "_isFromApi" in file && file._isFromApi;
  const isApiSource = shrtl || notter || useFilesApi || isFromApi;
  const userProfile = useQuery(
    api.users.getUserProfile,
    !isApiSource ? { userId: file.userId } : "skip"
  );

  let avatar: string | undefined;
  let username: string | undefined;

  if (shrtl) {
    avatar = user?.imageUrl ?? undefined;
    username = user?.username ?? undefined;
  } else if (notter) {
    avatar = file.avatar;
    username = file.username;
  } else if (useFilesApi || file.isFolder) {
    const lastEditorIsRawId = isClerkUserId(file.lastEditorUsername);
    avatar =
      file.lastEditorAvatar ??
      (lastEditorIsRawId ? user?.imageUrl : undefined) ??
      user?.imageUrl ??
      undefined;
    username = getLastEditorDisplayName(file.lastEditorUsername, user);
  } else {
    avatar = userProfile?.image;
    username = userProfile?.name;
  }

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
  useFilesApi,
  deletedOnly,
}: {
  file: FileDoc;
  onOpenFolder?: (folderName: string) => void;
  useFilesApi?: boolean;
  deletedOnly?: boolean;
}) {
  const displayName = file.displayName?.trim() || file.name?.trim() || "Без названия";
  const hidePublicStatus = file.isFolder && deletedOnly;
  const publicIcon = hidePublicStatus ? null : file.isPublic ? (
    <span title="Публичный доступ">
      <Globe className="h-3.5 w-3.5 shrink-0 text-green-400" />
    </span>
  ) : file.isFolder ? (
    <span title="Приватная папка">
      <Lock className="h-3.5 w-3.5 shrink-0 text-white/40" />
    </span>
  ) : null;

  if (file.isFolder) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenFolder?.(file.name);
        }}
        className="flex items-center gap-2 font-medium text-white/80 transition-colors hover:text-white"
        title={displayName}
      >
        <span className="shrink-0 text-zinc-400">{typeIcons.folder}</span>
        <span>{displayName}</span>
        {useFilesApi && publicIcon}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 font-medium text-white/80" title={displayName}>
      <span className="shrink-0 text-zinc-400">{typeIcons[file.type]}</span>
      <span>{displayName}</span>
      {useFilesApi && publicIcon}
    </div>
  );
}

function TypeCell({ file }: { file: FileDoc }) {
  const displayFormat = getFileFormatDisplay(file.name, file.type, file.isFolder);
  return (
    <div className="flex items-center gap-2 text-white/70">
      <span className="shrink-0 text-zinc-400">{typeIcons[file.type]}</span>
      <span>{displayFormat}</span>
    </div>
  );
}

function DateCell({ file, shrtl }: { file: FileDoc; shrtl?: boolean }) {
  if (file.isFolder) {
    return (
      <div className="text-white/50">
        {file.updatedAt
          ? formatRelative(new Date(file.updatedAt), new Date())
          : "—"}
      </div>
    );
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
  enableSelection,
  onRefresh,
  onOpenFolder,
}: {
  shrtl?: boolean;
  notter?: boolean;
  useFilesApi?: boolean;
  deletedOnly?: boolean;
  enableSelection?: boolean;
  onRefresh?: () => void;
  onOpenFolder?: (folderName: string) => void;
}): ColumnDef<FileDoc>[] {
  const columns: ColumnDef<FileDoc>[] = [];

  if (enableSelection) {
    columns.push({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(value === true)
          }
          aria-label="Выбрать все"
          className="border-white/10 bg-white/5 data-[state=checked]:border-primary data-[state=checked]:bg-primary hover:bg-white/10"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(value === true)}
          aria-label="Выбрать строку"
          className="border-white/10 bg-white/5 data-[state=checked]:border-primary data-[state=checked]:bg-primary hover:bg-white/10"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    });
  }

  columns.push(
    {
      accessorKey: "name",
      header: "Название",
      cell: ({ row }) => <NameCell file={row.original} onOpenFolder={onOpenFolder} useFilesApi={useFilesApi} deletedOnly={deletedOnly} />,
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
        <UserCell
          file={row.original}
          shrtl={shrtl}
          notter={notter}
          useFilesApi={useFilesApi}
        />
      ),
    },
    {
      accessorKey: "_creationTime",
      header: shrtl ? "Истекает" : "Дата",
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
  );

  return columns;
}
