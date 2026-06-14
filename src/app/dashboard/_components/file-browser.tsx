"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { CheckedState } from "@radix-ui/react-checkbox";
import { useQuery } from "convex/react";
import { LayoutGrid, Loader2, PackageOpen, Table as TableIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getAllFiles as getNotterFiles } from "@/app/api/notter";
import { getAllFiles as getShrtlFiles } from "@/app/api/shrtl";
import {
  fileSortDirectionOptions,
  fileSortOptions,
  fileTypeOptions,
  fileTypeOrder,
} from "@/config/const/components.const";
import type {
  FileDoc,
  FileFilterType,
  FilesBrowserProps,
  FileSortDirection,
  FileSortKey,
} from "@/config/types/components.types";
import { useSearchSuggestions } from "@/components/search-suggestions-context";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "../../../../convex/_generated/api";
import { createColumns } from "./columns";
import { FileCard } from "./file-card";
import { DataTable } from "./file-table";

export function Placeholder() {
  return (
    <div className="my-12 flex w-full flex-col items-center gap-6 text-zinc-500">
      <PackageOpen className="h-32 w-32" />
      <div className="text-center text-2xl font-bold">Тут ничего нет.</div>
    </div>
  );
}

export function FilesBrowser({
  title,
  shrtl,
  notter,
  hideWhenNoConvexUser,
}: FilesBrowserProps) {
  const searchParams = useSearchParams();
  const { setSuggestions } = useSearchSuggestions();
  const organization = useOrganization();
  const user = useUser();
  const [type, setType] = useState<FileFilterType>("all");
  const [sort, setSort] = useState<FileSortKey>("date");
  const [typeSort, setTypeSort] = useState<FileSortDirection>("new");
  const [checked, setChecked] = useState<boolean>(false);
  const [apiFiles, setApiFiles] = useState<FileDoc[] | undefined>(undefined);
  const query = searchParams.get("q")?.trim() ?? "";

  let orgId: string | undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const queryFiles = useQuery(
    api.files.getFiles,
    !shrtl && orgId
      ? {
          orgId,
          type: type === "all" ? undefined : type,
          query,
        }
      : "skip"
  );

  const currentConvexUser = useQuery(
    api.users.getMe,
    !shrtl && !notter && hideWhenNoConvexUser ? {} : "skip"
  );

  const handleCheckedChange = (nextChecked: CheckedState) => {
    if (typeof nextChecked === "boolean") {
      setChecked(nextChecked);
    }
  };

  useEffect(() => {
    if (!orgId) {
      return;
    }

    if (shrtl) {
      getShrtlFiles(orgId).then(setApiFiles);
    }

    if (notter) {
      getNotterFiles(orgId).then(setApiFiles);
    }
  }, [shrtl, notter, orgId]);

  const shouldShowEmptyState =
    Boolean(hideWhenNoConvexUser) && currentConvexUser === null;
  const files = shrtl || notter ? apiFiles : queryFiles;
  const isLoading =
    !shouldShowEmptyState &&
    (files === undefined ||
      (hideWhenNoConvexUser &&
        !shrtl &&
        !notter &&
        currentConvexUser === undefined));

  const modifiedFiles: FileDoc[] =
    files?.map((file) => ({
      ...file,
    })) ?? [];

  const autocompleteFiles = (() => {
    let filesToSuggest = modifiedFiles;

    if (type !== "all") {
      filesToSuggest = filesToSuggest.filter((file) => file.type === type);
    }

    if (shrtl && !checked) {
      filesToSuggest = filesToSuggest.filter((file) => {
        const expiresInSeconds =
          "_expiresInSeconds" in file
            ? ((file._expiresInSeconds as number | null | undefined) ?? null)
            : null;
        return expiresInSeconds !== null;
      });
    }

    return filesToSuggest;
  })();

  const sortedFiles = (() => {
    let filesToSort = modifiedFiles;

    if (shrtl || notter) {
      if (type !== "all") {
        filesToSort = filesToSort.filter((file) => file.type === type);
      }

      if (query) {
        filesToSort = filesToSort.filter((file) =>
          file.name.toLowerCase().includes(query.toLowerCase())
        );
      }

      if (shrtl && !checked) {
        filesToSort = filesToSort.filter((file) => {
          const expiresInSeconds =
            "_expiresInSeconds" in file
              ? ((file._expiresInSeconds as number | null | undefined) ?? null)
              : null;
          return expiresInSeconds !== null;
        });
      }
    }

    const sortedByAlphabet = [...filesToSort].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    const sortedByType = [...filesToSort].sort(
      (a, b) => fileTypeOrder.indexOf(a.type) - fileTypeOrder.indexOf(b.type)
    );

    const sortedByDate = [...filesToSort].sort(
      (a, b) =>
        new Date(b._creationTime).valueOf() - new Date(a._creationTime).valueOf()
    );

    let result = sortedByDate;
    if (sort === "alphabet") {
      result = sortedByAlphabet;
    } else if (sort === "types") {
      result = sortedByType;
    }

    return typeSort === "reverse" ? [...result].reverse() : result;
  })();

  const fileColumns = useMemo(
    () => createColumns({ shrtl, notter }),
    [shrtl, notter]
  );

  const autocompleteSuggestions = useMemo(
    () =>
      Array.from(new Set(autocompleteFiles.map((file) => file.name.trim()).filter(Boolean)))
        .sort((first, second) => first.localeCompare(second)),
    [autocompleteFiles]
  );

  useEffect(() => {
    setSuggestions((currentSuggestions) => {
      if (
        currentSuggestions.length === autocompleteSuggestions.length &&
        currentSuggestions.every(
          (suggestion, index) => suggestion === autocompleteSuggestions[index]
        )
      ) {
        return currentSuggestions;
      }

      return autocompleteSuggestions;
    });
  }, [autocompleteSuggestions, setSuggestions]);

  useEffect(() => {
    return () => setSuggestions([]);
  }, [setSuggestions]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white">{title}</h1>
      </div>

      {shouldShowEmptyState ? (
        <Placeholder />
      ) : (
        <Tabs defaultValue="grid">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
              <div className="flex flex-col gap-2">
                <Label htmlFor="type-select" className="text-sm text-white/60">
                  {"Показать"}
                </Label>
                <Select value={type} onValueChange={(newType) => setType(newType as FileFilterType)}>
                  <SelectTrigger
                    className="w-[180px] border-white/10 bg-white/5 text-white hover:bg-white/10"
                    id="type-select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#211428] text-white">
                    {fileTypeOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="focus:bg-white/10"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="sort-select" className="text-sm text-white/60">
                  {"Сортировать"}
                </Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Select value={sort} onValueChange={(newSort) => setSort(newSort as FileSortKey)}>
                    <SelectTrigger
                      className="w-[180px] border-white/10 bg-white/5 text-white hover:bg-white/10"
                      id="sort-select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-[#211428] text-white">
                      {fileSortOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="focus:bg-white/10"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={typeSort}
                    onValueChange={(newSort) => setTypeSort(newSort as FileSortDirection)}
                  >
                    <SelectTrigger
                      className="w-[160px] border-white/10 bg-white/5 text-white hover:bg-white/10"
                      id="sort-direction-select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-[#211428] text-white">
                      {fileSortDirectionOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="focus:bg-white/10"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {shrtl && (
                <div className="flex items-center gap-2 pb-1">
                  <Label htmlFor="expired-checkbox" className="shrink-0 text-sm text-white/60">
                    {"Истекшие"}
                  </Label>
                  <Checkbox
                    id="expired-checkbox"
                    name="expired-checkbox"
                    checked={checked}
                    onCheckedChange={handleCheckedChange}
                    className="border-white/10 bg-white/5 data-[state=checked]:border-primary data-[state=checked]:bg-primary hover:bg-white/10"
                  />
                </div>
              )}
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

          {isLoading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <Loader2 className="h-16 w-16 animate-spin text-white/50" />
            </div>
          ) : (
            <>
              <TabsContent value="grid">
                <div className="mr-2 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {sortedFiles.map((file) => (
                    <FileCard key={file._id} file={file} shrtl={shrtl} notter={notter} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="table">
                <DataTable columns={fileColumns} data={sortedFiles} />
              </TabsContent>
            </>
          )}
        </Tabs>
      )}

      {!shouldShowEmptyState && !isLoading && sortedFiles.length === 0 && <Placeholder />}
    </div>
  );
}
