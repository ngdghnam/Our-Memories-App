import { z } from "zod";

export const timelineEventSchema = z.object({
  eventDate: z.string().min(1, "Vui lòng nhập ngày tháng"),
  message: z.string().min(1, "Vui lòng nhập nội dung"),
  imageUrl: z.string().optional(),
});

export const fileSchema = z.object({
  fileUrl: z.string(),
  fileType: z.string(),
  message: z.string().optional(),
});

export const createMemorySchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  subtitle: z.string().optional(),
  coverImageUrl: z.string().optional(),
  youtubeVideoId: z.string().optional(),
  letter: z.string().optional(),
  showTimeline: z.boolean(),
  showLetter: z.boolean(),
  timelineEvents: z.array(timelineEventSchema),
  files: z.array(fileSchema),
});

export type CreateMemoryFormValues = z.infer<typeof createMemorySchema>;
