"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createTask } from "../actions";
import { Button } from "@/components/ui";

/**
 * Task Creation Form Component
 * Client component using useActionState to handle Server Action submission
 */

interface FormState {
  success: boolean;
  errors?: Record<string, string[]>;
}

export function TaskCreateForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<
    FormState | null,
    FormData
  >(createTask, null);

  const errors =
    state && !state.success
      ? (state.errors as Record<string, string[]> | undefined)
      : undefined;
  const hasErrors = !!errors;

  return (
    <form action={formAction} className="space-y-6">
      {/* General error message */}
      {hasErrors && errors?.submit && (
        <div className="alert alert-error">
          <span>{errors.submit[0]}</span>
        </div>
      )}

      {/* Title field */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-semibold">Task Title *</span>
        </label>
        <input
          type="text"
          name="title"
          placeholder="Enter task title"
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

      {/* Description field */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-semibold">Description</span>
        </label>
        <textarea
          name="description"
          placeholder="Enter task description (optional)"
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

      {/* Status field */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-semibold">Status</span>
        </label>
        <select
          name="status"
          defaultValue="todo"
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

      {/* Priority field */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-semibold">Priority</span>
        </label>
        <select
          name="priority"
          defaultValue="medium"
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

      {/* Assignee field */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-semibold">Assignee</span>
        </label>
        <input
          type="email"
          name="assignee"
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

      {/* Due Date field */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-semibold">Due Date</span>
        </label>
        <input
          type="date"
          name="dueDate"
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

      {/* Action buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isPending}
          className="btn-primary flex-1"
        >
          {isPending ? "Creating..." : "Create Task"}
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
