"use client";

import { useOrganization, useUser } from "@clerk/nextjs";

export interface CurrentOrg {
  orgId: string | undefined;
  isLoaded: boolean;
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
    return { orgId, isLoaded: true, isOrgAdmin: true };
  }

  const isOrgAdmin = membership?.role === "admin" || membership?.role === "org:admin";

  return { orgId, isLoaded: true, isOrgAdmin };
}
