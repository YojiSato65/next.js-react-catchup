"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import type { Task } from "@/lib/schema/task";
import { Button } from "@/components/ui";
import { updateTask, type TaskMutationFormState } from "../../actions";

interface TaskEditFormProps {
  task: Task;
}

export function TaskEditForm({ task }: TaskEditFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<
    TaskMutationFormState | null,
    FormData
  >(updateTask, null);

  const errors =
    state && !state.success
      ? (state.errors as Record<string, string[]> | undefined)
      : undefined;
  const hasErrors = !!errors;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="taskId" value={task.id} />

      {hasErrors && errors?.submit && (
        <div className="alert alert-error">
          <span>{errors.submit[0]}</span>
        </div>
      )}

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-semibold">Task Title *</span>
        </label>
        <input
          type="text"
          name="title"
          defaultValue={task.title}
          className={`input input-bordered w-full ${
            hasErrors && errors?.title ? "input-error" : ""
          }`}
          required
          disabled={isPending}
        />
        {hasErrors && errors?.title && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.title[0]}</span>
          </label>
        )}
      </div>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-semibold">Description</span>
        </label>
        <textarea
          name="description"
          defaultValue={task.description ?? ""}
          className={`textarea textarea-bordered w-full ${
            hasErrors && errors?.description ? "textarea-error" : ""
          }`}
          rows={4}
          disabled={isPending}
        />
        {hasErrors && errors?.description && (
          <label className="label">
            <span className="label-text-alt text-error">
              {errors.description[0]}
            </span>
          </label>
        )}
      </div>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-semibold">Status</span>
        </label>
        <select
          name="status"
          defaultValue={task.status}
          className={`select select-bordered w-full ${
            hasErrors && errors?.status ? "select-error" : ""
          }`}
          disabled={isPending}
        >
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        {hasErrors && errors?.status && (
          <label className="label">
            <span className="label-text-alt text-error">
              {errors.status[0]}
            </span>
          </label>
        )}
      </div>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-semibold">Priority</span>
        </label>
        <select
          name="priority"
          defaultValue={task.priority}
          className={`select select-bordered w-full ${
            hasErrors && errors?.priority ? "select-error" : ""
          }`}
          disabled={isPending}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        {hasErrors && errors?.priority && (
          <label className="label">
            <span className="label-text-alt text-error">
              {errors.priority[0]}
            </span>
          </label>
        )}
      </div>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-semibold">Assignee</span>
        </label>
        <input
          type="email"
          name="assignee"
          defaultValue={task.assignee ?? ""}
          placeholder="Enter assignee email (optional)"
          className={`input input-bordered w-full ${
            hasErrors && errors?.assignee ? "input-error" : ""
          }`}
          disabled={isPending}
        />
        {hasErrors && errors?.assignee && (
          <label className="label">
            <span className="label-text-alt text-error">
              {errors.assignee[0]}
            </span>
          </label>
        )}
      </div>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-semibold">Due Date</span>
        </label>
        <input
          type="date"
          name="dueDate"
          defaultValue={formatDateForInput(task.dueDate)}
          className={`input input-bordered w-full ${
            hasErrors && errors?.dueDate ? "input-error" : ""
          }`}
          disabled={isPending}
        />
        {hasErrors && errors?.dueDate && (
          <label className="label">
            <span className="label-text-alt text-error">
              {errors.dueDate[0]}
            </span>
          </label>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isPending}
          className="btn-primary flex-1"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
        <button
          type="button"
          className="btn btn-outline flex-1"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function formatDateForInput(value?: Date | string | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
