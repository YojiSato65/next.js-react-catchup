"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TaskRepository } from "@/lib/repository/task";
import { CreateTaskSchema } from "@/lib/schema/task";

/**
 * Server Action to create a new task
 * Validates input with Zod, creates task in database, revalidates cache, and redirects
 */
export async function createTask(_prevState: unknown, formData: FormData) {
  // Convert FormData to object
  const data = {
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    status: formData.get("status") || "todo",
    priority: formData.get("priority") || "medium",
    assignee: formData.get("assignee") || undefined,
    dueDate: formData.get("dueDate")
      ? new Date(formData.get("dueDate") as string)
      : undefined,
  };

  // Parse and validate input
  const validationResult = CreateTaskSchema.safeParse(data);

  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  try {
    const task = await TaskRepository.create(validationResult.data);

    // Revalidate the task list page to reflect new task
    revalidatePath("/tasks");

    // Redirect to the newly created task's detail page
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
