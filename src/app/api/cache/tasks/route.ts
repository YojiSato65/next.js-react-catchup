import { NextRequest, NextResponse } from "next/server";
import { TaskRepository } from "@/lib/repository/task";
import { TaskPriority, TaskStatus } from "@/lib/schema/task";
import { DATA_CACHE_REVALIDATE_SECONDS } from "@/lib/cache/config";

interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
}

type SortField = "createdAt" | "updatedAt" | "dueDate" | "priority";
type SortOrder = "asc" | "desc";

function parseFilters(searchParams: URLSearchParams): TaskFilters {
  const statusParam = searchParams.get("status");
  const priorityParam = searchParams.get("priority");

  const status =
    statusParam && TaskStatus.safeParse(statusParam).success
      ? (statusParam as TaskStatus)
      : undefined;

  const priority =
    priorityParam && TaskPriority.safeParse(priorityParam).success
      ? (priorityParam as TaskPriority)
      : undefined;

  return {
    ...(status && { status }),
    ...(priority && { priority }),
  } satisfies TaskFilters;
}

function parseSort(searchParams: URLSearchParams): {
  field: SortField;
  order: SortOrder;
} {
  const field = (searchParams.get("sortBy") || "createdAt") as SortField;
  const order = (searchParams.get("sortOrder") || "desc") as SortOrder;
  return { field, order };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filters = parseFilters(searchParams);
  const sort = parseSort(searchParams);

  const tasks = await TaskRepository.findMany(
    Object.keys(filters).length > 0 ? filters : undefined,
    {
      orderBy: {
        [sort.field]: sort.order,
      },
    },
  );

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    cacheWindowSeconds: DATA_CACHE_REVALIDATE_SECONDS,
    sort,
    filters,
    tasks,
  });
}
