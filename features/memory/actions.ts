"use server";

import { db } from "@/lib/db";
import { memories, files, timelineEvents } from "@/lib/db/schema";
import { CreateMemoryFormValues, createMemorySchema } from "./schema";

export async function createMemoryAction(data: CreateMemoryFormValues) {
  // Validate data
  const validated = createMemorySchema.parse(data);

  // Generate unique slug
  // For a real app we might slugify the title and add a random short ID. Here we just use a random UUID for simplicity or a simple slugifier.
  const slugBase = validated.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const slug = `${slugBase}-${randomSuffix}`;

  // Generate edit token
  const editToken = crypto.randomUUID();

  // We should do this in a transaction if possible
  try {
    const [newMemory] = await db.insert(memories).values({
      slug,
      editToken,
      title: validated.title,
      subtitle: validated.subtitle,
      coverImageUrl: validated.coverImageUrl,
      youtubeVideoId: validated.youtubeVideoId,
      letter: validated.letter,
      showTimeline: validated.showTimeline,
      showLetter: validated.showLetter,
      published: true, // Auto publish for MVP
    }).returning();

    // Insert timeline events
    if (validated.timelineEvents.length > 0) {
      await db.insert(timelineEvents).values(
        validated.timelineEvents.map((event, index) => ({
          memoryId: newMemory.id,
          eventDate: event.eventDate,
          message: event.message,
          imageUrl: event.imageUrl,
          order: index,
        }))
      );
    }

    // Insert gallery files
    if (validated.files.length > 0) {
      await db.insert(files).values(
        validated.files.map((file, index) => ({
          memoryId: newMemory.id,
          fileUrl: file.fileUrl,
          fileType: file.fileType,
          message: file.message,
          order: index,
        }))
      );
    }

    return { success: true, slug: newMemory.slug, editToken: newMemory.editToken };
  } catch (error) {
    console.error("Error creating memory:", error);
    throw new Error("Failed to create memory");
  }
}
