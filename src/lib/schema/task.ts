import { z } from "zod";

/**
 * Task domain schema
 * Single source of truth for task validation
 * Used on both client and server
 */
export const TaskSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  description: z.string().optional().default(""),
  completed: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Task = z.infer<typeof TaskSchema>;

/**
 * Input schema for creating/updating tasks
 * Excludes computed fields like id, createdAt, updatedAt
 */
export const CreateTaskSchema = TaskSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
