"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "@/lib/r2";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];

export async function getPresignedUrl(filename: string, fileType: string, fileSize: number) {
  if (!filename || !fileType || !fileSize) {
    throw new Error("Missing required fields");
  }

  // Validate File Type & Size
  const isImage = ALLOWED_IMAGE_TYPES.includes(fileType);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(fileType);

  if (!isImage && !isVideo) {
    throw new Error("Unsupported file type. Only JPG, PNG, WEBP, GIF, MP4, and WEBM are allowed.");
  }

  if (isImage && fileSize > MAX_IMAGE_SIZE) {
    throw new Error("Image size exceeds the 5MB limit.");
  }

  if (isVideo && fileSize > MAX_VIDEO_SIZE) {
    throw new Error("Video size exceeds the 50MB limit.");
  }

  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrlBase = process.env.R2_PUBLIC_URL;

  if (!bucketName || !publicUrlBase) {
    throw new Error("Server configuration error");
  }

  // Generate unique file key
  const extension = filename.split(".").pop();
  const uniqueFileName = `${crypto.randomUUID()}.${extension}`;
  const objectKey = `uploads/${uniqueFileName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName.trim(),
    Key: objectKey,
    ContentType: fileType,
  });

  try {
    const signedUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });
    const publicUrl = `${publicUrlBase.trim()}/${objectKey}`;

    return {
      signedUrl,
      publicUrl,
      objectKey,
    };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error("Failed to generate presigned URL");
  }
}
