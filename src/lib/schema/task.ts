import { z } from "zod";

/**
 * Task Status Enum
 */
export const TaskStatus = z.enum(["todo", "in_progress", "done"]);
export type TaskStatus = z.infer<typeof TaskStatus>;

/**
 * Task Priority Enum
 */
export const TaskPriority = z.enum(["low", "medium", "high"]);
export type TaskPriority = z.infer<typeof TaskPriority>;

/**
 * Full Task schema (from database)
 * Single source of truth for task validation
 * Used on both client and server
 */
export const TaskSchema = z.object({
  id: z.number().int().positive(),
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .nullable()
    .optional(),
  status: TaskStatus,
  priority: TaskPriority,
  assignee: z.string().email("Invalid email format").nullable().optional(),
  dueDate: z.date().nullable().optional(),
  completed: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Task = z.infer<typeof TaskSchema>;

/**
 * Input schema for creating tasks
 * Excludes computed fields like id, createdAt, updatedAt
 */
export const CreateTaskSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(255, "Title must be less than 255 characters"),
    description: z.string().max(1000).optional(),
    status: TaskStatus.optional().default("todo"),
    priority: TaskPriority.optional().default("medium"),
    assignee: z.string().email().optional(),
    dueDate: z.date().optional(),
  })
  .strict();

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

/**
 * Input schema for updating tasks
 * All fields optional except id
 */
export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  id: z.number().int().positive(),
});

export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;

/**
 * Query schema for filtering and sorting tasks
 */
export const TaskQuerySchema = z.object({
  status: TaskStatus.optional(),
  priority: TaskPriority.optional(),
  assignee: z.string().email().optional(),
  completed: z.boolean().optional(),
  sortBy: z
    .enum(["createdAt", "updatedAt", "dueDate", "priority"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  limit: z.number().int().positive().optional().default(10),
  offset: z.number().int().nonnegative().optional().default(0),
});

export type TaskQueryInput = z.infer<typeof TaskQuerySchema>;
