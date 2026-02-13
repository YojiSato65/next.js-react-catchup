"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  CreateTaskSchema,
  TaskSchema,
  UpdateTaskSchema,
  TaskQuerySchema,
  type Task,
  type CreateTaskInput,
  type TaskQueryInput,
} from "@/lib/schema/task";
import { revalidatePath } from "next/cache";

/**
 * Get all tasks with optional filtering and sorting
 */
export async function getTasks(
  query?: Partial<TaskQueryInput>,
): Promise<Task[]> {
  const validatedQuery = query
    ? TaskQuerySchema.parse(query)
    : TaskQuerySchema.parse({});

  const where: Prisma.TaskWhereInput = {};

  if (validatedQuery.status) where.status = validatedQuery.status;
  if (validatedQuery.priority) where.priority = validatedQuery.priority;
  if (validatedQuery.assignee) where.assignee = validatedQuery.assignee;
  if (validatedQuery.completed !== undefined)
    where.completed = validatedQuery.completed;

  const tasks = await prisma.task.findMany({
    where,
    orderBy: {
      [validatedQuery.sortBy]: validatedQuery.sortOrder,
    },
    take: validatedQuery.limit,
    skip: validatedQuery.offset,
  });

  return tasks.map((task) => TaskSchema.parse(task));
}

/**
 * Get a single task by ID
 */
export async function getTask(id: number): Promise<Task | null> {
  const task = await prisma.task.findUnique({
    where: { id },
  });

  if (!task) return null;
  return TaskSchema.parse(task);
}

/**
 * Create a new task
 */
export async function createTask(input: CreateTaskInput): Promise<Task> {
  const validatedInput = CreateTaskSchema.parse(input);

  const task = await prisma.task.create({
    data: validatedInput,
  });

  revalidatePath("/");
  return TaskSchema.parse(task);
}

/**
 * Update an existing task
 */
export async function updateTask(
  id: number,
  input: Partial<CreateTaskInput>,
): Promise<Task> {
  const validatedInput = UpdateTaskSchema.parse({ id, ...input });

  const task = await prisma.task.update({
    where: { id },
    data: validatedInput,
  });

  revalidatePath("/");
  return TaskSchema.parse(task);
}

/**
 * Delete a task
 */
export async function deleteTask(id: number): Promise<void> {
  await prisma.task.delete({
    where: { id },
  });

  revalidatePath("/");
}

/**
 * Toggle task completion status
 */
export async function toggleTask(id: number): Promise<Task> {
  const task = await prisma.task.findUnique({
    where: { id },
  });

  if (!task) {
    throw new Error(`Task with id ${id} not found`);
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: { completed: !task.completed },
  });

  revalidatePath("/");
  return TaskSchema.parse(updatedTask);
}
