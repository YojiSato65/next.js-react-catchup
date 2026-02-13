import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TaskRepository } from "@/lib/repository/task";
import { prisma } from "@/lib/prisma";

describe("TaskRepository", () => {
  beforeEach(async () => {
    // Clear tasks before each test
    await prisma.task.deleteMany({});
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.task.deleteMany({});
  });

  describe("create", () => {
    it("should create a new task", async () => {
      const task = await TaskRepository.create({
        title: "Test task",
        description: "A test task",
        status: "todo",
        priority: "medium",
      });

      expect(task.id).toBeDefined();
      expect(task.title).toBe("Test task");
      expect(task.status).toBe("todo");
      expect(task.priority).toBe("medium");
    });
  });

  describe("findById", () => {
    it("should find a task by ID", async () => {
      const created = await TaskRepository.create({ title: "Find me" });
      const found = await TaskRepository.findById(created.id);

      expect(found).toEqual(created);
    });

    it("should return null for non-existent task", async () => {
      const found = await TaskRepository.findById(9999);
      expect(found).toBeNull();
    });
  });

  describe("findMany", () => {
    it("should return empty array when no tasks exist", async () => {
      const tasks = await TaskRepository.findMany();
      expect(tasks).toEqual([]);
    });

    it("should return all tasks", async () => {
      await TaskRepository.create({ title: "Task 1" });
      await TaskRepository.create({ title: "Task 2" });

      const tasks = await TaskRepository.findMany();
      expect(tasks).toHaveLength(2);
    });

    it("should filter tasks by status", async () => {
      await TaskRepository.create({ title: "Todo", status: "todo" });
      await TaskRepository.create({ title: "Done", status: "done" });

      const tasks = await TaskRepository.findMany({ status: "todo" });
      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe("Todo");
    });

    it("should respect take and skip options", async () => {
      for (let i = 0; i < 5; i++) {
        await TaskRepository.create({ title: `Task ${i}` });
      }

      const tasks = await TaskRepository.findMany(undefined, {
        take: 2,
        skip: 1,
      });

      expect(tasks).toHaveLength(2);
    });
  });

  describe("findByStatus", () => {
    it("should find tasks by status", async () => {
      await TaskRepository.create({ title: "Todo", status: "todo" });
      await TaskRepository.create({
        title: "In Progress",
        status: "in_progress",
      });
      await TaskRepository.create({ title: "Done", status: "done" });

      const inProgress = await TaskRepository.findByStatus("in_progress");
      expect(inProgress).toHaveLength(1);
      expect(inProgress[0].title).toBe("In Progress");
    });
  });

  describe("findByPriority", () => {
    it("should find tasks by priority", async () => {
      await TaskRepository.create({ title: "High priority", priority: "high" });
      await TaskRepository.create({ title: "Low priority", priority: "low" });

      const high = await TaskRepository.findByPriority("high");
      expect(high).toHaveLength(1);
      expect(high[0].title).toBe("High priority");
    });
  });

  describe("findCompleted", () => {
    it("should find only completed tasks", async () => {
      await TaskRepository.create({ title: "Done", completed: true });
      await TaskRepository.create({ title: "Pending", completed: false });

      const completed = await TaskRepository.findCompleted();
      expect(completed).toHaveLength(1);
      expect(completed[0].title).toBe("Done");
    });
  });

  describe("update", () => {
    it("should update a task", async () => {
      const task = await TaskRepository.create({ title: "Original" });
      const updated = await TaskRepository.update(task.id, {
        title: "Updated",
      });

      expect(updated.title).toBe("Updated");
    });
  });

  describe("toggleCompleted", () => {
    it("should toggle completed status", async () => {
      const task = await TaskRepository.create({
        title: "Toggle me",
        completed: false,
      });

      const toggled = await TaskRepository.toggleCompleted(task.id);
      expect(toggled.completed).toBe(true);

      const toggledBack = await TaskRepository.toggleCompleted(task.id);
      expect(toggledBack.completed).toBe(false);
    });
  });

  describe("delete", () => {
    it("should delete a task", async () => {
      const task = await TaskRepository.create({ title: "Delete me" });
      await TaskRepository.delete(task.id);

      const found = await TaskRepository.findById(task.id);
      expect(found).toBeNull();
    });
  });

  describe("count", () => {
    it("should count tasks", async () => {
      await TaskRepository.create({ title: "1" });
      await TaskRepository.create({ title: "2" });

      const count = await TaskRepository.count();
      expect(count).toBe(2);
    });

    it("should count filtered tasks", async () => {
      await TaskRepository.create({ title: "High", priority: "high" });
      await TaskRepository.create({ title: "Low", priority: "low" });

      const count = await TaskRepository.count({ priority: "high" });
      expect(count).toBe(1);
    });
  });

  describe("exists", () => {
    it("should return true if task exists", async () => {
      const task = await TaskRepository.create({ title: "Exists" });
      const exists = await TaskRepository.exists(task.id);
      expect(exists).toBe(true);
    });

    it("should return false if task does not exist", async () => {
      const exists = await TaskRepository.exists(9999);
      expect(exists).toBe(false);
    });
  });
});
