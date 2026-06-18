"use client";

import { useOrganization, useUser } from "@clerk/nextjs";

export interface CurrentOrg {
  /** ID активного аккаунта: организации, если выбрана, или личного пользователя. */
  orgId: string | undefined;
  /** Загружены ли данные Clerk. */
  isLoaded: boolean;
  /**
   * Имеет ли текущий пользователь право администратора для активного аккаунта.
   * Для личного аккаунта всегда true, для организации — только при роли admin.
   */
  isOrgAdmin: boolean | undefined;
}

export function useCurrentOrg(): CurrentOrg {
  const { organization, membership, isLoaded: orgLoaded } = useOrganization();
  const { user, isLoaded: userLoaded } = useUser();

  const isLoaded = orgLoaded && userLoaded;

  if (!isLoaded) {
    return { orgId: undefined, isLoaded: false, isOrgAdmin: undefined };
  }

  const orgId = organization?.id ?? user?.id ?? undefined;

  if (!organization) {
    // Личный аккаунт — пользователь является владельцем.
    return { orgId, isLoaded: true, isOrgAdmin: true };
  }

  const isOrgAdmin = membership?.role === "admin" || membership?.role === "org:admin";

  return { orgId, isLoaded: true, isOrgAdmin };
}
