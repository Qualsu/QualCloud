"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { RowSelectionState } from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DataTableProps, FileDoc } from "@/config/types/components.types";
import { useTranslation } from "@/components/hooks/use-translation";
import { useDragSource, useDropTarget } from "@/components/hooks/use-drag-drop";
import { cn } from "@/lib/utils";
import { useCallback } from "react";

function DraggableTableRow<TData>({
  row,
  children,
  onClick,
  enableDragDrop,
  selectedFiles,
  allData,
  onDropOnFolder,
}: {
  row: ReturnType<ReturnType<typeof useReactTable<TData>>["getRowModel"]>["rows"][0];
  children: React.ReactNode;
  onClick?: (row: TData, e?: React.MouseEvent) => void;
  enableDragDrop?: boolean;
  selectedFiles?: TData[];
  allData: TData[];
  onDropOnFolder?: (draggedFiles: TData[], targetFolder: TData) => void;
}) {
  const file = row.original as unknown as FileDoc;
  const isFolder = file?.isFolder ?? false;

  const { isDragging, dragProps } = useDragSource(
    file,
    (selectedFiles ?? []) as unknown as FileDoc[],
    enableDragDrop ?? false
  );

  const handleDropOnFolder = useCallback(
    (draggedFiles: FileDoc[], targetFolder: FileDoc) => {
      onDropOnFolder?.(
        draggedFiles as unknown as TData[],
        targetFolder as unknown as TData
      );
    },
    [onDropOnFolder]
  );

  const { isOver, dropProps } = useDropTarget(
    file,
    allData as unknown as FileDoc[],
    handleDropOnFolder,
    (enableDragDrop ?? false) && isFolder && !!onDropOnFolder
  );

  return (
    <TableRow
      key={row.id}
      data-state={row.getIsSelected() && "selected"}
      className={cn(
        "border-white/10 text-white/70 hover:bg-white/[0.04] cursor-pointer data-[state=selected]:bg-white/[0.08] transition-all duration-200",
        isDragging && "opacity-40",
        isOver && "bg-purple/[0.12] border-purple/40 ring-1 ring-purple/30"
      )}
      onClick={(e) => onClick?.(row.original, e)}
      {...dragProps}
      {...dropProps}
    >
      {children}
    </TableRow>
  );
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  rowSelection,
  onRowSelectionChange,
  getRowId,
  enableDragDrop,
  selectedFiles,
  onDropOnFolder,
}: DataTableProps<TData, TValue>) {
  const { t } = useTranslation();
  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection: rowSelection ?? {},
    },
    enableRowSelection: true,
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
  });

  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-white/10 bg-white/[0.04] hover:bg-white/[0.06]">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="text-white/50">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <DraggableTableRow
                key={row.id}
                row={row}
                onClick={onRowClick}
                enableDragDrop={enableDragDrop}
                selectedFiles={selectedFiles}
                allData={data}
                onDropOnFolder={onDropOnFolder}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    onClick={(e) => {
                      if (cell.column.id === "actions" || cell.column.id === "select") {
                        e.stopPropagation();
                      }
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </DraggableTableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-white/40">
                {t("files.nothingFound")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
