import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { TaskStatus, TaskPriority } from "@/lib/schema/task";
import {
  getMemoizedTaskList,
  getNoStoreTaskList,
  type MemoizedTaskQueryInput,
  type MemoizedTaskQueryResult,
  type TaskListSortField,
  type TaskListSortOrder,
} from "@/lib/fetchers/memoizedTasks";

/**
 * Task List Page
 * Displays all tasks with filtering and sorting
 * Server Component with Suspense for streaming
 */

interface TaskListPageProps {
  searchParams: Promise<{
    status?: TaskStatus | string;
    priority?: TaskPriority | string;
    sortBy?: "createdAt" | "updatedAt" | "dueDate" | "priority";
    sortOrder?: "asc" | "desc";
  }>;
}

/**
 * Task list component - fetches and renders tasks
 */
async function TaskListContent({ searchParams }: TaskListPageProps) {
  // Await searchParams since it's a Promise in Next.js 16
  const params = await searchParams;

  // Validate and convert status if provided
  const status = params.status
    ? TaskStatus.safeParse(params.status).success
      ? (params.status as TaskStatus)
      : undefined
    : undefined;

  // Validate and convert priority if provided
  const priority = params.priority
    ? TaskPriority.safeParse(params.priority).success
      ? (params.priority as TaskPriority)
      : undefined
    : undefined;

  const sortField = (params.sortBy || "createdAt") as TaskListSortField;
  const sortOrder = (params.sortOrder || "desc") as TaskListSortOrder;

  const where = {
    ...(status && { status }),
    ...(priority && { priority }),
  };

  const memoizedInput: MemoizedTaskQueryInput = {
    ...(Object.keys(where).length > 0 ? { where } : {}),
    sort: {
      field: sortField,
      order: sortOrder,
    },
  };

  const memoizedResult = await getMemoizedTaskList(memoizedInput);
  const memoizedResultAgain = await getMemoizedTaskList(memoizedInput);
  const noStoreResult = await getNoStoreTaskList(memoizedInput);

  const memoizationVerified = Object.is(memoizedResult, memoizedResultAgain);
  const tasks = memoizedResult.tasks;

  const listContent =
    tasks.length === 0 ? (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No tasks found</p>
        <Button variant="primary">Create First Task</Button>
      </div>
    ) : (
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

  return (
    <div className="space-y-6">
      <RequestMemoizationBanner
        diagnostics={memoizedResult.diagnostics}
        memoizationVerified={memoizationVerified}
        taskCount={tasks.length}
      />
      <CacheStrategyComparison
        revalidateDiagnostics={memoizedResult.diagnostics}
        noStoreDiagnostics={noStoreResult.diagnostics}
      />
      {listContent}
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
        <Link href="/tasks/new">
          <Button variant="primary">New Task</Button>
        </Link>
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

interface RequestMemoizationBannerProps {
  diagnostics: MemoizedTaskQueryResult["diagnostics"];
  memoizationVerified: boolean;
  taskCount: number;
}

function RequestMemoizationBanner({
  diagnostics,
  memoizationVerified,
  taskCount,
}: RequestMemoizationBannerProps) {
  return (
    <div className="rounded-lg border border-indigo-200 bg-indigo-50 dark:bg-slate-900/40 dark:border-indigo-900 px-4 py-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
              Request Memoization + Data Cache
            </p>
            <p className="text-sm text-indigo-800/80 dark:text-indigo-100/70">
              Issues #15 & #16 · Next.js reuses identical fetches per request
              and serves the cached response until{" "}
              <code className="font-mono">
                next.revalidate = {diagnostics.revalidateInSeconds}s
              </code>{" "}
              expires.
            </p>
          </div>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${memoizationVerified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            {memoizationVerified ? "Verified" : "Not memoized"}
          </span>
        </div>
        <dl className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-indigo-900 dark:text-indigo-100">
          <div>
            <dt className="text-indigo-700/70 dark:text-indigo-200 text-xs uppercase tracking-wide">
              Execution ID
            </dt>
            <dd className="font-mono text-sm break-all">
              {diagnostics.executionId}
            </dd>
          </div>
          <div>
            <dt className="text-indigo-700/70 dark:text-indigo-200 text-xs uppercase tracking-wide">
              Executed at
            </dt>
            <dd>{new Date(diagnostics.executedAt).toLocaleTimeString()}</dd>
          </div>
          <div>
            <dt className="text-indigo-700/70 dark:text-indigo-200 text-xs uppercase tracking-wide">
              Tasks fetched
            </dt>
            <dd>
              {taskCount} · key {diagnostics.cacheKey.slice(0, 24)}
              {diagnostics.cacheKey.length > 24 ? "…" : ""}
            </dd>
          </div>
          <div>
            <dt className="text-indigo-700/70 dark:text-indigo-200 text-xs uppercase tracking-wide">
              Data cache TTL
            </dt>
            <dd>{diagnostics.revalidateInSeconds}s</dd>
          </div>
        </dl>
        <p className="text-xs text-indigo-800/80 dark:text-indigo-200/70">
          We call <code className="font-mono">getMemoizedTaskList()</code> twice
          during the same render. React&apos;s request memoization skips the
          duplicate work, while the underlying fetch stays cached for the
          configured revalidation window. Refresh after the TTL to observe a new
          timestamp.
        </p>
      </div>
    </div>
  );
}

interface CacheStrategyComparisonProps {
  revalidateDiagnostics: MemoizedTaskQueryResult["diagnostics"];
  noStoreDiagnostics: MemoizedTaskQueryResult["diagnostics"];
}

function CacheStrategyComparison({
  revalidateDiagnostics,
  noStoreDiagnostics,
}: CacheStrategyComparisonProps) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 px-4 py-5">
      <div className="mb-4">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Cache Strategy Comparison
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Issue #17 · Observe how{" "}
          <code className="font-mono">next.revalidate</code> serves cached
          responses while <code className="font-mono">cache: &quot;no-store&quot;</code>{" "}
          forces a fresh fetch every render.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <CacheStrategyCard
          title="Data Cache (revalidate)"
          badgeLabel={`TTL ${revalidateDiagnostics.revalidateInSeconds}s`}
          description="Next.js stores this response until the TTL expires, so repeated refreshes within the window reuse the same payload."
          diagnostics={revalidateDiagnostics}
        />
        <CacheStrategyCard
          title="Dynamic fetch (no-store)"
          badgeLabel="Always fresh"
          description="By opting into cache: &quot;no-store&quot; we bypass the data cache entirely—every render triggers a brand new fetch."
          diagnostics={noStoreDiagnostics}
          noStore
        />
      </div>
    </div>
  );
}

interface CacheStrategyCardProps {
  title: string;
  description: string;
  badgeLabel: string;
  diagnostics: MemoizedTaskQueryResult["diagnostics"];
  noStore?: boolean;
}

function CacheStrategyCard({
  title,
  description,
  badgeLabel,
  diagnostics,
  noStore = false,
}: CacheStrategyCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {description}
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-100">
          {badgeLabel}
        </span>
      </div>
      <dl className="space-y-2 text-sm text-slate-900 dark:text-slate-100">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Executed at
          </dt>
          <dd>{new Date(diagnostics.executedAt).toLocaleTimeString()}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Cache key
          </dt>
          <dd className="font-mono text-xs break-all">
            {diagnostics.cacheKey}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Cache lifetime
          </dt>
          <dd>
            {noStore || diagnostics.revalidateInSeconds === 0
              ? "Disabled (cache: &quot;no-store&quot;)"
              : `${diagnostics.revalidateInSeconds}s via next.revalidate`}
          </dd>
        </div>
      </dl>
    </div>
  );
}
