import { describe, it, expect } from "vitest";
import {
  TaskSchema,
  CreateTaskSchema,
  UpdateTaskSchema,
  TaskQuerySchema,
  TaskStatus,
  TaskPriority,
} from "@/lib/schema/task";

describe("Task Schema Validation", () => {
  describe("TaskStatus enum", () => {
    it("should accept valid status values", () => {
      expect(TaskStatus.parse("todo")).toBe("todo");
      expect(TaskStatus.parse("in_progress")).toBe("in_progress");
      expect(TaskStatus.parse("done")).toBe("done");
    });

    it("should reject invalid status values", () => {
      expect(() => TaskStatus.parse("invalid")).toThrow();
      expect(() => TaskStatus.parse("TODO")).toThrow();
    });
  });

  describe("TaskPriority enum", () => {
    it("should accept valid priority values", () => {
      expect(TaskPriority.parse("low")).toBe("low");
      expect(TaskPriority.parse("medium")).toBe("medium");
      expect(TaskPriority.parse("high")).toBe("high");
    });

    it("should reject invalid priority values", () => {
      expect(() => TaskPriority.parse("MEDIUM")).toThrow();
      expect(() => TaskPriority.parse("urgent")).toThrow();
    });
  });

  describe("TaskSchema (full task)", () => {
    it("should validate a complete task object", () => {
      const task = {
        id: 1,
        title: "Test Task",
        description: "A test task",
        status: "todo" as const,
        priority: "medium" as const,
        assignee: "user@example.com",
        dueDate: new Date(),
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const validated = TaskSchema.parse(task);
      expect(validated.id).toBe(1);
      expect(validated.title).toBe("Test Task");
    });

    it("should reject task without required fields", () => {
      expect(() => TaskSchema.parse({})).toThrow();
    });

    it("should enforce title length constraints", () => {
      expect(() =>
        TaskSchema.parse({
          id: 1,
          title: "",
          status: "todo",
          priority: "medium",
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ).toThrow();

      expect(() =>
        TaskSchema.parse({
          id: 1,
          title: "a".repeat(256),
          status: "todo",
          priority: "medium",
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ).toThrow();
    });

    it("should reject invalid email in assignee", () => {
      expect(() =>
        TaskSchema.parse({
          id: 1,
          title: "Test",
          status: "todo",
          priority: "medium",
          assignee: "not-an-email",
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ).toThrow();
    });
  });

  describe("CreateTaskSchema", () => {
    it("should validate a minimal create input", () => {
      const input = {
        title: "New Task",
      };

      const validated = CreateTaskSchema.parse(input);
      expect(validated.title).toBe("New Task");
      expect(validated.status).toBe("todo");
      expect(validated.priority).toBe("medium");
    });

    it("should validate a complete create input", () => {
      const input = {
        title: "New Task",
        description: "Task description",
        status: "in_progress" as const,
        priority: "high" as const,
        assignee: "user@example.com",
        dueDate: new Date(),
      };

      const validated = CreateTaskSchema.parse(input);
      expect(validated.title).toBe("New Task");
      expect(validated.description).toBe("Task description");
      expect(validated.status).toBe("in_progress");
      expect(validated.priority).toBe("high");
    });

    it("should reject invalid input", () => {
      expect(() => CreateTaskSchema.parse({})).toThrow();
      expect(() =>
        CreateTaskSchema.parse({
          title: "",
        }),
      ).toThrow();
    });

    it("should not include id, createdAt, updatedAt", () => {
      expect(() =>
        CreateTaskSchema.parse({
          title: "Test",
          id: 1,
        }),
      ).toThrow();
    });
  });

  describe("UpdateTaskSchema", () => {
    it("should validate partial update with id", () => {
      const input = {
        id: 1,
        status: "done" as const,
      };

      const validated = UpdateTaskSchema.parse(input);
      expect(validated.id).toBe(1);
      expect(validated.status).toBe("done");
    });

    it("should allow all fields to be optional except id", () => {
      const input = {
        id: 1,
      };

      const validated = UpdateTaskSchema.parse(input);
      expect(validated.id).toBe(1);
    });

    it("should reject update without id", () => {
      expect(() =>
        UpdateTaskSchema.parse({
          status: "done",
        }),
      ).toThrow();
    });
  });

  describe("TaskQuerySchema", () => {
    it("should validate empty query", () => {
      const validated = TaskQuerySchema.parse({});
      expect(validated.sortBy).toBe("createdAt");
      expect(validated.sortOrder).toBe("desc");
      expect(validated.limit).toBe(10);
      expect(validated.offset).toBe(0);
    });

    it("should validate query with filters", () => {
      const query = {
        status: "todo" as const,
        priority: "high" as const,
        completed: false,
        limit: 20,
        offset: 10,
      };

      const validated = TaskQuerySchema.parse(query);
      expect(validated.status).toBe("todo");
      expect(validated.priority).toBe("high");
      expect(validated.limit).toBe(20);
      expect(validated.offset).toBe(10);
    });

    it("should reject invalid sort order", () => {
      expect(() =>
        TaskQuerySchema.parse({
          sortOrder: "invalid",
        }),
      ).toThrow();
    });

    it("should reject negative limit", () => {
      expect(() =>
        TaskQuerySchema.parse({
          limit: -1,
        }),
      ).toThrow();
    });

    it("should reject negative offset", () => {
      expect(() =>
        TaskQuerySchema.parse({
          offset: -1,
        }),
      ).toThrow();
    });
  });
});
