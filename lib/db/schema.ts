import { pgTable, uuid, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";

export const memories = pgTable("memories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").unique().notNull(),
  editToken: text("edit_token").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  coverImageUrl: text("cover_image_url"),
  youtubeVideoId: text("youtube_video_id"),
  letter: text("letter"),
  showTimeline: boolean("show_timeline").default(false).notNull(),
  showLetter: boolean("show_letter").default(false).notNull(),
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  memoryId: uuid("memory_id").references(() => memories.id, { onDelete: 'cascade' }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(), // 'image' or 'video'
  message: text("message"),
  order: integer("order").notNull().default(0),
});

export const timelineEvents = pgTable("timeline_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  memoryId: uuid("memory_id").references(() => memories.id, { onDelete: 'cascade' }).notNull(),
  eventDate: text("event_date").notNull(), // E.g., "Feb 14, 2023"
  message: text("message").notNull(),
  imageUrl: text("image_url"),
  order: integer("order").notNull().default(0),
});
