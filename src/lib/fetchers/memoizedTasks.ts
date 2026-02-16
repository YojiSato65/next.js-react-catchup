import { cache } from "react";
import { randomUUID } from "crypto";
import type { Task, TaskPriority, TaskStatus } from "@/lib/schema/task";
import {
  DATA_CACHE_REVALIDATE_SECONDS,
  getAppBaseUrl,
} from "@/lib/cache/config";

export type TaskListSortField =
  | "createdAt"
  | "updatedAt"
  | "dueDate"
  | "priority";
export type TaskListSortOrder = "asc" | "desc";

export interface MemoizedTaskQueryInput {
  where?: {
    status?: TaskStatus;
    priority?: TaskPriority;
  };
  sort: {
    field: TaskListSortField;
    order: TaskListSortOrder;
  };
}

export interface MemoizedTaskQueryResult {
  tasks: Task[];
  diagnostics: {
    executionId: string;
    executedAt: string;
    cacheKey: string;
    revalidateInSeconds: number;
  };
}

interface TaskCacheResponse {
  tasks: Task[];
  generatedAt: string;
  cacheWindowSeconds?: number;
}

const TASK_CACHE_PATH = "/api/cache/tasks" as const;

function buildQueryString(params: MemoizedTaskQueryInput): string {
  const searchParams = new URLSearchParams();

  if (params.where?.status) {
    searchParams.set("status", params.where.status);
  }

  if (params.where?.priority) {
    searchParams.set("priority", params.where.priority);
  }

  searchParams.set("sortBy", params.sort.field);
  searchParams.set("sortOrder", params.sort.order);

  return searchParams.toString();
}

const memoizedTaskQuery = cache(async (serializedInput: string) => {
  const params = JSON.parse(serializedInput) as MemoizedTaskQueryInput;

  const query = buildQueryString(params);
  const baseUrl = getAppBaseUrl();
  const url = query ? `${baseUrl}${TASK_CACHE_PATH}?${query}` : `${baseUrl}${TASK_CACHE_PATH}`;

  const response = await fetch(url, {
    next: {
      revalidate: DATA_CACHE_REVALIDATE_SECONDS,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load cached tasks (status ${response.status})`);
  }

  const payload = (await response.json()) as TaskCacheResponse;

  return {
    tasks: payload.tasks,
    diagnostics: {
      executionId: randomUUID(),
      executedAt: payload.generatedAt,
      cacheKey: query || "all",
      revalidateInSeconds:
        payload.cacheWindowSeconds ?? DATA_CACHE_REVALIDATE_SECONDS,
    },
  } satisfies MemoizedTaskQueryResult;
});

export async function getMemoizedTaskList(
  input: MemoizedTaskQueryInput,
): Promise<MemoizedTaskQueryResult> {
  const serialized = JSON.stringify(input);
  return memoizedTaskQuery(serialized);
}
