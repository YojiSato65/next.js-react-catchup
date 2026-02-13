import { describe, it, expect, beforeEach } from "vitest";
import { TaskRepository } from "@/lib/repository/task";
import { prisma } from "@/lib/prisma";

describe("Task Detail Page Integration", () => {
  beforeEach(async () => {
    await prisma.task.deleteMany({});
  });

  describe("Task retrieval", () => {
    it("should retrieve a task by ID for detail page", async () => {
      const created = await TaskRepository.create({
        title: "Detail Page Test",
        description: "Testing task detail retrieval",
        status: "todo",
        priority: "high",
        assignee: "user@example.com",
      });

      const task = await TaskRepository.findById(created.id);

      expect(task).toBeDefined();
      expect(task?.id).toBe(created.id);
      expect(task?.title).toBe("Detail Page Test");
      expect(task?.description).toBe("Testing task detail retrieval");
      expect(task?.status).toBe("todo");
      expect(task?.priority).toBe("high");
      expect(task?.assignee).toBe("user@example.com");
    });

    it("should return null for non-existent task", async () => {
      const task = await TaskRepository.findById(9999);
      expect(task).toBeNull();
    });

    it("should handle task with all fields populated", async () => {
      const dueDate = new Date("2026-12-31");
      const created = await TaskRepository.create({
        title: "Full Task",
        description: "A task with all fields",
        status: "in_progress",
        priority: "medium",
        assignee: "john@example.com",
        dueDate,
        completed: false,
      });

      const task = await TaskRepository.findById(created.id);

      expect(task?.title).toBe("Full Task");
      expect(task?.description).toBe("A task with all fields");
      expect(task?.status).toBe("in_progress");
      expect(task?.priority).toBe("medium");
      expect(task?.assignee).toBe("john@example.com");
      expect(task?.dueDate).toBeDefined();
      expect(task?.completed).toBe(false);
      expect(task?.createdAt).toBeDefined();
      expect(task?.updatedAt).toBeDefined();
    });

    it("should handle task with minimal fields", async () => {
      const created = await TaskRepository.create({
        title: "Minimal Task",
      });

      const task = await TaskRepository.findById(created.id);

      expect(task?.title).toBe("Minimal Task");
      expect(task?.description).toBeNull();
      expect(task?.status).toBe("todo");
      expect(task?.priority).toBe("medium");
      expect(task?.assignee).toBeNull();
      expect(task?.dueDate).toBeNull();
      expect(task?.completed).toBe(false);
    });

    it("should retrieve completed task", async () => {
      const created = await TaskRepository.create({
        title: "Completed Task",
        completed: true,
        status: "done",
      });

      const task = await TaskRepository.findById(created.id);

      expect(task?.completed).toBe(true);
      expect(task?.status).toBe("done");
    });

    it("should preserve dates correctly", async () => {
      const created = await TaskRepository.create({
        title: "Date Test",
      });

      const task = await TaskRepository.findById(created.id);

      expect(task?.createdAt).toBeInstanceOf(Date);
      expect(task?.updatedAt).toBeInstanceOf(Date);
      expect(task?.createdAt?.getTime()).toBeLessThanOrEqual(
        task?.updatedAt?.getTime() || 0,
      );
    });
  });

  describe("findMany for static generation", () => {
    it("should return all tasks for static params generation", async () => {
      await TaskRepository.create({ title: "Task 1" });
      await TaskRepository.create({ title: "Task 2" });
      await TaskRepository.create({ title: "Task 3" });

      const tasks = await TaskRepository.findMany();

      expect(tasks).toHaveLength(3);
      // Tasks are returned in reverse creation order (desc by createdAt)
      expect(tasks.map((t) => t.title)).toEqual(["Task 3", "Task 2", "Task 1"]);
    });

    it("should handle empty task list", async () => {
      const tasks = await TaskRepository.findMany();
      expect(tasks).toEqual([]);
    });

    it("should return tasks with IDs for URL generation", async () => {
      const task1 = await TaskRepository.create({ title: "URL Test 1" });
      const task2 = await TaskRepository.create({ title: "URL Test 2" });

      const tasks = await TaskRepository.findMany();

      expect(tasks.map((t) => t.id)).toContain(task1.id);
      expect(tasks.map((t) => t.id)).toContain(task2.id);
      expect(tasks.every((t) => typeof t.id === "number")).toBe(true);
    });
  });

  describe("Task status transitions", () => {
    it("should update task status", async () => {
      const task1 = await TaskRepository.create({
        title: "Status Transition",
        status: "todo",
      });

      const updated = await TaskRepository.updateStatus(
        task1.id,
        "in_progress",
      );
      expect(updated.status).toBe("in_progress");
    });
  });

  describe("Task metadata", () => {
    it("should generate proper metadata for existing task", async () => {
      const task = await TaskRepository.create({
        title: "Metadata Test",
        description: "Testing metadata generation",
      });

      const retrieved = await TaskRepository.findById(task.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.title).toBe("Metadata Test");
      expect(retrieved?.description).toBe("Testing metadata generation");
    });

    it("should handle tasks with special characters in title", async () => {
      const task = await TaskRepository.create({
        title: "Task with & special < > characters",
        description: "Testing HTML encoding",
      });

      const retrieved = await TaskRepository.findById(task.id);

      expect(retrieved?.title).toBe("Task with & special < > characters");
      expect(retrieved?.description).toBe("Testing HTML encoding");
    });
  });
});
