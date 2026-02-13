import { Metadata } from "next";
import Link from "next/link";
import { TaskCreateForm } from "./form";

export const metadata: Metadata = {
  title: "Create New Task",
  description: "Create a new task in the task management app",
};

/**
 * Task Creation Page
 * Server component that renders the task creation form
 */
export default function TaskCreatePage() {
  return (
    <div className="min-h-screen bg-base-200 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/tasks" className="link link-primary mb-4 inline-block">
            ← Back to Tasks
          </Link>
          <h1 className="text-4xl font-bold mb-2">Create New Task</h1>
          <p className="text-base-content/70">
            Fill out the form below to create a new task
          </p>
        </div>

        {/* Form card */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <TaskCreateForm />
          </div>
        </div>
      </div>
    </div>
  );
}
