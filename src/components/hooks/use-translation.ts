"use client";

import { useCallback } from "react";
import { translate, type Language } from "@/config/i18n";
import { useSettings } from "@/components/context/settings-context";

export function useTranslation() {
  const { language } = useSettings();

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return translate(language, key, params);
    },
    [language]
  );

  return { t, language };
}

export type { Language };
