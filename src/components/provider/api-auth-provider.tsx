"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { setClerkTokenGetter } from "@/config/const/api.const";

export function ApiAuthProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded } = useAuth();

  useEffect(() => {
    setClerkTokenGetter(async () => {
      try {
        if (!isLoaded || !getToken) return null;
        const token = await getToken();
        return token ?? null;
      } catch {
        return null;
      }
    });
  }, [getToken, isLoaded]);

  return <>{children}</>;
}
