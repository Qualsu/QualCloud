import type { FilesApiEditor } from "@/app/api/files";

export type ClerkUserLike = {
  id?: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  imageUrl?: string;
  primaryEmailAddress?: { emailAddress?: string } | null;
};

function buildDisplayName(user: ClerkUserLike): string {
  const first = user.firstName?.trim() ?? "";
  const last = user.lastName?.trim() ?? "";
  const fromNames = [first, last].filter(Boolean).join(" ").trim();

  return (
    user.username?.trim() ||
    user.fullName?.trim() ||
    fromNames ||
    user.primaryEmailAddress?.emailAddress?.trim() ||
    user.id ||
    ""
  );
}

export function isClerkUserId(value?: string | null): boolean {
  if (!value) return false;
  return /^user_[A-Za-z0-9]+$/.test(value);
}

export function getFilesEditor(user?: ClerkUserLike | null): FilesApiEditor {
  return {
    username: buildDisplayName(user ?? {}),
    avatar_url: user?.imageUrl ?? "",
  };
}

export function getLastEditorDisplayName(
  lastEditorUsername: string | null | undefined,
  currentUser?: ClerkUserLike | null
): string {
  if (isClerkUserId(lastEditorUsername) && currentUser?.id) {
    if (lastEditorUsername === currentUser.id) {
      const currentName = buildDisplayName(currentUser);
      if (currentName && !isClerkUserId(currentName)) return currentName;
    }
    return "Пользователь";
  }

  return (
    lastEditorUsername ||
    (currentUser ? buildDisplayName(currentUser) : "") ||
    "Вы"
  );
}
