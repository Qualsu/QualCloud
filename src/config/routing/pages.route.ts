export const pages = {
  ROOT: "/",
  AUTH: "/auth/sign-in",
  DASHBOARD: {
    ROOT: "/dashboard",
    CLOUD: "/dashboard/cloud",
    FAVORITES: "/dashboard/favorites",
    TRASH: "/dashboard/trash",
    KENYCLOUD: "/dashboard/kenycloud",
    NOTTER: "/dashboard/notter",
    SHRTL: "/dashboard/shrtl",
  },
  FILE: {
    ROOT: "/file",
    BY_ID: (id: string) => `/file/${id}`,
    COPY: (origin: string, linkId: string) => `${origin}${pages.FILE.BY_ID(linkId)}`
  },
  FOLDER: {
    ROOT: "/folder",
    BY_ID: (id: string) => `/folder/${id}`,
    COPY: (origin: string, folderId: string) =>
      `${origin}${pages.FOLDER.BY_ID(folderId)}`
  },
}