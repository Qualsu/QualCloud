export const pages = {
  ROOT: "/",
  AUTH: "/auth/sign-in",
  DASHBOARD: {
    ROOT: "/dashboard/notter",
    KENYCLOUD: "/dashboard/kenycloud",
    NOTTER: "/dashboard/notter",
    SHRTL: "/dashboard/shrtl",
  },
  FILE: {
    ROOT: "/file",
    BY_ID: (id: string) => `/file/${id}`,
    COPY: (origin: string, linkId: string) => `${origin}/${pages.FILE.BY_ID(linkId)}`
  },
}