"use client";

import { FilesBrowser } from "../_components/file-browser";
import { useTranslation } from "@/components/hooks/use-translation";

export default function Notter() {
  const { t } = useTranslation();
  return (
    <div>
      <FilesBrowser title={t("files.title.notter")} notter />
    </div>
  );
}
