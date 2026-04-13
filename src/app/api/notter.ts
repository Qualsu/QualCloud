import { notter } from "@/config/const/api.const";
import { api } from "@/config/routing/api.route";
import { NotterFileResponse } from "@/config/types/api.types";
import { Id } from "../../../convex/_generated/dataModel";
import { getMimeType } from "./utils/get-mime";

export async function getAllFiles(account_id: string) {
  const res = await notter.get(api.NOTTER.GET_ALL(account_id));
  const notterFiles: NotterFileResponse[] = res.data;
  
  return notterFiles.map((file) => {
    const deterministicId = `notter_${file._id}` as unknown as Id<"users">;

    return {
      _id: file.documentid as Id<"files">,
      _creationTime: new Date(file.created).getTime(),
      name: file.filename,
      orgId: account_id,
      type: getMimeType(file.type),
      fileId: file.fileid as Id<"_storage">,
      userId: deterministicId,
      linkId: "",
      isFavorited: false,
      _isFromApi: true,
      downloads: 0,
      _expiresInSeconds: 1,
      avatar: file.avatar,
      username: file.username,
    };
  });
}