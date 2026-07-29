import { getPresignedUrl } from "@/utils/upload.action";

export async function uploadFileToR2(file: File): Promise<string> {
  // 1. Get presigned URL from our server action
  const { signedUrl, publicUrl } = await getPresignedUrl(file.name, file.type, file.size);

  // 2. Upload file directly to Cloudflare R2
  const uploadResponse = await fetch(signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("Failed to upload file to storage");
  }

  // 3. Return the public URL for storing in database
  return publicUrl;
}

