import { Suspense } from "react";
import { TaskRepository } from "@/lib/repository/task";
import { Button } from "@/components/ui";
import { TaskStatus, TaskPriority } from "@/lib/schema/task";

/**
 * Task List Page
 * Displays all tasks with filtering and sorting
 * Server Component with Suspense for streaming
 */

interface TaskListPageProps {
  searchParams: {
    status?: TaskStatus | string;
    priority?: TaskPriority | string;
    sortBy?: "createdAt" | "updatedAt" | "dueDate" | "priority";
    sortOrder?: "asc" | "desc";
  };
}

/**
 * Task list component - fetches and renders tasks
 */
async function TaskListContent({ searchParams }: TaskListPageProps) {
  // Validate and convert status if provided
  const status = searchParams.status
    ? TaskStatus.safeParse(searchParams.status).success
      ? (searchParams.status as TaskStatus)
      : undefined
    : undefined;

  // Validate and convert priority if provided
  const priority = searchParams.priority
    ? TaskPriority.safeParse(searchParams.priority).success
      ? (searchParams.priority as TaskPriority)
      : undefined
    : undefined;

  const tasks = await TaskRepository.findMany(
    {
      ...(status && { status }),
      ...(priority && { priority }),
    },
    {
      orderBy: {
        [searchParams.sortBy || "createdAt"]: searchParams.sortOrder || "desc",
      },
    },
  );

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No tasks found</p>
        <Button variant="primary">Create First Task</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-gray-200 dark:border-slate-700"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {task.title}
              </h3>
              {task.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {task.description}
                </p>
              )}
              <div className="flex gap-2 mt-3 flex-wrap">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    task.status === "done"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : task.status === "in_progress"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                  }`}
                >
                  {task.status}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    task.priority === "high"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : task.priority === "medium"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Edit
              </Button>
              <Button variant="outline" size="sm">
                Delete
              </Button>
            </div>
          </div>
          {task.assignee && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Assigned to: {task.assignee}
            </p>
          )}
          {task.dueDate && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Loading fallback for Suspense
 */
function TaskListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-200 dark:bg-slate-700 rounded-lg h-32 animate-pulse"
        />
      ))}
    </div>
  );
}

/**
 * Task List Page
 */
export default async function TasksPage({ searchParams }: TaskListPageProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Tasks
        </h1>
        <Button variant="primary">New Task</Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 mb-6 border border-gray-200 dark:border-slate-700">
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
              Status
            </label>
            <select className="mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
              <option value="">All</option>
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
              Priority
            </label>
            <select className="mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
              <option value="">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List with Suspense */}
      <Suspense fallback={<TaskListSkeleton />}>
        <TaskListContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
