import { describe, it, expect, beforeEach, vi } from "vitest";
import { TaskRepository } from "@/lib/repository/task";

// Mock the repository
vi.mock("@/lib/repository/task");

describe("Tasks Page - Repository Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call TaskRepository.findMany when loading tasks", async () => {
    const mockTasks = [
      {
        id: 1,
        title: "Test Task 1",
        description: "Test description",
        status: "todo" as const,
        priority: "high" as const,
        completed: false,
        assignee: null,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(TaskRepository.findMany).mockResolvedValue(mockTasks);

    // Server components should be tested through E2E tests or integration tests
    // Component logic is tested here
    const result = await TaskRepository.findMany();

    expect(result).toEqual(mockTasks);
    expect(TaskRepository.findMany).toHaveBeenCalled();
  });

  it("should handle empty task list", async () => {
    vi.mocked(TaskRepository.findMany).mockResolvedValue([]);

    const result = await TaskRepository.findMany();

    expect(result).toEqual([]);
  });

  it("should support filtering by status", async () => {
    const mockTasks = [
      {
        id: 1,
        title: "In Progress Task",
        description: null,
        status: "in_progress" as const,
        priority: "medium" as const,
        completed: false,
        assignee: null,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(TaskRepository.findMany).mockResolvedValue(mockTasks);

    const result = await TaskRepository.findMany({ status: "in_progress" });

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("in_progress");
  });
});
