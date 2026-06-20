import { httpRouter } from "convex/server";

import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

http.route({
  path: "/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payloadString = await request.text();
    const headerPayload = request.headers;

    try {
      const result = await ctx.runAction(internal.clerk.fulfill, {
        payload: payloadString,
        headers: {
          "svix-id": headerPayload.get("svix-id")!,
          "svix-timestamp": headerPayload.get("svix-timestamp")!,
          "svix-signature": headerPayload.get("svix-signature")!,
        },
      });

      switch (result.type) {
        case "user.created":
            await ctx.runMutation(internal.users.createUser, {
                tokenIdentifier: `https://${process.env.CLERK_HOSTNAME}|${result.data.id}`,
                name: `${result.data.first_name ?? ""} ${result.data.last_name ?? ""}`,
                image: result.data.image_url,
            });
            break;
        case "user.updated":
              await ctx.runMutation(internal.users.updateUser, {
                  tokenIdentifier: `https://${process.env.CLERK_HOSTNAME}|${result.data.id}`,
                  name: `${result.data.username}`,
                  image: result.data.image_url,
              });
              break;
        case "organizationMembership.created":
            await ctx.runMutation(internal.users.addOrgIdToUser, {
                tokenIdentifier: `https://${process.env.CLERK_HOSTNAME}|${result.data.public_user_data.user_id}`,
                orgId: result.data.organization.id,
                role: result.data.role === "org:admin" ? "admin" : "member",
            });
            break;
          case "organizationMembership.updated":
              await ctx.runMutation(internal.users.updateRoleInOrgForUser, {
                  tokenIdentifier: `https://${process.env.CLERK_HOSTNAME}|${result.data.public_user_data.user_id}`,
                  orgId: result.data.organization.id,
                  role: result.data.role === "org:admin" ? "admin" : "member",
              });
              break;
      }

      return new Response(null, {
        status: 200,
      });
    } catch (err) {
      return new Response("Webhook Error", {
        status: 400,
      });
    }
  }),
});

async function detectMimeType(blob: Blob): Promise<string> {
  if (blob.size === 0 || blob.size > 1024 * 1024) {
    return "application/octet-stream";
  }

  // Avoid `blob.slice()` — it can throw "offset is out of bounds" on Convex
  // storage Blobs. Read the whole buffer (small files only) and take the
  // first bytes from the resulting Uint8Array.
  const arr = new Uint8Array(await blob.arrayBuffer()).slice(0, 4);
  if (arr.length < 4) return "application/octet-stream";

  if (arr[0] === 0xff && arr[1] === 0xd8 && arr[2] === 0xff) return "image/jpeg";
  if (arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4e && arr[3] === 0x47) return "image/png";
  if (arr[0] === 0x47 && arr[1] === 0x49 && arr[2] === 0x46) return "image/gif";
  if (arr[0] === 0x52 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x46) return "image/webp";
  if (arr[0] === 0x42 && arr[1] === 0x4d) return "image/bmp";
  if (arr[0] === 0x49 && arr[1] >= 0x49 && arr[2] === 0x2a && arr[3] === 0x00) return "image/tiff";
  if (arr[0] === 0x4d && arr[1] === 0x4d && arr[2] === 0x00 && arr[3] === 0x2a) return "image/tiff";
  if (arr[0] === 0x00 && arr[1] === 0x00 && arr[2] === 0x01 && arr[3] === 0x00) return "image/x-icon";
  if (arr[0] === 0x1a && arr[1] === 0x45 && arr[2] === 0xdf && arr[3] === 0xa3) return "video/webm";
  if (arr[0] === 0x66 && arr[1] === 0x74 && arr[2] === 0x79 && arr[3] === 0x70) return "video/mp4";
  if (arr[0] === 0x49 && arr[1] === 0x44 && arr[2] === 0x33) return "audio/mpeg";
  if (arr[0] === 0x25 && arr[1] === 0x50 && arr[2] === 0x44 && arr[3] === 0x46) return "application/pdf";

  return "application/octet-stream";
}

http.route({
  path: "/getImage",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const { searchParams } = new URL(request.url);
      const storageId = searchParams.get("storageId") as Id<"_storage"> | null;

      if (!storageId) {
        return new Response("Missing storageId", { status: 400 });
      }

      const blob = await ctx.storage.get(storageId);
      if (blob === null) {
        return new Response("Image not found", { status: 404 });
      }

      const metadata = await ctx.storage.getMetadata(storageId);
      const contentType = metadata?.contentType ?? (await detectMimeType(blob));

      return new Response(blob, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch (error) {
      console.error("Error serving image:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }),
});

export default http;