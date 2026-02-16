import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Task } from "@/lib/schema/task";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  return {
    ...actual,
    cache<TArgs extends Array<unknown>, TReturn>(
      fn: (...args: TArgs) => TReturn,
    ) {
      const store = new Map<string, TReturn>();
      return (...args: TArgs) => {
        const key = JSON.stringify(args);
        if (store.has(key)) {
          return store.get(key)!;
        }
        const result = fn(...args);
        store.set(key, result);
        return result;
      };
    },
  };
});

vi.mock("@/lib/repository/task", () => {
  return {
    TaskRepository: {
      findMany: vi.fn(),
    },
  };
});

const buildTask = (overrides: Partial<Task> = {}): Task => ({
  id: 1,
  title: "Memoized Task",
  description: null,
  status: "todo",
  priority: "medium",
  completed: false,
  assignee: null,
  dueDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("memoized task fetcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("dedupes repeated calls with identical input", async () => {
    const { TaskRepository } = await import("@/lib/repository/task");
    vi.mocked(TaskRepository.findMany).mockResolvedValue([buildTask()]);

    const { getMemoizedTaskList } = await import("./memoizedTasks");

    const input = {
      where: { status: "todo" as const },
      sort: { field: "createdAt" as const, order: "desc" as const },
    };

    const first = await getMemoizedTaskList(input);
    const second = await getMemoizedTaskList(input);

    expect(TaskRepository.findMany).toHaveBeenCalledTimes(1);
    expect(first.tasks).toEqual(second.tasks);
    expect(first.diagnostics.executionId).toBe(second.diagnostics.executionId);
  });

  it("executes again when filters change", async () => {
    const { TaskRepository } = await import("@/lib/repository/task");
    vi.mocked(TaskRepository.findMany).mockResolvedValue([buildTask()]);

    const { getMemoizedTaskList } = await import("./memoizedTasks");
    const sort = { field: "createdAt" as const, order: "desc" as const };

    await getMemoizedTaskList({ where: { status: "todo" }, sort });
    await getMemoizedTaskList({ where: { status: "done" }, sort });

    expect(TaskRepository.findMany).toHaveBeenCalledTimes(2);
  });
});
