"use client";

import { useEffect, useState } from "react";
import {
  COOKIE_DISPLAY_MODE,
  setCookie,
} from "@/lib/pwa-cookies";

export function isPwa(): boolean {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-expect-error iOS Safari standalone property
    window.navigator.standalone === true
  );
}

function setPwaCookie(detected: boolean) {
  if (detected) {
    setCookie(COOKIE_DISPLAY_MODE, "standalone");
  }
}

export function useIsPwa(): boolean {
  const [pwa, setPwa] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const detected = isPwa();
    setPwa(detected);
    setPwaCookie(detected);

    const query = window.matchMedia("(display-mode: standalone)");
    const handler = (event: MediaQueryListEvent) => {
      setPwa(event.matches);
      setPwaCookie(event.matches);
    };

    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return pwa;
}
