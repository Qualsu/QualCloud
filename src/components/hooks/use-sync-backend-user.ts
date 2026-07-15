"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { setAvatar, setUsername } from "@/app/api/users";
import {
  getFilesEditor,
  isClerkUserId,
  type ClerkUserLike,
} from "@/lib/files-editor";

export function useSyncBackendUser(account_id?: string | null) {
  const { user, isLoaded } = useUser();
  const synced = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user || !account_id || synced.current) return;

    const editor = getFilesEditor(user as ClerkUserLike);
    const name = editor.username;
    const avatar = editor.avatar_url;

    synced.current = true;

    if (name && !isClerkUserId(name)) {
      setUsername(account_id, name).catch(() => {
      });
    }

    if (avatar) {
      setAvatar(account_id, avatar).catch(() => {
      });
    }
  }, [isLoaded, user, account_id]);
}
