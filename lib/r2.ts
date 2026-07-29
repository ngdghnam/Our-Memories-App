import { S3Client } from "@aws-sdk/client-s3";

if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_ENDPOINT_URL) {
  throw new Error("Missing Cloudflare R2 environment variables");
}

export const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT_URL.trim(),
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID.trim(),
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY.trim(),
  },
});
