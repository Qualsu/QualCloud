import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { ColumnDef, RowSelectionState, Updater } from "@tanstack/react-table";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

export type FileDoc = Omit<Doc<"files">, "type"> & {
  type: FileType;
  downloads?: number;
  _expiresInSeconds?: number | null;
  _isFromApi?: boolean;
  isFavorited?: boolean;
  avatar?: string;
  username?: string;
  lastEditorUsername?: string | null;
  lastEditorAvatar?: string | null;
  noteId?: string;
  fileUrl?: string;
  fileSize?: number;
  contentType?: string;
  folder?: string | null;
  folderId?: string;
  isDeleted?: boolean;
  isFolder?: boolean;
  isPublic?: boolean;
  updatedBy?: string | null;
  updatedAt?: number | null;
  displayName?: string;
};
export type FavoritedFile = FileDoc;
export type FileType = Doc<"files">["type"] | "folder";
export type FileFilterType = FileType | "all";
export type FileSortKey = "date" | "alphabet" | "types";
export type FileSortDirection = "new" | "reverse";

export interface FilesBrowserProps {
  title: string;
  shrtl?: boolean;
  notter?: boolean;
  kenycloud?: boolean;
  favorites?: boolean;
  deletedOnly?: boolean;
  hideWhenNoConvexUser?: boolean;
}

export interface FileCardProps {
  file: FileDoc;
  shrtl?: boolean;
  notter?: boolean;
  useFilesApi?: boolean;
  deletedOnly?: boolean;
  onRefresh?: () => void;
  onOpenFolder?: (folderName: string) => void;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onClearSelection?: () => void;
}

export interface UserCellProps {
  userId: Id<"users">;
}

export interface NavigationItem {
  href: string;
  label: string;
  match: string;
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData, e?: React.MouseEvent) => void;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (updater: Updater<RowSelectionState>) => void;
  getRowId?: (row: TData) => string;
}

export interface HeaderProps {
    showMobileMenuButton?: boolean;
    showSearch?: boolean;
}

export interface SearchBarProps {
  query?: string;
  setQuery?: Dispatch<SetStateAction<string>>;
  syncWithUrl?: boolean;
}

export interface LandingFeatureCard {
  title: string;
  description: string;
  icon: ReactNode;
}
