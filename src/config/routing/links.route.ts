import { Id } from "../../../convex/_generated/dataModel";

export const links = {
  QUALSU: "https://qual.su",
  FEEDBACK: "https://feedback.qual.su",
  TELEGRAM: "https://t.me/qualsu",
  QUAL_ID: "https://id.qual.su",
  GITHUB: "https://github.com/qualsu/qualcloud",
  SHRTL: {
    SITE: "https://shrtl.ru",
    GET_FILE: (fileId: string) => `${process.env.NEXT_PUBLIC_SHRTL_API}/files/${fileId}`,
    GET_LINK: (fileId: string) => `${links.SHRTL.SITE}/file/${fileId}`,
  },
  NOTTER: {
    SITE: "https://notter.su",
    GET_FILE: (fileId: string) => `${process.env.NEXT_PUBLIC_NOTTER_API}/files/uploads/${fileId}`,
    GET_NOTE: (documentId: string) => `${links.NOTTER.SITE}/view/${documentId}`,
  },
  KENYCLOUD: {
    GET_FILE: (fileId: Id<"_storage">) => `${process.env.NEXT_PUBLIC_CONVEX_ACTION_URL}/getImage?storageId=${fileId}`,
  }
}