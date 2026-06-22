"use client";

import { useEffect } from "react";
import { useSettings } from "@/components/context/settings-context";

export function LanguageSync() {
  const { language, initialized } = useSettings();

  useEffect(() => {
    if (!initialized) return;
    document.documentElement.lang = language;
  }, [language, initialized]);

  return null;
}
