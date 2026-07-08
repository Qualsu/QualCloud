import { notter } from "@/config/const/api.const";
import { api } from "@/config/routing/api.route";
import { NotterFileResponse } from "@/config/types/api.types";
import { Id } from "../../../convex/_generated/dataModel";
import { getMimeType } from "./utils/get-mime";

export async function getAllFiles(account_id: string) {
  const res = await notter.get(api.NOTTER.GET_ALL(account_id));
  const notterFiles: NotterFileResponse[] = res.data;

  const uniqueFiles = notterFiles.filter((file, index, files) => {
    const fileKey = `${file.documentid}:${file.url}`;
    return index === files.findIndex((item) => `${item.documentid}:${item.url}` === fileKey);
  });

  return uniqueFiles.map((file) => {
    const deterministicId = `notter_${file._id}` as unknown as Id<"users">;
    const uniqueFileId = `notter_${file.documentid}_${file._id}` as unknown as Id<"files">;

    return {
      _id: uniqueFileId,
      _creationTime: new Date(file.created || Date.now()).getTime(),
      name: file.filename,
      orgId: account_id,
      type: getMimeType(file.type),
      contentType: file.type,
      fileId: file._id as Id<"_storage">,
      userId: deterministicId,
      linkId: "",
      isFavorited: false,
      _isFromApi: true,
      downloads: 0,
      avatar: file.avatar,
      username: file.username,
      noteId: file.documentid,
      fileUrl: file.url,
    };
  });
}