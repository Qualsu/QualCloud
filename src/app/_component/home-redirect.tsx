"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/components/context/settings-context";
import { pages } from "@/config/routing/pages.route";

export function HomeRedirect() {
  const router = useRouter();
  const { initialized, redirectHomeToDashboard } = useSettings();

  useEffect(() => {
    if (!initialized) return;
    if (redirectHomeToDashboard) {
      router.replace(pages.DASHBOARD.ROOT);
    }
  }, [initialized, redirectHomeToDashboard, router]);

  return null;
}
