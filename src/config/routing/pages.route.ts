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
}