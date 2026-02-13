/**
 * Task Repository
 * Data access layer for Task operations
 * Abstracts Prisma queries and handles type conversions
 */

import { prisma } from "@/lib/prisma";
import { TaskSchema, TaskStatus, TaskPriority, type Task } from "@/lib/schema/task";
import { Prisma } from "@prisma/client";

export class TaskRepository {
  /**
   * Find all tasks with optional filtering
   */
  static async findMany(
    where?: Prisma.TaskWhereInput,
    options?: {
      orderBy?: Prisma.TaskOrderByWithRelationInput;
      take?: number;
      skip?: number;
    }
  ): Promise<Task[]> {
    const tasks = await prisma.task.findMany({
      where,
      orderBy: options?.orderBy || { createdAt: "desc" },
      take: options?.take,
      skip: options?.skip,
    });

    return tasks.map(task => TaskSchema.parse(task));
  }

  /**
   * Find a single task by ID
   */
  static async findById(id: number): Promise<Task | null> {
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) return null;
    return TaskSchema.parse(task);
  }

  /**
   * Find tasks by status
   */
  static async findByStatus(status: TaskStatus): Promise<Task[]> {
    return this.findMany({ status });
  }

  /**
   * Find tasks by priority
   */
  static async findByPriority(priority: TaskPriority): Promise<Task[]> {
    return this.findMany({ priority });
  }

  /**
   * Find tasks assigned to a user
   */
  static async findByAssignee(assignee: string): Promise<Task[]> {
    return this.findMany({ assignee });
  }

  /**
   * Find completed tasks
   */
  static async findCompleted(): Promise<Task[]> {
    return this.findMany({ completed: true });
  }

  /**
   * Find incomplete tasks
   */
  static async findIncomplete(): Promise<Task[]> {
    return this.findMany({ completed: false });
  }

  /**
   * Count tasks
   */
  static async count(where?: Prisma.TaskWhereInput): Promise<number> {
    return prisma.task.count({ where });
  }

  /**
   * Create a new task
   */
  static async create(data: Prisma.TaskCreateInput): Promise<Task> {
    const task = await prisma.task.create({ data });
    return TaskSchema.parse(task);
  }

  /**
   * Update an existing task
   */
  static async update(
    id: number,
    data: Prisma.TaskUpdateInput
  ): Promise<Task> {
    const task = await prisma.task.update({
      where: { id },
      data,
    });
    return TaskSchema.parse(task);
  }

  /**
   * Toggle task completion status
   */
  static async toggleCompleted(id: number): Promise<Task> {
    const task = await this.findById(id);
    if (!task) throw new Error(`Task with id ${id} not found`);

    return this.update(id, { completed: !task.completed });
  }

  /**
   * Update task status
   */
  static async updateStatus(id: number, status: TaskStatus): Promise<Task> {
    return this.update(id, { status });
  }

  /**
   * Update task priority
   */
  static async updatePriority(id: number, priority: TaskPriority): Promise<Task> {
    return this.update(id, { priority });
  }

  /**
   * Delete a task
   */
  static async delete(id: number): Promise<void> {
    await prisma.task.delete({
      where: { id },
    });
  }

  /**
   * Delete all tasks matching criteria
   */
  static async deleteMany(where: Prisma.TaskWhereInput): Promise<number> {
    const result = await prisma.task.deleteMany({ where });
    return result.count;
  }

  /**
   * Check if task exists
   */
  static async exists(id: number): Promise<boolean> {
    const count = await prisma.task.count({
      where: { id },
    });
    return count > 0;
  }
}
