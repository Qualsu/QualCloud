import type { ColumnDef } from "@tanstack/react-table";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

export type FileDoc = Doc<"files"> & {
  downloads?: number;
  _expiresInSeconds?: number | null;
  _isFromApi?: boolean;
  isFavorited?: boolean;
  avatar?: string;
  username?: string;
};
export type FileType = Doc<"files">["type"];
export type FileFilterType = FileType | "all";
export type FileSortKey = "date" | "alphabet" | "types";
export type FileSortDirection = "new" | "reverse";

export interface FilesBrowserProps {
  title: string;
  shrtl?: boolean;
  notter?: boolean;
}

export interface FileCardProps {
  file: FileDoc;
  shrtl?: boolean;
  notter?: boolean;
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
}

export interface HeaderProps {
    showMobileMenuButton?: boolean;
}