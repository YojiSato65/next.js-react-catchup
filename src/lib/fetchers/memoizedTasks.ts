import { cache } from "react";
import { randomUUID } from "crypto";
import { TaskRepository } from "@/lib/repository/task";
import type { Task, TaskPriority, TaskStatus } from "@/lib/schema/task";

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
  };
}

const memoizedTaskQuery = cache(async (serializedInput: string) => {
  const params = JSON.parse(serializedInput) as MemoizedTaskQueryInput;
  const hasWhere = params.where && Object.keys(params.where).length > 0;

  const tasks = await TaskRepository.findMany(
    hasWhere ? params.where : undefined,
    {
      orderBy: {
        [params.sort.field]: params.sort.order,
      },
    },
  );

  return {
    tasks,
    diagnostics: {
      executionId: randomUUID(),
      executedAt: new Date().toISOString(),
      cacheKey: serializedInput,
    },
  } satisfies MemoizedTaskQueryResult;
});

export async function getMemoizedTaskList(
  input: MemoizedTaskQueryInput,
): Promise<MemoizedTaskQueryResult> {
  const serialized = JSON.stringify(input);
  return memoizedTaskQuery(serialized);
}
