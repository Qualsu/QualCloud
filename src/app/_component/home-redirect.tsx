"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { pages } from "@/config/routing/pages.route";

const STORAGE_KEY = "qualcloud-settings";

interface StoredSettings {
  redirectHomeToDashboard?: boolean;
}

function getStoredRedirectPreference(): boolean {
  if (typeof window === "undefined") return true;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;

    const parsed = JSON.parse(raw) as StoredSettings;
    return parsed.redirectHomeToDashboard !== false;
  } catch {
    return true;
  }
}

export function HomeRedirect() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [redirectEnabled, setRedirectEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    setRedirectEnabled(getStoredRedirectPreference());
  }, []);

  useEffect(() => {
    if (!isLoaded || redirectEnabled === null) return;

    if (redirectEnabled && isSignedIn) {
      router.replace(pages.DASHBOARD.ROOT);
    }
  }, [isLoaded, isSignedIn, redirectEnabled, router]);

  return null;
}
