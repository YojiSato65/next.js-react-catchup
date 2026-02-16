import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { TaskRepository } from "@/lib/repository/task";
import { TaskEditForm } from "./form";

interface TaskEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TaskEditPage({ params }: TaskEditPageProps) {
  const { id } = await params;
  const taskId = Number(id);

  if (!Number.isFinite(taskId)) {
    notFound();
  }

  const task = await TaskRepository.findById(taskId);

  if (!task) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-base-200 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href={`/tasks/${task.id}`}
            className="link link-primary mb-4 inline-block"
          >
            ← Back to Task
          </Link>
          <h1 className="text-4xl font-bold mb-2">Edit Task</h1>
          <p className="text-base-content/70">
            Update the task details below. Changes save via Server Actions and
            immediately revalidate cached lists.
          </p>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <TaskEditForm task={task} />
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: TaskEditPageProps): Promise<Metadata> {
  const { id } = await params;
  const taskId = Number(id);

  if (!Number.isFinite(taskId)) {
    return {
      title: "Task Not Found",
    };
  }

  const task = await TaskRepository.findById(taskId);

  if (!task) {
    return {
      title: "Task Not Found",
    };
  }

  return {
    title: `Edit ${task.title}`,
    description: task.description
      ? `Update task: ${task.description.slice(0, 80)}`
      : `Update task: ${task.title}`,
  } satisfies Metadata;
}
