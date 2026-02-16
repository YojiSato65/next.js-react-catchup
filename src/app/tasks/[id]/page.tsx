import { notFound } from "next/navigation";
import { TaskRepository } from "@/lib/repository/task";
import { Button } from "@/components/ui";
import Link from "next/link";
import { deleteTask } from "../actions";

interface TaskDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Task Detail Page
 * Displays full details of a single task
 * Dynamic route: /tasks/[id]
 */
export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  // Await params since it's a Promise in Next.js 16
  const { id } = await params;
  const taskId = parseInt(id, 10);

  if (isNaN(taskId)) {
    notFound();
  }

  const task = await TaskRepository.findById(taskId);

  if (!task) {
    notFound();
  }

  const statusBadgeColor = {
    todo: "badge-warning",
    in_progress: "badge-info",
    done: "badge-success",
  }[task.status];

  const priorityBadgeColor = {
    low: "badge-success",
    medium: "badge-warning",
    high: "badge-error",
  }[task.priority];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
          <Link href="/tasks">
            <Button variant="outline">← Back to Tasks</Button>
          </Link>
        </div>

        {/* Status and Priority */}
        <div className="flex gap-2 mb-6">
          <span className={`badge ${statusBadgeColor}`}>
            {task.status === "in_progress" ? "In Progress" : task.status}
          </span>
          <span className={`badge ${priorityBadgeColor}`}>
            {task.priority} priority
          </span>
          {task.completed && (
            <span className="badge badge-success">✓ Completed</span>
          )}
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          {/* Description */}
          {task.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Description
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Assignee */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-1">
                Assigned To
              </h3>
              <p className="text-gray-900">{task.assignee || "Not assigned"}</p>
            </div>

            {/* Due Date */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-1">
                Due Date
              </h3>
              <p className="text-gray-900">
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "No due date"}
              </p>
            </div>

            {/* Created Date */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-1">
                Created
              </h3>
              <p className="text-gray-900">
                {new Date(task.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Updated Date */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-1">
                Last Updated
              </h3>
              <p className="text-gray-900">
                {new Date(task.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <Link href="/tasks" className="flex-1 min-w-35">
            <Button className="w-full">← Back to Tasks</Button>
          </Link>
          <Link href={`/tasks/${task.id}/edit`} className="flex-1 min-w-35">
            <Button className="w-full" variant="primary">
              Edit Task
            </Button>
          </Link>
          <form
            action={deleteTask}
            className="flex-1 min-w-35"
            aria-label="Delete task"
          >
            <input type="hidden" name="taskId" value={task.id} />
            <Button
              type="submit"
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              Delete Task
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

/**
 * Static params for prerendering
 * Pre-generates pages for existing tasks
 */
export async function generateStaticParams() {
  const tasks = await TaskRepository.findMany();
  return tasks.map((task) => ({
    id: task.id.toString(),
  }));
}

/**
 * Metadata for SEO
 */
export async function generateMetadata({ params }: TaskDetailPageProps) {
  // Await params since it's a Promise in Next.js 16
  const { id } = await params;
  const taskId = parseInt(id, 10);
  const task = await TaskRepository.findById(taskId);

  if (!task) {
    return {
      title: "Task Not Found",
    };
  }

  return {
    title: `${task.title} - Task Details`,
    description: task.description || `View details for task: ${task.title}`,
  };
}
