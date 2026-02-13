import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { MockInstance } from "vitest";
import { createTask } from "@/app/tasks/actions";
import { TaskRepository } from "@/lib/repository/task";
import type { Task } from "@/lib/schema/task";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

vi.mock("@/lib/repository/task", () => ({
  TaskRepository: {
    create: vi.fn(),
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("createTask server action", () => {
  let consoleErrorSpy:
    | MockInstance<
        Parameters<typeof console.error>,
        ReturnType<typeof console.error>
      >
    | undefined;

  const buildTask = (overrides?: Partial<Task>): Task => ({
    id: 1,
    title: "Sample Task",
    description: null,
    status: "todo",
    priority: "medium",
    assignee: null,
    dueDate: null,
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  type CreateTaskResult = Awaited<ReturnType<typeof createTask>>;

  const expectErrorResult = (result: CreateTaskResult) => {
    if (!result || result.success) {
      throw new Error("Expected createTask to return an error result");
    }
    return result;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error");
    consoleErrorSpy!.mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
  });

  it("should create task, revalidate list, and redirect", async () => {
    const mockTask = buildTask({
      id: 42,
      title: "My Task",
    });

    vi.mocked(TaskRepository.create).mockResolvedValue(mockTask);

    const formData = new FormData();
    formData.set("title", "My Task");
    const result = await createTask(null, formData);

    expect(TaskRepository.create).toHaveBeenCalledWith({
      title: "My Task",
      description: undefined,
      status: "todo",
      priority: "medium",
      assignee: undefined,
      dueDate: undefined,
    });
    expect(revalidatePath).toHaveBeenCalledWith("/tasks");
    expect(redirect).toHaveBeenCalledWith("/tasks/42");
    expect(result).toBeUndefined();
  });

  it("should return validation errors when title missing", async () => {
    const formData = new FormData();

    const result = await createTask(null, formData);

    const errorResult = expectErrorResult(result);
    const fieldErrors = errorResult.errors as Record<string, string[]>;

    expect(fieldErrors.title?.[0]).toBeDefined();
    expect(TaskRepository.create).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("should handle optional fields and convert due date", async () => {
    vi.mocked(TaskRepository.create).mockResolvedValue(buildTask({ id: 7 }));

    const formData = new FormData();
    formData.set("title", "Task with due date");
    formData.set("description", "Details");
    formData.set("status", "in_progress");
    formData.set("priority", "high");
    formData.set("assignee", "user@example.com");
    formData.set("dueDate", "2026-12-31");

    await createTask(null, formData);

    expect(TaskRepository.create).toHaveBeenCalledWith({
      title: "Task with due date",
      description: "Details",
      status: "in_progress",
      priority: "high",
      assignee: "user@example.com",
      dueDate: new Date("2026-12-31"),
    });
  });

  it("should surface server errors as form errors", async () => {
    vi.mocked(TaskRepository.create).mockRejectedValue(
      new Error("DB connection failed"),
    );

    const formData = new FormData();
    formData.set("title", "Broken task");

    const result = await createTask(null, formData);

    const errorResult = expectErrorResult(result);
    const submitErrors = errorResult.errors as { submit: string[] };

    expect(submitErrors.submit?.[0]).toBe(
      "Failed to create task. Please try again.",
    );
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});
