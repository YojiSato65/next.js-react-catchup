"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TaskRepository } from "@/lib/repository/task";
import { CreateTaskSchema } from "@/lib/schema/task";

export type CreateTaskFormState = {
  success: boolean;
  errors?: Record<string, string[]>;
};

/**
 * Server Action to create a new task
 * Validates input with Zod, creates task in database, revalidates cache, and redirects
 */
export async function createTask(
  _prevState: CreateTaskFormState | null,
  formData: FormData,
): Promise<CreateTaskFormState | null> {
  const parsedInput = CreateTaskSchema.safeParse(
    mapFormDataToCreateInput(formData),
  );

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

function mapFormDataToCreateInput(formData: FormData) {
  const dueDateInput = getOptionalTrimmedString(formData.get("dueDate"));

  return {
    title: getRequiredTrimmedString(formData.get("title")),
    description: getOptionalTrimmedString(formData.get("description")),
    status: getOptionalTrimmedString(formData.get("status")),
    priority: getOptionalTrimmedString(formData.get("priority")),
    assignee: getOptionalTrimmedString(formData.get("assignee")),
    dueDate: dueDateInput ? new Date(dueDateInput) : undefined,
  };
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
