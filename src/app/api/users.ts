import { files } from "@/config/const/api.const";
import { api } from "@/config/routing/api.route";

export async function setUsername(
  account_id: string,
  username: string
): Promise<unknown> {
  const res = await files.post(api.FILES.USER_SET_USERNAME(account_id), {
    username,
  });
  return res.data;
}

export async function setAvatar(
  account_id: string,
  avatar_url: string
): Promise<unknown> {
  const res = await files.post(api.FILES.USER_SET_AVATAR(account_id), {
    avatar_url,
  });
  return res.data;
}
