"use client";

import { FilesBrowser } from "../_components/file-browser";
import { useTranslation } from "@/components/hooks/use-translation";

export default function Trash() {
  const { t } = useTranslation();
  return (
    <div>
      <FilesBrowser title={t("files.title.trash")} deletedOnly />
    </div>
  );
}
