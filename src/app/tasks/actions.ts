"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { TaskRepository } from "@/lib/repository/task";
import { CreateTaskSchema, UpdateTaskSchema } from "@/lib/schema/task";
import { TASK_LIST_CACHE_TAG } from "@/lib/cache/config";

export type TaskMutationFormState = {
  success: boolean;
  errors?: Record<string, string[]>;
};

/**
 * Server Action to create a new task
 * Validates input with Zod, creates task in database, revalidates cache, and redirects
 */
export async function createTask(
  _prevState: TaskMutationFormState | null,
  formData: FormData,
): Promise<TaskMutationFormState | null> {
  const parsedInput = CreateTaskSchema.safeParse(getTaskFormFields(formData));

  if (!parsedInput.success) {
    return {
      success: false,
      errors: parsedInput.error.flatten().fieldErrors,
    };
  }

  try {
    const task = await TaskRepository.create(parsedInput.data);

    // Revalidate both the tasks page and the cached API endpoint so newly
    // created tasks show up immediately despite the data cache TTL demo.
    revalidatePath("/tasks");
    revalidatePath("/api/cache/tasks");
    revalidateTag(TASK_LIST_CACHE_TAG, "max");

    redirect(`/tasks/${task.id}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    console.error("Failed to create task:", error);

    return {
      success: false,
      errors: {
        submit: ["Failed to create task. Please try again."],
      },
    };
  }
}

/**
 * Server Action to update an existing task.
 * Validates input, performs the update, revalidates caches, and redirects
 * back to the task detail page.
 */
export async function updateTask(
  _prevState: TaskMutationFormState | null,
  formData: FormData,
): Promise<TaskMutationFormState | null> {
  const taskId = getTaskIdFromFormData(formData);

  if (taskId == null) {
    return {
      success: false,
      errors: {
        submit: ["Invalid task identifier."],
      },
    };
  }

  const parsedInput = UpdateTaskSchema.safeParse({
    ...getTaskFormFields(formData),
    id: taskId,
  });

  if (!parsedInput.success) {
    return {
      success: false,
      errors: parsedInput.error.flatten().fieldErrors,
    };
  }

  const { id, ...updateFields } = parsedInput.data;

  try {
    await TaskRepository.update(id, updateFields);

    revalidatePath("/tasks");
    revalidatePath("/api/cache/tasks");
    revalidatePath(`/tasks/${id}`);
    revalidateTag(TASK_LIST_CACHE_TAG, "max");

    redirect(`/tasks/${id}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    console.error("Failed to update task:", error);

    return {
      success: false,
      errors: {
        submit: ["Failed to update task. Please try again."],
      },
    };
  }
}

/**
 * Server Action to delete an existing task.
 * Removes the record, revalidates related caches, and redirects back to /tasks.
 */
export async function deleteTask(formData: FormData): Promise<void> {
  const taskId = getTaskIdFromFormData(formData);

  if (taskId == null) {
    console.error("Failed to delete task: missing taskId");
    redirect("/tasks");
  }

  try {
    await TaskRepository.delete(taskId);

    revalidatePath("/tasks");
    revalidatePath("/api/cache/tasks");
    revalidatePath(`/tasks/${taskId}`);
    revalidateTag(TASK_LIST_CACHE_TAG, "max");

    redirect("/tasks");
  } catch (error) {
    console.error("Failed to delete task:", error);
    redirect("/tasks");
  }
}

function getTaskFormFields(formData: FormData) {
  return {
    title: getRequiredTrimmedString(formData.get("title")),
    description: getOptionalTrimmedString(formData.get("description")),
    status: getOptionalTrimmedString(formData.get("status")),
    priority: getOptionalTrimmedString(formData.get("priority")),
    assignee: getOptionalTrimmedString(formData.get("assignee")),
    dueDate: toDateOrUndefined(
      getOptionalTrimmedString(formData.get("dueDate")),
    ),
  };
}

function getTaskIdFromFormData(formData: FormData): number | null {
  const raw = formData.get("taskId");
  if (raw == null) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function getRequiredTrimmedString(value: FormDataEntryValue | null): string {
  if (value == null) return "";
  return value.toString().trim();
}

function getOptionalTrimmedString(
  value: FormDataEntryValue | null,
): string | undefined {
  if (value == null) return undefined;
  const trimmed = value.toString().trim();
  return trimmed.length ? trimmed : undefined;
}

function toDateOrUndefined(value?: string): Date | undefined {
  if (!value) return undefined;
  const candidate = new Date(value);
  return Number.isNaN(candidate.getTime()) ? undefined : candidate;
}

function isRedirectError(error: unknown): error is { digest: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as Record<string, unknown>).digest === "string" &&
    ((error as Record<string, unknown>).digest as string).startsWith(
      "NEXT_REDIRECT;",
    )
  );
}
